import os
import glob
import json
import requests
from django.conf import settings
from fillsense.models import Procedimento

# --- Camada de Adaptação (Transformação de Dados) ---

def _transform_api_data_to_mock_format(api_data_list: list) -> list:
    """
    Transforma a lista da API real no formato esperado (mock).
    """
    all_procs = []
    for api_proc in api_data_list:
        nt_info = api_proc.get('nota_tecnica', {})
        
        # O 'proc_id' do mock é uma string complexa 
        # (ex: "consulta_ginecologia..._0710797"), mas o 'id' da API é um
        # inteiro (ex: 710797).
        # Assumindo que o ID canônico é o da API (o número).
        # O modelo `Procedimento` usa `codigo` como CharField, então
        # salvaremos o ID da API como string.
        
        proc_id_str = str(api_proc.get('id'))
        proc_label = api_proc.get('Nome')

        mock_formatted_proc = {
            "proc_id": proc_id_str,
            "proc_label": proc_label,
            "proc_sisreg": proc_label,  # Assumindo que é o mesmo que o Nome/Label
            "NT_id": nt_info.get('id'),
            "NT_label": nt_info.get('nome'), 
            
            "fields": api_proc.get('formulario'),
            "ers": api_proc.get('ers', [])
        }
        all_procs.append(mock_formatted_proc)
    
    return all_procs

# --- Camadas de Busca de Dados ---
def _fetch_mock_procedimentos() -> list:
    """
    Busca procedimentos dos arquivos JSON locais.
    """
    print("INFO: Usando dados MOCK para procedimentos.")
    data_path = os.path.join(settings.BASE_DIR, 'jsons_procedimentos')
    json_files = glob.glob(os.path.join(data_path, '*.json'))
    
    all_procs = []
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'procs' in data and isinstance(data['procs'], list):
                    all_procs.extend(data['procs'])
        except (json.JSONDecodeError, IOError) as e:
            print(f"Erro ao processar o arquivo mock {file_path}: {e}")
            continue
    return all_procs

def _fetch_api_procedimentos() -> list:
    """
    Busca procedimentos da API real e os transforma.
    """
    print("INFO: Usando dados da API REAL para procedimentos.")
    api_url = settings.PROCEDIMENTOS_API_URL
    try:
        response = requests.get(api_url, timeout=10) # Timeout de 10s
        response.raise_for_status() # Lança exceção para erros HTTP (4xx, 5xx)
        
        api_data = response.json() # API retorna uma lista [...]
        
        # Transforma os dados da API para o formato mock
        transformed_procs = _transform_api_data_to_mock_format(api_data)
        return transformed_procs
        
    except requests.RequestException as e:
        print(f"ERRO: Falha ao buscar dados da API de procedimentos: {e}")
        return [] # Retorna lista vazia em caso de falha


def _update_procedimentos_no_banco(procs_list: list):
    """
    Recebe a lista de procedimentos (já no formato mock)
    e atualiza o banco de dados.
    """
    for proc in procs_list:
        # Pega o 'proc_id' e 'proc_label' que foram padronizados
        proc_id = proc.get('proc_id')
        proc_label = proc.get('proc_label')

        if not proc_id or not proc_label:
            print(f"Aviso: Procedimento inválido ou incompleto, pulando: {proc_id}")
            continue
            
        try:
            obj, created = Procedimento.objects.update_or_create(
                codigo=proc_id,
                defaults={'label': proc_label}
            )
            if created:
                print(f"Procedimento criado: {proc_id}")
        except Exception as e:
            # Captura erros de banco (ex: violação de constraint)
            print(f"Erro ao salvar procedimento {proc_id} no DB: {e}")


# --- Função Pública do Serviço ---
def get_procedimentos_data() -> list:
    """
    Função principal do serviço.
    
    1. Decide se usa mock ou API baseado em settings.USE_MOCK_DATA.
    2. Busca os dados da fonte correta.
    3. (Se for API) Transforma os dados para o formato padrão.
    4. Atualiza o banco de dados com os dados obtidos.
    5. Retorna a lista de procedimentos no formato padrão (mock).
    """
    if settings.USE_MOCK_DATA:
        procs_list = _fetch_mock_procedimentos()
    else:
        procs_list = _fetch_api_procedimentos()
    
    # Atualiza o DB em segundo plano (ou de forma síncrona, como aqui)
    if procs_list:
        _update_procedimentos_no_banco(procs_list)
        
    return procs_list
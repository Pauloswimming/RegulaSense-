import json
import re
import textwrap
import time
from typing import Optional, Dict, Any, List

import requests
from django.conf import settings

# --- Constantes e Expressões Regulares ---

# Regex para remover blocos <think>...</think>
_THINK_RE = re.compile(r"<think>.*?</think>", flags=re.DOTALL | re.IGNORECASE)
# Regex para extrair de blocos de código ```json ... ```
_CODE_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", flags=re.DOTALL | re.IGNORECASE)


# --- Funções Auxiliares de Limpeza ---

def _strip_think_blocks(text: str) -> str:
    """Remove quaisquer blocos <think>...</think> que o modelo possa ter emitido."""
    return _THINK_RE.sub("", text)


def _extract_first_json_object(text: str) -> Optional[str]:
    """
    Extrai o primeiro objeto JSON bem balanceado encontrado na string.
    Estratégia:
      1) Se houver bloco ```json ... ```, tenta usar o conteúdo interno.
      2) Scan por chaves { } balanceadas para isolar o primeiro objeto.
    """
    m = _CODE_FENCE_RE.search(text)
    if m:
        inner = m.group(1).strip()
        maybe = _extract_by_brace_balance(inner)
        if maybe:
            return maybe
    return _extract_by_brace_balance(text)

def _extract_by_brace_balance(text: str) -> Optional[str]:
    """Extrai o primeiro bloco {...} com chaves balanceadas."""
    start = text.find("{")
    while start != -1:
        depth = 0
        for i in range(start, len(text)):
            ch = text[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[start:i+1]
        start = text.find("{", start + 1)
    return None

# --- Funções de Geração de Prompt ---

def _prompt_template() -> str:
    """
    Template modificado: saída deve ser JSON no ponto de vista do profissional de saúde solicitante.
    """
    return textwrap.dedent("""
    Sua tarefa é redigir a JUSTIFICATIVA CLÍNICA fundamentada nas informações clínicas e nos critérios da nota técnica.

    A saída deve ser EXCLUSIVAMENTE em JSON válido, no seguinte formato:

    {{
      "procedimento": "<nome do procedimento>",
      "justificativa": "<texto clínico conciso estruturado em 2 a 3 parágrafos, escrito na perspectiva do profissional solicitante>"
    }}

    REGRAS:
    - Escreva a justificativa como se fosse o médico/profissional solicitante.
    - Use tom clínico-profissional, claro, objetivo e fundamentado.
    - Inicie a justificativa com uma frase que CITE A NOTA TÉCNICA (EXEMPLO: 'Caro(a) colega regulador(a),\n
    Encaminho a presente solicitação de procedimento, elaborada conforme os requisitos formais estabelecidos
    na Nota Técnica X.\n').
    - Embase o texto nas informações clínicas e PRINCIPALMENTE nos critérios da nota técnica. Alinhando SEMPRE as 
    informações clínicas do paciente com o requisito da nota técnica.
    - Apresente na justificativa TODOS os dados clínicos do paciente informados.
    - Quando um dado clínico do paciente atender ao critério apresentado, mencione isso na justificativa. CASO NÃO ATENDA, IGNORE.
    - NÃO inclua texto fora do JSON, comentários ou explicações adicionais.

    DADOS:
    - Procedimento: <<{procedimento}>>
    - Informações clínicas: <<{clinico}>>
    - Critérios da nota técnica: <<{requisitos}>>
    """)

def _build_messages(procedimento: str, clinico: str, requisitos: str) -> List[Dict[str, Any]]:
    """
    Constrói o array de mensagens para o endpoint /api/chat do Ollama.
    """
    system_text = (
        """Você é um profissional de saúde solicitando a realização de um procedimento 
            para seu paciente. """
        "Sempre retorne JSON válido, sem qualquer texto adicional fora do JSON."
    )
    
    user_prompt = _prompt_template().format(
        procedimento=procedimento,
        clinico=clinico,
        requisitos=requisitos
    )
    return [
        {"role": "system", "content": system_text},
        {"role": "user", "content": user_prompt},
    ]


# --- Função de Chamada à API ---

def _call_ollama(messages: List[Dict[str, Any]], retries: int = 2) -> str:
    """
    Chama o Ollama /api/chat e retorna o texto final (string).
    Adaptado para usar as configurações do settings.py do Django.
    """
    
    # URL do endpoint
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"

    # Lê as configurações do Django settings
    timeout = getattr(settings, "OLLAMA_TIMEOUT", 600)
    num_predict = getattr(settings, "OLLAMA_MAX_TOKENS", 600)
    
    payload: Dict[str, Any] = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "options": {
            "temperature": settings.OLLAMA_DEFAULT_TEMPERATURE,
            "num_predict": num_predict,
            "seed": settings.OLLAMA_DEFAULT_SEED,
        },
        "format": "json",
        "stream": False,
        "think": False,
    }

    headers = {
        "Content-Type": "application/json",
    }

    last_err = None
    for attempt in range(retries + 1):
        try:
            r = requests.post(url, json=payload, headers=headers, timeout=timeout)
            r.raise_for_status()
            data = r.json()
            content = (data.get("message", {}) or {}).get("content", "")
            return (content or "").strip()
        except requests.exceptions.RequestException as e:
            last_err = e
            if attempt < retries:
                time.sleep(2 ** attempt)
            else:
                # Lança a exceção que a view espera
                raise ConnectionError(f"Falha ao comunicar com o serviço Ollama: {e}") from e
    
    if last_err:
        raise ConnectionError(f"Falha ao comunicar com o serviço Ollama após {retries} tentativas: {last_err}") from last_err
    return ""


# --- Função Principal do Serviço (Ponto de Entrada para a View) ---

def gerar_justificativa_ia(procedimento: str, clinico_text: str, nota_json_str: str) -> Dict[str, Any]:
    """
    Orquestra a geração de justificativa, chamando a IA e processando a resposta.
    
    Esta função agora requer o JSON da nota técnica como uma string separada.
    
    Args:
        procedimento: O nome do procedimento a ser solicitado.
        clinico_text: O texto com as informações clínicas do paciente.
        nota_json_str: Uma STRING contendo o JSON da nota técnica.
                          
    Returns:
        Um dicionário Python com o resultado, ex: {"procedimento": "...", "justificativa": "..."}.
        
    Raises:
        ConnectionError: Se houver falha na comunicação com a IA.
        ValueError: Se a IA não retornar um JSON válido ou se a nota_json_str for inválida.
    """
    
    # 1. Parsear o JSON da nota técnica
    try:
        nota_json = json.loads(nota_json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"O texto da nota técnica não é um JSON válido. Erro: {e}") from e
    
    # 2. Construir a string de requisitos
    requisitos = """REQUISITOS DA NOTA TÉCNICA:"""
    for categoria in nota_json.get("Categorias", []):
        requisitos += f"\nCATEGORIA: {categoria.get('Nome', 'N/A')}({categoria.get('Descrição', 'N/A')})"
        for er in categoria.get("ERs", []):
            requisitos += f"\n - {er.get('Nome', 'N/A')}: {er.get('Descrição', 'N/A')}"

    # 3. Construir as mensagens para a IA
    messages = _build_messages(
        procedimento=procedimento,
        clinico=clinico_text,
        requisitos=requisitos
    )

    # 4. Chamar a IA
    raw_response = _call_ollama(messages)

    # 5. Pós-processamento robusto
    cleaned = _strip_think_blocks(raw_response).strip()
    
    parsed = None
    try:
        # Tenta parse direto
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Se falhar, tenta extrair o primeiro objeto JSON
        candidate = _extract_first_json_object(cleaned)
        if candidate:
            try:
                parsed = json.loads(candidate)
            except json.JSONDecodeError:
                pass # A falha será capturada abaixo
            
    if parsed is None:
        raise ValueError(f"A resposta da IA não foi um JSON válido. Resposta recebida: {raw_response}")

    # 6. Normaliza parágrafos na justificativa (lógica do generate-entities.py)
    if isinstance(parsed, dict) and "justificativa" in parsed:
        just = parsed.get("justificativa")
        if isinstance(just, str):
            lines = [p.strip() for p in just.strip().splitlines() if p.strip()]
            parsed["justificativa"] = "\n\n".join(lines)

    return parsed
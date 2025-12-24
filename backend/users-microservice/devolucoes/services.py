import requests
from django.conf import settings
from rest_framework.exceptions import APIException

class ServiceUnavailable(APIException):
    status_code = 503
    default_detail = 'Serviço temporariamente indisponível.'
    default_code = 'service_unavailable'

def buscar_devolucoes_externas(params):
    """
    Busca as devoluções na API externa repassando os parâmetros recebidos.
    
    Args:
        params (dict): Dicionário com query params (page, limit, filtros, etc).
        
    Returns:
        list/dict: O JSON retornado pela API externa.
    """
    # URL da API Externa definida no settings.py
    base_url = getattr(settings, 'DEVOLUCOES_API_URL', None)
    if not base_url:
        raise ValueError("A configuração DEVOLUCOES_API_URL não foi definida no settings.")

    try:
        # Repassa os parâmetros (page, limit, usuario, etc) diretamente para a API externa
        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.Timeout:
        raise ServiceUnavailable(detail="A API de devoluções demorou muito para responder.")
    except requests.exceptions.ConnectionError:
        raise ServiceUnavailable(detail="Não foi possível conectar à API de devoluções.")
    except requests.exceptions.RequestException as e:
        # Tenta pegar a mensagem de erro da API externa, se houver
        error_msg = "Erro na comunicação com o serviço externo."
        if e.response is not None:
            try:
                error_data = e.response.json()
                if 'message' in error_data:
                    error_msg = error_data['message']
            except ValueError:
                pass # Não é JSON
        
        # Repassa o status code original se possível, senão 502 (Bad Gateway)
        status_code = e.response.status_code if e.response else 502
        
        # Cria uma exceção genérica com o status code correto
        exc = APIException(detail=error_msg)
        exc.status_code = status_code
        raise exc
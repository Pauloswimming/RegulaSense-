from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .services import buscar_devolucoes_externas

class DevolucaoViewSet(viewsets.ViewSet):
    """
    Proxy reverso para a API de Devoluções.
    O Frontend chama este endpoint, que busca os dados externamente.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        GET /api/devolucoes/
        Repassa todos os query params (page, limit, usuario, datas...) para o serviço.
        """
        try:
            # Pega todos os parâmetros da query string (ex: ?page=1&limit=50&usuario=joao)
            # request.query_params retorna um QueryDict, transformamos em dict padrão
            params = request.query_params.dict()
            
            data = buscar_devolucoes_externas(params)
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Se for uma exceção do DRF (APIException), ela já tem status_code e detail
            if hasattr(e, 'status_code'):
                return Response({"detail": e.detail}, status=e.status_code)
            
            # Erro genérico
            return Response(
                {"detail": f"Erro interno ao processar devoluções: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Solicitacao, Procedimento
from .serializers import SolicitacaoSerializer
from .services.gerar_justificativa_service import gerar_justificativa_ia
from .services.procedimentos_service import get_procedimentos_data
from django.conf import settings
import os
import glob
import json

class SolicitacaoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite que as solicitações sejam visualizadas ou editadas.
    """
    serializer_class = SolicitacaoSerializer
    # Garante que apenas usuários autenticados possam acessar este endpoint.
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Esta view deve retornar uma lista de todas as solicitações
        para o usuário atualmente autenticado.
        """
        return Solicitacao.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        """
        Associa automaticamente o usuário autenticado à nova solicitação criada.
        """
        serializer.save(usuario=self.request.user)

    def _transform_ers_to_categorias(self, ers_list: list) -> dict:
        """
        Transforma a lista plana de 'ers' (que vem do procedimento)
        na estrutura de 'Categorias' aninhadas que o 
        'gerar_justificativa_service' espera.
        """
        categorias_map = {}
        for er in ers_list:
            categoria = er.get('categoria', {})
            cat_nome = categoria.get('Nome', 'Sem Categoria')
            cat_desc = categoria.get('Descricao', '')
            
            if cat_nome not in categorias_map:
                categorias_map[cat_nome] = {
                    "Nome": cat_nome,
                    "Descrição": cat_desc,
                    "ERs": []
                }
            
            # Adiciona apenas a info da ER que o prompt precisa
            categorias_map[cat_nome]["ERs"].append({
                "Nome": er.get('Nome', 'N/A'),
                "Descrição": er.get('Descricao', 'N/A')
            })
            
        # Converte o mapa de volta para uma lista
        categorias_list = list(categorias_map.values())
        
        # Retorna o dicionário final no formato esperado pelo serviço de IA
        return {"Categorias": categorias_list}

    # Este é o endpoint customizado para gerar a justificativa
    # POST /api/fillsense/solicitacoes/gerar-justificativa/
    @action(detail=False, methods=['post'], url_path='gerar-justificativa')
    def gerar_justificativa(self, request, pk=None):
        """
        Endpoint para gerar a justificativa de IA.

        Recebe um JSON do frontend com:
        {
            "procedimento": "Nome do Procedimento...",
            "clinico_text": "Texto clínico do paciente...",
            "ers": [ ...lista de ers do procedimento selecionado... ]
        }
        """
        
        try:
            # Carrega os dados do corpo da requisição POST
            data = json.loads(request.body)
            procedimento_nome = data['procedimento']
            clinico_text = data['clinico_text']
            ers_list = data['ers']
            
        except (json.JSONDecodeError, KeyError) as e:
            return Response({"erro": "Dados Incompletos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            nota_tecnica_dict = self._transform_ers_to_categorias(ers_list)
        
            # Converte esse dicionário de volta para uma string JSON
            nota_json_str = json.dumps(nota_tecnica_dict, ensure_ascii=False)

            # Chama o serviço de IA 
            result = gerar_justificativa_ia(
                procedimento=procedimento_nome,
                clinico_text=clinico_text,
                nota_json_str=nota_json_str
            )

            # Retorna a justificativa gerada
            return Response(result, status=status.HTTP_200_OK)
        
        except ConnectionError as e:
            # Erro de rede ou indisponibilidade do Ollama
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as e:
            # IA retornou algo que não é JSON
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            # Outros erros inesperados
            return Response({"error": f"Ocorreu um erro inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Este é o endpoint customizado para retornar os procedimentos
    # GET /api/fillsense/solicitacoes/procedimentos/
    @action(detail=False, methods=['get'], url_path='procedimentos')
    def procedimentos(self, request):
        """
        Esta view retorna os procedimentos do FillSense.
        
        Busca da API real ou de arquivos mock locais, 
        dependendo da configuração 'USE_MOCK_DATA'.
        
        Aproveita a chamada para popular/atualizar a tabela
        de Procedimentos no banco de dados.
        """
        try:
            # 1. Chamar o serviço
            all_procs = get_procedimentos_data()
            # 2. Retornar a resposta no formato que o frontend espera
            return Response(all_procs, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Erro inesperado na view de procedimentos: {e}")
            
            return Response(
                {"error": "Não foi possível processar a solicitação de procedimentos."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
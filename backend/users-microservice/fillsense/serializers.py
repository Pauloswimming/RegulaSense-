from rest_framework import serializers
from .models import Solicitacao, Procedimento

class SolicitacaoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Solicitacao, com validações e formatação de campos.
    """
    procedimento = serializers.PrimaryKeyRelatedField(
        queryset=Procedimento.objects.all(),
        source='procedimento_fk',  
        allow_null=True,           
        required=False
    )
    # --- Campos Formatados para Leitura (read-only) ---
    # Usa a função `get_..._display()` do Django para retornar o valor legível
    procedimento_label = serializers.CharField(source='procedimento_fk.label', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Formata os campos de data e hora para o formato dd/mm/yyyy HH:MM
    data_criacao_display = serializers.DateTimeField(source='data_criacao', format='%d/%m/%Y %H:%M', read_only=True)
    data_atualizacao_display = serializers.DateTimeField(source='data_atualizacao', format='%d/%m/%Y %H:%M', read_only=True)

    class Meta:
        model = Solicitacao
        # Inclui todos os campos do modelo na API
        fields = '__all__'
        # O campo 'usuario' e 'protocolo' serão definidos pelo sistema, não pelo cliente
        read_only_fields = ('usuario', 'protocolo', 'data_criacao', 'data_atualizacao')
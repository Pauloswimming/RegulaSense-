from django.db import models
from django.utils import timezone
from authentication.models import User

class Procedimento(models.Model):
    """
    Modelo para representar um Procedimento no FillSense.
    """

    codigo = models.CharField(max_length=255, null=False, blank=False, primary_key=True, help_text="Código do procedimento em ASCII")
    label = models.CharField(max_length=255, null=False, blank=False, help_text="Texto legível do procedimento, é o que será exibido para o usuário")
    def __str__(self):
        return self.label

class Solicitacao(models.Model):
    """
    Modelo para representar uma solicitação de procedimento no FillSense.
    """
    class StatusChoices(models.TextChoices):
        CRIADA = 'CRIADA', 'Criada'
        EM_ANALISE = 'EM_ANALISE', 'Em Análise'
        APROVADA = 'APROVADA', 'Aprovada'
        REJEITADA = 'REJEITADA', 'Rejeitada'
        CONCLUIDA = 'CONCLUIDA', 'Concluída'

    # Relacionamento com o usuário que criou a solicitação
    # OBS: Se o usuário for deletado, então todas as solicitações relacionadas ao usuário serão deletadas também 
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitacoes') 

    procedimento = models.CharField(max_length=255, null=False, blank=False, help_text="Nome ou código do procedimento solicitado.")    

    # Relacionamento com o procedimento da solicitação
    procedimento_fk = models.ForeignKey(
        'Procedimento',
        on_delete=models.deletion.PROTECT,
        null=True,
        blank=True
    )

    # --- Campos da solicitação ---
    protocolo = models.CharField(max_length=20, unique=False, editable=False, default="FS-XXXX-YYYYY", help_text="Protocolo único da solicitação (FS-ANO-ID).")

    # Campos com as informações do procedimento
    descricao_medica = models.TextField(blank=True, null=True, help_text="Descrição médica inicial preenchida manualmente pelo o usuário.")
    justificativa = models.TextField(blank=True, null=True, help_text="Justificativa textual para a solicitação (gerada por IA e revisada pelo usuário).")

    # Campos com metadados da solicitação
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.CRIADA)
    data_criacao = models.DateTimeField(auto_now_add=True, help_text="Data e hora em que a solicitação foi criada.")
    data_atualizacao = models.DateTimeField(auto_now=True, help_text="Data e hora da última atualização.")

    # Campo para armazenar dados da interação com a IA
    metadados_ia = models.JSONField(blank=False, null=False, default=dict, help_text="Metadados da interação com a IA, como notas técnicas usadas.")

    def __str__(self):
        return f"Solicitação {self.id} - {self.procedimento} ({self.status})"

    def save(self, *args, **kwargs):
        # Gera o protocolo apenas na primeira vez que o objeto é salvo
        if not self.pk:
            super().save(*args, **kwargs) # Salva primeiro para obter um ID
            ano_atual = timezone.now().year
            # Conta quantas solicitações já existem neste ano para determinar o próximo ID sequencial
            id_no_ano = Solicitacao.objects.filter(data_criacao__year=ano_atual).count()
            # Formata o protocolo com 5 dígitos, preenchendo com zeros à esquerda
            self.protocolo = f"FS-{ano_atual}-{id_no_ano:05d}"
            # O `update_fields` evita um loop de save e é mais performático
            kwargs['force_insert'] = False # Permite que o próximo save seja um update
        
        super().save(*args, **kwargs)
    class Meta:
        verbose_name = "Solicitação"
        verbose_name_plural = "Solicitações"
        ordering = ['-data_criacao'] # Ordena as solicitações da mais nova para a mais antiga
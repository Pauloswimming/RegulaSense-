from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)
    specialty = models.CharField(max_length=100, blank=True, null=True)
    # Você pode adicionar mais papéis/permissões aqui, por exemplo, usando ManyToManyField para um modelo Role
    # Para simplificar, vamos usar um campo char para um papel básico, ou depender dos grupos/permissões embutidos do Django
    # Exemplo para um papel simples:
    # ROLE_CHOICES = (
    #     ('profissional_saude', 'Profissional de Saúde'),
    #     ('admin', 'Admin'),
    #     ('patient', 'Paciente'),
    # )
    # role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='profissional_saude')

    USERNAME_FIELD = 'email' # Usa o email como campo de login
    REQUIRED_FIELDS = ['username'] # Mantém username como campo requerido durante a criação via createsuperuser

    def __str__(self):
        return self.email
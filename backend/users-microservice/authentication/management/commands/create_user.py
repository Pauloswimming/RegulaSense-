from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class Command(BaseCommand):
    """
    Comando de gerenciamento para criar um novo usuário no sistema.
    """
    help = 'Cria um novo usuário com email, username, senha e especialidade opcional.'

    def add_arguments(self, parser):
        """Adiciona os argumentos que o comando aceitará na linha de comando."""
        parser.add_argument('email', type=str, help='O e-mail do usuário (será usado para login).')
        parser.add_argument('username', type=str, help='O nome de usuário único para o novo usuário.')
        parser.add_argument('password', type=str, help='A senha para a nova conta.')
        
        # Argumento opcional para 'specialty'
        parser.add_argument(
            '--specialty',
            type=str,
            default=None, # O valor padrão será None se não for fornecido
            help='A especialidade do profissional (opcional).'
        )

    def handle(self, *args, **kwargs):
        """A lógica principal do comando."""
        email = kwargs['email']
        username = kwargs['username']
        password = kwargs['password']
        specialty = kwargs['specialty']

        # Validação para garantir que o usuário não exista
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f"Erro: Um usuário com o email '{email}' já existe."))
            return
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f"Erro: Um usuário com o username '{username}' já existe."))
            return

        # Tenta criar o usuário usando o manager `create_user`
        try:
            user = User.objects.create_user(
                email=email,
                username=username,
                password=password,
                # Passa a especialidade somente se ela for fornecida
                specialty=specialty if specialty else '' 
            )
            
            self.stdout.write(self.style.SUCCESS(
                f"Usuário '{user.username}' com email '{user.email}' foi criado com sucesso!"
            ))

        except ValidationError as e:
            self.stdout.write(self.style.ERROR(f"Erro de validação ao criar o usuário: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Ocorreu um erro inesperado: {e}"))
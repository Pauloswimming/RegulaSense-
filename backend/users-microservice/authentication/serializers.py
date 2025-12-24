from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model() # Obtém o modelo de usuário ativo

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'specialty'] # Adicione specialty
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "As senhas não conferem."})
        # Verifica se o email já existe
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Este email já está cadastrado."})
        return data

    def create(self, validated_data):
        # Remove password2 antes de criar o usuário
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            specialty=validated_data.get('specialty', '') # Lida com specialty opcional
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
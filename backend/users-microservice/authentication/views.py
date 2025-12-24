from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserRegisterSerializer, UserLoginSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Gera tokens para o usuário recém-cadastrado
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "specialty": user.specialty,
            }, # Retorne apenas os dados essenciais do usuário
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password) # Usa o email como username para autenticação

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login bem-sucedido",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": str(user.username)
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
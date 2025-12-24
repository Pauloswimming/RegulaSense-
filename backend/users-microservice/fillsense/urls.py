
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SolicitacaoViewSet

# O DefaultRouter do DRF registra automaticamente as URLs para um ViewSet.
# Ele cria as rotas para list, create, retrieve, update e destroy.
router = DefaultRouter()
router.register(r'solicitacoes', SolicitacaoViewSet, basename='solicitacao')

# As URLs da nossa API são determinadas automaticamente pelo router.
urlpatterns = [
    path('', include(router.urls)),
]
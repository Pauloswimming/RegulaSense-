from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DevolucaoViewSet

router = DefaultRouter()
router.register(r'devolucoes', DevolucaoViewSet, basename='devolucoes')

urlpatterns = [
    path('', include(router.urls)),
]
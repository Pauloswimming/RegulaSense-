from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/fillsense/', include('fillsense.urls')),
    path('api/', include('devolucoes.urls')),
]
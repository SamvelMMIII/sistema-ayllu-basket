from django.urls import path
from . import views

app_name = "gestion"

urlpatterns = [
    path("", views.acceso, name="acceso"),
    path("registro/", views.registro, name="registro"),
    path("inicio/", views.home, name="home"),
    path("jugadores/", views.jugadores, name="jugadores"),
    path("categorias/", views.categorias, name="categorias"),
    path("calendario/", views.calendario, name="calendario"),
    path("pagos/", views.pagos, name="pagos"),
    path("usuarios/", views.usuarios, name="usuarios"),
]

from django.urls import path

from . import views

app_name = "cuentas"

urlpatterns = [
    path("iniciar-sesion/", views.iniciar_sesion, name="login"),
    path("registro/", views.registrar_usuario, name="registro"),
    path("cerrar-sesion/", views.cerrar_sesion, name="logout"),
    path("sin-permiso/", views.sin_permiso, name="sin_permiso"),
]
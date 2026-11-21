from django.conf import settings
from django.db import models


class PerfilUsuario(models.Model):
    class Rol(models.TextChoices):
        TESORERA = "tesorera", "Tesorera"
        SECRETARIA = "secretaria", "Secretaria"
        PRESIDENTE = "presidente", "Presidente"
        ENTRENADOR = "entrenador", "Entrenador"
        APODERADO = "apoderado", "Apoderado"

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil",
    )
    telefono = models.CharField(max_length=20, blank=True)
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.APODERADO)

    def __str__(self):
        return f"{self.usuario.get_full_name() or self.usuario.email} ({self.get_rol_display()})"
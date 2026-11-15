from django.db import models

# Create your models here.

class Apoderado(models.Model):
    nombre_completo = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20)
    correo = models.EmailField()
    rut_apoderado = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.nombre_completo

class Categoria(models.Model):
    nombre_categoria = models.CharField(max_length=100)
    anio_inicio = models.IntegerField()
    anio_fin = models.IntegerField()

    def __str__(self):
        return self.nombre_categoria

class Jugador(models.Model):
    apoderado = models.ForeignKey(Apoderado, on_delete=models.PROTECT)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    nombre_completo = models.CharField(max_length=150)
    fecha_nacimiento = models.DateField()
    rut_jugador = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return f"{self.nombre_completo} - {self.rut_jugador}"
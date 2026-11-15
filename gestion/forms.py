from django import forms
from .models import Jugador

class JugadorForm(forms.ModelForm):
    class Meta:
        model = Jugador
        fields = ['nombre_completo', 'rut_jugador', 'fecha_nacimiento', 'categoria', 'apoderado']
        widgets = {
            'nombre_completo': forms.TextInput(attrs={'class': 'field', 'placeholder': 'Nombre y apellido'}),
            'rut_jugador': forms.TextInput(attrs={'class': 'field', 'placeholder': '12.345.678-9'}),
            'fecha_nacimiento': forms.DateInput(attrs={'class': 'field', 'type': 'date'}),
            'categoria': forms.Select(attrs={'class': 'field'}),
            'apoderado': forms.Select(attrs={'class': 'field'}),
        }
        labels = {
            'nombre_completo': 'Nombre del jugador',
            'rut_jugador': 'RUT del jugador',
            'fecha_nacimiento': 'Fecha de nacimiento',
            'categoria': 'Categoría asignada',
            'apoderado': 'Apoderado responsable',
        }
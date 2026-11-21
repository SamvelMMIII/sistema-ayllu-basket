from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError
from django.db.models import Q

from .models import PerfilUsuario

User = get_user_model()


class RegistroUsuarioForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["password1"].widget.attrs.update({"class": "field", "autocomplete": "new-password"})
        self.fields["password2"].widget.attrs.update({"class": "field", "autocomplete": "new-password"})

    username = forms.EmailField(
        label="Correo electr\u00f3nico",
        max_length=150,
        widget=forms.EmailInput(attrs={"class": "field", "autocomplete": "email", "placeholder": "nombre@correo.cl"}),
    )
    nombre_completo = forms.CharField(
        label="Nombre completo",
        max_length=150,
        widget=forms.TextInput(attrs={"class": "field", "autocomplete": "name", "placeholder": "Nombre y apellido"}),
    )
    telefono = forms.CharField(
        label="Tel\u00e9fono",
        max_length=20,
        widget=forms.TextInput(attrs={"class": "field", "autocomplete": "tel", "placeholder": "+56 9 1234 5678"}),
    )

    class Meta:
        model = User
        fields = ("username",)

    def clean_username(self):
        correo = self.cleaned_data["username"].strip().lower()
        if User.objects.filter(Q(username__iexact=correo) | Q(email__iexact=correo)).exists():
            raise ValidationError("Ya existe una cuenta con este correo.")
        return correo

    def save(self, commit=True):
        usuario = super().save(commit=False)
        usuario.email = self.cleaned_data["username"]
        partes_nombre = self.cleaned_data["nombre_completo"].strip().split(maxsplit=1)
        usuario.first_name = partes_nombre[0]
        usuario.last_name = partes_nombre[1] if len(partes_nombre) > 1 else ""
        if commit:
            usuario.save()
            PerfilUsuario.objects.create(
                usuario=usuario,
                telefono=self.cleaned_data["telefono"].strip(),
                rol=PerfilUsuario.Rol.APODERADO,
            )
        return usuario


class InicioSesionForm(AuthenticationForm):
    username = forms.EmailField(
        label="Correo electr\u00f3nico",
        widget=forms.EmailInput(attrs={"class": "field", "autocomplete": "username", "placeholder": "nombre@correo.cl"}),
    )
    password = forms.CharField(
        label="Contrase\u00f1a",
        strip=False,
        widget=forms.PasswordInput(attrs={"class": "field", "autocomplete": "current-password", "placeholder": "Tu contrase\u00f1a"}),
    )

    def clean(self):
        correo = self.cleaned_data.get("username", "").strip().lower()
        if correo:
            usuario = User.objects.filter(Q(email__iexact=correo) | Q(username__iexact=correo)).first()
            if usuario:
                self.cleaned_data["username"] = usuario.get_username()
        return super().clean()
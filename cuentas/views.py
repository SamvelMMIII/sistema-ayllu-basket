from django.contrib import messages
from django.contrib.auth import login, logout
from django.db import transaction
from django.shortcuts import redirect, render
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from .forms import InicioSesionForm, RegistroUsuarioForm


def iniciar_sesion(request):
    siguiente = request.POST.get("next") or request.GET.get("next", "")
    if not url_has_allowed_host_and_scheme(
        siguiente,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        siguiente = ""

    if request.user.is_authenticated:
        return redirect(siguiente or "gestion:home")

    form = InicioSesionForm(request=request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        return redirect(siguiente or "gestion:home")

    return render(request, "cuentas/acceso.html", {"form": form, "next": siguiente})


def registrar_usuario(request):
    if request.user.is_authenticated:
        return redirect("gestion:home")

    form = RegistroUsuarioForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        with transaction.atomic():
            form.save()
        messages.success(request, "La cuenta fue creada. Ya puedes iniciar sesi\u00f3n.")
        return redirect("cuentas:login")

    return render(request, "cuentas/registro.html", {"form": form})


@require_POST
def cerrar_sesion(request):
    logout(request)
    messages.success(request, "Se cerr\u00f3 la sesi\u00f3n.")
    return redirect("cuentas:login")


def sin_permiso(request):
    if not request.user.is_authenticated:
        return redirect("cuentas:login")
    return render(request, "cuentas/sin_permiso.html", status=403)
from functools import wraps

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect


def roles_requeridos(*roles):
    def decorador(vista):
        @login_required(login_url="cuentas:login")
        @wraps(vista)
        def protegida(request, *args, **kwargs):
            if request.user.is_superuser:
                return vista(request, *args, **kwargs)
            perfil = getattr(request.user, "perfil", None)
            if perfil and perfil.rol in roles:
                return vista(request, *args, **kwargs)
            return redirect("cuentas:sin_permiso")
        return protegida
    return decorador
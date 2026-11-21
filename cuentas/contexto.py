def contexto_cuenta(request):
    usuario = request.user
    perfil = getattr(usuario, "perfil", None) if usuario.is_authenticated else None
    roles = {"tesorera", "secretaria"}
    return {
        "perfil_actual": perfil,
        "puede_gestionar_jugadores": bool(usuario.is_authenticated and (usuario.is_superuser or (perfil and perfil.rol in roles))),
    }
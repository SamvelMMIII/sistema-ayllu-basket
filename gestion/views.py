from django.shortcuts import render

def acceso(request):
    return render(request, "gestion/acceso.html")

def registro(request):
    return render(request, "gestion/registro.html")

def home(request):
    return render(request, "gestion/home.html")

def jugadores(request):
    return render(request, "gestion/jugadores.html")

def categorias(request):
    return render(request, "gestion/categorias.html")

def calendario(request):
    return render(request, "gestion/calendario.html")

def pagos(request):
    return render(request, "gestion/pagos.html")

def usuarios(request):
    return render(request, "gestion/usuarios.html")

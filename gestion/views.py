from django.shortcuts import render, redirect
from .models import Jugador, Apoderado
from .forms import JugadorForm, ApoderadoForm

def acceso(request):
    return render(request, "gestion/acceso.html")

def jugadores(request):
    lista_jugadores = Jugador.objects.all().order_by('nombre_completo')
    return render(request, "gestion/jugadores.html", {'jugadores': lista_jugadores})

def registrar_jugador(request):
    if request.method == 'POST':
        form = JugadorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('gestion:jugadores')
    else:
        form = JugadorForm()
    
    return render(request, "gestion/registrar_jugador.html", {'form': form})

def apoderados(request):
    lista = Apoderado.objects.all().order_by('nombre_completo')
    return render(request, "gestion/apoderados.html", {'apoderados': lista})


def registrar_apoderado(request):
    if request.method == 'POST':
        form = ApoderadoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('gestion:apoderados')
    else:
        form = ApoderadoForm()
    return render(request, "gestion/registrar_apoderado.html", {'form': form})

def home(request):
    return render(request, "gestion/home.html")


def categorias(request):
    return render(request, "gestion/categorias.html")

def calendario(request):
    return render(request, "gestion/calendario.html")

def pagos(request):
    return render(request, "gestion/pagos.html")

def usuarios(request):
    return render(request, "gestion/usuarios.html")

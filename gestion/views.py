from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from cuentas.permisos import roles_requeridos

from .forms import ActualizarJugadorForm, ApoderadoForm, JugadorForm
from .models import Apoderado, Categoria, Jugador


def acceso(request):
    return redirect("cuentas:login")


@roles_requeridos("tesorera", "secretaria")
def jugadores(request):
    query = request.GET.get('q', '').strip()
    categoria_id = request.GET.get('categoria', '').strip()

    lista_jugadores = Jugador.objects.select_related('categoria', 'apoderado').order_by('nombre_completo')
    if query:
        lista_jugadores = lista_jugadores.filter(
            Q(nombre_completo__icontains=query)
            | Q(rut_jugador__icontains=query)
            | Q(apoderado__nombre_completo__icontains=query)
            | Q(apoderado__rut_apoderado__icontains=query)
            | Q(categoria__nombre_categoria__icontains=query)
        )

    categoria_seleccionada = None
    if categoria_id.isdigit():
        categoria_seleccionada = int(categoria_id)
    elif categoria_id:
        categoria = Categoria.objects.filter(nombre_categoria__iexact=categoria_id).first()
        categoria_seleccionada = categoria.pk if categoria else None
        categoria_id = str(categoria_seleccionada) if categoria else ''
    if categoria_seleccionada:
        lista_jugadores = lista_jugadores.filter(categoria_id=categoria_seleccionada)

    return render(request, "gestion/jugadores.html", {
        'jugadores': lista_jugadores,
        'categorias': Categoria.objects.order_by('nombre_categoria'),
        'query': query,
        'categoria_id': categoria_id,
        'categoria_seleccionada': categoria_seleccionada,
        'total_jugadores': Jugador.objects.count(),
    })


@roles_requeridos("tesorera", "secretaria")
def registrar_jugador(request):
    if request.method == 'POST':
        form = JugadorForm(request.POST)
        if form.is_valid():
            jugador = form.save(commit=False)
            anio = jugador.fecha_nacimiento.year
            categoria = Categoria.objects.filter(
                anio_inicio__lte=anio,
                anio_fin__gte=anio
            ).order_by('nombre_categoria').first()
            if categoria:
                jugador.categoria = categoria
                jugador.save()
                messages.success(request, 'El jugador fue inscrito correctamente.')
                return redirect('gestion:jugadores')
            form.add_error('fecha_nacimiento', 'No hay una categoría configurada para el año de nacimiento ingresado.')
    else:
        form = JugadorForm()
    return render(request, "gestion/registrar_jugador.html", {'form': form})


@roles_requeridos("tesorera", "secretaria")
def editar_jugador(request, jugador_id):
    jugador = get_object_or_404(
        Jugador.objects.select_related('categoria', 'apoderado'),
        pk=jugador_id,
    )
    if request.method == 'POST':
        form = ActualizarJugadorForm(request.POST, instance=jugador)
        if form.is_valid():
            form.save()
            messages.success(request, f'Los datos de {jugador.nombre_completo} fueron actualizados.')
            return redirect('gestion:jugadores')
    else:
        form = ActualizarJugadorForm(instance=jugador)

    return render(request, 'gestion/editar_jugador.html', {
        'form': form,
        'jugador': jugador,
    })


@roles_requeridos("tesorera", "secretaria")
def apoderados(request):
    lista = Apoderado.objects.all().order_by('nombre_completo')
    return render(request, "gestion/apoderados.html", {'apoderados': lista})


@roles_requeridos("tesorera", "secretaria")
def registrar_apoderado(request):
    if request.method == 'POST':
        form = ApoderadoForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'El apoderado fue registrado correctamente.')
            return redirect('gestion:apoderados')
    else:
        form = ApoderadoForm()
    return render(request, "gestion/registrar_apoderado.html", {'form': form})


@login_required(login_url="cuentas:login")
def home(request):
    return render(request, "gestion/home.html")


@login_required(login_url="cuentas:login")
def categorias(request):
    return render(request, "gestion/categorias.html")


@login_required(login_url="cuentas:login")
def calendario(request):
    return render(request, "gestion/calendario.html")


@login_required(login_url="cuentas:login")
def pagos(request):
    return render(request, "gestion/pagos.html")


@staff_member_required
def usuarios(request):
    return redirect("admin:cuentas_perfilusuario_changelist")
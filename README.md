# Ayllu Basket

Sistema de administración del club desarrollado con Django.

## Preparar el entorno

```powershell
pipenv sync
Copy-Item .env.example .env
pipenv run python manage.py migrate
pipenv run python manage.py createsuperuser
pipenv run python manage.py runserver
```

La clave del archivo `.env.example` es de muestra y `DEBUG=True` es para desarrollo local; reemplaza la clave y no uses ese valor de `DEBUG` al desplegar.

Abre `http://127.0.0.1:8000/` para iniciar sesión. El formulario público está en `/cuentas/registro/`; las cuentas nuevas reciben el rol Apoderado.

## Asignar roles del club

Inicia sesión en `/admin/` con el superusuario. En **Cuentas > Perfiles de usuario**, cambia el rol de una cuenta a Tesorera o Secretaria. Solo esos roles y los superusuarios pueden consultar, registrar y actualizar jugadores y apoderados.
# Documento tecnico breve - EventHub Universitario

## Descripcion

EventHub Universitario es una aplicacion web para administrar eventos academicos, culturales, deportivos e institucionales. Permite crear categorias, publicar eventos, controlar cupos, registrar asistentes y consultar indicadores desde un dashboard privado.

## Tecnologias

- HTML5, CSS3 y JavaScript puro.
- Bootstrap 5 para componentes responsivos.
- Firebase Authentication para registro, login y logout.
- Firestore Database para almacenamiento.
- Firebase SDK v10 mediante modulos ES.

## Modulos implementados

- Autenticacion: registro, inicio de sesion, cierre de sesion y proteccion de vistas privadas.
- Eventos: crear, listar, ver detalle, editar, cancelar y eliminar.
- Categorias: crear, listar, editar, activar/desactivar y eliminar.
- Asistentes: registro publico, validacion de cupo, consulta, cancelacion y marcado de asistencia.
- Dashboard: total de eventos, proximos eventos, eventos cancelados y asistentes registrados.

## Validaciones principales

- Campos obligatorios en formularios.
- Correos con formato valido.
- Longitudes minimas para nombres, titulos y descripciones.
- Fechas validas.
- Cupos positivos.
- Hora final mayor que hora inicial.
- Evitar correos duplicados en el mismo evento.
- No permitir registro cuando el cupo esta lleno.

## Seguridad

Las reglas de Firestore permiten leer eventos, categorias y registros publicamente para que la vista publica pueda validar cupos y evitar registros duplicados desde JavaScript directo. Las operaciones administrativas de edicion y eliminacion requieren usuario autenticado. Las contrasenas no se guardan en Firestore; se administran exclusivamente con Firebase Authentication.

## Usuario administrador inicial

Correo sugerido: `admin@eventhub.edu.mx`

Este correo queda con rol `admin` al registrarse por primera vez. La contrasena se define al crear la cuenta en Firebase Authentication desde la app.

## Capturas sugeridas para la entrega

- Login.
- Registro.
- Dashboard.
- CRUD de eventos.
- CRUD de categorias.
- Registro publico de asistentes.
- Panel de asistentes.

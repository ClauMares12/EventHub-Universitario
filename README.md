# EventHub Universitario

Sistema web para organizar eventos universitarios, administrar categorias, controlar cupos y registrar asistentes.

## Tecnologias

- HTML, CSS y JavaScript puro.
- Bootstrap 5.
- Firebase Authentication.
- Firestore Database.
- Firebase SDK v10.

## Estructura

```text
eventhub-universitario/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── events.html
│   ├── categories.html
│   ├── registrations.html
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── firebase.js
│           ├── auth.js
│           ├── firestore.js
│           ├── validators.js
│           ├── ui.js
│           └── main.js
├── docs/
│   ├── documento-tecnico.md
│   ├── diagrama-flujo-registro.md
│   └── modelo-datos.md
├── firestore.rules
├── README.md
└── .gitignore
```

## Funcionalidades

- Registro, login, logout y proteccion de dashboard.
- Usuario administrador inicial con correo `admin@eventhub.edu.mx`.
- CRUD completo de eventos.
- CRUD completo de categorias.
- Registro publico de asistentes.
- Validacion de cupo maximo.
- Busqueda y filtros por estado, categoria y fecha.
- Dashboard con total de eventos, eventos proximos, cancelados y total de asistentes.
- Confirmacion antes de eliminar.
- Estados de carga, alertas, estados vacios y diseno responsivo.

## Ejecutar localmente

### Opcion recomendada: Visual Studio Code

1. Abre la carpeta `eventhub-universitario` en Visual Studio Code.
2. Instala la extension `Live Server`.
3. Abre `public/index.html`.
4. Haz clic derecho y selecciona `Open with Live Server`.
5. Abre `http://localhost:5500`.

Tambien puedes revisar `GUIA-VSCODE.md`.

### Opcion con terminal

Desde la carpeta del proyecto:

```bash
python -m http.server 5500 -d public
```

Abre:

```text
http://localhost:5500
```

Tambien se puede usar Live Server de Visual Studio Code apuntando a la carpeta `public`.

## Usuario de prueba

Crear desde la pantalla de registro:

- Correo: `claudiss8@hotmail.com`
- Contrasena: `123456`

Despues creo categorias y eventos desde el dashboard.

## Datos de prueba recomendados

Categorias:

- Academico: conferencias, talleres y seminarios.
- Cultural: teatro, musica y exposiciones.
- Deportivo: torneos y activaciones fisicas.

Eventos:

- Conferencia de Innovacion Tecnologica, categoria Academico, cupo 80, estado published.
- Torneo Relampago de Futbol, categoria Deportivo, cupo 120, estado published.
- Semana Cultural , categoria Cultural, cupo 25, estado draft.


```



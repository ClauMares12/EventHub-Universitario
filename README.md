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

## Configuracion de Firebase

1. Entra a [Firebase Console](https://console.firebase.google.com/).
2. Crea un proyecto llamado `eventhub-universitario`.
3. Agrega una app web.
4. Copia la configuracion que Firebase genera.
5. Abre `public/assets/js/firebase.js`.
6. Reemplaza los valores `TU_API_KEY`, `TU_PROJECT_ID`, etc. por los datos reales.
7. En Firebase Authentication, activa el proveedor `Email/Password`.
8. En Firestore Database, crea la base de datos.
9. Publica las reglas del archivo `firestore.rules`.

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

Tambien puedes usar Live Server de Visual Studio Code apuntando a la carpeta `public`.

## Usuario de prueba

Crear desde la pantalla de registro:

- Correo: `admin@eventhub.edu.mx`
- Contrasena: `Admin12345`

Despues crea categorias y eventos desde el dashboard.

## Datos de prueba recomendados

Categorias:

- Academico: conferencias, talleres y seminarios.
- Cultural: teatro, musica y exposiciones.
- Deportivo: torneos y activaciones fisicas.

Eventos:

- Conferencia de Innovacion Tecnologica, categoria Academico, cupo 80, estado published.
- Torneo Relampago de Futbol, categoria Deportivo, cupo 120, estado published.
- Semana Cultural Universitaria, categoria Cultural, cupo 150, estado draft.

## GitFlow sugerido

```bash
git init
git checkout -b develop
git checkout -b feature/auth
git add .
git commit -m "feat: agregar autenticacion con firebase"
git checkout develop
git merge feature/auth

git checkout -b feature/crud-principal
git add .
git commit -m "feat: agregar crud de eventos categorias y asistentes"
git checkout develop
git merge feature/crud-principal

git checkout -b feature/dashboard
git add .
git commit -m "feat: agregar dashboard de indicadores"
git checkout develop
git merge feature/dashboard

git checkout -b feature/ui
git add .
git commit -m "style: mejorar interfaz responsiva"
git checkout develop
git merge feature/ui

git checkout main
git merge develop
```

## Subir a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/eventhub-universitario.git
git branch -M main
git push -u origin main
git push origin develop
```



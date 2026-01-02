# Frontend – Gestión de Formaciones (Angular)

Aplicación web en **Angular 19** para la gestión de formaciones de Policía Nacional.  
Permite autenticación de usuarios para la creación y edición de formaciones a partir de ficheros Excel, pudiendo exportar las formaciones a listados **PDF** y **Excel**.

---

### Resumen

Este frontend consume la API REST del backend de **Gestión de Formaciones** y ofrece una interfaz web para:

- Login de usuario y control de acceso según rol.
- Listado y gestión de formaciones.
- Creación de nuevas formaciones a partir de un Excel.
- Visualización de las posiciones asignadas (filas/columnas).
- Modificación manual de posiciones dentro de una formación.
- Exportación de la formación a:
  - **PDF**.
  - **Excel**.

Todas las peticiones a la API se realizan con un **token JWT** almacenado en `localStorage`.

---

### Requisitos

- **Node.js 18+** (recomendado)
- **npm** (incluido con Node)
- Acceso a la API del backend

---

### Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/TomiStyle/frontend-formaciones.git
   cd frontend-formaciones
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

---

### Configuración de entornos

La aplicación utiliza dos archivos de entorno:

- `src/environments/environment.ts` → desarrollo (API local)
- `src/environments/environment.prod.ts` → producción (API desplegada en Render)

```ts
// environment.ts (desarrollo)
export const environment = {
  apiUrl: "http://localhost:3000/api/",
};

// environment.prod.ts (producción)
export const environment = {
  apiUrl: "https://backend-formaciones.onrender.com/api/",
};
```

El valor de `apiUrl` se usa en los servicios para construir las URLs de la API, por ejemplo:

```ts
private apiUrl = environment.apiUrl;
```

---

### Scripts npm

```bash
npm run start        # ng serve (desarrollo, API local)
npm run start:prod   # ng serve --configuration production (desarrollo usando API de producción)
npm run build        # ng build (build de producción)
```

---

### Tecnologías y librerías utilizadas

- **Angular 19**
  - `@angular/core`, `@angular/router`, `@angular/forms`, etc.
- **Angular Material** (`@angular/material`, `@angular/cdk`)  
  Componentes de UI (botones, diálogos, tablas, inputs, etc.).
- **Formularios Template-Driven**  
  Manejo de formularios de login, alta/edición de usuarios, ...
- **JWT en cliente** (`@auth0/angular-jwt`)  
  Para gestionar el token en las peticiones HTTP.
- **exceljs**  
  Generación de ficheros **Excel** para exportar las formaciones.
- **jsPDF** con **jspdf-autotable**  
  Generación de **PDF** con tablas de personas.

---

### Estructura del proyecto

Árbol simplificado de la carpeta `src`:

```text
src/
├── app/
│   ├── auth/                     # Módulo / componentes de autenticación (login, guard, etc.)
│   ├── formation/                # Gestión de formaciones
│   │   ├── formation-new/        # Crear nueva formación desde Excel
│   │   ├── formation-view-list/  # Listado de formaciones por columnas
│   │   ├── formation-view-list-row/ # Listado de formaciones por filas
│   │   └── formation.service.ts  # Llamadas HTTP a la API de formaciones
│   ├── home/                     # Página de inicio
│   ├── profile/                  # Perfil y edición de datos del usuario
│   ├── shared/                   # Componentes y servicios compartidos
│   │   ├── confirm-dialog/       # Diálogo genérico de confirmación
│   │   ├── loading-overlay/      # Componente de espera de carga
│   │   ├── navbar/               # Barra de navegación / menú
│   │   └── person-detail-modal/  # Modal con detalle de persona/posición en formaciones
│   ├── users/                    # Gestión de usuarios
│   ├── app.component.ts          # Componente raíz
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.routes.ts             # Definición de rutas (Angular Router)
│   └── app.config.ts             # Configuración de la app (providers, etc.)
│
├── environments/
│   ├── environment.ts            # Variables de entorno de desarrollo
│   └── environment.prod.ts       # Variables de entorno de producción
│
├── index.html
└── main.ts
```

> La estructura puede ampliarse con más módulos / componentes según crezcan las funcionalidades.

---

### Autenticación y gestión de sesión

El frontend utiliza JWT para autenticar las peticiones con el backend.

#### Flujo básico

1. El usuario introduce **Usuario** y **contraseña** en el formulario de login.
2. Se envía la petición a `POST /api/users/login` a través de `AuthService`.
3. Si las credenciales son correctas, el backend devuelve:
   - `token` (JWT)
   - `user` (datos del usuario autenticado)
4. El frontend almacena estos datos en `localStorage`.

El token se inyecta automáticamente en las peticiones HTTP a través de un **interceptor** (`jwt.interceptos.ts`), de forma que todas las rutas protegidas del backend requieren que el usuario esté autenticado.

---

### Funcionalidades principales

#### Autenticación

- Formulario de login por **DNI** y contraseña.
- Validaciones básicas en cliente (formularios template-driven).
- Gestión de sesión:
  - Guardado de `token` y `user` en `localStorage`.
  - Logout eliminando datos de `localStorage` y redirigiendo a login.

#### Gestión de formaciones

- Subida de un fichero **Excel** para crear una nueva formación:
  - Se envía al backend con los datos de título, fecha y número de columnas.
  - El backend calcula las posiciones (filas y columnas) y guarda la formación.
- Listado de formaciones:
  - Visualización de formaciones activas, con sus datos básicos.
- Vista de detalle:
  - Visualización de formaciones por filas o columnas.

#### Edición de posiciones

- Modificación manual de posiciones de personas dentro de una formación.
- Feedback visual mediante componentes de carga (`loading-overlay`) y notificaciones.

#### Exportación

- **Exportación a PDF**:
  - Uso de **jsPDF** y **jspdf-autotable**.
  - Generación de un documento donde en cada página se listan las filas/columnas de la formación con sus personas correspondientes.
- **Exportación a Excel**:
  - Uso de **exceljs**.
  - Creación de un libro donde cada hoja representa una fila/columnas de la formación.
  - Cada hoja incluye las personas correspondientes a esa fila/columna.

---

### Navegación y rutas

El fichero `app.routes.ts` define las rutas principales de la aplicación.

El acceso a las rutas protegidas está condicionado a que el usuario esté logueado.

---

### Desarrollo y despliegue

#### Entorno de desarrollo (API local)

```bash
npm run start
# Abre http://localhost:4200
# Usa environment.ts -> http://localhost:3000/api/
```

#### Desarrollo contra backend de producción

```bash
npm run start:prod
# Usa environment.prod.ts -> https://backend-formaciones.onrender.com/api/
```

#### Build de producción

```bash
npm run build
# Genera la carpeta dist/ para desplegar en Netlify
```

---

### Notas

- La aplicación está pensada para trabajar con un tráfico de datos bajo, priorizando la sencillez y el mantenimiento.
- Todas las operaciones de gestión (formaciones, usuarios) están condicionadas al rol del usuario devuelto por el backend.
- El frontend está preparado para desplegarse en servicios como **Netlify**, consumiendo la API desplegada, por ejemplo, en **Render**.

---

### Licencia

© (Tomás de la Torre Rando)

Reservados todos los derechos. Está prohibido la reproducción total o parcial de esta obra por cualquier medio o procedimiento, comprendidos la impresión, la reprografía, el microfilme, el tratamiento informático o cualquier otro sistema, así como la distribución de ejemplares mediante alquiler y préstamo, sin la autorización escrita del autor o de los límites que autorice la Ley de Propiedad Intelectual.

---

### Autor

Frontend desarrollado por **Tomás de la Torre Rando** para el proyecto **Gestión de Formaciones**.

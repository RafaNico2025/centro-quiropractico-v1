# 🏥 Centro Quiropráctico - Sistema de Gestión

Sistema web integral para la gestión de un centro quiropráctico que incluye gestión de pacientes, citas médicas, servicios, contabilidad y estadísticas.

## 📋 Descripción

Este proyecto está desarrollado como un sistema completo para la administración de un centro quiropráctico, permitiendo a los profesionales gestionar eficientemente:

- **Gestión de Pacientes**: Registro y administración de expedientes clínicos
- **Sistema de Citas**: Programación y gestión de turnos médicos
- **Servicios**: Catálogo de tratamientos y terapias disponibles
- **Contabilidad**: Control de pagos y facturación
- **Estadísticas**: Reportes y análisis de datos del centro
- **Dashboard**: Panel de control para profesionales y pacientes

## 🏗️ Arquitectura del Proyecto

El proyecto está estructurado con una arquitectura de cliente-servidor separada:

```
centro-quiro-vite/
├── frontend/          # Aplicación React con Vite
├── backend/           # API REST con Node.js y Express
└── README.md         # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuario
- **Vite** - Herramienta de desarrollo y build
- **Tailwind CSS** - Framework de CSS para diseño
- **Radix UI** - Componentes accesibles y reutilizables
- **React Router** - Navegación del lado del cliente
- **React Hook Form** - Manejo de formularios
- **React Big Calendar** - Componente de calendario
- **Axios** - Cliente HTTP para comunicación con la API
- **Lucide React** - Iconografía moderna
- **Date-fns** - Utilidades para manejo de fechas

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **Sequelize** - ORM para base de datos SQL
- **PostgreSQL** - Base de datos relacional
- **Supabase** - Backend como servicio (BaaS)
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Hashing de contraseñas
- **Nodemailer** - Envío de correos electrónicos
- **Swagger** - Documentación de API
- **ExcelJS** - Generación de reportes en Excel

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- PostgreSQL
- Git

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd centro-quiro-vite
```

### 2. Configurar el Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

Configurar las variables de entorno en el archivo `.env`:

```env
# Base de datos
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_secret_key

# Email (Nodemailer)
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password

# Puerto del servidor
PORT=3000
```

### 3. Configurar el Frontend

```bash
# Navegar al directorio frontend
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno (opcional)
cp .env.example .env
```

Configurar las variables de entorno del frontend (si es necesario):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🏃‍♂️ Ejecutar la Aplicación

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Acceso a la Aplicación

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Documentación API**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 📖 Estructura del Proyecto

### Backend
```
backend/
├── config/           # Configuraciones (Swagger, DB)
├── database/         # Conexión y modelos de base de datos
├── middleware/       # Middlewares personalizados
├── models/          # Modelos de datos
├── presentation/    # Controladores y rutas
├── services/        # Lógica de negocio
├── test/           # Archivos de prueba
└── index.js        # Punto de entrada del servidor
```

### Frontend
```
frontend/
├── public/          # Archivos estáticos
├── src/
│   ├── assets/      # Recursos (imágenes, iconos)
│   ├── components/  # Componentes reutilizables
│   ├── context/     # Contextos de React
│   ├── hooks/       # Hooks personalizados
│   ├── lib/         # Utilidades y configuraciones
│   ├── pages/       # Páginas de la aplicación
│   ├── services/    # Servicios para comunicación con API
│   ├── styles/      # Estilos globales
│   └── utils/       # Funciones utilitarias
├── index.html       # Punto de entrada HTML
└── vite.config.js   # Configuración de Vite
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm test           # Ejecutar pruebas
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Crear build de producción
npm run preview    # Previsualizar build de producción
npm run lint       # Ejecutar linter
```

## 📱 Funcionalidades Principales

### Para Administradores/Profesionales
- Dashboard con métricas principales
- Gestión completa de pacientes
- Programación y administración de citas
- Gestión de servicios y tratamientos
- Control de contabilidad y facturación
- Generación de reportes estadísticos
- Gestión de historiales clínicos

### Para Pacientes
- Dashboard personal
- Visualización de citas programadas
- Acceso a historial clínico
- Información de contacto del centro

## 🔐 Autenticación y Seguridad

- Autenticación basada en JWT (JSON Web Tokens)
- Encriptación de contraseñas con Bcrypt
- Middleware de autorización para rutas protegidas
- Validación de datos en frontend y backend
- Configuración CORS para seguridad del cliente

## 📊 Base de Datos

El sistema utiliza PostgreSQL con Sequelize como ORM. La base de datos incluye tablas para:

- Usuarios (profesionales y pacientes)
- Pacientes y expedientes clínicos
- Citas médicas
- Servicios y tratamientos
- Registros contables
- Notificaciones

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
npm run build
# Subir carpeta 'dist' al servicio de hosting
```

### Backend (Railway/Heroku/AWS)
```bash
# Configurar variables de entorno en el servicio
# Asegurar que PORT esté configurado correctamente
npm start
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Para probar notificaciones específicamente
npm run test:notifications
```


### Frontend

El frontend cuenta con pruebas unitarias automatizadas utilizando **Vitest** y **Testing Library**.

#### Ejecutar los tests del frontend

```bash
cd frontend
npm run test
```
o
```bash
npx vitest run
```

#### Estructura de los tests

- Los tests se encuentran en:  
  `frontend/src/__tests__/`
- Los mocks de componentes UI y servicios están en:  
  `frontend/src/__tests__/__mocks__/`

#### Ejemplo de script de prueba

```jsx
it('valida campos requeridos', async () => {
  render(<AppointmentForm {...defaultProps} />)
  const submitButton = screen.getByRole('button', { name: /crear/i })
  fireEvent.click(submitButton)
  expect(screen.getByLabelText('Fecha')).toBeRequired()
  expect(screen.getByLabelText('Hora de inicio')).toBeRequired()
  expect(screen.getByLabelText('Hora de fin')).toBeRequired()
  expect(screen.getByLabelText('Motivo')).toBeRequired()
})
```

## 👥 Autores

- Nicolás Castro
- Rafael Fuentes


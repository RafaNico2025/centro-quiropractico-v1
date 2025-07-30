# 🏥 Gonzalo Cajeao Quiropraxia - Sistema de Gestión

Sistema web integral para la gestión de un consultorio quiropráctico que incluye gestión de pacientes, citas médicas, servicios, contabilidad y estadísticas.

## 🌐 Acceso Directo - Deploy en Producción

🔗 **Aplicación Web**: [https://gonzalocajeao.onrender.com/](https://gonzalocajeao.onrender.com/)  
📚 **Documentación API**: [https://centro-quiropractico-v1.onrender.com/api-docs/#/](https://centro-quiropractico-v1.onrender.com/api-docs/#/)

## 📋 Descripción

Este proyecto está desarrollado como un sistema completo para la administración de un consultorio quiropráctico, permitiendo a los profesionales gestionar eficientemente:

- **Gestión de Pacientes**: Registro y administración de expedientes clínicos
- **Sistema de Citas**: Programación y gestión de turnos médicos
- **Servicios**: Catálogo de tratamientos y terapias disponibles
- **Contabilidad**: Control de pagos y facturación
- **Estadísticas**: Reportes y análisis de datos del consultorio
- **Dashboard**: Panel de control para profesionales y pacientes
- **Recuperación de Contraseña**: Sistema completo de reset de contraseña por email
- **Generación de Reportes**: Exportación de estadísticas a Excel
- **Sistema de Notificaciones**: Emails automáticos para citas

## 🏗️ Arquitectura del Proyecto

El proyecto está estructurado con una arquitectura de cliente-servidor separada:

```
centro-quiro-vite/
├── frontend/          # Aplicación React con Vite
├── backend/           # API REST con Node.js y Express
└── README.md         # Este archivo
```

![Diagrama](./frontend/assets/diagrama.jpg)


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
- **Crypto** - Generación de tokens seguros para reset de contraseña
- **Swagger** - Documentación de API
- **ExcelJS** - Generación de reportes en Excel
- **Nodemailer** - Envío de correos electrónicos
- **Axios** - Cliente HTTP para notificaciones externas

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
SUPABASE_DB=postgresql://postgres.user:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
SUPABASE_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_secret_key

# URLs del Frontend y Backend
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Email (Gmail con App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# CORS - Orígenes permitidos
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Información del Centro (para emails)
CENTRO_NAME="Tu Centro Quiropráctico"
CENTRO_ADDRESS="Tu Dirección"
CENTRO_PHONE="+54 XXX XXX XXXX"
CENTRO_EMAIL="contacto@tucentro.com"

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development
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

#### Desarrollo Local
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Documentación API**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

#### Producción (Deploy)
- **Frontend**: [https://gonzalocajeao.onrender.com/](https://gonzalocajeao.onrender.com/)
- **Backend API**: [https://centro-quiropractico-v1.onrender.com/api/v1](https://centro-quiropractico-v1.onrender.com/api/v1)
- **Documentación API**: [https://centro-quiropractico-v1.onrender.com/api-docs/#/](https://centro-quiropractico-v1.onrender.com/api-docs/#/)

### Ingreso como Administrador:
Usuario: admin
Contraseña: admin123

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
- Exportación de estadísticas a Excel
- Sistema de notificaciones automáticas

### Para Pacientes
- Dashboard personal
- Visualización de citas programadas
- Información de contacto del centro

### Para Todos los Usuarios
- Sistema de autenticación seguro
- Recuperación de contraseña por email
- Formulario de contacto integrado
- Interfaz responsive y moderna
- Botón flotante de WhatsApp para contacto directo
- Sistema de notificaciones por email

## 🔐 Autenticación y Seguridad

- Autenticación basada en JWT (JSON Web Tokens)
- Encriptación de contraseñas con Bcrypt
- Sistema de recuperación de contraseña con tokens seguros
- Tokens de reset con expiración automática (1 hora)
- Envío de emails seguros con enlaces de recuperación
- Middleware de autorización para rutas protegidas
- Validación de datos en frontend y backend
- Configuración CORS para seguridad del cliente

## 🔑 Sistema de Recuperación de Contraseña

El sistema incluye una funcionalidad completa de recuperación de contraseña:

### Funcionalidades
- **Olvido de contraseña**: Los usuarios pueden solicitar un reset desde la página de login
- **Envío de emails**: Se envía automáticamente un email con enlace de recuperación
- **Tokens seguros**: Cada enlace incluye un token único con expiración de 1 hora
- **Validaciones**: Verificación de email válido y token no expirado
- **Interfaz amigable**: Páginas dedicadas para el proceso completo

### Endpoints API
- `POST /api/v1/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/v1/auth/reset-password` - Resetear contraseña con token

### Páginas Frontend
- `/forgot-password` - Formulario para ingresar email
- `/reset-password/:token` - Formulario para nueva contraseña

### Configuración Email
Para que funcione correctamente, configura estas variables en tu `.env`:
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
FRONTEND_URL=http://localhost:5173  # URL del frontend para los enlaces
```

## 📊 Base de Datos

El sistema utiliza PostgreSQL con Sequelize como ORM. La base de datos incluye tablas para:

- Usuarios (profesionales y pacientes)
- Pacientes y expedientes clínicos
- Citas médicas
- Servicios y tratamientos
- Registros contables
- Notificaciones
- Tokens de recuperación de contraseña (con expiración automática)

## 🚀 Despliegue

### URLs de Producción
- **Aplicación Web**: [https://gonzalocajeao.onrender.com/](https://gonzalocajeao.onrender.com/)
- **API y Documentación**: [https://centro-quiropractico-v1.onrender.com/api-docs/#/](https://centro-quiropractico-v1.onrender.com/api-docs/#/)

### Frontend (Render)
```bash
npm run build
# Conectar repositorio con Render
# Configurar build command: npm run build
# Configurar publish directory: dist
```

### Backend (Render)
```bash
# Conectar repositorio con Render
# Configurar start command: npm start
# Configurar variables de entorno en el panel de Render
# Importante: FRONTEND_URL=https://gonzalocajeao.onrender.com
```

### Variables de Entorno para Producción
```env
NODE_ENV=production
FRONTEND_URL=https://gonzalocajeao.onrender.com
ALLOWED_ORIGINS=https://gonzalocajeao.onrender.com,https://centro-quiropractico-v1.onrender.com
# ... resto de variables de producción
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
### SWAGGER
- **Desarrollo**: http://localhost:3000/api-docs
- **Producción**: [https://centro-quiropractico-v1.onrender.com/api-docs/#/](https://centro-quiropractico-v1.onrender.com/api-docs/#/)

La documentación incluye todos los endpoints disponibles, incluyendo:
- Autenticación y registro
- Gestión de usuarios y pacientes  
- Sistema de citas
- Recuperación de contraseña
- Servicios de contabilidad

## 📧 Configuración de Email (Gmail)

Para configurar el envío de emails de recuperación de contraseña:

1. **Crear App Password en Gmail**:
   - Ve a tu cuenta de Google → Seguridad
   - Activa la verificación en 2 pasos
   - Genera una "Contraseña de aplicación"
   - Usa esa contraseña en `EMAIL_PASSWORD`

2. **Variables requeridas**:
   ```env
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_app_password_generado
   ```

3. **Configuración para producción**:
   - Asegúrate de que `FRONTEND_URL` apunte a tu dominio de producción
   - Ejemplo: `FRONTEND_URL=https://tu-dominio.com`

## 🔧 Migración de Base de Datos

Después de agregar nuevas funcionalidades, sincroniza la base de datos:

```bash
cd backend
npm run dev  # Sequelize sincronizará automáticamente los nuevos campos
```

**Campos agregados recientemente**:
- `Users.resetPasswordToken` - Token para reset de contraseña
- `Users.resetPasswordExpires` - Fecha de expiración del token

## 👥 Autores

- Nicolás Castro
- Rafael Fuentes


# 🎮 Juego Educativo USB Medellín

## 📋 Descripción General

El **Juego Educativo USB Medellín** es una aplicación web interactiva diseñada para familiarizar a los aspirantes y estudiantes con los diferentes servicios y procesos de la Universidad San Buenaventura Medellín. A través de una experiencia gamificada, los usuarios pueden aprender sobre las áreas clave de la universidad mientras completan puzzles y desafíos educativos.

### 🎯 Objetivos del Proyecto

- **Educar** a los aspirantes sobre los servicios universitarios
- **Gamificar** el proceso de aprendizaje institucional
- **Facilitar** la comprensión de procesos administrativos
- **Incentivar** la participación a través de un sistema de recompensas
- **Proporcionar** una experiencia interactiva y atractiva

### 🏛️ Áreas Educativas Cubiertas

1. **Mercadeo** - Campañas promocionales y orientación
2. **Registro Académico** - Proceso de inscripción y matrícula
3. **Bienestar Institucional** - Servicios de apoyo estudiantil
4. **Facultades** - Programas académicos y estructura
5. **Cartera** - Aspectos financieros y pagos

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.2.0** - Biblioteca principal para la interfaz de usuario
- **Vite 5.0.8** - Herramienta de construcción y desarrollo
- **Tailwind CSS 3.3.6** - Framework de estilos utilitarios
- **React Router DOM 6.8.1** - Enrutamiento del lado del cliente
- **React Hot Toast 2.4.1** - Sistema de notificaciones
- **Axios 1.6.2** - Cliente HTTP para comunicación con la API
- **Lucide React 0.294.0** - Biblioteca de iconos
- **Phaser 3.60.0** - Motor de juegos (para funcionalidades avanzadas)

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js 4.18.2** - Framework web para Node.js
- **PostgreSQL** - Base de datos relacional
- **bcryptjs 2.4.3** - Encriptación de contraseñas
- **jsonwebtoken 9.0.2** - Autenticación basada en tokens
- **nodemailer 7.0.6** - Envío de correos electrónicos
- **express-rate-limit 7.1.5** - Limitación de velocidad de requests
- **helmet 7.1.0** - Seguridad HTTP
- **express-validator 7.0.1** - Validación de datos
- **cors 2.8.5** - Configuración de CORS
- **dotenv 16.3.1** - Gestión de variables de entorno

### Base de Datos
- **PostgreSQL** - Base de datos principal
- **Neon** - Plataforma de base de datos en la nube (producción)
- **Pool de conexiones** - Gestión eficiente de conexiones

### Herramientas de Desarrollo
- **Nodemon 3.0.2** - Reinicio automático del servidor en desarrollo
- **Autoprefixer 10.4.16** - Prefijos CSS automáticos
- **PostCSS 8.4.32** - Procesamiento de CSS
- **@vitejs/plugin-react 4.2.1** - Plugin de React para Vite

### Despliegue y Hosting
- **Render** - Plataforma de hosting para frontend y backend
- **Neon** - Base de datos PostgreSQL en la nube
- **Git** - Control de versiones

---

## 🏗️ Arquitectura del Sistema

### Patrón de Desarrollo
- **Arquitectura de Microservicios** - Separación clara entre frontend y backend
- **API REST** - Comunicación entre cliente y servidor
- **MVC (Model-View-Controller)** - Organización del código backend
- **Component-Based Architecture** - Arquitectura basada en componentes React
- **Context API** - Gestión de estado global en React
- **Custom Hooks** - Lógica reutilizable en React

### Estructura del Proyecto

```
juegoAspirantes/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── puzzles/    # Componentes de juegos
│   │   │   └── ...
│   │   ├── contexts/       # Contextos de React
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── utils/          # Utilidades y configuraciones
│   │   └── config/         # Configuraciones del cliente
│   ├── public/             # Archivos estáticos
│   └── dist/               # Build de producción
├── server/                 # Backend Node.js
│   ├── config/             # Configuraciones del servidor
│   ├── routes/             # Rutas de la API
│   ├── services/           # Lógica de negocio
│   └── index.js            # Punto de entrada del servidor
├── database_schema.sql     # Esquema de la base de datos
└── README.md              # Este archivo
```

---

## 🎮 Tipos de Puzzles Implementados

### 1. **Rompecabezas (Jigsaw Puzzle)**
- **Tecnología**: Canvas HTML5 y manipulación DOM
- **Características**: 
  - 3 piezas iniciales bloqueadas
  - Sistema de pistas con piezas naranjas
  - Bordes delgados para mejor visualización
  - Contenedor responsivo y ampliado

### 2. **Sopa de Letras (Word Search)**
- **Tecnología**: Algoritmos de generación de grillas
- **Características**: Búsqueda de palabras relacionadas con la universidad

### 3. **Sudoku**
- **Tecnología**: Algoritmos de resolución y validación
- **Características**: Números relacionados con procesos universitarios

### 4. **Puzzle Secuencial**
- **Tecnología**: Lógica de secuencias y patrones
- **Características**: Ordenamiento de procesos administrativos

### 5. **Puzzle de Asociación**
- **Tecnología**: Sistema de emparejamiento
- **Características**: Relación entre conceptos y servicios

### 6. **Crucigrama (Crossword)**
- **Tecnología**: Algoritmos de colocación de palabras
- **Características**: Definiciones relacionadas con la universidad

### 7. **Puzzle Matemático**
- **Tecnología**: Cálculos y validaciones matemáticas
- **Características**: Problemas relacionados con costos y becas

### 8. **Memoria (Memory Match)**
- **Tecnología**: Sistema de volteo de cartas
- **Características**: Emparejamiento de conceptos universitarios

---

## 🗄️ Base de Datos

### Esquema Principal

#### Tablas Core
- **users** - Información de usuarios y autenticación
- **game_levels** - Niveles del juego (5 niveles)
- **puzzles** - Configuración de puzzles por nivel
- **user_progress** - Progreso general del usuario
- **user_puzzle_progress** - Progreso detallado por puzzle

#### Sistema de Recompensas
- **rewards_catalog** - Catálogo de recompensas disponibles
- **user_rewards** - Recompensas obtenidas por usuarios

#### Sistema de Logros
- **achievements** - Logros disponibles
- **user_achievements** - Logros obtenidos por usuarios

#### Gestión de Sesiones
- **game_sessions** - Sesiones activas de usuarios

### Características de la Base de Datos
- **12 tablas principales**
- **25+ índices optimizados**
- **5 triggers automáticos**
- **2 vistas optimizadas**
- **Funciones PL/pgSQL** para automatización
- **Constraints y validaciones** de integridad

---

## 🔐 Seguridad

### Medidas Implementadas
- **Autenticación JWT** - Tokens seguros para sesiones
- **Encriptación de contraseñas** - bcryptjs con salt
- **Rate Limiting** - Protección contra ataques de fuerza bruta
- **Helmet.js** - Headers de seguridad HTTP
- **CORS configurado** - Control de acceso cross-origin
- **Validación de entrada** - Sanitización de datos
- **Variables de entorno** - Configuración segura
- **SSL/TLS** - Conexiones encriptadas en producción

### Configuración de Seguridad
```javascript
// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests por minuto
  message: 'Demasiadas solicitudes'
});

// Helmet para headers de seguridad
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)
- **npm** o **yarn**
- **Git**

### Instalación del Backend

```bash
# Clonar el repositorio
git clone <repository-url>
cd juegoAspirantes/back

# Instalar dependencias del servidor
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
psql -U postgres
CREATE DATABASE usbmeda_db;
\c usbmeda_db;
\i ../database_schema.sql

# Iniciar servidor en desarrollo
npm run dev

# Iniciar servidor en producción
npm start
```

### Instalación del Frontend

```bash
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

### Variables de Entorno

#### Backend (.env)
```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/usbmeda_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# Servidor
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Juego Educativo USB Medellín
```

---

## 🎯 Funcionalidades Principales

### Sistema de Usuarios
- **Registro** con validación de datos
- **Autenticación** segura con JWT
- **Perfil de usuario** con información personal
- **Gestión de sesiones** con tokens seguros

### Sistema de Juego
- **5 niveles** progresivos
- **8 tipos de puzzles** diferentes
- **Sistema de estrellas** basado en rendimiento
- **Pistas limitadas** (3 por puzzle)
- **Penalizaciones** por tiempo y errores

### Sistema de Progreso
- **Seguimiento detallado** del progreso
- **Desbloqueo progresivo** de niveles
- **Estadísticas** de rendimiento
- **Persistencia** de datos en PostgreSQL

### Sistema de Recompensas
- **Recompensas virtuales** (descuentos)
- **Recompensas físicas** (merchandising)
- **Códigos de canje** únicos
- **Sistema de puntos** basado en estrellas

### Sistema de Logros
- **Logros automáticos** basados en progreso
- **Notificaciones** de logros obtenidos
- **Sistema de badges** visuales

---

## 📱 Responsive Design

### Breakpoints
```css
/* Tailwind CSS Breakpoints */
xs: 475px    /* Móviles pequeños */
sm: 640px    /* Móviles */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Pantallas grandes */
3xl: 1920px  /* Pantallas extra grandes */
4xl: 2560px  /* Pantallas 4K */
```

### Características Responsive
- **Diseño adaptativo** para todos los dispositivos
- **Navegación móvil** optimizada
- **Puzzles responsivos** que se adaptan al tamaño de pantalla
- **Sidebars colapsables** en dispositivos móviles
- **Touch-friendly** para dispositivos táctiles

---

## 🎨 Sistema de Diseño

### Paleta de Colores
```css
/* Colores principales USB Medellín */
--usb-orange: #f97316    /* Color principal */
--usb-black: #0f172a     /* Color secundario */
--usb-white: #ffffff     /* Color de fondo */
--usb-gold: #f59e0b      /* Color de acento */
--usb-green: #10b981     /* Color de éxito */
--usb-red: #ef4444       /* Color de error */
--usb-blue: #3b82f6      /* Color de información */
--usb-purple: #8b5cf6    /* Color de advertencia */
```

### Tipografía
- **Fuente principal**: Inter (sistema)
- **Fuente de display**: Poppins (sistema)
- **Jerarquía tipográfica** clara y consistente

### Componentes
- **Sistema de componentes** reutilizables
- **Estados visuales** claros (hover, active, disabled)
- **Animaciones suaves** con CSS transitions
- **Iconografía consistente** con Lucide React

---

## 🔧 API Endpoints

### Autenticación
```
POST /api/auth/register    # Registro de usuario
POST /api/auth/login       # Inicio de sesión
POST /api/auth/logout      # Cerrar sesión
GET  /api/auth/verify      # Verificar token
```

### Juego
```
GET  /api/game/levels      # Obtener niveles del juego
GET  /api/game/puzzles/:levelId  # Obtener puzzles de un nivel
POST /api/game/calculate-stars   # Calcular estrellas
```

### Progreso
```
GET  /api/progress/:userId           # Obtener progreso del usuario
POST /api/progress/:userId/update    # Actualizar progreso
GET  /api/progress/:userId/stats     # Obtener estadísticas
```

### Recompensas
```
GET  /api/rewards/user/:userId       # Obtener recompensas del usuario
POST /api/rewards/claim-virtual      # Reclamar recompensa virtual
POST /api/rewards/request-physical   # Solicitar recompensa física
```

---

## 🚀 Despliegue

### Render (Producción)
- **Frontend**: Desplegado como Static Site
- **Backend**: Desplegado como Web Service
- **Base de datos**: Neon PostgreSQL
- **Dominio**: Configurado automáticamente

### Configuración de Despliegue
```yaml
# render.yaml
services:
  - type: static
    name: juego-aspirantes-client
    buildCommand: cd client && npm ci --include=dev && npm run build
    publishPath: client/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Variables de Entorno de Producción
```env
# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=production_secret
NODE_ENV=production
CLIENT_URL=https://tu-frontend.onrender.com

# Frontend
VITE_API_BASE_URL=https://tu-backend.onrender.com
```

---

## 🧪 Testing y Calidad

### Estrategia de Testing
- **Testing manual** de funcionalidades
- **Validación de datos** en frontend y backend
- **Pruebas de integración** con base de datos
- **Testing de responsividad** en diferentes dispositivos

### Herramientas de Calidad
- **ESLint** - Linting de código JavaScript
- **Prettier** - Formateo de código
- **Validación de formularios** - express-validator
- **Sanitización de datos** - Helmet.js

---

## 📊 Métricas y Analytics

### Métricas Implementadas
- **Tiempo de juego** por puzzle
- **Número de errores** por sesión
- **Pistas utilizadas** por puzzle
- **Progreso de usuarios** por nivel
- **Tasa de completación** de puzzles
- **Estadísticas de recompensas** reclamadas

### Dashboard de Administración
- **Estadísticas generales** del juego
- **Progreso de usuarios** individuales
- **Análisis de rendimiento** por nivel
- **Reportes de recompensas** y logros

---

## 🔄 Mantenimiento y Actualizaciones

### Estrategia de Versionado
- **Semantic Versioning** (SemVer)
- **Changelog** detallado
- **Tags de Git** para releases
- **Branching strategy** con GitFlow

### Monitoreo
- **Logs estructurados** en el servidor
- **Métricas de rendimiento** de la base de datos
- **Monitoreo de errores** en producción
- **Alertas automáticas** para problemas críticos

---

## 🤝 Contribución

### Guías de Contribución
1. **Fork** del repositorio
2. **Crear branch** para nueva funcionalidad
3. **Commit** con mensajes descriptivos
4. **Push** al branch
5. **Pull Request** con descripción detallada

### Estándares de Código
- **ESLint** configurado
- **Prettier** para formateo
- **Conventional Commits** para mensajes
- **Documentación** en código

---

## 📞 Soporte y Contacto

### Información del Proyecto
- **Universidad**: San Buenaventura Medellín
- **Proyecto**: Juego Educativo para Aspirantes
- **Versión**: 1.0.0
- **Licencia**: Propietaria

### Recursos Adicionales
- **Documentación técnica** en el código
- **Comentarios detallados** en funciones complejas
- **README específicos** en cada módulo
- **Guías de usuario** integradas en la aplicación

---

## 🎓 Conclusión

El **Juego Educativo USB Medellín** representa una solución innovadora para la educación universitaria, combinando tecnología moderna con pedagogía efectiva. La aplicación no solo educa a los usuarios sobre los servicios universitarios, sino que también proporciona una experiencia de usuario excepcional a través de su diseño responsivo, sistema de gamificación y arquitectura robusta.

### Logros Técnicos
- ✅ **Arquitectura escalable** con separación clara de responsabilidades
- ✅ **Base de datos optimizada** con índices y triggers automáticos
- ✅ **Seguridad robusta** con múltiples capas de protección
- ✅ **Experiencia de usuario** excepcional en todos los dispositivos
- ✅ **Sistema de gamificación** completo y funcional
- ✅ **Despliegue automatizado** en la nube

### Impacto Educativo
- 🎯 **Aprendizaje interactivo** sobre servicios universitarios
- 🏆 **Motivación** a través de sistema de recompensas
- 📊 **Seguimiento** del progreso educativo
- 🎮 **Experiencia gamificada** que mantiene el engagement
- 📱 **Accesibilidad** en múltiples dispositivos

---

*Desarrollado con ❤️ para la Universidad San Buenaventura Medellín*

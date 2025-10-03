# 🎮 Juego Educativo USB Medellín

## 📖 Descripción
Juego serio estilo Hoshi Saga para aspirantes de la Universidad de San Buenaventura Medellín. Los estudiantes aprenden sobre procesos de inscripción mientras resuelven puzzles interactivos y ganan premios reales.

## 🎯 Objetivos
- Simular el proceso de inscripción universitaria de manera gamificada
- Guiar por 5 bases: Cartera, Registro Académico, Bienestar, Mercadeo, Facultades
- Incentivar participación con premios virtuales y físicos (descuentos hasta 8% en matrícula)
- Asegurar que cada nivel esté relacionado temáticamente con su base
- Proporcionar una experiencia educativa interactiva y divertida

## 🕹️ Mecánicas del Juego
- **Estilo**: Inspirado en Hoshi Saga (mini-retos/puzzles por niveles)
- **Estructura**: 5 bases principales con caminos no lineales
- **Sistema de estrellas**: Hasta 5 estrellas por puzzle (basado en tiempo, precisión y uso de pistas)
- **Progresión**: Avance secuencial por bases
- **Un solo intento**: Solo puedes intentar cada puzzle una vez
- **Sistema de recompensas**: Descuentos no acumulables, se aplica el mayor obtenido

## 🎮 Tipos de Puzzles Implementados

### 1. **Memory Match Puzzle** (Cartera)
- Encuentra pares de conceptos financieros relacionados
- 10 pares de tarjetas con información sobre pagos, servicios y costos
- Modal educativo con información detallada de cada concepto

### 2. **Sequential Puzzle** (Registro Académico)
- Ordena correctamente los pasos del proceso de inscripción
- Drag & Drop de 4 pasos principales
- Secuencia: Formulario → Documentos → Pago → Confirmación

### 3. **Math Puzzle** (Cartera)
- 8 problemas matemáticos relacionados con costos universitarios
- Calculadora integrada para resolver ejercicios
- Dificultad progresiva desde básico hasta avanzado

### 4. **Association Puzzle** (Facultades)
- Conecta conceptos académicos con sus imágenes correspondientes
- Sistema de líneas dinámicas para crear asociaciones
- Categorías temáticas por facultad

### 5. **Crossword Puzzle** (Bienestar)
- Crucigrama con términos relacionados a servicios universitarios
- Pistas contextuales sobre bienestar estudiantil
- Validación en tiempo real

### 6. **Word Search** (Mercadeo)
- Búsqueda de palabras relacionadas con financiación
- Términos sobre becas, créditos y opciones de pago
- Diferentes niveles de dificultad

### 7. **Sudoku Puzzle** (Registro Académico)
- Sudoku clásico con dificultad media
- 36 celdas prellenadas de 81 totales
- Validación automática de reglas

### 8. **Jigsaw Puzzle** (Facultades)
- Rompecabezas de imágenes institucionales
- Piezas interactivas con física realista
- Diferentes tamaños de puzzle

## 🏆 Sistema de Recompensas

### Recompensas Virtuales
- **Insignias**: Logros por completar objetivos específicos
- **Títulos**: Nombres especiales para el perfil del usuario
- **Puntos de experiencia**: Sistema de puntuación acumulativa
- **Desbloqueos**: Contenido adicional desbloqueable

### Recompensas Físicas
- **Descuentos en matrícula**: Hasta 8% según estrellas obtenidas
- **Merchandise**: Productos oficiales de la universidad
- **Certificados**: Diplomas de logros académicos
- **Eventos**: Acceso a eventos especiales

### Sistema de Logros
- **Primeros Pasos**: Completa tu primer puzzle
- **Coleccionista de Estrellas**: Obtén 50 estrellas en total
- **Maestro de Niveles**: Completa todos los niveles
- **Demonio de la Velocidad**: Completa un nivel en menos de 5 minutos
- **Perfeccionista**: Obtén 5 estrellas en 10 puzzles diferentes
- **Estudiante Dedicado**: Juega durante 7 días consecutivos
- **Buscador de Conocimiento**: Completa 100 puzzles en total
- **Mariposa Social**: Comparte tu progreso 5 veces

## 🏗️ Arquitectura Técnica

### Frontend
- **React 18**: Framework principal para la UI
- **Vite**: Bundler y servidor de desarrollo
- **TailwindCSS**: Framework de CSS utilitario
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para API calls
- **React Hot Toast**: Notificaciones en tiempo real
- **Lucide React**: Iconografía moderna
- **React Beautiful DnD**: Drag and drop functionality

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **JWT**: Autenticación basada en tokens
- **bcryptjs**: Hash de contraseñas
- **express-validator**: Validación de datos
- **helmet**: Seguridad HTTP
- **cors**: Cross-Origin Resource Sharing
- **express-rate-limit**: Protección contra ataques
- **nodemailer**: Servicio de correo electrónico
- **resend**: API de envío de emails

### Base de Datos
- **PostgreSQL**: Base de datos relacional (configurada para producción)
- **Mapas en memoria**: Sistema temporal para desarrollo y testing

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- PostgreSQL (para producción)

### Instalación Rápida
```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd juegoAspirantes

# Instalar dependencias de ambos proyectos
npm run install:all

# Configurar variables de entorno
cp server/env.example server/.env
# Editar server/.env con tus configuraciones

# Ejecutar en modo desarrollo
npm run dev
```

### Instalación Manual
```bash
# Frontend
cd client
npm install
npm run dev

# Backend (en otra terminal)
cd server
npm install
npm run dev
```

### Variables de Entorno
```env
# server/.env
JWT_SECRET=tu_jwt_secret_aqui
DB_HOST=localhost
DB_PORT=5432
DB_NAME=usbmeda_game
DB_USER=tu_usuario
DB_PASSWORD=tu_password
EMAIL_SERVICE=resend
RESEND_API_KEY=tu_api_key
```

## 📁 Estructura del Proyecto
```
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── puzzles/       # 8 tipos de puzzles implementados
│   │   │   ├── AchievementSystem.jsx
│   │   │   ├── GameSidebar.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── RewardNotification.jsx
│   │   │   └── WelcomeModal.jsx
│   │   ├── contexts/          # Contextos de React
│   │   │   ├── AuthContext.jsx
│   │   │   └── GameContext.jsx
│   │   ├── hooks/             # Hooks personalizados
│   │   │   ├── useBestReward.js
│   │   │   ├── useGameCompletion.js
│   │   │   └── useRewardNotifications.js
│   │   ├── pages/             # Páginas principales
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GameLevel.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Rewards.jsx
│   │   └── utils/             # Utilidades
│   └── public/                # Assets estáticos
├── server/                    # Backend Node.js
│   ├── routes/                # Rutas de la API
│   │   ├── auth.js           # Autenticación
│   │   ├── game.js           # Lógica del juego
│   │   ├── progress.js       # Progreso del usuario
│   │   └── rewards.js        # Sistema de recompensas
│   ├── services/             # Servicios
│   │   └── emailService.js   # Servicio de correo
│   └── index.js              # Punto de entrada
├── docs/                     # Documentación
│   ├── ARQUITECTURA.md       # Documentación técnica
│   └── SUDOKU_EXAMPLE.md     # Ejemplos de puzzles
└── setup.bat/setup.sh        # Scripts de configuración
```

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuarios con validación completa
- `POST /login` - Inicio de sesión con JWT
- `GET /verify` - Verificación de token
- `GET /profile/:userId` - Perfil del usuario

### Juego (`/api/game`)
- `GET /levels` - Lista de niveles disponibles
- `GET /levels/:levelId` - Nivel específico con puzzles
- `GET /puzzles/:puzzleId` - Puzzle específico con datos
- `POST /calculate-stars` - Cálculo de estrellas basado en rendimiento

### Progreso (`/api/progress`)
- `GET /:userId` - Progreso completo del usuario
- `POST /:userId/update` - Actualizar progreso después de completar puzzle
- `GET /:userId/stats` - Estadísticas detalladas del usuario

### Recompensas (`/api/rewards`)
- `GET /catalog` - Catálogo completo de recompensas
- `GET /user/:userId` - Recompensas del usuario
- `POST /claim-virtual` - Reclamar recompensa virtual
- `POST /request-physical` - Solicitar recompensa física

## 🎨 Características de UI/UX

### Diseño Responsive
- Adaptable a diferentes dispositivos
- Optimizado para computadores (recomendado)
- Interfaz moderna con TailwindCSS

### Experiencia de Usuario
- **Pantalla dividida**: Centro para juego, laterales para información
- **Sistema de pistas**: Pistas inteligentes contextuales
- **Feedback visual**: Animaciones y transiciones suaves
- **Notificaciones**: Toast notifications para feedback inmediato
- **Modales educativos**: Información contextual sobre conceptos

### Componentes Principales
- **GameSidebar**: Información lateral durante el juego
- **ProgressBar**: Barra de progreso visual
- **WelcomeModal**: Modal de bienvenida con instrucciones
- **RewardNotification**: Notificaciones de recompensas
- **AchievementSystem**: Sistema completo de logros

## 🔐 Seguridad Implementada

### Autenticación
- **JWT Tokens**: Tokens seguros con expiración de 24h
- **Password Hashing**: bcrypt con salt rounds
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Input Validation**: Validación estricta con express-validator

### Protección de Datos
- **CORS**: Configuración segura de Cross-Origin
- **Helmet**: Headers de seguridad HTTP
- **Data Sanitization**: Limpieza de datos de entrada
- **SQL Injection Prevention**: Parámetros preparados

## 📊 Sistema de Estrellas

### Algoritmo de Cálculo
```javascript
let stars = 5; // Máximo de estrellas

// Penalización por tiempo (más de 5 minutos = -1 estrella)
if (timeSpent > 300) stars -= 1;

// Penalización por errores (cada 2 errores = -1 estrella)
stars -= Math.floor(errorCount / 2);

// Penalización por pistas (cada pista = -0.5 estrellas)
stars -= hintsUsed * 0.5;

// Asegurar que no baje de 0 estrellas
stars = Math.max(0, Math.round(stars));
```

### Factores de Evaluación
1. **Tiempo**: Completar el puzzle rápidamente
2. **Precisión**: Minimizar errores
3. **Independencia**: Usar pocas pistas
4. **Eficiencia**: Completar en el menor número de intentos


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - más permisivo en desarrollo
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 en desarrollo, 100 en producción
  message: {
    error: 'Demasiadas solicitudes, por favor intenta de nuevo en un momento',
    retryAfter: Math.ceil(1 * 60 / 1000) // 1 minuto en segundos
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para rutas de salud y desarrollo
    return req.path === '/api/health' || process.env.NODE_ENV === 'development';
  }
});
app.use(limiter);

// Middleware para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas (configurables entre memoria y PostgreSQL)
const { authRoutes, progressRoutes, rewardsRoutes } = require('./config/migration');

app.use('/api/auth', authRoutes);
app.use('/api/game', require('./routes/game')); // game.js no necesita migración
app.use('/api/progress', progressRoutes);
app.use('/api/rewards', rewardsRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor del juego educativo USB Medellín funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor con verificación de base de datos
const startServer = async () => {
  try {
    // Probar conexión a PostgreSQL
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🎮 Juego educativo USB Medellín iniciado`);
      console.log(`🗄️ Base de datos PostgreSQL conectada`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error.message);
    process.exit(1);
  }
};

startServer();

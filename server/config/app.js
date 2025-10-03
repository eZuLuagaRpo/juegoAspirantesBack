// Configuración de la aplicación
require('dotenv').config();

const config = {
  // Servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de datos
  usePostgreSQL: process.env.USE_POSTGRESQL !== 'false', // Por defecto usar PostgreSQL
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'usbmeda_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  
  // Seguridad
  helmetEnabled: process.env.HELMET_ENABLED !== 'false',
  corsEnabled: process.env.CORS_ENABLED !== 'false',
  
  // Email
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true'
};

// Validaciones
if (!config.emailUser || !config.emailPass) {
  console.warn('⚠️ Configuración de email incompleta');
}

if (config.usePostgreSQL && !process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL no configurada para PostgreSQL');
}

module.exports = config;

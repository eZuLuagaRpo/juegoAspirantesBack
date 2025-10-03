// Configuración para alternar entre memoria y PostgreSQL
const config = require('./app');
const USE_POSTGRESQL = config.usePostgreSQL;

// Rutas de memoria (originales)
const authMemory = require('../routes/auth');
const progressMemory = require('../routes/progress');
const rewardsMemory = require('../routes/rewards');

// Rutas de PostgreSQL (nuevas)
const authPostgres = require('../routes/auth_postgres');
const progressPostgres = require('../routes/progress_postgres');
const rewardsPostgres = require('../routes/rewards_postgres');

// Exportar las rutas según la configuración
const authRoutes = USE_POSTGRESQL ? authPostgres : authMemory;
const progressRoutes = USE_POSTGRESQL ? progressPostgres : progressMemory;
const rewardsRoutes = USE_POSTGRESQL ? rewardsPostgres : rewardsMemory;

console.log(`🗄️ Usando: ${USE_POSTGRESQL ? 'PostgreSQL' : 'Memoria'} para almacenamiento`);

module.exports = {
  USE_POSTGRESQL,
  authRoutes,
  progressRoutes,
  rewardsRoutes,
  
  // Funciones de utilidad
  getStorageType: () => USE_POSTGRESQL ? 'PostgreSQL' : 'Memoria',
  
  // Para testing
  setStorageType: (usePostgres) => {
    process.env.USE_POSTGRESQL = usePostgres ? 'true' : 'false';
    console.log(`🔄 Cambiado a: ${usePostgres ? 'PostgreSQL' : 'Memoria'}`);
  }
};

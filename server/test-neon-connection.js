#!/usr/bin/env node

/**
 * Script para probar la conexión con Neon y verificar la configuración
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'neon-config.env') });

const { testConnection, query } = require('./config/database');

async function testNeonConnection() {
  console.log('🧪 Probando conexión con Neon...');
  console.log('📡 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')); // Ocultar password
  
  try {
    // Probar conexión básica
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    
    // Probar una consulta simple
    console.log('🔍 Probando consulta básica...');
    const result = await query('SELECT version() as version, now() as current_time');
    console.log('✅ Versión de PostgreSQL:', result.rows[0].version);
    console.log('✅ Hora actual:', result.rows[0].current_time);
    
    // Verificar si las tablas existen
    console.log('📋 Verificando tablas existentes...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tables.rows.length === 0) {
      console.log('⚠️ No se encontraron tablas. Ejecuta: node init-neon-db.js');
    } else {
      console.log('✅ Tablas encontradas:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    console.log('🎉 Prueba de conexión exitosa!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testNeonConnection();
}

module.exports = { testNeonConnection };

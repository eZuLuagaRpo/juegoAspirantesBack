#!/usr/bin/env node

/**
 * Script para inicializar la base de datos en Neon
 * Ejecuta las migraciones necesarias para configurar las tablas
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, 'neon-config.env') });

// Configuración del pool de conexiones para Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Necesario para Neon
  max: 5, // Límite más conservador para Neon
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function initDatabase() {
  console.log('🚀 Iniciando configuración de base de datos Neon...');
  
  try {
    // Probar conexión
    const client = await pool.connect();
    console.log('✅ Conexión a Neon exitosa');
    
    // Leer y ejecutar schema
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Ejecutando schema de base de datos...');
    await client.query(schema);
    console.log('✅ Schema ejecutado correctamente');
    
    // Leer y ejecutar datos de puzzles
    const dataPath = path.join(__dirname, '..', 'database_puzzles_data.sql');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      console.log('🧩 Insertando datos de puzzles...');
      await client.query(data);
      console.log('✅ Datos de puzzles insertados correctamente');
    }
    
    // Verificar tablas creadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    console.log('🎉 Base de datos inicializada correctamente!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };

#!/usr/bin/env node

/**
 * Script para migrar el orden de los niveles en la base de datos
 * Corrige el orden: Nivel 3 = Facultades, Nivel 4 = Bienestar
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, 'neon-config.env') });

// Configuración del pool de conexiones para Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function migrateLevelOrder() {
  console.log('🔄 Iniciando migración del orden de niveles...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar el estado actual
    console.log('📊 Estado actual de los niveles:');
    const currentLevels = await client.query(`
      SELECT id, name, order_number 
      FROM game_levels 
      ORDER BY order_number
    `);
    
    currentLevels.rows.forEach(level => {
      console.log(`   - ${level.order_number}: ${level.name} (${level.id})`);
    });
    
    // Actualizar el orden de los niveles
    console.log('🔄 Actualizando orden de niveles...');
    
    // Nivel 3: Facultades
    await client.query(`
      UPDATE game_levels 
      SET order_number = 3 
      WHERE id = 'facultades'
    `);
    console.log('✅ Facultades actualizado a nivel 3');
    
    // Nivel 4: Bienestar
    await client.query(`
      UPDATE game_levels 
      SET order_number = 4 
      WHERE id = 'bienestar'
    `);
    console.log('✅ Bienestar actualizado a nivel 4');
    
    // Verificar el estado final
    console.log('📊 Estado final de los niveles:');
    const finalLevels = await client.query(`
      SELECT id, name, order_number 
      FROM game_levels 
      ORDER BY order_number
    `);
    
    finalLevels.rows.forEach(level => {
      console.log(`   - ${level.order_number}: ${level.name} (${level.id})`);
    });
    
    // Verificar que los puzzles están correctamente asociados
    console.log('🧩 Verificando puzzles por nivel:');
    const puzzlesByLevel = await client.query(`
      SELECT 
        gl.id as level_id,
        gl.name as level_name,
        gl.order_number,
        COUNT(p.id) as puzzle_count,
        STRING_AGG(p.id, ', ') as puzzle_ids
      FROM game_levels gl
      LEFT JOIN puzzles p ON gl.id = p.level_id
      GROUP BY gl.id, gl.name, gl.order_number
      ORDER BY gl.order_number
    `);
    
    puzzlesByLevel.rows.forEach(level => {
      console.log(`   - Nivel ${level.order_number} (${level.level_name}): ${level.puzzle_count} puzzles [${level.puzzle_ids || 'ninguno'}]`);
    });
    
    client.release();
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  migrateLevelOrder();
}

module.exports = { migrateLevelOrder };

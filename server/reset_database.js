const { query, getClient } = require('./config/database');

// Script para vaciar todas las tablas de la base de datos
async function resetDatabase() {
  console.log('🗑️ INICIANDO LIMPIEZA COMPLETA DE LA BASE DE DATOS\n');
  console.log('⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos');
  console.log('=' .repeat(60));
  
  try {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      console.log('🔄 Eliminando datos de todas las tablas...\n');
      
      // Lista de tablas en orden de dependencias (primero las dependientes)
      const tables = [
        // Tablas dependientes primero
        'user_achievements',
        'user_completed_levels', 
        'user_puzzle_progress',
        'user_level_progress',
        'user_rewards',
        'user_progress',
        'users',
        'achievements',
        'puzzles',
        'game_levels',
        'rewards_catalog'
      ];
      
      let deletedRecords = 0;
      
      for (const table of tables) {
        try {
          // Contar registros antes de eliminar
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          const recordCount = parseInt(countResult.rows[0].count);
          
          if (recordCount > 0) {
            // Eliminar todos los registros
            await client.query(`DELETE FROM ${table}`);
            deletedRecords += recordCount;
            console.log(`✅ ${table}: ${recordCount} registros eliminados`);
          } else {
            console.log(`📭 ${table}: Ya estaba vacía`);
          }
        } catch (error) {
          console.log(`❌ ${table}: Error - ${error.message}`);
        }
      }
      
      // Resetear secuencias (auto-increment)
      console.log('\n🔄 Reseteando secuencias...');
      
      const sequences = [
        'users_id_seq',
        'game_levels_id_seq', 
        'puzzles_id_seq',
        'rewards_catalog_id_seq',
        'achievements_id_seq'
      ];
      
      for (const sequence of sequences) {
        try {
          await client.query(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
          console.log(`✅ ${sequence}: Reseteada a 1`);
        } catch (error) {
          console.log(`❌ ${sequence}: Error - ${error.message}`);
        }
      }
      
      await client.query('COMMIT');
      
      console.log('\n' + '=' .repeat(60));
      console.log('📊 RESUMEN DE LIMPIEZA');
      console.log('=' .repeat(60));
      console.log(`🗑️ Total de registros eliminados: ${deletedRecords}`);
      console.log(`📋 Tablas procesadas: ${tables.length}`);
      console.log(`🔄 Secuencias reseteadas: ${sequences.length}`);
      
      console.log('\n✅ Base de datos limpiada exitosamente');
      console.log('🎯 La base de datos está lista para empezar desde cero');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('\n❌ Error limpiando la base de datos:', error.message);
    throw error;
  }
}

// Función para confirmar la operación
async function confirmReset() {
  console.log('⚠️  CONFIRMACIÓN REQUERIDA');
  console.log('Esta operación eliminará TODOS los datos de la base de datos:');
  console.log('- Todos los usuarios');
  console.log('- Todo el progreso de juego');
  console.log('- Todas las recompensas');
  console.log('- Todos los logros');
  console.log('- Todos los puzzles y niveles');
  console.log('\nEsta acción NO se puede deshacer.\n');
  
  // En un entorno de producción, aquí podrías pedir confirmación interactiva
  // Por ahora, procedemos directamente ya que es un script de desarrollo
  
  return true;
}

// Función para verificar el estado después del reset
async function verifyReset() {
  console.log('\n🔍 Verificando estado después del reset...');
  
  try {
    const tables = [
      'users',
      'user_progress', 
      'user_level_progress',
      'user_puzzle_progress',
      'user_rewards',
      'user_achievements',
      'user_completed_levels',
      'game_levels',
      'puzzles',
      'rewards_catalog',
      'achievements'
    ];
    
    let totalRecords = 0;
    
    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      totalRecords += count;
      
      if (count === 0) {
        console.log(`✅ ${table}: Vacía`);
      } else {
        console.log(`⚠️  ${table}: ${count} registros restantes`);
      }
    }
    
    if (totalRecords === 0) {
      console.log('\n🎉 ¡Reset completo exitoso! La base de datos está completamente vacía.');
    } else {
      console.log(`\n⚠️  Aún quedan ${totalRecords} registros en la base de datos.`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando el reset:', error.message);
  }
}

// Función principal
async function main() {
  try {
    await confirmReset();
    await resetDatabase();
    await verifyReset();
    
    console.log('\n🏁 Proceso de reset completado');
    console.log('💡 Ahora puedes:');
    console.log('   1. Ejecutar los scripts de migración para recrear los datos');
    console.log('   2. Registrar nuevos usuarios desde cero');
    console.log('   3. Probar el sistema completamente limpio');
    
  } catch (error) {
    console.error('\n❌ Error durante el reset:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Reset de base de datos completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { resetDatabase, verifyReset };

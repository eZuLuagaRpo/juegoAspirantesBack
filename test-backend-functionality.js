#!/usr/bin/env node

/**
 * Script de prueba completo para el backend del juego educativo USB Medellín
 * Verifica todas las funcionalidades principales
 */

// Usar fetch nativo de Node.js (disponible desde Node 18+)

// Configuración
const BASE_URL = process.env.API_URL || 'https://juegoaspirantesback.onrender.com';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
  studentId: '1234567890',
  phone: '3001234567'
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para imprimir con colores
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para hacer peticiones HTTP
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    if (response.ok) {
      return { success: true, data: responseData, status: response.status };
    } else {
      return { 
        success: false, 
        error: responseData,
        status: response.status
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: 500
    };
  }
};

// Test 1: Health Check
const testHealthCheck = async () => {
  log('\n🔍 Test 1: Health Check', 'cyan');
  const result = await makeRequest('GET', '/api/health');
  
  if (result.success) {
    log('✅ Health check exitoso', 'green');
    log(`   Status: ${result.status}`, 'blue');
    log(`   Message: ${result.data.message}`, 'blue');
  } else {
    log('❌ Health check falló', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
  }
  
  return result.success;
};

// Test 2: Registro de usuario
const testUserRegistration = async () => {
  log('\n🔍 Test 2: Registro de Usuario', 'cyan');
  const result = await makeRequest('POST', '/api/auth/register', TEST_USER);
  
  if (result.success) {
    log('✅ Registro exitoso', 'green');
    log(`   User ID: ${result.data.data.user.id}`, 'blue');
    return result.data.data.token;
  } else {
    log('❌ Registro falló', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

// Test 3: Login de usuario
const testUserLogin = async () => {
  log('\n🔍 Test 3: Login de Usuario', 'cyan');
  const result = await makeRequest('POST', '/api/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (result.success) {
    log('✅ Login exitoso', 'green');
    log(`   User ID: ${result.data.data.user.id}`, 'blue');
    return result.data.data.token;
  } else {
    log('❌ Login falló', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

// Test 4: Verificación de token
const testTokenVerification = async (token) => {
  log('\n🔍 Test 4: Verificación de Token', 'cyan');
  const result = await makeRequest('GET', '/api/auth/verify', null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Verificación de token exitosa', 'green');
    log(`   User: ${result.data.data.user.firstName} ${result.data.data.user.lastName}`, 'blue');
    return result.data.data.user.id;
  } else {
    log('❌ Verificación de token falló', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

// Test 5: Obtener niveles del juego
const testGameLevels = async () => {
  log('\n🔍 Test 5: Niveles del Juego', 'cyan');
  const result = await makeRequest('GET', '/api/game/levels');
  
  if (result.success) {
    log('✅ Niveles obtenidos exitosamente', 'green');
    log(`   Niveles disponibles: ${result.data.data.length}`, 'blue');
    result.data.data.forEach(level => {
      log(`   - ${level.name}: ${level.puzzles.length} puzzles`, 'blue');
    });
    return true;
  } else {
    log('❌ Error obteniendo niveles', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 6: Obtener progreso del usuario
const testUserProgress = async (userId, token) => {
  log('\n🔍 Test 6: Progreso del Usuario', 'cyan');
  const result = await makeRequest('GET', `/api/progress/${userId}`, null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Progreso obtenido exitosamente', 'green');
    log(`   Total estrellas: ${result.data.data.totalStars}`, 'blue');
    log(`   Niveles completados: ${result.data.data.completedLevels.length}`, 'blue');
    return true;
  } else {
    log('❌ Error obteniendo progreso', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 7: Actualizar progreso
const testUpdateProgress = async (userId, token) => {
  log('\n🔍 Test 7: Actualizar Progreso', 'cyan');
  const result = await makeRequest('POST', `/api/progress/${userId}/update`, {
    levelId: 'mercadeo',
    puzzleId: 'mercadeo_1',
    stars: 3,
    completed: true,
    timeSpent: 120,
    errors: 2,
    hintsUsed: 1
  }, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Progreso actualizado exitosamente', 'green');
    log(`   Nuevas estrellas totales: ${result.data.data.totalStars}`, 'blue');
    return true;
  } else {
    log('❌ Error actualizando progreso', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 8: Estadísticas de progreso
const testProgressStats = async (userId, token) => {
  log('\n🔍 Test 8: Estadísticas de Progreso', 'cyan');
  const result = await makeRequest('GET', `/api/progress/${userId}/stats`, null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Estadísticas obtenidas exitosamente', 'green');
    log(`   Total estrellas: ${result.data.data.totalStars}`, 'blue');
    log(`   Puzzles completados: ${result.data.data.completedPuzzles}`, 'blue');
    return true;
  } else {
    log('❌ Error obteniendo estadísticas', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 9: Información de finalización
const testCompletionInfo = async (userId, token) => {
  log('\n🔍 Test 9: Información de Finalización', 'cyan');
  const result = await makeRequest('GET', `/api/progress/${userId}/completion`, null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Información de finalización obtenida', 'green');
    log(`   Juego completado: ${result.data.data.gameCompleted}`, 'blue');
    if (result.data.data.gameCompleted) {
      log(`   Código: ${result.data.data.completionCode}`, 'blue');
    }
    return true;
  } else {
    log('❌ Error obteniendo información de finalización', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 10: Catálogo de recompensas
const testRewardsCatalog = async () => {
  log('\n🔍 Test 10: Catálogo de Recompensas', 'cyan');
  const result = await makeRequest('GET', '/api/rewards/catalog');
  
  if (result.success) {
    log('✅ Catálogo obtenido exitosamente', 'green');
    log(`   Recompensas disponibles: ${result.data.data.length}`, 'blue');
    return true;
  } else {
    log('❌ Error obteniendo catálogo', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 11: Recompensas del usuario
const testUserRewards = async (userId, token) => {
  log('\n🔍 Test 11: Recompensas del Usuario', 'cyan');
  const result = await makeRequest('GET', `/api/rewards/user/${userId}`, null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Recompensas del usuario obtenidas', 'green');
    log(`   Recompensas virtuales: ${result.data.data.virtualRewards.length}`, 'blue');
    log(`   Recompensas físicas: ${result.data.data.physicalRewards.length}`, 'blue');
    return true;
  } else {
    log('❌ Error obteniendo recompensas del usuario', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 12: Estadísticas de recompensas
const testRewardsStats = async (userId, token) => {
  log('\n🔍 Test 12: Estadísticas de Recompensas', 'cyan');
  const result = await makeRequest('GET', `/api/rewards/stats/${userId}`, null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Estadísticas de recompensas obtenidas', 'green');
    log(`   Total recompensas: ${result.data.data.totalRewards}`, 'blue');
    log(`   Recompensas disponibles: ${result.data.data.availableRewards}`, 'blue');
    return true;
  } else {
    log('❌ Error obteniendo estadísticas de recompensas', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Test 13: Envío de código de recompensa por email
const testSendRewardCode = async (userId, token) => {
  log('\n🔍 Test 13: Envío de Código de Recompensa', 'cyan');
  const result = await makeRequest('POST', '/api/auth/send-reward-code', {
    userId: userId,
    email: TEST_USER.email,
    firstName: TEST_USER.firstName,
    completionCode: 'USBTEST123',
    rewardTitle: 'Inscripción Gratuita',
    discountPercentage: 100
  }, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ Código de recompensa enviado exitosamente', 'green');
    log(`   Message ID: ${result.data.data.messageId}`, 'blue');
    return true;
  } else {
    log('❌ Error enviando código de recompensa', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Función principal de pruebas
const runAllTests = async () => {
  log('🚀 Iniciando pruebas del backend del juego educativo USB Medellín', 'bright');
  log(`📍 URL base: ${BASE_URL}`, 'blue');
  
  let passedTests = 0;
  let totalTests = 13;
  let token = null;
  let userId = null;
  
  // Test 1: Health Check
  if (await testHealthCheck()) passedTests++;
  
  // Test 2: Registro (opcional, puede fallar si el usuario ya existe)
  const registrationResult = await testUserRegistration();
  if (registrationResult) {
    token = registrationResult;
    passedTests++;
  }
  
  // Test 3: Login
  const loginResult = await testUserLogin();
  if (loginResult) {
    token = loginResult;
    passedTests++;
  }
  
  if (!token) {
    log('\n❌ No se pudo obtener token de autenticación. Abortando pruebas.', 'red');
    return;
  }
  
  // Test 4: Verificación de token
  const verificationResult = await testTokenVerification(token);
  if (verificationResult) {
    userId = verificationResult;
    passedTests++;
  }
  
  if (!userId) {
    log('\n❌ No se pudo obtener ID de usuario. Abortando pruebas.', 'red');
    return;
  }
  
  // Tests que requieren autenticación
  if (await testGameLevels()) passedTests++;
  if (await testUserProgress(userId, token)) passedTests++;
  if (await testUpdateProgress(userId, token)) passedTests++;
  if (await testProgressStats(userId, token)) passedTests++;
  if (await testCompletionInfo(userId, token)) passedTests++;
  if (await testRewardsCatalog()) passedTests++;
  if (await testUserRewards(userId, token)) passedTests++;
  if (await testRewardsStats(userId, token)) passedTests++;
  if (await testSendRewardCode(userId, token)) passedTests++;
  
  // Resumen final
  log('\n📊 RESUMEN DE PRUEBAS', 'bright');
  log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 ¡Todas las pruebas pasaron exitosamente!', 'green');
    log('✅ El backend está funcionando correctamente', 'green');
  } else {
    log('\n⚠️ Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
  }
  
  log('\n🔧 Para ejecutar este script:', 'cyan');
  log('   node test-backend-functionality.js', 'blue');
  log('   API_URL=https://tu-backend-url.com node test-backend-functionality.js', 'blue');
};

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  makeRequest,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testTokenVerification,
  testGameLevels,
  testUserProgress,
  testUpdateProgress,
  testProgressStats,
  testCompletionInfo,
  testRewardsCatalog,
  testUserRewards,
  testRewardsStats,
  testSendRewardCode
};

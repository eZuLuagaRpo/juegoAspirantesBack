#!/usr/bin/env node

/**
 * Script de diagnóstico específico para el servicio de email
 */

const BASE_URL = process.env.API_URL || 'https://juegoaspirantesback.onrender.com';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test 1: Verificar que el endpoint responde
const testEndpointResponse = async () => {
  log('\n🔍 Test 1: Verificar respuesta del endpoint', 'cyan');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
    
    const response = await fetch(`${BASE_URL}/api/auth/send-reward-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        firstName: 'Test',
        completionCode: 'USBTEST123',
        rewardTitle: 'Inscripción Gratuita',
        discountPercentage: 100
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    log(`✅ Endpoint responde (Status: ${response.status})`, 'green');
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      log('❌ Endpoint no responde (Timeout)', 'red');
    } else {
      log(`❌ Error de conexión: ${error.message}`, 'red');
    }
    return false;
  }
};

// Test 2: Verificar variables de entorno del servidor
const testServerEnvironment = async () => {
  log('\n🔍 Test 2: Verificar configuración del servidor', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    log('✅ Servidor responde correctamente', 'green');
    log(`   Mensaje: ${data.message}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Error conectando al servidor: ${error.message}`, 'red');
    return false;
  }
};

// Test 3: Probar con timeout más corto
const testEmailWithShortTimeout = async () => {
  log('\n🔍 Test 3: Probar email con timeout corto (10s)', 'cyan');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    
    const response = await fetch(`${BASE_URL}/api/auth/send-reward-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        firstName: 'Test',
        completionCode: 'USBTEST123',
        rewardTitle: 'Inscripción Gratuita',
        discountPercentage: 100
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      log('✅ Email enviado exitosamente', 'green');
      log(`   Message ID: ${data.data.messageId}`, 'blue');
      return true;
    } else {
      const error = await response.json();
      log(`❌ Error del servidor (${response.status})`, 'red');
      log(`   Error: ${JSON.stringify(error)}`, 'red');
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      log('❌ Timeout - El servidor no responde en 10 segundos', 'red');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
    return false;
  }
};

// Test 4: Verificar logs del servidor (si es posible)
const testServerLogs = async () => {
  log('\n🔍 Test 4: Información de diagnóstico', 'cyan');
  
  log('📋 Posibles causas del problema:', 'yellow');
  log('   1. Variables de entorno no actualizadas en Render', 'yellow');
  log('   2. Redeploy no completado', 'yellow');
  log('   3. Credenciales de Gmail incorrectas', 'yellow');
  log('   4. Problemas de conectividad SMTP desde Render', 'yellow');
  log('   5. Gmail bloqueando conexiones desde Render', 'yellow');
  
  log('\n🔧 Soluciones a probar:', 'yellow');
  log('   1. Verificar variables en Render: EMAIL_USER y EMAIL_PASS', 'yellow');
  log('   2. Forzar redeploy manual en Render', 'yellow');
  log('   3. Verificar que la contraseña de app de Gmail sea correcta', 'yellow');
  log('   4. Probar con otra cuenta de Gmail', 'yellow');
  log('   5. Verificar logs del servidor en Render', 'yellow');
};

// Función principal
const runDiagnostics = async () => {
  log('🚀 Iniciando diagnóstico del servicio de email', 'bright');
  log(`📍 URL base: ${BASE_URL}`, 'blue');
  
  const results = {
    endpoint: await testEndpointResponse(),
    server: await testServerEnvironment(),
    email: await testEmailWithShortTimeout()
  };
  
  testServerLogs();
  
  log('\n📊 RESUMEN DEL DIAGNÓSTICO:', 'bright');
  log(`✅ Endpoint responde: ${results.endpoint ? 'SÍ' : 'NO'}`, results.endpoint ? 'green' : 'red');
  log(`✅ Servidor funcionando: ${results.server ? 'SÍ' : 'NO'}`, results.server ? 'green' : 'red');
  log(`✅ Email funcionando: ${results.email ? 'SÍ' : 'NO'}`, results.email ? 'green' : 'red');
  
  if (!results.email) {
    log('\n⚠️ DIAGNÓSTICO: El problema está en el servicio de email', 'yellow');
    log('🔧 Acción requerida: Verificar configuración de email en Render', 'yellow');
  } else {
    log('\n🎉 ¡El servicio de email está funcionando!', 'green');
  }
};

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  runDiagnostics().catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runDiagnostics };

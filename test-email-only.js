#!/usr/bin/env node

/**
 * Script de prueba específico para el envío de email
 */

// Usar fetch nativo de Node.js
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

// Función para hacer peticiones HTTP con timeout
const makeRequest = async (method, endpoint, data = null, headers = {}, timeout = 30000) => {
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
    
    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);
    
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
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Timeout - La petición tardó demasiado',
        status: 408
      };
    }
    return { 
      success: false, 
      error: error.message,
      status: 500
    };
  }
};

// Test de envío de email
const testEmailSending = async () => {
  log('\n🔍 Test: Envío de Código de Recompensa por Email', 'cyan');
  log('⏱️  Timeout configurado a 30 segundos', 'yellow');
  
  const result = await makeRequest('POST', '/api/auth/send-reward-code', {
    email: 'test@example.com',
    firstName: 'Test',
    completionCode: 'USBTEST123',
    rewardTitle: 'Inscripción Gratuita',
    discountPercentage: 100
  }, {}, 30000);
  
  if (result.success) {
    log('✅ Email enviado exitosamente', 'green');
    log(`   Message ID: ${result.data.data.messageId}`, 'blue');
    log(`   Email: ${result.data.data.email}`, 'blue');
    log(`   Recompensa: ${result.data.data.rewardTitle}`, 'blue');
    return true;
  } else {
    log('❌ Error enviando email', 'red');
    log(`   Status: ${result.status}`, 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Función principal
const runEmailTest = async () => {
  log('🚀 Iniciando prueba de envío de email', 'bright');
  log(`📍 URL base: ${BASE_URL}`, 'blue');
  
  const success = await testEmailSending();
  
  if (success) {
    log('\n🎉 ¡Prueba de email exitosa!', 'green');
    log('✅ El servicio de email está funcionando correctamente', 'green');
  } else {
    log('\n⚠️ Prueba de email falló', 'yellow');
    log('🔧 Posibles causas:', 'yellow');
    log('   - Credenciales de email no configuradas en Render', 'yellow');
    log('   - Problemas de conectividad SMTP', 'yellow');
    log('   - Variables de entorno faltantes', 'yellow');
  }
};

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  runEmailTest().catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testEmailSending, makeRequest };

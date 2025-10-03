#!/usr/bin/env node

/**
 * Script de prueba de email con información de logs
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

// Test de envío de email con información de logs
const testEmailWithLogs = async () => {
  log('\n🔍 Test: Envío de Código de Recompensa por Email', 'cyan');
  log('⏱️  Timeout configurado a 30 segundos', 'yellow');
  log('📋 Los logs del servidor deberían mostrar:', 'yellow');
  log('   - 🔧 Configurando transporter de email...', 'yellow');
  log('   - 📧 EMAIL_USER: Configurado', 'yellow');
  log('   - 🔑 EMAIL_PASS: Configurado', 'yellow');
  log('   - 🔍 Verificando conexión SMTP...', 'yellow');
  log('   - ✅ Conexión SMTP verificada', 'yellow');
  log('   - 📤 Enviando email...', 'yellow');
  log('   - ✅ Email enviado exitosamente', 'yellow');
  
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
    
    log('\n🔍 Para diagnosticar el problema:', 'yellow');
    log('   1. Ve a Render → Tu servicio → Logs', 'yellow');
    log('   2. Busca los mensajes que empiezan con 🔧, 📧, 🔑, etc.', 'yellow');
    log('   3. Si no ves esos mensajes, el endpoint no se está ejecutando', 'yellow');
    log('   4. Si ves "NO CONFIGURADO", las variables de entorno no están bien', 'yellow');
    log('   5. Si se cuelga en "Verificando conexión SMTP", hay problema de conectividad', 'yellow');
    
    return false;
  }
};

// Función principal
const runEmailTestWithLogs = async () => {
  log('🚀 Iniciando prueba de envío de email con logs', 'bright');
  log(`📍 URL base: ${BASE_URL}`, 'blue');
  log('📋 IMPORTANTE: Revisa los logs de Render mientras se ejecuta esta prueba', 'yellow');
  
  const success = await testEmailWithLogs();
  
  if (success) {
    log('\n🎉 ¡Prueba de email exitosa!', 'green');
    log('✅ El servicio de email está funcionando correctamente', 'green');
  } else {
    log('\n⚠️ Prueba de email falló', 'yellow');
    log('🔧 Revisa los logs de Render para más detalles', 'yellow');
  }
};

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  runEmailTestWithLogs().catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testEmailWithLogs, makeRequest };

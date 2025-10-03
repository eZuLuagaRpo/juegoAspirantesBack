// Script de prueba para Google Sheets - Ejecutar en la consola del navegador
// Para usar: importar este archivo y ejecutar las funciones de prueba

import { submitToGoogleSheets, testGoogleSheetsConnection, validateFormEntries } from './googleSheets.js';

// Función principal de prueba
export const runGoogleSheetsTest = async () => {
  console.log('🚀 === PRUEBA DE GOOGLE SHEETS ===');
  console.log('📅 Fecha:', new Date().toLocaleString());
  
  // Paso 1: Validar IDs de entrada
  console.log('\n📋 PASO 1: Validando IDs de entrada...');
  validateFormEntries();
  
  // Paso 2: Probar conexión
  console.log('\n🔗 PASO 2: Probando conexión...');
  const connectionResult = await testGoogleSheetsConnection();
  console.log('📊 Resultado de conexión:', connectionResult);
  
  // Paso 3: Prueba con datos reales
  console.log('\n📝 PASO 3: Prueba con datos de ejemplo...');
  const testUserData = {
    studentId: '12345678',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '3001234567'
  };
  
  const testRewardData = {
    title: '5% de Descuento'
  };
  
  const testCode = 'USB12345';
  
  const result = await submitToGoogleSheets(testUserData, testRewardData, testCode);
  console.log('📊 Resultado final:', result);
  
  // Resumen
  console.log('\n📋 === RESUMEN DE LA PRUEBA ===');
  console.log('✅ Conexión:', connectionResult.success ? 'EXITOSA' : 'FALLIDA');
  console.log('✅ Envío de datos:', result.success ? 'EXITOSO' : 'FALLIDO');
  
  if (!result.success) {
    console.log('❌ Error:', result.error);
    console.log('🔧 Posibles soluciones:');
    console.log('   1. Verificar que la URL del formulario sea correcta');
    console.log('   2. Verificar que los IDs de entrada (entry.XXXXXX) sean correctos');
    console.log('   3. Verificar que el formulario de Google esté configurado para recibir envíos');
    console.log('   4. Verificar la configuración de CORS del navegador');
  }
  
  return result;
};

// Función para probar solo la URL del formulario
export const testFormUrlOnly = async () => {
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/formResponse';
  
  console.log('🔗 Probando URL del formulario:', formUrl);
  
  try {
    const response = await fetch(formUrl, { 
      method: 'POST',
      mode: 'no-cors',
      body: new FormData()
    });
    
    console.log('✅ URL accesible:', response);
    return true;
  } catch (error) {
    console.error('❌ URL no accesible:', error);
    return false;
  }
};

// Función para generar un reporte de diagnóstico
export const generateDiagnosticReport = () => {
  console.log('📊 === REPORTE DE DIAGNÓSTICO ===');
  
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/formResponse',
    entryIds: [
      'entry.146369297',
      'entry.1974491796', 
      'entry.2099371572',
      'entry.1032330105',
      'entry.471605411',
      'entry.725824376',
      'entry.492956207'
    ],
    possibleIssues: [
      'IDs de entrada incorrectos o desactualizados',
      'URL del formulario incorrecta',
      'Formulario de Google no configurado correctamente',
      'Problemas de CORS en el navegador',
      'Formulario de Google deshabilitado o eliminado'
    ],
    troubleshootingSteps: [
      '1. Abrir el formulario de Google Forms en el navegador',
      '2. Inspeccionar elemento (F12) en los campos del formulario',
      '3. Buscar los atributos name="entry.XXXXXX" en los inputs',
      '4. Comparar con los IDs actuales en el código',
      '5. Actualizar los IDs si son diferentes',
      '6. Verificar que el formulario acepte envíos',
      '7. Probar el envío manual desde el formulario'
    ]
  };
  
  console.log('📋 Reporte generado:', report);
  return report;
};

// Exportar funciones para uso en consola
window.testGoogleSheets = {
  runTest: runGoogleSheetsTest,
  testUrl: testFormUrlOnly,
  generateReport: generateDiagnosticReport,
  validateEntries: validateFormEntries
};

console.log('🧪 Funciones de prueba cargadas. Usa:');
console.log('- testGoogleSheets.runTest() - Ejecutar prueba completa');
console.log('- testGoogleSheets.testUrl() - Probar solo la URL');
console.log('- testGoogleSheets.generateReport() - Generar reporte de diagnóstico');
console.log('- testGoogleSheets.validateEntries() - Validar IDs de entrada');

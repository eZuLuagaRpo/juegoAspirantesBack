// Script de prueba para Google Sheets
// Ejecutar en la consola del navegador para probar la funcionalidad

const testGoogleSheets = async () => {
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/formResponse';
  
  // Datos de prueba
  const testUserData = {
    studentId: '12345678',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '3001234567'
  };
  
  const testRewardData = {
    title: 'Test Reward'
  };
  
  const testCode = 'USBTEST123';
  
  console.log('🧪 Iniciando prueba de Google Sheets...');
  console.log('📝 Datos de prueba:', { testUserData, testRewardData, testCode });
  
  // Crear FormData
  const formData = new FormData();
  formData.append('entry.146369297', testUserData.studentId);
  formData.append('entry.1974491796', testUserData.firstName);
  formData.append('entry.2099371572', testUserData.lastName);
  formData.append('entry.1032330105', testUserData.email);
  formData.append('entry.471605411', testUserData.phone);
  formData.append('entry.725824376', testRewardData.title);
  formData.append('entry.492956207', testCode);
  
  console.log('📋 FormData creado:', formData);
  
  try {
    console.log('🚀 Enviando datos...');
    const response = await fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    
    console.log('✅ Respuesta recibida:', response);
    console.log('🎉 ¡Datos enviados exitosamente!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando datos:', error);
    return { success: false, error: error.message };
  }
};

// Función para probar la URL del formulario
const testFormUrl = () => {
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/formResponse';
  
  console.log('🔗 Probando URL del formulario...');
  
  fetch(formUrl, { method: 'GET' })
    .then(response => {
      console.log('✅ URL accesible:', response.status);
    })
    .catch(error => {
      console.error('❌ URL no accesible:', error);
    });
};

// Función para extraer IDs de entrada del formulario
const extractFormEntries = () => {
  console.log('🔍 Para extraer los IDs correctos del formulario:');
  console.log('1. Abre el formulario de Google Forms');
  console.log('2. Inspecciona el elemento (F12)');
  console.log('3. Busca los campos input con name="entry.XXXXXX"');
  console.log('4. Copia esos IDs y actualízalos en el código');
  
  // URLs comunes para formularios de Google
  const commonUrls = [
    'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/viewform',
    'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/formResponse'
  ];
  
  console.log('📋 URLs a verificar:', commonUrls);
};

// Ejecutar pruebas
console.log('🚀 Ejecutando pruebas de Google Sheets...');
console.log('📖 Comandos disponibles:');
console.log('- testGoogleSheets() - Probar envío de datos');
console.log('- testFormUrl() - Probar accesibilidad de URL');
console.log('- extractFormEntries() - Ver instrucciones para extraer IDs');

// Ejecutar automáticamente
testFormUrl();
extractFormEntries();

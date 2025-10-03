// Función para enviar datos al formulario de Google Sheets
export const submitToGoogleSheets = async (userData, rewardData, completionCode) => {
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/formResponse';
  
  
  // Validar datos requeridos
  if (!userData || !userData.studentId || !userData.firstName || !userData.lastName || !userData.email) {
    console.error('❌ Datos de usuario incompletos:', userData);
    return { success: false, error: 'Datos de usuario incompletos' };
  }
  
  if (!rewardData || !rewardData.title) {
    console.error('❌ Datos de recompensa incompletos:', rewardData);
    return { success: false, error: 'Datos de recompensa incompletos' };
  }
  
  if (!completionCode) {
    console.error('❌ Código de completación faltante');
    return { success: false, error: 'Código de completación faltante' };
  }
  
  // Mapeo de campos del formulario
  const formData = new FormData();
  formData.append('entry.146369297', userData.studentId || ''); // documento de identidad
  formData.append('entry.1974491796', userData.firstName || ''); // nombres
  formData.append('entry.2099371572', userData.lastName || ''); // apellidos
  formData.append('entry.1032330105', userData.email || ''); // correo
  formData.append('entry.471605411', userData.phone || ''); // celular
  formData.append('entry.725824376', rewardData.title || ''); // recompensa
  formData.append('entry.492956207', completionCode || ''); // codigo recompensa

  // Log de datos que se van a enviar
  try {
    const response = await fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors', // Necesario para formularios de Google
      body: formData
    });

    
    // Con no-cors no podemos verificar el status, pero si no hay error significa que se envió
    // Sin embargo, podemos agregar un pequeño delay para asegurar que la petición se procese
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando datos a Google Sheets:', error);
    console.error('🔍 Detalles del error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
};

// Función para generar un código único de recompensa en formato USBXXXXX
export const generateCompletionCode = (userId, timestamp) => {
  // Generar 5 números aleatorios
  const randomNumbers = Math.floor(10000 + Math.random() * 90000);
  
  return `USB${randomNumbers}`;
};

// Función para obtener información de la recompensa basada en estrellas
export const getRewardInfo = (totalStars) => {
  const rewardTiers = [
    { stars: 10, discount: 100, title: "Inscripción Gratuita" },
    { stars: 20, discount: 3, title: "3% de Descuento" },
    { stars: 30, discount: 5, title: "5% de Descuento" },
    { stars: 40, discount: 8, title: "8% de Descuento" }
  ];

  // Encontrar la recompensa más alta que el usuario ha desbloqueado
  const unlockedRewards = rewardTiers.filter(tier => totalStars >= tier.stars);
  const highestReward = unlockedRewards.sort((a, b) => b.stars - a.stars)[0];
  
  return highestReward || rewardTiers[0];
};

// Función de prueba para diagnosticar problemas con Google Sheets
export const testGoogleSheetsConnection = async () => {
  console.log('🧪 Iniciando prueba de conexión con Google Sheets...');
  
  // URL de prueba (puede que necesite ser actualizada)
  const testFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdQOF_HVcfUCvp4aZ5MjP-Q_FOsZgsumsxhu3hDJccbiaWTFg/viewform';
  
  try {
    console.log('🔗 Probando acceso al formulario...');
    const response = await fetch(testFormUrl, { 
      method: 'GET',
      mode: 'no-cors'
    });
    
    console.log('✅ Formulario accesible:', response);
    
    // Datos de prueba
    const testData = {
      userData: {
        studentId: 'TEST123456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '3000000000'
      },
      rewardData: {
        title: 'Test Reward'
      },
      completionCode: 'USBTEST123'
    };
    
    console.log('📝 Enviando datos de prueba...');
    const result = await submitToGoogleSheets(testData.userData, testData.rewardData, testData.completionCode);
    
    console.log('📊 Resultado de la prueba:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar si los IDs de entrada del formulario son correctos
export const validateFormEntries = () => {
  console.log('🔍 Validando IDs de entrada del formulario...');
  console.log('📋 IDs actuales:');
  console.log('  - entry.146369297 (documento de identidad)');
  console.log('  - entry.1974491796 (nombres)');
  console.log('  - entry.2099371572 (apellidos)');
  console.log('  - entry.1032330105 (correo)');
  console.log('  - entry.471605411 (celular)');
  console.log('  - entry.725824376 (recompensa)');
  console.log('  - entry.492956207 (código recompensa)');
  
  console.log('⚠️  Si los datos no se están enviando, es probable que estos IDs hayan cambiado.');
  console.log('📖 Para obtener los IDs correctos:');
  console.log('  1. Abre el formulario de Google Forms');
  console.log('  2. Inspecciona el elemento (F12)');
  console.log('  3. Busca los campos input con name="entry.XXXXXX"');
  console.log('  4. Copia esos IDs y actualízalos en el código');
  
  return {
    currentIds: [
      'entry.146369297',
      'entry.1974491796', 
      'entry.2099371572',
      'entry.1032330105',
      'entry.471605411',
      'entry.725824376',
      'entry.492956207'
    ]
  };
};

const nodemailer = require('nodemailer');

// Configuración del transporter de email con Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Plantilla HTML para el email de recompensa
const createRewardEmailTemplate = (firstName, completionCode, rewardTitle, discountPercentage) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Felicitaciones! Tu código de recompensa USB Medellín</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .congratulations {
          text-align: center;
          margin-bottom: 30px;
        }
        .congratulations h2 {
          color: #1e40af;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .reward-info {
          background-color: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 10px;
          padding: 25px;
          margin: 25px 0;
          text-align: center;
        }
        .reward-title {
          font-size: 20px;
          font-weight: bold;
          color: #0c4a6e;
          margin-bottom: 10px;
        }
        .discount {
          font-size: 36px;
          font-weight: bold;
          color: #0ea5e9;
          margin: 15px 0;
        }
        .code-section {
          background-color: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 25px;
          margin: 25px 0;
          text-align: center;
        }
        .code-label {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 10px;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #1e40af;
          font-family: 'Courier New', monospace;
          letter-spacing: 3px;
          background-color: #e0f2fe;
          padding: 15px 25px;
          border-radius: 8px;
          display: inline-block;
          margin: 10px 0;
        }
        .instructions {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 25px 0;
        }
        .instructions h3 {
          color: #92400e;
          margin-top: 0;
          font-size: 18px;
        }
        .instructions ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .instructions li {
          margin: 8px 0;
          color: #92400e;
        }
        .footer {
          background-color: #f8fafc;
          padding: 25px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 5px 0;
          color: #64748b;
          font-size: 14px;
        }
        .logo {
          width: 80px;
          height: auto;
          margin-bottom: 15px;
        }
        .highlight {
          background-color: #fef3c7;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Felicitaciones!</h1>
          <p>Has completado exitosamente el juego educativo USB Medellín</p>
        </div>
        
        <div class="content">
          <div class="congratulations">
            <h2>¡Hola ${firstName}!</h2>
            <p>Nos complace informarte que has completado exitosamente todos los niveles del juego educativo de la Universidad San Buenaventura Medellín.</p>
          </div>
          
          <div class="code-section">
            <div class="code-label">Tu código de recompensa es:</div>
            <div class="code">${completionCode}</div>
            <p><strong>Guarda este código de forma segura</strong></p>
          </div>
          
          <div class="instructions">
            <h3>📋 Cómo usar tu código de recompensa:</h3>
            <ul>
              <li>Presenta este código junto con tu documento de identidad en la oficina de admisiones de la USB Medellín</li>
              <li>El código es válido únicamente para el próximo proceso de admisiones e inscripciones de la Universidad de San Buenaventura Medellín</li>
              <li>No es transferible y debe ser usado por el titular del documento</li>
              <li>Para más información, contacta a la Universidad de San Buenaventura Medellín</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #1e40af; font-weight: bold;">
              ¡Gracias por participar en nuestro juego educativo!
            </p>
            <p style="color: #64748b;">
              Esperamos verte pronto como parte de nuestra comunidad universitaria.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Universidad San Buenaventura Medellín</strong></p>
          <p style="font-size: 12px; margin-top: 15px;">
            Este es un email automático, por favor no responder a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función para enviar email de recompensa
const sendRewardEmail = async (email, firstName, completionCode, rewardTitle, discountPercentage) => {
  try {
    // Verificar que las credenciales estén configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Credenciales de email no configuradas. Verifica EMAIL_USER y EMAIL_PASS en el archivo .env');
    }

    const transporter = createTransporter();
    
    // Verificar la conexión
    await transporter.verify();

    const mailOptions = {
      from: `"Juego Educativo USB Medellín" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 ¡Felicitaciones ${firstName}! Tu código de recompensa USB Medellín`,
      html: createRewardEmailTemplate(firstName, completionCode, rewardTitle, discountPercentage),
      text: `
        ¡Felicitaciones ${firstName}!
        
        Has completado exitosamente el juego educativo de la Universidad San Buenaventura Medellín.
        
        Tu recompensa: ${rewardTitle} (${discountPercentage === 100 ? '100%' : `${discountPercentage}%`} de descuento)
        Tu código: ${completionCode}
        
        Cómo usar tu código:
        - Presenta este código junto con tu documento de identidad en la oficina de admisiones
        - Válido únicamente para el próximo proceso de admisiones e inscripciones de la Universidad de San Buenaventura Medellín
        - No es transferible
        
        ¡Gracias por participar!
        Universidad San Buenaventura Medellín
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRewardEmail,
  createRewardEmailTemplate
};

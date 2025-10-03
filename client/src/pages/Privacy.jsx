import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, UserCheck, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="responsive-container py-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center space-x-4">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidad</h1>
              <p className="text-white/90">Protección de Datos Personales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="responsive-container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Contenido de privacidad */}
          <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
            
            {/* Sección 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                1. Información que Recopilamos
              </h2>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold">1.1 Información de Registro</p>
                <p>
                  Al crear una cuenta en nuestro Juego Educativo, recopilamos la siguiente información:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nombre completo</li>
                  <li>Correo electrónico institucional o personal</li>
                  <li>Contraseña (encriptada)</li>
                  <li>Número de teléfono (opcional)</li>
                </ul>

                <p className="font-semibold mt-4">1.2 Información de Uso</p>
                <p>
                  Durante el uso de la plataforma, recopilamos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Progreso en los módulos educativos</li>
                  <li>Puntuación y estrellas obtenidas</li>
                  <li>Tiempo dedicado a cada actividad</li>
                  <li>Recompensas solicitadas</li>
                  <li>Fecha y hora de acceso</li>
                  <li>Dirección IP (para seguridad)</li>
                </ul>

                <p className="font-semibold mt-4">1.3 Información para Recompensas Físicas</p>
                <p>
                  Si solicita recompensas físicas, podemos requerir:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dirección de entrega</li>
                  <li>Número de identificación (para verificación)</li>
                  <li>Información de contacto adicional</li>
                </ul>
              </div>
            </section>

            {/* Sección 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                2. Cómo Utilizamos su Información
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  La Universidad de San Buenaventura Medellín utiliza sus datos personales para:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Proporcionar y mejorar el servicio del Juego Educativo</li>
                  <li>Gestionar su cuenta y autenticación</li>
                  <li>Realizar seguimiento de su progreso educativo</li>
                  <li>Procesar y entregar recompensas</li>
                  <li>Enviar notificaciones sobre el servicio</li>
                  <li>Personalizar su experiencia de aprendizaje</li>
                  <li>Generar estadísticas anónimas para mejorar la plataforma</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Prevenir fraude y garantizar la seguridad</li>
                </ul>
              </div>
            </section>

            {/* Sección 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                3. Protección de sus Datos
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encriptación de contraseñas mediante algoritmos seguros</li>
                  <li>Conexiones HTTPS seguras</li>
                  <li>Controles de acceso restrictivos a la base de datos</li>
                  <li>Respaldos periódicos de información</li>
                  <li>Monitoreo de actividades sospechosas</li>
                  <li>Auditorías de seguridad regulares</li>
                </ul>
                <p className="mt-4">
                  Sin embargo, ningún sistema de transmisión por Internet es 100% seguro. 
                  Por ello, le recomendamos mantener su contraseña confidencial.
                </p>
              </div>
            </section>

            {/* Sección 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                4. Compartición de Información
              </h2>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold">4.1 No Vendemos sus Datos</p>
                <p>
                  La Universidad de San Buenaventura Medellín NO vende, alquila ni comercializa 
                  sus datos personales con terceros.
                </p>

                <p className="font-semibold mt-4">4.2 Compartición Limitada</p>
                <p>
                  Podemos compartir información solo en los siguientes casos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar 
                    la plataforma (hosting, email) bajo estrictos acuerdos de confidencialidad
                  </li>
                  <li>
                    <strong>Autoridades:</strong> Cuando sea requerido por ley o por orden judicial
                  </li>
                  <li>
                    <strong>Protección de derechos:</strong> Para proteger los derechos, propiedad 
                    o seguridad de la Universidad o sus usuarios
                  </li>
                </ul>

                <p className="font-semibold mt-4">4.3 Datos Anónimos</p>
                <p>
                  Podemos compartir datos estadísticos agregados y anónimos para fines académicos 
                  e investigación, sin que estos permitan identificar a usuarios individuales.
                </p>
              </div>
            </section>

            {/* Sección 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
                5. Sus Derechos (Ley 1581 de 2012)
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Como titular de datos personales, usted tiene derecho a:
                </p>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Acceder:</strong> Conocer qué datos personales tenemos sobre usted</span>
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Actualizar:</strong> Modificar datos inexactos o incompletos</span>
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Rectificar:</strong> Corregir información errónea</span>
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Suprimir:</strong> Solicitar la eliminación de sus datos</span>
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Revocar:</strong> Retirar la autorización en cualquier momento</span>
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Presentar quejas:</strong> Ante la Superintendencia de Industria y Comercio</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                6. Cookies y Tecnologías Similares
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Utilizamos cookies y tecnologías similares para:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mantener su sesión activa</li>
                  <li>Recordar sus preferencias</li>
                  <li>Analizar el uso de la plataforma</li>
                  <li>Mejorar la experiencia del usuario</li>
                </ul>
                <p className="mt-4">
                  Puede configurar su navegador para rechazar cookies, aunque esto puede afectar 
                  algunas funcionalidades de la plataforma.
                </p>
              </div>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                7. Retención de Datos
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Conservamos sus datos personales mientras:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Su cuenta permanezca activa</li>
                  <li>Sea necesario para proporcionar el servicio</li>
                  <li>Sea requerido por ley</li>
                </ul>
                <p className="mt-4">
                  Si solicita la eliminación de su cuenta, sus datos serán eliminados en un plazo 
                  de 30 días, excepto aquellos que debamos conservar por obligaciones legales.
                </p>
              </div>
            </section>

            {/* Sección 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                8. Menores de Edad
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Si usted es menor de 18 años, debe contar con el consentimiento de sus padres 
                  o tutores legales para utilizar la plataforma. Los representantes legales pueden 
                  ejercer los derechos HABEAS DATA en nombre del menor.
                </p>
              </div>
            </section>

            {/* Sección 9 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                9. Cambios a esta Política
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Los cambios 
                  significativos serán notificados mediante:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Aviso destacado en la plataforma</li>
                  <li>Correo electrónico a su cuenta registrada</li>
                  <li>Notificación al iniciar sesión</li>
                </ul>
                <p className="mt-4">
                  Le recomendamos revisar esta política periódicamente.
                </p>
              </div>
            </section>

            {/* Sección 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                10. Contacto del Responsable del Tratamiento
              </h2>
              <div className="text-gray-700 space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-600">
                  <p className="font-semibold text-blue-900 mb-3">
                    Universidad de San Buenaventura Medellín
                  </p>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Dirección:</strong> Carrera 56c #51-110, San Benito - Medellín, Colombia</p>
                    <p><strong>Teléfono:</strong> 300 702 87 20</p>
                    <p><strong>Horario de atención:</strong> Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                11. Normativa Aplicable
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Esta Política de Privacidad cumple con:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ley 1581 de 2012 - Protección de Datos Personales</li>
                  <li>Decreto 1377 de 2013</li>
                  <li>Decreto 1074 de 2015</li>
                  <li>Ley 1266 de 2008 - Habeas Data</li>
                </ul>
              </div>
            </section>

          </div>

          {/* Botón de acción */}
          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


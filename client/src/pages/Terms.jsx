import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-gradient-to-r from-usb-orange-500 to-usb-red-600 text-white">
        <div className="responsive-container py-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center space-x-4">
            <FileText className="w-12 h-12" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Términos y Condiciones de Uso</h1>
              <p className="text-white/90">Universidad de San Buenaventura Medellín</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="responsive-container py-12">
        <div className="max-w-4xl mx-auto">
          

          {/* Contenido de términos */}
          <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
            
            {/* Sección 1 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                1. Aceptación de los Términos
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Al acceder y utilizar el Juego Educativo de Procesos de Inscripción de la Universidad de 
                  San Buenaventura Medellín (en adelante, "el Juego" o "la Plataforma"), usted acepta estar 
                  legalmente vinculado por estos Términos y Condiciones de Uso.
                </p>
                <p>
                  Si no está de acuerdo con estos términos, por favor no utilice la plataforma.
                </p>
              </div>
            </section>

            {/* Sección 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                2. Descripción del Servicio
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  El Juego es una herramienta educativa interactiva diseñada para facilitar el aprendizaje 
                  de los procesos de inscripción y servicios universitarios de la USB Medellín. El servicio incluye:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Juegos y puzzles educativos sobre los procesos universitarios</li>
                  <li>Sistema de recompensas virtuales y físicas</li>
                  <li>Seguimiento de progreso académico</li>
                  <li>Información sobre becas, servicios y dependencias universitarias</li>
                </ul>
              </div>
            </section>

            {/* Sección 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                3. Uso de la Plataforma
              </h2>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold">3.1 Elegibilidad</p>
                <p>
                  El Juego está dirigido principalmente a aspirantes y estudiantes de la Universidad de 
                  San Buenaventura Medellín. Al registrarse, usted confirma que:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Es mayor de edad o cuenta con el consentimiento de sus padres o tutores</li>
                  <li>Proporcionará información veraz y actualizada</li>
                  <li>Mantendrá la seguridad de su cuenta y contraseña</li>
                </ul>
                
                <p className="font-semibold mt-4">3.2 Conducta del Usuario</p>
                <p>Usted se compromete a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>No compartir su cuenta con terceros</li>
                  <li>No utilizar la plataforma para fines distintos a los educativos</li>
                  <li>No intentar manipular el sistema de puntuación o recompensas</li>
                  <li>No realizar actividades que puedan dañar o comprometer la plataforma</li>
                </ul>
              </div>
            </section>

            {/* Sección 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                4. Sistema de Recompensas
              </h2>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold">4.1 Recompensas Virtuales</p>
                <p>
                  Las recompensas virtuales (certificados digitales, insignias) son de carácter 
                  simbólico y reconocen el esfuerzo del usuario en completar los módulos educativos.
                </p>
                
                <p className="font-semibold mt-4">4.2 Recompensas Físicas</p>
                <p>
                  Las recompensas físicas están sujetas a disponibilidad y pueden requerir 
                  verificación de identidad. La Universidad se reserva el derecho de:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modificar el catálogo de recompensas disponibles</li>
                  <li>Establecer fechas límite para el reclamo de recompensas</li>
                  <li>Verificar la elegibilidad del usuario antes de entregar premios físicos</li>
                  <li>Limitar la cantidad de recompensas por usuario</li>
                </ul>
              </div>
            </section>

            {/* Sección 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                5. Propiedad Intelectual
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Todos los contenidos del Juego, incluyendo pero no limitado a textos, gráficos, 
                  logos, íconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, 
                  son propiedad de la Universidad de San Buenaventura Medellín o de sus proveedores de 
                  contenido y están protegidos por las leyes de propiedad intelectual de Colombia.
                </p>
                <p>
                  El uso no autorizado de cualquier material puede violar las leyes de derechos de autor, 
                  marcas comerciales y otras leyes aplicables.
                </p>
              </div>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                6. Privacidad y Protección de Datos
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  El tratamiento de sus datos personales se rige por nuestra{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    Política de Privacidad
                  </Link>
                  , la cual forma parte integral de estos Términos y Condiciones.
                </p>
                <p>
                  La Universidad cumple con la Ley 1581 de 2012 y demás normativa aplicable sobre 
                  protección de datos personales en Colombia.
                </p>
              </div>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                7. Limitación de Responsabilidad
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  La Universidad de San Buenaventura Medellín:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>No garantiza que el servicio estará disponible de forma ininterrumpida o libre de errores</li>
                  <li>No se hace responsable por pérdidas de datos o interrupciones del servicio</li>
                  <li>No garantiza resultados específicos del uso educativo de la plataforma</li>
                  <li>Se reserva el derecho de modificar, suspender o descontinuar el servicio en cualquier momento</li>
                </ul>
              </div>
            </section>

            {/* Sección 8 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                8. Modificaciones a los Términos
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  La Universidad se reserva el derecho de modificar estos términos en cualquier momento. 
                  Los cambios significativos serán notificados a los usuarios mediante:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Aviso en la plataforma</li>
                  <li>Correo electrónico registrado</li>
                  <li>Notificación al iniciar sesión</li>
                </ul>
                <p>
                  El uso continuado de la plataforma después de las modificaciones constituye 
                  su aceptación de los nuevos términos.
                </p>
              </div>
            </section>

            {/* Sección 9 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                9. Terminación de la Cuenta
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  La Universidad se reserva el derecho de suspender o terminar su cuenta si:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Viola estos Términos y Condiciones</li>
                  <li>Proporciona información falsa o engañosa</li>
                  <li>Intenta manipular el sistema de recompensas</li>
                  <li>Realiza actividades que perjudiquen a otros usuarios o a la plataforma</li>
                </ul>
              </div>
            </section>

            {/* Sección 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                10. Contacto
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Para preguntas o comentarios sobre estos Términos y Condiciones, puede contactarnos a través de:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Teléfono:</strong> 300 702 87 20</p>
                  <p><strong>Dirección:</strong> Carrera 56c #51-110, San Benito-Medellín</p>
                </div>
              </div>
            </section>

            {/* Sección 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                11. Legislación Aplicable
              </h2>
              <div className="text-gray-700 space-y-3">
                <p>
                  Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. 
                  Cualquier disputa será resuelta en los tribunales competentes de Medellín, Colombia.
                </p>
              </div>
            </section>

          </div>

          {/* Botón de acción */}
          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-usb-orange-500 to-usb-red-600 text-white rounded-lg hover:from-usb-orange-600 hover:to-usb-red-700 transition-all shadow-lg"
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

export default Terms;


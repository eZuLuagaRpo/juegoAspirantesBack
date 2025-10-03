import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  ArrowLeft,
  MessageCircle,
  Building2,
  Globe
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se podría integrar con un servicio de email
    setSubmitted(true);
    
    // Resetear después de 3 segundos
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const campuses = [
    {
      name: 'Campus San Benito - Medellín',
      address: 'Carrera 56c #51-110, San Benito',
      city: 'Medellín, Antioquia',
      icon: <Building2 className="w-6 h-6" />
    },
    {
      name: 'Campus Santana - Bello',
      address: 'Calle 45 N° 61-40, Santana',
      city: 'Bello, Antioquia',
      icon: <Building2 className="w-6 h-6" />
    },
    {
      name: 'Campus Armenia',
      address: 'Cra. 6 #6-25',
      city: 'Armenia, Quindío',
      icon: <Building2 className="w-6 h-6" />
    }
  ];

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Teléfono',
      info: '300 702 87 20',
      description: 'Llámanos en horario de atención',
      color: 'from-green-500 to-green-600'
    },
    
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Horario de Atención',
      info: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
      description: 'Sábados: 8:00 AM - 12:00 PM',
      color: 'from-purple-500 to-purple-600'
    }
  ];

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
            <MessageCircle className="w-12 h-12" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Contáctanos</h1>
              <p className="text-white/90">Estamos aquí para ayudarte</p>
            </div>
          </div>
        </div>
      </div>

      <div className="responsive-container py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Métodos de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-900 font-semibold mb-1">{method.info}</p>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formulario de contacto */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-2 text-usb-orange-500" />
                Envíanos un Mensaje
              </h2>
              
              {submitted ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-800 font-semibold">¡Mensaje enviado con éxito!</p>
                      <p className="text-green-700 text-sm mt-1">Nos pondremos en contacto contigo pronto.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usb-orange-500 focus:border-transparent transition-all"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usb-orange-500 focus:border-transparent transition-all"
                      placeholder="tu.email@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usb-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="soporte">Soporte Técnico</option>
                      <option value="recompensas">Consulta sobre Recompensas</option>
                      <option value="cuenta">Problemas con mi Cuenta</option>
                      <option value="inscripcion">Información de Inscripción</option>
                      <option value="sugerencia">Sugerencias</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usb-orange-500 focus:border-transparent transition-all resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-usb-orange-500 to-usb-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-usb-orange-600 hover:to-usb-red-700 transition-all shadow-lg flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Mensaje
                  </button>
                </form>
              )}
            </div>

            {/* Información de ubicación */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-usb-orange-500" />
                  Nuestros Campus
                </h2>
                
                <div className="space-y-6">
                  {campuses.map((campus, index) => (
                    <div 
                      key={index}
                      className="border-l-4 border-usb-orange-500 pl-4 py-2"
                    >
                      <div className="flex items-start">
                        <div className="text-usb-orange-500 mr-3 mt-1">
                          {campus.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{campus.name}</h3>
                          <p className="text-gray-700 text-sm">{campus.address}</p>
                          <p className="text-gray-600 text-sm">{campus.city}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-br from-usb-orange-50 to-usb-red-50 rounded-lg shadow-md p-8 border border-usb-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-usb-orange-500" />
                  ¿Necesitas más información?
                </h3>
                <p className="text-gray-700 mb-4">
                  Visita nuestro sitio web oficial para conocer más sobre nuestros programas académicos, 
                  proceso de inscripción y servicios universitarios.
                </p>
                <a 
                  href="https://www.usbmed.edu.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-usb-orange-600 hover:text-usb-orange-700 font-semibold"
                >
                  Ir al sitio web oficial
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* FAQ rápido */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">¿Cuándo recibiré respuesta?</h4>
                    <p className="text-gray-600 text-sm">
                      Respondemos todos los mensajes en un plazo de 24 a 48 horas hábiles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">¿Cómo reclamo mis recompensas?</h4>
                    <p className="text-gray-600 text-sm">
                      Puedes reclamar tus recompensas desde la sección "Recompensas" en tu perfil.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">¿Olvidé mi contraseña?</h4>
                    <p className="text-gray-600 text-sm">
                      Usa la opción "¿Olvidaste tu contraseña?" en la página de inicio de sesión.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de regreso */}
          <div className="mt-12 text-center">
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

export default Contact;


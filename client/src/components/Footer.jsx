import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter,
  Youtube
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Inicio', to: '/' },
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'Recompensas', to: '/rewards' },
    { name: 'Mi Perfil', to: '/profile' }
  ];

  const universityInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      text: 'Carrera 56c #51-110, San Benito-Medellín'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      text: 'Calle 45 N° 61-40, Santana-Bello'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      text: 'Cra. 6 #6-25, Armenia, Quindío'
    },
    {
      icon: <Phone className="w-5 h-5" />,
      text: '300 702 87 20'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: 'Pregrado: mercadeo@usbmed.edu.co'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: 'mercadeo1@usbmed.edu.co'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: 'asistente.mercadeo1@usbmed.edu.co'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: 'Posgrado: mercadeo.posgrados@usbmed.edu.co'
    }
  ];

  const socialMedia = [
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: 'https://www.facebook.com/usbmed?' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: 'https://www.instagram.com/usbmed?igsh=aGcxMzgza2ttamJ3' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://x.com/USBmed' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="responsive-container py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo y descripción */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-10 sm:w-10 sm:h-14 header-gradient rounded-lg flex items-center justify-center usb-shadow">
                <img src="/logo.png" alt="USB Logo" className="w-5 h-7 sm:w-7 sm:h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-display">USB Medellín</h3>
                <p className="text-xs sm:text-sm text-gray-400">Juego Educativo</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Descubre los procesos de inscripción de la Universidad de San Buenaventura 
              Medellín de manera divertida e interactiva.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información de la universidad */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Universidad</h4>
            <ul className="space-y-2 sm:space-y-3">
              {universityInfo.map((info, index) => (
                <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <span className="text-usb-blue mt-0.5 text-sm sm:text-base">{info.icon}</span>
                  <span className="text-gray-400 text-xs sm:text-sm">{info.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Síguenos</h4>
            <div className="flex space-x-3 sm:space-x-4">
              {socialMedia.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-usb-blue rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-sm sm:text-base">{social.icon}</span>
                </a>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6">
              <h5 className="text-xs sm:text-sm font-semibold mb-2 text-gray-300">Horarios de Atención</h5>
              <p className="text-gray-400 text-xs sm:text-sm">
                Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                Sábados: 8:00 AM - 12:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              <p>&copy; {currentYear} Universidad de San Buenaventura Medellín. Todos los derechos reservados.</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Términos de Uso
              </Link>
              
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-gray-500 text-xs leading-relaxed">
            Este juego educativo es una iniciativa de la Universidad de San Buenaventura Medellín 
            para facilitar el proceso de inscripción de nuevos estudiantes.
          </p>
          <p className="text-gray-500 text-xs mt-2 leading-relaxed">
            Desarrollado con ❤️ por Mateo Giraldo, Emanuel Zuluaga y Alejandro Tabares para la comunidad estudiantil USB.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { 
  X, 
  Star, 
  Trophy, 
  Target, 
  Gift, 
  Play, 
  CheckCircle,
  Award,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Star className="w-6 h-6 text-usb-gold" />,
      title: "Sistema de Puntuación",
      description: "Comienzas con 5 estrellas y se restan penalizaciones por tiempo, errores y pistas. Fórmula: 5 - Tiempo - Errores - Pistas = Estrellas finales."
    },
    {
      icon: <Trophy className="w-6 h-6 text-usb-orange-500" />,
      title: "Solo 1 intento por puzzle",
      description: "Solo puedes intentar un puzzle una vez, por lo que debes estar muy concentrado para no perder tus estrellas."
    },
    {
      icon: <Gift className="w-6 h-6 text-usb-purple" />,
      title: "Las recompensas no son acumulables",
      description: "Obtienes un solo premio, no puedes acumular recompensas, se aplica el mayor descuento obtenido."
    },
    {
      icon: <Target className="w-6 h-6 text-usb-green" />,
      title: "Juega desde un computador",
      description: "Los diferentes puzzles están optimizados para una mejor experiencia y jugabilidad, por lo que te recomendamos jugar desde un computador."
    },
    {
      icon: <Award className="w-6 h-6 text-usb-orange-500" />,
      title: "Solo tienes una oportunidad",
      description: "Para reclamar tu premio debe ser con tu documento de identidad, por lo que no se puede crear más de una cuenta con el mismo documento."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto usb-shadow-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-usb-orange-500 to-orange-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <img src="/logo.png" alt="USB Logo" className="w-12 h-16 object-contain" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenid@ a la USB Medellín!
            </h1>
            <p className="text-xl text-orange-100">
              Tu aventura educativa está por comenzar
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Introducción */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold usb-dark mb-4">
              🎮 Aprende Jugando, Gana Recompensas Reales
            </h2>
            <p className="text-lg usb-light leading-relaxed">
              Has llegado al lugar perfecto para prepararte para tu vida universitaria. 
              A través de juegos interactivos, aprenderás todo lo necesario sobre los procesos 
              de inscripción y podrás ganar descuentos reales en tu matrícula.
            </p>
          </div>

          {/* Características principales */}
          <div className="mb-8">
            <h3 className="text-xl font-bold usb-dark mb-6 text-center">
              ¿Qué debes tener en cuenta?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-4 p-4 bg-usb-gray-50 rounded-xl ${
                    index === features.length - 1 && features.length % 2 !== 0 
                      ? 'md:col-span-2 md:max-w-2xl md:mx-auto' 
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold usb-dark mb-2">{feature.title}</h4>
                    <p className="text-sm usb-light">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="btn-primary text-lg px-8 py-3"
            >
              ¡Comenzar Aventura!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

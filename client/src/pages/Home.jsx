import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  Star, 
  Users, 
  BookOpen, 
  Award,
  ArrowRight,
  Play
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-usb-orange-500" />,
      title: 'Aprende Jugando',
      description: 'Descubre los procesos de inscripción de la USB Medellín de manera divertida e interactiva'
    },
    {
      icon: <Trophy className="w-8 h-8 text-usb-gold" />,
      title: 'Gana Recompensas',
      description: 'Obtén increíbles descuentos de hasta el 8% en tu matrícula mediante estrellas en los diferentes juegos'
    },
    {
      icon: <Star className="w-8 h-8 text-usb-gold" />,
      title: 'Sistema de Estrellas',
      description: 'Completa puzzles y obtén hasta 5 estrellas según tu rendimiento'
    }
  ];

  const levels = [
    {
      id: 'mercadeo',
      name: 'Mercadeo',
      description: 'Conoce opciones de financiación',
      color: 'from-usb-gold to-yellow-500',
      stars: 10
    },
    {
      id: 'registroAcademico',
      name: 'Registro Académico',
      description: 'Completa información y documentos',
      color: 'from-usb-green to-green-600',
      stars: 10
    },
    {
      id: 'facultades',
      name: 'Facultades',
      description: 'Explora programas académicos',
      color: 'from-usb-red to-red-600',
      stars: 5
    },
    {
      id: 'bienestar',
      name: 'Bienestar',
      description: 'Descubre servicios universitarios',
      color: 'from-usb-purple to-purple-600',
      stars: 5
    },
    {
      id: 'cartera',
      name: 'Cartera',
      description: 'Gestiona pagos y costos de matrícula',
      color: 'from-usb-orange-500 to-usb-orange-600',
      stars: 10
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="header-gradient text-usb-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
              ¡Aprende Jugando!
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Descubre los procesos de inscripción de la Universidad de San Buenaventura Medellín 
              mientras resuelves puzzles y ganas recompensas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-usb-white text-usb-orange-500 font-bold text-lg rounded-lg hover:bg-orange-50 transition-colors usb-shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Continuar Juego
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-usb-white text-usb-orange-500 font-bold text-lg rounded-lg hover:bg-orange-50 transition-colors usb-shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Empezar a Jugar
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-usb-white text-usb-white font-bold text-lg rounded-lg hover:bg-usb-white hover:text-usb-orange-500 transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-usb-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold usb-dark mb-4 font-display">
              ¿Por qué jugar?
            </h2>
            <p className="text-xl usb-light max-w-2xl mx-auto">
              Nuestro juego educativo combina diversión y aprendizaje para que tu experiencia 
              de inscripción sea memorable y efectiva
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-usb-orange-100 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold usb-dark mb-2">
                  {feature.title}
                </h3>
                <p className="usb-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Preview */}
      <section className="py-20 bg-usb-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold usb-dark mb-4 font-display">
              Niveles del Juego
            </h2>
            <p className="text-xl usb-light max-w-2xl mx-auto">
              Completa 5 bases temáticas para dominar todo el proceso de inscripción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <div 
                key={level.id}
                className={`bg-gradient-to-br ${level.color} text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{level.name}</h3>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                </div>
                <p className="text-orange-100 mb-4">{level.description}</p>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1" />
                  <span>Hasta {level.stars} estrellas</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary inline-flex items-center"
              >
                Ver Todos los Niveles
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary inline-flex items-center"
              >
                Empezar Ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-usb-gold to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-usb-white mb-6 font-display">
            ¿Listo para la aventura?
          </h2>
            <p className="text-xl text-yellow-100 mb-8">
              Únete a cientos de aspirantes que ya están aprendiendo mientras se divierten.
            </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-usb-white text-yellow-600 font-bold text-lg rounded-lg hover:bg-yellow-50 transition-colors usb-shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Continuar Juego
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-usb-white text-yellow-600 font-bold text-lg rounded-lg hover:bg-yellow-50 transition-colors usb-shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Empezar Gratis
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-usb-white text-usb-white font-bold text-lg rounded-lg hover:bg-usb-white hover:text-yellow-600 transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

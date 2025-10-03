import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  Star, 
  Percent, 
  CheckCircle, 
  Award,
  TrendingUp,
  Calculator
} from 'lucide-react';

const Rewards = () => {
  const { user } = useAuth();
  const { userProgress } = useGame();
  const [loading, setLoading] = useState(false);

  
  // Sistema de descuentos basado en estrellas (máximo 40 estrellas totales)
  const discountTiers = [
    {
      stars: 10,
      discount: 100,
      title: "Inscripción Gratuita",
      description: "¡Felicidades! Has ganado inscripción completamente gratuita",
      icon: <Award className="w-8 h-8 text-usb-green" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800"
    },
    {
      stars: 20,
      discount: 3,
      title: "3% de Descuento",
      description: "Obtén un 3% de descuento en el valor de tu matrícula",
      icon: <Percent className="w-8 h-8 text-usb-orange-500" />,
      color: "from-usb-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800"
    },
    {
      stars: 30,
      discount: 5,
      title: "5% de Descuento",
      description: "Obtén un 5% de descuento en el valor de tu matrícula",
      icon: <TrendingUp className="w-8 h-8 text-usb-blue" />,
      color: "from-usb-blue to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800"
    },
    {
      stars: 40,
      discount: 8,
      title: "8% de Descuento",
      description: "Obtén un 8% de descuento en el valor total de tu matrícula",
      icon: <Calculator className="w-8 h-8 text-usb-purple" />,
      color: "from-usb-purple to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800"
    }
  ];

  const totalStars = userProgress?.totalStars || 0;
  // Encontrar la recompensa más alta desbloqueada (la última que cumple el requisito)
  const currentTier = discountTiers
    .filter(tier => totalStars >= tier.stars)
    .sort((a, b) => b.stars - a.stars)[0] || null;
  const nextTier = discountTiers.find(tier => totalStars < tier.stars);


  const getTierStatus = (tier) => {
    if (totalStars >= tier.stars) {
      return 'unlocked';
    } else if (nextTier && tier.stars === nextTier.stars) {
      return 'next';
    } else {
      return 'locked';
    }
  };

  return (
    <div className="min-h-screen bg-usb-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold usb-dark font-display">
                🎓 Sistema de Recompensas
              </h1>
              <p className="usb-light mt-2">
                Gana estrellas y obtén descuentos en tu matrícula universitaria
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-usb-gold">
                {totalStars}
              </div>
              <div className="text-sm usb-light">Estrellas Totales</div>
            </div>
          </div>
        </div>


        {/* Estado actual del descuento */}
            {currentTier && (
          <div className="mb-8">
            <div className={`${currentTier.bgColor} ${currentTier.borderColor} border-2 rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {currentTier.icon}
                  <div>
                    <h2 className={`text-xl font-bold ${currentTier.textColor}`}>
                      ¡Descuento Actual Desbloqueado!
                    </h2>
                    <p className={`${currentTier.textColor} opacity-80`}>
                      {currentTier.title} - {currentTier.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${currentTier.textColor}`}>
                    {currentTier.discount === 0 ? '100%' : `${currentTier.discount}%`}
                  </div>
                  <div className={`text-sm ${currentTier.textColor} opacity-80`}>
                    Descuento
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Próximo nivel */}
        {nextTier && (
          <div className="mb-8">
            <div className="bg-usb-white rounded-xl usb-shadow-lg border border-usb-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-usb-orange-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-usb-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold usb-dark">
                      Próximo Descuento Disponible
                    </h3>
                    <p className="usb-light">
                      Necesitas {nextTier.stars - totalStars} estrellas más para desbloquear {nextTier.title}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-usb-orange-500">
                    {nextTier.stars - totalStars}
                  </div>
                  <div className="text-sm usb-light">
                    Estrellas faltantes
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm usb-light mb-2">
                  <span>Progreso hacia {nextTier.title}</span>
                  <span>{totalStars}/{nextTier.stars} estrellas</span>
                </div>
                <div className="w-full bg-usb-gray-200 rounded-full h-2">
                  <div 
                    className="bg-usb-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalStars / nextTier.stars) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Niveles de descuento */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold usb-dark mb-6 font-display">
            Niveles de Descuento Disponibles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountTiers.map((tier, index) => {
              const status = getTierStatus(tier);
              const isUnlocked = status === 'unlocked';
              const isNext = status === 'next';
              
              return (
                <div
                  key={tier.stars}
                  className={`relative rounded-xl p-6 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-green-50 border-2 border-green-200 shadow-lg'
                      : isNext
                      ? 'bg-usb-orange-50 border-2 border-usb-orange-200 shadow-md'
                      : 'bg-usb-gray-100 border-2 border-usb-gray-200 opacity-60'
                  }`}
                >
                  {/* Badge de estado */}
                  <div className="absolute -top-2 -right-2">
                    {isUnlocked ? (
                      <div className="w-8 h-8 bg-usb-green rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-usb-white" />
                      </div>
                    ) : isNext ? (
                      <div className="w-8 h-8 bg-usb-orange-500 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-usb-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-usb-gray-400 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-usb-white" />
                      </div>
                    )}
                  </div>

                  {/* Icono */}
                  <div className="mb-4">
                    {isUnlocked ? (
                      <div className="w-8 h-8 text-green-600">
                        {tier.icon}
                      </div>
                    ) : (
                      <div className="w-8 h-8 text-usb-gray-400">
                        {tier.icon}
                      </div>
                    )}
                  </div>

                  {/* Título y descuento */}
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold mb-2 ${
                      isUnlocked ? 'text-green-800' : isNext ? 'text-usb-orange-600' : 'usb-light'
                    }`}>
                      {tier.title}
                    </h3>
                    <div className={`text-3xl font-bold ${
                      isUnlocked ? 'text-green-800' : isNext ? 'text-usb-orange-500' : 'usb-light'
                    }`}>
                      {tier.discount === 0 ? '100%' : `${tier.discount}%`}
                    </div>
                    <div className={`text-sm ${
                      isUnlocked ? 'text-green-800' : isNext ? 'text-usb-orange-600' : 'usb-light'
                    } opacity-80`}>
                      Descuento
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className={`text-sm mb-4 ${
                    isUnlocked ? 'text-green-800' : isNext ? 'text-usb-orange-600' : 'usb-light'
                  } opacity-80`}>
                    {tier.description}
                  </p>

                  {/* Requisitos de estrellas */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className={`w-4 h-4 ${
                        isUnlocked ? 'text-green-600' : isNext ? 'text-usb-orange-500' : 'usb-light'
                      }`} />
                      <span className={`text-sm ${
                        isUnlocked ? 'text-green-800' : isNext ? 'text-usb-orange-600' : 'usb-light'
                      }`}>
                        {tier.stars} estrellas
                      </span>
                    </div>
                    
                    {isUnlocked && (
                      <div className="flex items-center space-x-1 text-usb-green">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Desbloqueado</span>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso para el siguiente nivel */}
                  {isNext && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs usb-light mb-1">
                        <span>Progreso</span>
                        <span>{totalStars}/{tier.stars}</span>
                      </div>
                      <div className="w-full bg-usb-gray-200 rounded-full h-1">
                        <div 
                          className="bg-usb-orange-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalStars / tier.stars) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Rewards;

import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Award,
  Gift,
  Star,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const RewardClaimModal = ({ isOpen, onClose, user, reward, onClaimReward, isClaiming }) => {
  if (!isOpen) return null;

  const getRewardInfo = () => {
    const rewardTiers = [
      { stars: 10, discount: 100, title: "Inscripción Gratuita", description: "¡Felicidades! Has ganado inscripción completamente gratuita" },
      { stars: 20, discount: 3, title: "3% de Descuento", description: "Obtén un 3% de descuento en el valor de tu matrícula" },
      { stars: 30, discount: 5, title: "5% de Descuento", description: "Obtén un 5% de descuento en el valor de tu matrícula" },
      { stars: 40, discount: 8, title: "8% de Descuento", description: "Obtén un 8% de descuento en el valor total de tu matrícula" }
    ];

    return rewardTiers.find(tier => tier.stars === reward.stars) || rewardTiers[0];
  };

  const rewardInfo = getRewardInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full usb-shadow-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-usb-green to-green-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Felicitaciones, {user?.firstName}!
            </h1>
            <p className="text-xl text-green-100">
              Has completado exitosamente todos los puzzles
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Información de recompensa */}
          <div className="text-center mb-8">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Award className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                {rewardInfo.title}
              </h2>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {rewardInfo.discount === 100 ? '100%' : `${rewardInfo.discount}%`}
              </div>
              <p className="text-green-700">
                {rewardInfo.description}
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center space-y-3">
            <button
              onClick={onClaimReward}
              disabled={isClaiming}
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2 mx-auto"
            >
              {isClaiming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generando Código...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Reclamar Recompensa</span>
                </>
              )}
            </button>
            
            {/* Botón de prueba para desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  const { testGoogleSheetsConnection } = await import('../utils/googleSheets.js');
                  await testGoogleSheetsConnection();
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600 transition-colors"
              >
                🧪 Probar Google Sheets
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardClaimModal;

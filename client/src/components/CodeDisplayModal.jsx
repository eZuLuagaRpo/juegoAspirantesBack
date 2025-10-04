import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Mail, 
  CheckCircle, 
  Trophy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const CodeDisplayModal = ({ isOpen, onClose, user, reward, completionCode, onLogout, onClaimReward, isClaiming }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(completionCode);
      toast.success('¡Código copiado al portapapeles!');
    } catch (error) {
      toast.error('Error al copiar el código');
    } finally {
      setIsCopying(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      
      const response = await fetch('/api/auth/send-reward-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          completionCode: completionCode,
          rewardTitle: reward.title,
          discountPercentage: reward.discount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setEmailSent(true);
        toast.success('¡Código enviado por correo exitosamente!', {
          duration: 4000,
          icon: '📧',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      } else {
        throw new Error(data.error || 'Error enviando email');
      }
    } catch (error) {
      toast.error('Error al enviar el email. Intenta de nuevo.', {
        duration: 4000,
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleFinish = () => {
    onLogout();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full usb-shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-usb-orange-500 to-orange-600 text-white p-3 rounded-t-xl">
          <div className="text-center">
            <div className="mx-auto w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
              <Trophy className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold mb-1">
              ¡Recompensa Obtenida!
            </h1>
            <p className="text-xs text-orange-100">
              Para reclamarla, haz clic en el botón "Reclamar Recompensa"
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Código de recompensa */}
          <div className="mb-4">
            <h3 className="text-base font-bold usb-dark mb-2 text-center">
              Tu Código de Recompensa
            </h3>
            <div className="bg-usb-gray-50 border-2 border-usb-gray-200 rounded-lg p-3">
              <div className="text-center">
                <div className="text-xl font-bold usb-dark mb-1 font-mono tracking-wider">
                  {completionCode}
                </div>
                <p className="text-xs usb-light mb-2">
                  Guarda este código para reclamar tu recompensa.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={handleCopyCode}
                    disabled={isCopying}
                    className="btn-secondary flex items-center justify-center space-x-1 text-xs py-1 px-3"
                  >
                    {isCopying ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-usb-orange-500"></div>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{isCopying ? 'Copiando...' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la recompensa */}
          <div className="mb-4">
            <h3 className="text-base font-bold usb-dark mb-2 text-center">
              Tu Recompensa
            </h3>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-base font-bold text-green-800 mb-1">
                  {reward.title}
                </h2>
                
                <p className="text-xs text-green-700">
                  {reward.description}
                </p>
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="mb-4">
            <h3 className="text-base font-bold usb-dark mb-2 text-center">
              Información Importante
            </h3>
            <div className="bg-usb-orange-50 border border-usb-orange-200 rounded-lg p-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-usb-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-usb-orange-800 mb-1 text-xs">
                    Cómo usar tu código
                  </h4>
                  <p className="text-xs text-usb-orange-700 leading-relaxed">
                    Presenta este código junto con tu documento de identidad en la oficina de admisiones de la USB Medellín. El código es válido únicamente para el próximo proceso de admisiones e inscripciones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center space-y-3">
            <button
              onClick={onClaimReward}
              disabled={isClaiming}
              className="btn-primary text-sm px-4 py-2 flex items-center justify-center space-x-2 mx-auto"
            >
              {isClaiming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando datos...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Reclamar Recompensa</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleFinish}
              className="text-usb-gray-500 hover:text-usb-gray-700 text-sm underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDisplayModal;

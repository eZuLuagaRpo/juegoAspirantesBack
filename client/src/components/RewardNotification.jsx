import React, { useState, useEffect } from 'react';
import { Trophy, Gift, X, Star, Badge, Crown, Award, CheckCircle, Percent, TrendingUp, Calculator } from 'lucide-react';

const RewardNotification = ({ 
  rewards = [], 
  onClose, 
  onClaimReward, 
  variant = 'default', // 'default', 'compact', 'modal', 'popup', 'best-reward'
  autoClose = true,
  showAnimation = true,
  bestReward = null // Nueva prop para la mejor recompensa actual
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState(new Set());

  useEffect(() => {
    if ((rewards && rewards.length > 0) || bestReward) {
      setIsVisible(true);
      
      if (autoClose && (variant === 'popup' || variant === 'best-reward')) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [rewards, bestReward, autoClose, variant, onClose]);

  if ((!rewards || rewards.length === 0) && !bestReward || !isVisible) return null;

  const virtualRewards = rewards.filter(r => r.type === 'badge' || r.type === 'title');
  const physicalRewards = rewards.filter(r => r.type === 'merchandise');

  const getRewardIcon = (reward) => {
    switch (reward.type) {
      case 'badge':
        return <Badge className="w-5 h-5 text-usb-gold" />;
      case 'title':
        return <Crown className="w-5 h-5 text-usb-purple" />;
      case 'merchandise':
        return <Gift className="w-5 h-5 text-usb-orange-500" />;
      default:
        return <Trophy className="w-5 h-5 text-usb-gold" />;
    }
  };

  const getRewardColor = (reward) => {
    switch (reward.type) {
      case 'badge':
        return 'text-usb-gold';
      case 'title':
        return 'text-usb-purple';
      case 'merchandise':
        return 'text-usb-orange-500';
      default:
        return 'text-usb-gold';
    }
  };

  const getBestRewardIcon = (reward) => {
    switch (reward.icon) {
      case 'Award':
        return <Award className="w-6 h-6" />;
      case 'Percent':
        return <Percent className="w-6 h-6" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  const handleClaimReward = async (reward) => {
    if (onClaimReward) {
      const result = await onClaimReward(reward.id);
      if (result?.success) {
        setClaimedRewards(prev => new Set([...prev, reward.id]));
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-usb-gold to-yellow-500 rounded-lg p-3 mb-4 transition-all duration-300 ${
        showAnimation ? 'animate-pulse' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-usb-white" />
            <span className="text-usb-white font-medium">
              {rewards.length} nueva{rewards.length > 1 ? 's' : ''} recompensa{rewards.length > 1 ? 's' : ''}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-usb-white hover:bg-yellow-600 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'popup') {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-usb-gold to-yellow-500 rounded-xl shadow-2xl border border-yellow-300">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-usb-white" />
                <h3 className="text-lg font-bold text-usb-white">
                  ¡Nueva Recompensa!
                </h3>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-usb-white hover:bg-yellow-600 rounded p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {rewards.slice(0, 2).map((reward, index) => (
              <div key={index} className="bg-usb-white bg-opacity-20 rounded-lg p-3 mb-2">
                <div className="flex items-center space-x-2">
                  {getRewardIcon(reward)}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-usb-white">{reward.name}</h4>
                    <p className="text-xs text-yellow-100">{reward.description}</p>
                  </div>
                  {onClaimReward && !claimedRewards.has(reward.id) && (
                    <button
                      onClick={() => handleClaimReward(reward)}
                      className="bg-usb-white text-usb-gold px-2 py-1 rounded text-xs font-medium hover:bg-yellow-50 transition-colors"
                    >
                      Reclamar
                    </button>
                  )}
                  {claimedRewards.has(reward.id) && (
                    <CheckCircle className="w-4 h-4 text-usb-white" />
                  )}
                </div>
              </div>
            ))}
            
            {rewards.length > 2 && (
              <p className="text-xs text-yellow-100 text-center">
                y {rewards.length - 2} más...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`bg-gradient-to-r from-usb-gold to-yellow-500 rounded-lg p-4 mb-6 transition-all duration-300 ${
        showAnimation ? 'animate-bounce' : ''
      }`}>
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Trophy className="w-6 h-6 text-usb-white" />
          <h3 className="text-lg font-bold text-usb-white">
            ¡Nuevas Recompensas Desbloqueadas!
          </h3>
        </div>
        
        <div className="space-y-2">
          {rewards.slice(0, 3).map((reward, index) => (
            <div key={index} className="flex items-center justify-between bg-usb-white bg-opacity-20 rounded-lg p-2">
              <div className="flex items-center space-x-2 text-usb-white">
                {getRewardIcon(reward)}
                <span className="text-sm font-medium">{reward.name}</span>
              </div>
              {onClaimReward && !claimedRewards.has(reward.id) && (
                <button
                  onClick={() => handleClaimReward(reward)}
                  className="bg-usb-white text-usb-gold px-2 py-1 rounded text-xs font-medium hover:bg-yellow-50 transition-colors"
                >
                  Reclamar
                </button>
              )}
              {claimedRewards.has(reward.id) && (
                <CheckCircle className="w-4 h-4 text-usb-white" />
              )}
            </div>
          ))}
          {rewards.length > 3 && (
            <div className="text-xs text-yellow-100 text-center">
              • y {rewards.length - 3} más...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'best-reward' && bestReward) {
    return (
      <div className={`${bestReward.bgColor} ${bestReward.borderColor} border-2 rounded-xl p-6 transition-all duration-300 ${
        showAnimation ? 'animate-pulse' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${bestReward.color.replace('from-', 'bg-').replace(' to-', '-')} rounded-full flex items-center justify-center`}>
              {getBestRewardIcon(bestReward)}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${bestReward.textColor}`}>
                ¡Descuento Actual Desbloqueado!
              </h2>
              <p className={`${bestReward.textColor} opacity-80`}>
                {bestReward.title} - {bestReward.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${bestReward.textColor}`}>
              {bestReward.discount === 0 ? '100%' : `${bestReward.discount}%`}
            </div>
            <div className={`text-sm ${bestReward.textColor} opacity-80`}>
              Descuento
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gradient-to-r from-usb-gold to-yellow-500 rounded-xl p-4 usb-shadow-lg mb-6 transition-all duration-300 ${
      showAnimation ? 'animate-pulse' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Gift className="w-6 h-6 text-usb-white" />
          <div>
            <h3 className="text-lg font-bold text-usb-white">
              ¡Tienes {rewards.length} nueva{rewards.length > 1 ? 's' : ''} recompensa{rewards.length > 1 ? 's' : ''} disponible{rewards.length > 1 ? 's' : ''}!
            </h3>
            <p className="text-yellow-100 text-sm">
              Ve a la sección de recompensas para reclamarlas.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-usb-white hover:bg-yellow-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Lista de recompensas */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {virtualRewards.map((reward, index) => (
          <div key={index} className="bg-usb-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              {getRewardIcon(reward)}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-usb-white">{reward.name}</h4>
                <p className="text-xs text-yellow-100">{reward.description}</p>
              </div>
              {onClaimReward && !claimedRewards.has(reward.id) && (
                <button
                  onClick={() => handleClaimReward(reward)}
                  className="bg-usb-white text-usb-gold px-3 py-1 rounded text-xs font-medium hover:bg-yellow-50 transition-colors"
                >
                  Reclamar
                </button>
              )}
              {claimedRewards.has(reward.id) && (
                <CheckCircle className="w-4 h-4 text-usb-white" />
              )}
            </div>
          </div>
        ))}
        
        {physicalRewards.map((reward, index) => (
          <div key={index} className="bg-usb-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              {getRewardIcon(reward)}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-usb-white">{reward.name}</h4>
                <p className="text-xs text-yellow-100">{reward.description}</p>
              </div>
              <span className="text-xs text-yellow-100 bg-usb-white bg-opacity-20 px-2 py-1 rounded">
                Física
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardNotification;

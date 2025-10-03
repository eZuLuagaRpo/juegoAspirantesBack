import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  Crown, 
  Badge,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Calendar
} from 'lucide-react';

const AchievementSystem = ({ userProgress, onAchievementUnlocked }) => {
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [recentUnlocks, setRecentUnlocks] = useState([]);

  // Definir logros disponibles
  const availableAchievements = [
    {
      id: 'first_steps',
      name: 'Primeros Pasos',
      description: 'Completa tu primer puzzle',
      icon: <img src="/logo.png" alt="USB Logo" className="w-4 h-6 object-contain" />,
      type: 'milestone',
      requirement: { type: 'puzzles_completed', value: 1 },
      reward: { stars: 5, badge: 'first_steps' },
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800'
    },
    {
      id: 'star_collector',
      name: 'Coleccionista de Estrellas',
      description: 'Obtén 50 estrellas en total',
      icon: <Star className="w-6 h-6" />,
      type: 'collection',
      requirement: { type: 'total_stars', value: 50 },
      reward: { stars: 10, badge: 'star_collector' },
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800'
    },
    {
      id: 'level_master',
      name: 'Maestro de Niveles',
      description: 'Completa todos los niveles del juego',
      icon: <Crown className="w-6 h-6" />,
      type: 'mastery',
      requirement: { type: 'levels_completed', value: 5 },
      reward: { stars: 25, badge: 'level_master' },
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    },
    {
      id: 'speed_demon',
      name: 'Demonio de la Velocidad',
      description: 'Completa un nivel en menos de 5 minutos',
      icon: <Zap className="w-6 h-6" />,
      type: 'speed',
      requirement: { type: 'fast_completion', value: 300 }, // 5 minutos en segundos
      reward: { stars: 15, badge: 'speed_demon' },
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800'
    },
    {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: 'Obtén 5 estrellas en 10 puzzles diferentes',
      icon: <Target className="w-6 h-6" />,
      type: 'precision',
      requirement: { type: 'perfect_puzzles', value: 10 },
      reward: { stars: 20, badge: 'perfectionist' },
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800'
    },
    {
      id: 'dedicated_learner',
      name: 'Estudiante Dedicado',
      description: 'Juega durante 7 días consecutivos',
      icon: <Calendar className="w-6 h-6" />,
      type: 'consistency',
      requirement: { type: 'consecutive_days', value: 7 },
      reward: { stars: 30, badge: 'dedicated_learner' },
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-800'
    },
    {
      id: 'knowledge_seeker',
      name: 'Buscador de Conocimiento',
      description: 'Completa 100 puzzles en total',
      icon: <BookOpen className="w-6 h-6" />,
      type: 'dedication',
      requirement: { type: 'total_puzzles', value: 100 },
      reward: { stars: 40, badge: 'knowledge_seeker' },
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-800'
    },
    {
      id: 'social_butterfly',
      name: 'Mariposa Social',
      description: 'Comparte tu progreso 5 veces',
      icon: <Users className="w-6 h-6" />,
      type: 'social',
      requirement: { type: 'shares', value: 5 },
      reward: { stars: 15, badge: 'social_butterfly' },
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-800'
    }
  ];

  // Verificar si un logro se ha desbloqueado
  const checkAchievement = (achievement) => {
    if (!userProgress) return false;

    switch (achievement.requirement.type) {
      case 'puzzles_completed':
        return (userProgress.totalPuzzlesCompleted || 0) >= achievement.requirement.value;
      case 'total_stars':
        return (userProgress.totalStars || 0) >= achievement.requirement.value;
      case 'levels_completed':
        return (userProgress.completedLevels?.length || 0) >= achievement.requirement.value;
      case 'fast_completion':
        return (userProgress.fastestCompletion || Infinity) <= achievement.requirement.value;
      case 'perfect_puzzles':
        return (userProgress.perfectPuzzles || 0) >= achievement.requirement.value;
      case 'consecutive_days':
        return (userProgress.consecutiveDays || 0) >= achievement.requirement.value;
      case 'total_puzzles':
        return (userProgress.totalPuzzlesCompleted || 0) >= achievement.requirement.value;
      case 'shares':
        return (userProgress.shares || 0) >= achievement.requirement.value;
      default:
        return false;
    }
  };

  // Verificar logros desbloqueados
  useEffect(() => {
    if (!userProgress) return;

    const newlyUnlocked = [];
    const currentUnlocked = [];

    availableAchievements.forEach(achievement => {
      const isUnlocked = checkAchievement(achievement);
      if (isUnlocked) {
        currentUnlocked.push(achievement);
        
        // Verificar si es un logro recién desbloqueado
        const wasAlreadyUnlocked = unlockedAchievements.find(a => a.id === achievement.id);
        if (!wasAlreadyUnlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      setRecentUnlocks(newlyUnlocked);
      setUnlockedAchievements(currentUnlocked);
      
      // Notificar logros desbloqueados
      newlyUnlocked.forEach(achievement => {
        onAchievementUnlocked?.(achievement);
      });

      // Limpiar logros recientes después de 5 segundos
      setTimeout(() => {
        setRecentUnlocks([]);
      }, 5000);
    } else {
      setUnlockedAchievements(currentUnlocked);
    }
  }, [userProgress, unlockedAchievements]);

  const getProgressPercentage = (achievement) => {
    if (!userProgress) return 0;

    let current = 0;
    let required = achievement.requirement.value;

    switch (achievement.requirement.type) {
      case 'puzzles_completed':
        current = userProgress.totalPuzzlesCompleted || 0;
        break;
      case 'total_stars':
        current = userProgress.totalStars || 0;
        break;
      case 'levels_completed':
        current = userProgress.completedLevels?.length || 0;
        break;
      case 'fast_completion':
        current = userProgress.fastestCompletion ? (achievement.requirement.value - userProgress.fastestCompletion) : 0;
        required = achievement.requirement.value;
        break;
      case 'perfect_puzzles':
        current = userProgress.perfectPuzzles || 0;
        break;
      case 'consecutive_days':
        current = userProgress.consecutiveDays || 0;
        break;
      case 'total_puzzles':
        current = userProgress.totalPuzzlesCompleted || 0;
        break;
      case 'shares':
        current = userProgress.shares || 0;
        break;
      default:
        return 0;
    }

    return Math.min((current / required) * 100, 100);
  };

  const getAchievementTypeIcon = (type) => {
    switch (type) {
      case 'milestone':
        return <Target className="w-4 h-4" />;
      case 'collection':
        return <Star className="w-4 h-4" />;
      case 'mastery':
        return <Crown className="w-4 h-4" />;
      case 'speed':
        return <Zap className="w-4 h-4" />;
      case 'precision':
        return <Target className="w-4 h-4" />;
      case 'consistency':
        return <Calendar className="w-4 h-4" />;
      case 'dedication':
        return <BookOpen className="w-4 h-4" />;
      case 'social':
        return <Users className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Logros recién desbloqueados */}
      {recentUnlocks.length > 0 && (
        <div className="bg-gradient-to-r from-usb-gold to-yellow-500 rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-6 h-6 text-usb-white" />
            <h3 className="text-lg font-bold text-usb-white">
              ¡Logros Desbloqueados!
            </h3>
          </div>
          <div className="space-y-2">
            {recentUnlocks.map((achievement) => (
              <div key={achievement.id} className="bg-usb-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="text-usb-white">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-usb-white">{achievement.name}</h4>
                    <p className="text-sm text-yellow-100">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-usb-white">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-bold">+{achievement.reward.stars}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableAchievements.map((achievement) => {
          const isUnlocked = checkAchievement(achievement);
          const progress = getProgressPercentage(achievement);

          return (
            <div
              key={achievement.id}
              className={`rounded-xl p-4 border-2 transition-all duration-300 ${
                isUnlocked
                  ? `${achievement.bgColor} ${achievement.textColor} border-current shadow-lg`
                  : 'bg-usb-gray-50 border-usb-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isUnlocked ? 'bg-current text-usb-white' : 'bg-usb-gray-200 text-usb-gray-400'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      isUnlocked ? achievement.textColor : 'usb-light'
                    }`}>
                      {achievement.name}
                    </h4>
                    <div className="flex items-center space-x-1 mt-1">
                      {getAchievementTypeIcon(achievement.type)}
                      <span className={`text-xs ${
                        isUnlocked ? achievement.textColor : 'usb-light'
                      }`}>
                        {achievement.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isUnlocked && (
                  <CheckCircle className="w-6 h-6 text-usb-green" />
                )}
              </div>

              <p className={`text-sm mb-3 ${
                isUnlocked ? achievement.textColor : 'usb-light'
              }`}>
                {achievement.description}
              </p>

              {/* Barra de progreso */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isUnlocked ? achievement.textColor : 'usb-light'}>
                    Progreso
                  </span>
                  <span className={isUnlocked ? achievement.textColor : 'usb-light'}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-usb-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isUnlocked ? 'bg-current' : 'bg-usb-orange-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Recompensa */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className={`w-4 h-4 ${
                    isUnlocked ? 'text-usb-gold' : 'text-usb-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isUnlocked ? 'text-usb-gold' : 'usb-light'
                  }`}>
                    +{achievement.reward.stars} estrellas
                  </span>
                </div>
                
                {isUnlocked && (
                  <div className="text-xs px-2 py-1 bg-usb-green text-usb-white rounded-full font-medium">
                    Desbloqueado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementSystem;

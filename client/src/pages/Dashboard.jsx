import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  Star, 
  Trophy, 
  Play, 
  Lock, 
  CheckCircle, 
  BarChart3,
  Award,
  Target,
  Gift,
  Bell,
  X,
  Percent,
  TrendingUp,
  Calculator
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import RewardNotification from '../components/RewardNotification';
import NotificationCenter from '../components/NotificationCenter';
import WelcomeModal from '../components/WelcomeModal';
import RewardClaimModal from '../components/RewardClaimModal';
import CodeDisplayModal from '../components/CodeDisplayModal';
import { useRewardNotifications } from '../hooks/useRewardNotifications';
import { useBestReward } from '../hooks/useBestReward';
import { useGameCompletion } from '../hooks/useGameCompletion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    levels, 
    userProgress, 
    loading, 
    getUserStats, 
    getRewardStats,
    rewards,
    claimVirtualReward,
    isLevelUnlocked,
    isLevelCompleted,
    isLevelLocked
  } = useGame();
  
  const [stats, setStats] = useState(null);
  const [rewardStats, setRewardStats] = useState(null);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [newRewards, setNewRewards] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Usar el hook de notificaciones
  const {
    notifications,
    unreadCount,
    checkForNewRewards,
    getRewardNotifications,
    clearDuplicateNotifications
  } = useRewardNotifications(userProgress);

  // Usar el hook de mejor recompensa
  const {
    bestReward,
    previousBestReward,
    checkForNewBestReward,
    getNextTier,
    getProgressToNextTier
  } = useBestReward(userProgress);

  // Usar el hook de finalización del juego
  const {
    showRewardModal,
    showCodeModal,
    completionCode,
    rewardData,
    isClaiming,
    gameAlreadyCompleted,
    closeRewardModal,
    closeCodeModal,
    handleClaimFinalReward,
    handleLogout,
    checkCompletionStatus
  } = useGameCompletion();

  useEffect(() => {
    if (user) {
      // Debounce la carga de estadísticas para evitar llamadas múltiples
      const timeoutId = setTimeout(() => {
        loadStats();
      }, 500);
      
      // Limpiar notificaciones duplicadas al cargar
      clearDuplicateNotifications();
      
      // Verificar si es el primer login del usuario
      if (user.isFirstLogin) {
        setShowWelcomeModal(true);
      }
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, clearDuplicateNotifications]);

  // Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && (!levels || levels.length === 0)) {
        console.warn('Timeout de carga detectado, forzando finalización del loading');
        setLoadingTimeout(true);
        toast.error('La carga está tardando más de lo esperado. Recarga la página si el problema persiste.', {
          duration: 5000,
          icon: '⚠️'
        });
      }
    }, 15000); // 15 segundos de timeout

    return () => clearTimeout(timeoutId);
  }, [loading, levels]);

  // Verificar estado de finalización cuando se carga el usuario
  useEffect(() => {
    if (user?.id && userProgress) {
      // Solo verificar si el usuario tiene progreso válido (no es usuario nuevo)
      if (userProgress.totalStars > 0 || (userProgress.completedLevels && userProgress.completedLevels.length > 0)) {
        // Solo verificar una vez, no en cada cambio de userProgress
        if (!gameAlreadyCompleted) {
          checkCompletionStatus();
        }
      }
    }
  }, [user?.id, userProgress?.userId, checkCompletionStatus, gameAlreadyCompleted]);

  const loadStats = async () => {
    const userStats = await getUserStats(user.id);
    const userRewardStats = await getRewardStats(user.id);
    setStats(userStats);
    setRewardStats(userRewardStats);
  };

  // Actualizar recompensas cuando cambien las notificaciones (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const rewardNotifications = getRewardNotifications();
      // Solo mostrar notificaciones si el usuario tiene estrellas
      if (rewardNotifications.length > 0 && userProgress?.totalStars > 0) {
        const rewards = rewardNotifications.map(n => n.reward);
        setNewRewards(rewards);
        setShowRewardNotification(true);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [notifications, getRewardNotifications, userProgress?.totalStars]);

  const handleClaimReward = async (rewardId) => {
    const result = await claimVirtualReward(rewardId);
    if (result.success) {
      setNewRewards(prev => prev.filter(r => r.id !== rewardId));
      if (newRewards.length === 1) {
        setShowRewardNotification(false);
      }
    }
  };

  const handleWelcomeModalClose = async () => {
    setShowWelcomeModal(false);
    
    // Marcar que el usuario ya no es primer login
    try {
      const response = await fetch(`/api/auth/mark-first-login-complete/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Actualizar el estado del usuario localmente
        user.isFirstLogin = false;
      }
    } catch (error) {
      console.error('Error marcando primer login como completado:', error);
    }
  };


  const getLevelIcon = (levelId) => {
    const icons = {
      mercadeo: '📊',
      registroAcademico: '📚',
      bienestar: '❤️',
      facultades: '🏛️',
      cartera: '💰'
    };
    return icons[levelId] || '🎯';
  };

  const getLevelColor = (levelId) => {
    const colors = {
      mercadeo: 'from-orange-500 to-orange-600',
      registroAcademico: 'from-green-500 to-green-600',
      bienestar: 'from-purple-500 to-purple-600',
      facultades: 'from-red-500 to-red-600',
      cartera: 'from-blue-500 to-blue-600'
    };
    return colors[levelId] || 'from-gray-500 to-gray-600';
  };

  // Función para obtener el número máximo de estrellas por nivel
  const getMaxStarsForLevel = (levelId) => {
    const maxStars = {
      mercadeo: 10,
      registroAcademico: 10,
      bienestar: 5,
      facultades: 5,
      cartera: 10
    };
    return maxStars[levelId] || 10;
  };

  // Función para determinar el nivel actual correcto
  const getCurrentLevel = () => {
    if (!userProgress || !levels.length) return 'Mercadeo';
    
    const levelOrder = ['mercadeo', 'registroAcademico', 'facultades', 'bienestar', 'cartera'];
    const completedLevels = userProgress.completedLevels || [];
    
    // Si no hay niveles completados, el nivel actual es el primero
    if (completedLevels.length === 0) {
      return levels.find(l => l.id === 'mercadeo')?.name || 'Mercadeo';
    }
    
    // Buscar el primer nivel no completado
    for (const levelId of levelOrder) {
      if (!completedLevels.includes(levelId)) {
        return levels.find(l => l.id === levelId)?.name || levelId;
      }
    }
    
    // Si todos los niveles están completados, mostrar el último
    return levels.find(l => l.id === 'cartera')?.name || 'Cartera';
  };

  if (loading) {
    return <LoadingSpinner text="Cargando tu progreso..." />;
  }

  // Verificar que tenemos los datos necesarios
  if (!levels || levels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <img src="/logo.png" alt="USB Logo" className="w-16 h-22 mx-auto object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando niveles...</h2>
          <p className="text-gray-600 mb-4">Preparando tu aventura educativa</p>
          
          {/* Mostrar botón de recarga si hay timeout */}
          {loadingTimeout && (
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-usb-orange-500 hover:bg-usb-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Recargar Página
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Si el problema persiste, contacta al soporte técnico
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-usb-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modal de bienvenida para nuevos usuarios */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleWelcomeModalClose}
        />

        {/* Modal de recompensa - Solo mostrar si el juego no está ya completado */}
        {!gameAlreadyCompleted && (
          <RewardClaimModal
            isOpen={showRewardModal}
            onClose={closeRewardModal}
            user={user}
            reward={rewardData}
            onClaimReward={handleClaimFinalReward}
            isClaiming={isClaiming}
          />
        )}

        {/* Modal de código generado */}
        <CodeDisplayModal
          isOpen={showCodeModal}
          onClose={closeCodeModal}
          user={user}
          reward={rewardData}
          completionCode={completionCode}
          onLogout={handleLogout}
          onClaimReward={handleClaimFinalReward}
          isClaiming={isClaiming}
        />

        {/* Notificación de nuevas recompensas */}
        {showRewardNotification && newRewards.length > 0 && (
          <RewardNotification
            rewards={newRewards}
            onClose={() => setShowRewardNotification(false)}
            onClaimReward={handleClaimReward}
          />
        )}

        {/* Header del Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold usb-dark font-display">
                ¡Bienvenido, {user?.firstName}!
              </h1>
              <p className="usb-light mt-2">
                Continúa tu aventura educativa en la USB Medellín.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-usb-gold">
                  {userProgress?.totalStars || 0}
                </div>
                <div className="text-sm usb-light">Estrellas Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-usb-green">
                  {userProgress?.completedLevels ? userProgress.completedLevels.length : 0}/5
                </div>
                <div className="text-sm usb-light">Niveles Completados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium usb-light">Progreso Total</p>
                  <p className="text-2xl font-bold usb-dark">{stats.completionPercentage}%</p>
                </div>
                <div className="w-12 h-12 bg-usb-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-usb-orange-500" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium usb-light">Nivel Actual</p>
                  <p className="text-2xl font-bold usb-dark">
                    {getCurrentLevel()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-usb-green/20 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-usb-green" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progreso de Descuentos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold usb-dark mb-6 font-display">
            Progreso hacia Descuentos
          </h2>
          
          {/* Estado actual del descuento usando el nuevo sistema */}
          {bestReward && (
            <div className="mb-6">
              <RewardNotification
                bestReward={bestReward}
                variant="best-reward"
                showAnimation={true}
              />
            </div>
          )}

          {/* Próximo nivel */}
          {(() => {
            const nextTier = getNextTier();
            const progress = getProgressToNextTier();
            
            return nextTier && (
              <div className="mb-6">
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
                          Necesitas {progress.remaining} estrellas más para desbloquear <strong>{nextTier.title}</strong>.
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-usb-orange-500">
                        {progress.remaining}
                      </div>
                      <div className="text-sm usb-light">
                        Estrellas faltantes
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm usb-light mb-2">
                      <span>Progreso hacia <strong>{nextTier.title}</strong></span>
                      <span>{userProgress?.totalStars || 0}/{nextTier.stars} estrellas</span>
                    </div>
                    <div className="w-full bg-usb-gray-200 rounded-full h-2">
                      <div 
                        className="bg-usb-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Niveles del juego */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold usb-dark mb-6 font-display">
            Niveles del Juego
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level, index) => {
              const isUnlocked = isLevelUnlocked(level.id);
              const isCompleted = isLevelCompleted(level.id);
              const isLocked = isLevelLocked(level.id);
              
              const levelProgress = userProgress && userProgress.levelProgress ? 
                userProgress.levelProgress[level.id] : null;
              
              // Verificar si hay progreso parcial (algunos puzzles completados pero no todos)
              const hasPartialProgress = levelProgress && levelProgress.puzzles && 
                Object.keys(levelProgress.puzzles).length > 0 && !isCompleted;
              

              return (
                <div
                  key={level.id}
                  className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 ${
                    isUnlocked 
                      ? isCompleted 
                        ? 'level-card completed' 
                        : 'level-card'
                      : 'level-card locked'
                  }`}
                >
                  {/* Header del nivel */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getLevelIcon(level.id)}</span>
                        <div>
                          <h3 className="text-xl font-bold usb-dark">
                            {level.name}
                          </h3>
                          <p className="text-sm usb-light">
                            Nivel {index + 1}
                          </p>
                        </div>
                      </div>
                      
                      {isCompleted && (
                        <CheckCircle className="w-8 h-8 text-usb-green" />
                      )}
                      
                      {!isUnlocked && (
                        <Lock className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    <p className="usb-dark mb-4">
                      {level.description}
                    </p>

                    {/* Progreso del nivel */}
                    {levelProgress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="usb-light">Progreso</span>
                          <span className="font-medium usb-dark">
                            {levelProgress.totalStars}/{getMaxStarsForLevel(level.id)} estrellas
                          </span>
                        </div>
                        <div className="w-full bg-usb-gray-200 rounded-full h-2">
                          <div 
                            className="bg-usb-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(levelProgress.totalStars / getMaxStarsForLevel(level.id)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Puzzles del nivel */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm usb-light">
                          Puzzles disponibles: {level.puzzles.length}
                        </p>
                        {hasPartialProgress && (
                          <span className="text-xs bg-usb-orange-100 text-usb-orange-600 px-2 py-1 rounded-full">
                            En progreso
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {level.puzzles.map((puzzle, puzzleIndex) => {
                          const puzzleProgress = levelProgress?.puzzles ? levelProgress.puzzles[puzzle.id] : null;
                          return (
                            <div
                              key={puzzle.id}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                puzzleProgress && puzzleProgress.completed
                                  ? 'bg-usb-green text-usb-white'
                                  : 'bg-usb-gray-200 usb-light'
                              }`}
                            >
                              {puzzleProgress && puzzleProgress.stars ? puzzleProgress.stars : 0}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="flex justify-between items-center">
                      {isLocked ? (
                        <button
                          disabled
                          className="btn-secondary flex items-center space-x-2 opacity-50 cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Completado</span>
                        </button>
                      ) : hasPartialProgress ? (
                        <Link
                          to={`/game/${level.id}`}
                          className="bg-usb-orange-500 hover:bg-usb-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Continuar</span>
                        </Link>
                      ) : isUnlocked ? (
                        <Link
                          to={`/game/${level.id}`}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Jugar</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="btn-secondary flex items-center space-x-2 opacity-50 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Bloqueado</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso inferior */}
                  {isUnlocked && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-usb-orange-500 to-usb-orange-600"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/rewards"
            className="bg-gradient-to-r from-usb-gold to-yellow-500 text-usb-white p-6 rounded-xl usb-shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ver Recompensas</h3>
                <p className="text-yellow-100">
                  Descubre qué premios puedes reclamar
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-100" />
            </div>
          </Link>

          <Link
            to="/profile"
            className="header-gradient text-usb-white p-6 rounded-xl usb-shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Mi Perfil</h3>
                <p className="text-orange-100">
                  Gestiona tu información y progreso
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-orange-100" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

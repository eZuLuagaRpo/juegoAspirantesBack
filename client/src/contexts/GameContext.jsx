import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Función de reintento con backoff exponencial mejorada
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Si es un error de recursos insuficientes, no reintentar
      if (error.code === 'ERR_INSUFFICIENT_RESOURCES' || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
        throw error;
      }
      
      // Para errores 429, usar un delay más largo y no reintentar inmediatamente
      if (error.response?.status === 429) {
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000; // Agregar jitter
          console.warn(`Rate limited. Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          console.error('Demasiados reintentos. Abortando...');
          throw error;
        }
      }
      throw error;
    }
  }
};

// Hook para debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser usado dentro de un GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [lastRewardCheck, setLastRewardCheck] = useState(0);
  const [initializing, setInitializing] = useState(false);
  
  // Referencias para evitar bucles infinitos
  const initializationRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const requestQueueRef = useRef(new Set());

  // Cargar niveles del juego
  useEffect(() => {
    loadGameLevels();
  }, []);

  // Timeout de seguridad para forzar recarga si no hay niveles después de un tiempo
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (levels.length === 0 && !loading) {
        console.warn('No se pudieron cargar los niveles, intentando recarga automática');
        loadGameLevels();
      }
    }, 20000); // 20 segundos

    return () => clearTimeout(safetyTimeout);
  }, [levels.length, loading]);

  // Manejar estado de loading cuando no hay usuario
  useEffect(() => {
    // Si no hay niveles cargados aún, mantener loading en true
    if (levels.length === 0) {
      return;
    }
    
    // Si hay niveles pero no hay usuario autenticado, establecer loading en false
    // Esto permite que el Dashboard muestre el contenido de "sin usuario"
    setLoading(false);
  }, [levels]);

  // Cargar progreso del usuario con debouncing
  const loadUserProgress = useCallback(async (userId) => {
    if (!userId || requestQueueRef.current.has(`progress-${userId}`)) {
      return;
    }
    
    requestQueueRef.current.add(`progress-${userId}`);
    
    try {
      const response = await retryWithBackoff(async () => {
        return await axios.get(`/api/progress/${userId}`, {
          timeout: 15000 // 15 segundos de timeout
        });
      });
      if (response.data.success && response.data.data) {
        setUserProgress(response.data.data);
        setCurrentLevel(response.data.data.currentLevel);
      } else {
        throw new Error('No se pudo cargar el progreso');
      }
    } catch (error) {
      console.warn('Error cargando progreso del usuario, usando valores por defecto:', error.message);
      // Si no hay progreso, crear uno nuevo
      const defaultProgress = {
        userId,
        currentLevel: 'mercadeo',
        completedLevels: [],
        totalStars: 0,
        achievements: [],
        levelProgress: {}
      };
      setUserProgress(defaultProgress);
      setCurrentLevel('mercadeo');
    } finally {
      requestQueueRef.current.delete(`progress-${userId}`);
    }
  }, []);

  // Cargar recompensas del usuario con debouncing
  const loadUserRewards = useCallback(async (userId) => {
    if (!userId || requestQueueRef.current.has(`rewards-${userId}`)) {
      return;
    }
    
    requestQueueRef.current.add(`rewards-${userId}`);
    
    try {
      const response = await retryWithBackoff(async () => {
        return await axios.get(`/api/rewards/user/${userId}`, {
          timeout: 15000 // 15 segundos de timeout
        });
      });
      setRewards(response.data.data);
    } catch (error) {
      console.warn('Error cargando recompensas del usuario, usando valores por defecto:', error.message);
      setRewards({
        userId,
        virtualRewards: [],
        physicalRewards: [],
        totalStars: 0
      });
    } finally {
      requestQueueRef.current.delete(`rewards-${userId}`);
    }
  }, []);

  // Función para inicializar progreso del usuario con debouncing
  const initializeUserProgress = useCallback(async (userId) => {
    if (!userId || initializing || initializationRef.current) {
      return;
    }
    
    // Evitar inicializaciones duplicadas para el mismo usuario
    if (lastUserIdRef.current === userId) {
      return;
    }
    
    initializationRef.current = true;
    lastUserIdRef.current = userId;
    setInitializing(true);
    
    try {
      await loadUserProgress(userId);
      // Delay más largo para evitar peticiones simultáneas
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadUserRewards(userId);
    } catch (error) {
      console.error('Error inicializando progreso del usuario:', error);
    } finally {
      setInitializing(false);
      initializationRef.current = false;
      // Asegurar que el loading se establezca en false después de la inicialización
      setLoading(false);
    }
  }, [initializing, loadUserProgress, loadUserRewards]);

  const loadGameLevels = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setLoading(true);
      const response = await retryWithBackoff(async () => {
        return await axios.get('/api/game/levels', {
          timeout: 10000 // 10 segundos de timeout
        });
      });
      setLevels(response.data.data);
    } catch (error) {
      console.error('Error cargando niveles:', error);
      
      if (retryCount < maxRetries) {
        // Retry automático con delay exponencial
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Reintentando carga de niveles en ${delay}ms (intento ${retryCount + 1}/${maxRetries})`);
        
        setTimeout(() => {
          loadGameLevels(retryCount + 1);
        }, delay);
        return; // No establecer loading en false aquí
      }
      
      // Si se agotaron los reintentos, mostrar error y establecer loading en false
      if (error.response?.status === 429) {
        toast.error('Demasiadas solicitudes. El servidor está sobrecargado. Intenta de nuevo en unos minutos.');
      } else {
        toast.error('Error cargando los niveles del juego. Recarga la página si el problema persiste.');
      }
      
      // Forzar loading en false después de maxRetries
      setLoading(false);
    } finally {
      // Solo establecer loading en false si no hay más reintentos pendientes
      if (retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  // Actualizar progreso del usuario
  const updateProgress = async (levelId, puzzleId, stars, completed) => {
    try {
      if (!userProgress?.userId) {
        console.error('No user ID available for progress update');
        toast.error('Error: Usuario no autenticado');
        return { success: false, error: 'Usuario no autenticado' };
      }
      
      const response = await axios.post(`/api/progress/${userProgress.userId}/update`, {
        levelId,
        puzzleId,
        stars,
        completed
      });
      
      const newProgress = response.data.data;
      setUserProgress(newProgress);
      
      // Si el nivel se completó, manejar la finalización
      if (completed && newProgress.completedLevels.includes(levelId)) {
        const levelOrder = ['mercadeo', 'registroAcademico', 'bienestar', 'facultades', 'cartera'];
        const currentIndex = levelOrder.indexOf(levelId);
        const nextLevelId = levelOrder[currentIndex + 1];
        
        if (nextLevelId) {
          // No es el último nivel, desbloquear siguiente
          setCurrentLevel(nextLevelId);
          toast.success(`¡Nivel completado! Siguiente nivel desbloqueado: ${nextLevelId}`);
        } else {
          // Es el último nivel (cartera), mostrar mensaje final
          setCurrentLevel(levelId); // Mantener en el nivel actual
          toast.success('¡Felicidades! Has completado todos los niveles del juego. ¡Eres un experto en la USBMED!', {
            duration: 6000,
            icon: '🎓'
          });
        }
      } else {
        setCurrentLevel(newProgress.currentLevel);
      }
      
      // Verificar si hay nuevas recompensas disponibles solo si hay un cambio significativo
      if (newProgress.totalStars > userProgress.totalStars && newProgress.totalStars > 0) {
        // Evitar verificar recompensas muy frecuentemente (mínimo 2 segundos entre verificaciones)
        const now = Date.now();
        if (now - lastRewardCheck > 2000) {
          setLastRewardCheck(now);
          checkNewRewards(newProgress.totalStars);
        }
      }
      
      toast.success(`¡Progreso guardado! Obtuviste ${stars} estrellas`);
      return { success: true };
    } catch (error) {
      console.error('Error updating progress:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Error guardando progreso');
      return { success: false, error: error.message };
    }
  };

  // Verificar nuevas recompensas (deshabilitado para evitar duplicados con useRewardNotifications)
  const checkNewRewards = async (totalStars) => {
    // Esta función está deshabilitada para evitar notificaciones duplicadas
    // Las recompensas se verifican ahora a través del hook useRewardNotifications
    return null;
  };

  // Reclamar recompensa virtual
  const claimVirtualReward = async (rewardId) => {
    try {
      const response = await axios.post('/api/rewards/claim-virtual', {
        userId: userProgress.userId,
        rewardId
      });
      
      // Recargar recompensas
      await loadUserRewards(userProgress.userId);
      
      // Mostrar notificación de éxito con animación
      toast.success('¡Recompensa reclamada exitosamente!', {
        duration: 3000,
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Error reclamando recompensa';
      toast.error(message, {
        duration: 4000,
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return { success: false, error: message };
    }
  };

  // Solicitar recompensa física
  const requestPhysicalReward = async (rewardId, shippingAddress, phone) => {
    try {
      const response = await axios.post('/api/rewards/request-physical', {
        userId: userProgress.userId,
        rewardId,
        shippingAddress,
        phone
      });
      
      // Recargar recompensas
      await loadUserRewards(userProgress.userId);
      
      toast.success('¡Solicitud de recompensa física enviada! Te contactaremos pronto.', {
        duration: 4000,
        icon: '📦',
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });
      
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Error solicitando recompensa física';
      toast.error(message, {
        duration: 4000,
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return { success: false, error: message };
    }
  };

  // Obtener estadísticas del usuario con debouncing
  const getUserStats = useCallback(async (userId) => {
    if (!userId || requestQueueRef.current.has(`stats-${userId}`)) {
      return null;
    }
    
    requestQueueRef.current.add(`stats-${userId}`);
    
    try {
      const response = await retryWithBackoff(async () => {
        return await axios.get(`/api/progress/${userId}/stats`, {
          timeout: 10000
        });
      });
      return response.data.data;
    } catch (error) {
      console.warn('Error cargando estadísticas del usuario:', error.message);
      return null;
    } finally {
      requestQueueRef.current.delete(`stats-${userId}`);
    }
  }, []);

  // Obtener estadísticas de recompensas con debouncing
  const getRewardStats = useCallback(async (userId) => {
    if (!userId || requestQueueRef.current.has(`reward-stats-${userId}`)) {
      return null;
    }
    
    requestQueueRef.current.add(`reward-stats-${userId}`);
    
    try {
      const response = await retryWithBackoff(async () => {
        return await axios.get(`/api/rewards/stats/${userId}`, {
          timeout: 10000
        });
      });
      return response.data.data;
    } catch (error) {
      console.warn('Error cargando estadísticas de recompensas:', error.message);
      return null;
    } finally {
      requestQueueRef.current.delete(`reward-stats-${userId}`);
    }
  }, []);

  // Calcular estrellas basado en rendimiento con debouncing
  const calculateStars = useCallback(async (puzzleId, timeSpent, errors, hintsUsed) => {
    if (requestQueueRef.current.has(`calculate-stars-${puzzleId}`)) {
      return 0;
    }
    
    requestQueueRef.current.add(`calculate-stars-${puzzleId}`);
    
    try {
      const response = await retryWithBackoff(async () => {
        return await axios.post('/api/game/calculate-stars', {
          puzzleId,
          timeSpent,
          errors,
          hintsUsed
        }, {
          timeout: 10000
        });
      });
      
      return response.data.data.stars;
    } catch (error) {
      console.warn('Error calculando estrellas:', error.message);
      return 0;
    } finally {
      requestQueueRef.current.delete(`calculate-stars-${puzzleId}`);
    }
  }, []);

  // Verificar si un nivel está desbloqueado
  const isLevelUnlocked = (levelId) => {
    if (!userProgress) return levelId === 'mercadeo';
    
    const levelOrder = ['mercadeo', 'registroAcademico', 'bienestar', 'facultades', 'cartera'];
    const levelIndex = levelOrder.indexOf(levelId);
    
    // El primer nivel (mercadeo) siempre está desbloqueado
    if (levelIndex === 0) return true;
    
    // Para los demás niveles, verificar si el nivel anterior está completado
    const previousLevelId = levelOrder[levelIndex - 1];
    const isPreviousLevelCompleted = userProgress.completedLevels && 
      userProgress.completedLevels.includes(previousLevelId);
    
    return isPreviousLevelCompleted;
  };

  // Verificar si un nivel está completado
  const isLevelCompleted = (levelId) => {
    if (!userProgress) return false;
    return userProgress.completedLevels.includes(levelId);
  };

  // Verificar si un nivel está bloqueado (completado)
  const isLevelLocked = (levelId) => {
    if (!userProgress) return false;
    return userProgress.completedLevels.includes(levelId);
  };

  // Obtener el siguiente puzzle disponible en un nivel con debouncing
  const getNextPuzzle = useCallback(async (levelId) => {
    if (!userProgress?.userId || requestQueueRef.current.has(`next-puzzle-${levelId}`)) {
      return { success: false, error: 'Usuario no autenticado o petición en progreso' };
    }
    
    requestQueueRef.current.add(`next-puzzle-${levelId}`);
    
    try {
      const response = await retryWithBackoff(async () => {
        return await axios.get(`/api/progress/${userProgress.userId}/next-puzzle/${levelId}`, {
          timeout: 10000
        });
      });
      return response.data;
    } catch (error) {
      console.warn('Error obteniendo siguiente puzzle:', error.message);
      return { success: false, error: error.message };
    } finally {
      requestQueueRef.current.delete(`next-puzzle-${levelId}`);
    }
  }, [userProgress?.userId]);

  // Verificar el estado de un nivel
  const getLevelStatus = async (levelId) => {
    try {
      const response = await axios.get(`/api/progress/${userProgress.userId}/level-status/${levelId}`);
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Obtener progreso de un nivel específico
  const getLevelProgress = (levelId) => {
    if (!userProgress || !userProgress.levelProgress[levelId]) {
      return {
        completed: false,
        totalStars: 0,
        puzzles: {}
      };
    }
    return userProgress.levelProgress[levelId];
  };

  // Función para limpiar el estado y resetear las referencias
  const resetGameState = useCallback(() => {
    setUserProgress(null);
    setCurrentLevel(null);
    setRewards([]);
    setLoading(true);
    initializationRef.current = false;
    lastUserIdRef.current = null;
    requestQueueRef.current.clear();
  }, []);

  // Limpiar estado cuando no haya usuario autenticado
  useEffect(() => {
    // Este efecto se ejecutará cuando el componente se desmonte o cuando no haya usuario
    return () => {
      // Limpiar estado al desmontar
      resetGameState();
    };
  }, [resetGameState]);

  const value = useMemo(() => ({
    levels,
    currentLevel,
    userProgress,
    rewards,
    loading,
    loadUserProgress,
    loadUserRewards,
    updateProgress,
    claimVirtualReward,
    requestPhysicalReward,
    getUserStats,
    getRewardStats,
    calculateStars,
    isLevelUnlocked,
    isLevelCompleted,
    isLevelLocked,
    getNextPuzzle,
    getLevelStatus,
    getLevelProgress,
    initializeUserProgress,
    resetGameState
  }), [
    levels,
    currentLevel,
    userProgress,
    rewards,
    loading,
    loadUserProgress,
    loadUserRewards,
    updateProgress,
    claimVirtualReward,
    requestPhysicalReward,
    getUserStats,
    getRewardStats,
    calculateStars,
    isLevelUnlocked,
    isLevelCompleted,
    isLevelLocked,
    getNextPuzzle,
    getLevelStatus,
    getLevelProgress,
    initializeUserProgress,
    resetGameState
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

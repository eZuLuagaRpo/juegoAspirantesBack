import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { submitToGoogleSheets, generateCompletionCode, getRewardInfo } from '../utils/googleSheets';
import toast from 'react-hot-toast';

export const useGameCompletion = () => {
  const { user, logout } = useAuth();
  const { userProgress, levels } = useGame();
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [completionCode, setCompletionCode] = useState('');
  const [rewardData, setRewardData] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [gameAlreadyCompleted, setGameAlreadyCompleted] = useState(false);
  const [lastUserId, setLastUserId] = useState(null);
  const [googleSheetsSent, setGoogleSheetsSent] = useState(false);
  const [isSendingToGoogleSheets, setIsSendingToGoogleSheets] = useState(false);

  // Resetear estados cuando cambia el usuario
  useEffect(() => {
    if (user?.id !== lastUserId) {
      setGoogleSheetsSent(false);
      setIsSendingToGoogleSheets(false);
      setLastUserId(user?.id);
    }
  }, [user?.id, lastUserId]);

  // Verificar si ya se envió a Google Sheets para este usuario (persistencia)
  useEffect(() => {
    if (user?.id) {
      const key = `googleSheetsSent_${user.id}`;
      const alreadySent = localStorage.getItem(key) === 'true';
      if (alreadySent) {
        setGoogleSheetsSent(true);
      }
    }
  }, [user?.id]);

  // Verificar si el usuario ha completado todos los niveles
  const checkGameCompletion = () => {
    if (!userProgress || !levels || levels.length === 0) return false;
    
    const completedLevels = userProgress.completedLevels || [];
    const totalLevels = levels.length;
    
    // Solo considerar completado si hay niveles y se han completado todos
    return totalLevels > 0 && completedLevels.length === totalLevels;
  };

  // Verificar estado de finalización desde el backend
  const checkCompletionStatus = async () => {
    if (!user?.id || !userProgress) return false;
    
    try {
      const response = await fetch(`/api/progress/${user.id}/completion`);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        return false;
      }
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return false;
      }
      
      const data = await response.json();
      
      if (data.success && data.data.gameCompleted) {
        setGameAlreadyCompleted(true);
        
        // Generar código único si no existe
        let code = data.data.completionCode;
        if (!code) {
          const timestamp = Date.now();
          code = generateCompletionCode(user.id, timestamp);
        }
        setCompletionCode(code);
        
        // Crear objeto de recompensa desde los datos del backend
        const reward = {
          title: data.data.reward?.name || 'Recompensa Final',
          description: data.data.reward?.description || 'Recompensa por completar el juego',
          discount: data.data.reward?.discountPercentage || 0
        };
        setRewardData(reward);
        
        // NO enviar automáticamente - se enviará cuando el usuario haga clic en "Reclamar Recompensa"
        
        // Mostrar directamente el modal de código
        setShowCodeModal(true);
        return true;
      } else {
        setGameAlreadyCompleted(false);
        return false;
      }
    } catch (error) {
      setGameAlreadyCompleted(false);
      return false;
    }
  };

  // Función para enviar datos a Google Sheets automáticamente (SOLO UNA VEZ)
  const sendToGoogleSheetsAutomatically = async (userData, rewardData, completionCode) => {
    // Validación: Solo enviar si no se ha enviado antes
    if (googleSheetsSent) {
      return { success: true, alreadySent: true };
    }

    // Validación: Evitar envíos simultáneos
    if (isSendingToGoogleSheets) {
      return { success: true, alreadySending: true };
    }

    try {

      // Marcar como enviando para evitar duplicados
      setIsSendingToGoogleSheets(true);

      // Preparar datos del usuario
      const userDataForSheets = {
        studentId: userData.studentId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone
      };

      // Enviar datos a Google Sheets
      const result = await submitToGoogleSheets(userDataForSheets, rewardData, completionCode);
      
      if (result.success) {
        setGoogleSheetsSent(true); // Marcar como enviado
        
        // Guardar en localStorage para persistencia
        if (userData.id) {
          const key = `googleSheetsSent_${userData.id}`;
          localStorage.setItem(key, 'true');
        }
        
        toast.success('¡Código generado y datos registrados exitosamente!', {
          duration: 4000,
          icon: '🎉'
        });
        return { success: true, firstTime: true };
      } else {
        toast.error(`Error registrando datos: ${result.error}. Tu código sigue siendo válido.`, {
          duration: 5000,
          icon: '⚠️'
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('Error registrando datos, pero tu código sigue siendo válido.', {
        duration: 5000,
        icon: '⚠️'
      });
      return { success: false, error: error.message };
    } finally {
      // Siempre liberar el flag de envío
      setIsSendingToGoogleSheets(false);
    }
  };

  // Mostrar modal de recompensa cuando se complete el juego
  const handleGameCompletion = () => {
    if (!user || !userProgress) {
      return;
    }

    // Obtener información de la recompensa
    const reward = getRewardInfo(userProgress.totalStars);
    setRewardData(reward);

    // Generar código único
    const timestamp = Date.now();
    const code = generateCompletionCode(user.id, timestamp);
    setCompletionCode(code);

    // Mostrar modal de código directamente (sin modal de recompensa intermedio)
    setShowCodeModal(true);
  };

  // Reclamar recompensa y enviar a Google Sheets (SOLO cuando se hace clic en el botón)
  const handleClaimFinalReward = async () => {
    if (!user || !rewardData || !completionCode) {
      return;
    }

    try {
      setIsClaiming(true);

      // Enviar datos a Google Sheets SOLO cuando se hace clic
      await sendToGoogleSheetsAutomatically(user, rewardData, completionCode);

      // El modal ya está abierto, no necesitamos cerrar/abrir modales

    } catch (error) {
      toast.error('Error generando código de recompensa');
    } finally {
      setIsClaiming(false);
    }
  };

  // Resetear estado cuando cambie el usuario o no haya userProgress
  useEffect(() => {
    const currentUserId = user?.id;
    
    // Si no hay usuario (usuario no autenticado), resetear todo
    if (!user) {
      setShowRewardModal(false);
      setShowCodeModal(false);
      setCompletionCode('');
      setRewardData(null);
      setIsClaiming(false);
      setGameAlreadyCompleted(false);
      setLastUserId(null);
      return;
    }
    
    // Si cambió el usuario, resetear el estado
    if (currentUserId && currentUserId !== lastUserId) {
      setShowRewardModal(false);
      setShowCodeModal(false);
      setCompletionCode('');
      setRewardData(null);
      setIsClaiming(false);
      setGameAlreadyCompleted(false);
      setLastUserId(currentUserId);
    }
  }, [user?.id, user, lastUserId]);

  // Verificar automáticamente el estado de finalización
  useEffect(() => {
    const checkStatus = async () => {
      // Validaciones básicas
      if (!user?.id || !userProgress || showRewardModal || showCodeModal || isClaiming) return;
      
      // Solo procesar si es el usuario actual
      if (user?.id !== lastUserId) return;
      
      // Validar que el usuario tenga progreso válido
      if (!userProgress.totalStars && (!userProgress.completedLevels || userProgress.completedLevels.length === 0)) {
        // Usuario nuevo sin progreso, no hacer nada
        return;
      }
      
      // Solo verificar si el juego ya está completado UNA VEZ
      if (!gameAlreadyCompleted) {
        const alreadyCompleted = await checkCompletionStatus();
        
        // Si no está completado, verificar si acaba de completar todos los niveles
        if (!alreadyCompleted && checkGameCompletion()) {
          // Pequeño delay para asegurar que el estado se haya actualizado
          setTimeout(() => {
            handleGameCompletion();
          }, 1000);
        }
      }
    };
    
    checkStatus();
  }, [user?.id, userProgress?.userId, levels?.length, showRewardModal, showCodeModal, isClaiming, lastUserId, gameAlreadyCompleted]);

  const closeRewardModal = () => {
    setShowRewardModal(false);
  };

  const closeCodeModal = () => {
    setShowCodeModal(false);
  };

  const handleLogout = () => {
    logout();
  };

  return {
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
    checkGameCompletion,
    handleGameCompletion,
    checkCompletionStatus
  };
};

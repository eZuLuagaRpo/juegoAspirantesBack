import { useState, useEffect, useCallback } from 'react';

export const useBestReward = (userProgress) => {
  const [bestReward, setBestReward] = useState(null);
  const [previousBestReward, setPreviousBestReward] = useState(null);
  const [lastUserId, setLastUserId] = useState(null);

  // Sistema de descuentos basado en estrellas
  const discountTiers = [
    {
      stars: 10,
      discount: 100,
      title: "Inscripción Gratuita",
      description: "¡Felicidades! Has ganado inscripción completamente gratuita",
      icon: "Award",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      type: "discount"
    },
    {
      stars: 20,
      discount: 3,
      title: "3% de Descuento",
      description: "Obtén un 3% de descuento en el valor de tu matrícula",
      icon: "Percent",
      color: "from-usb-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      type: "discount"
    },
    {
      stars: 30,
      discount: 5,
      title: "5% de Descuento",
      description: "Obtén un 5% de descuento en el valor de tu matrícula",
      icon: "TrendingUp",
      color: "from-usb-blue to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      type: "discount"
    },
    {
      stars: 40,
      discount: 8,
      title: "8% de Descuento",
      description: "Obtén un 8% de descuento en el valor total de tu matrícula",
      icon: "Calculator",
      color: "from-usb-purple to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      type: "discount"
    }
  ];

  // Función para obtener la mejor recompensa actual
  const getBestReward = useCallback((totalStars) => {
    if (!totalStars || totalStars === 0) return null;
    
    // Encontrar el tier más alto que el usuario ha desbloqueado
    const unlockedTiers = discountTiers.filter(tier => totalStars >= tier.stars);
    
    if (unlockedTiers.length === 0) return null;
    
    // Retornar el tier con más estrellas (el mejor)
    return unlockedTiers.reduce((best, current) => 
      current.stars > best.stars ? current : best
    );
  }, []);

  // Función para verificar si hay una nueva mejor recompensa
  const checkForNewBestReward = useCallback((newProgress) => {
    if (!newProgress?.totalStars) return false;
    
    const currentBest = getBestReward(newProgress.totalStars);
    const previousBest = getBestReward(previousBestReward?.stars || 0);
    
    // Verificar si hay una nueva mejor recompensa
    if (currentBest && (!previousBest || currentBest.stars > previousBest.stars)) {
      return true;
    }
    
    return false;
  }, [getBestReward, previousBestReward]);

  // Resetear estado cuando cambie el usuario o no haya userProgress
  useEffect(() => {
    const currentUserId = userProgress?.userId;
    
    // Si no hay userProgress (usuario no autenticado), resetear todo
    if (!userProgress) {
      setBestReward(null);
      setPreviousBestReward(null);
      setLastUserId(null);
      return;
    }
    
    // Si cambió el usuario, resetear el estado
    if (currentUserId && currentUserId !== lastUserId) {
      setBestReward(null);
      setPreviousBestReward(null);
      setLastUserId(currentUserId);
    }
  }, [userProgress?.userId, lastUserId, userProgress]);

  // Actualizar la mejor recompensa cuando cambie el progreso
  useEffect(() => {
    if (userProgress?.totalStars && userProgress?.userId === lastUserId) {
      const newBestReward = getBestReward(userProgress.totalStars);
      
      // Verificar si es una nueva mejor recompensa
      if (newBestReward && (!bestReward || newBestReward.stars > bestReward.stars)) {
        setPreviousBestReward(bestReward);
        setBestReward(newBestReward);
      } else if (newBestReward) {
        setBestReward(newBestReward);
      }
    }
  }, [userProgress?.totalStars, userProgress?.userId, getBestReward, bestReward, lastUserId]);

  // Función para obtener el próximo nivel disponible
  const getNextTier = useCallback((totalStars) => {
    return discountTiers.find(tier => totalStars < tier.stars) || null;
  }, []);

  // Función para obtener el progreso hacia el siguiente nivel
  const getProgressToNextTier = useCallback((totalStars) => {
    const nextTier = getNextTier(totalStars);
    if (!nextTier) return { progress: 100, remaining: 0 };
    
    const progress = Math.min((totalStars / nextTier.stars) * 100, 100);
    const remaining = Math.max(nextTier.stars - totalStars, 0);
    
    return { progress, remaining };
  }, [getNextTier]);

  return {
    bestReward,
    previousBestReward,
    checkForNewBestReward,
    getNextTier: () => getNextTier(userProgress?.totalStars || 0),
    getProgressToNextTier: () => getProgressToNextTier(userProgress?.totalStars || 0),
    discountTiers
  };
};

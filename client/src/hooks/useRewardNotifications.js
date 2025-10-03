import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export const useRewardNotifications = (userProgress, rewards) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheckedStars, setLastCheckedStars] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUserId, setLastUserId] = useState(null);
  const checkedRewardsRef = useRef(new Set());

  // Resetear estado cuando cambie el usuario o no haya userProgress
  useEffect(() => {
    const currentUserId = userProgress?.userId;
    
    // Si no hay userProgress (usuario no autenticado), resetear todo
    if (!userProgress) {
      setNotifications([]);
      setUnreadCount(0);
      setLastCheckedStars(0);
      setIsChecking(false);
      setLastUserId(null);
      checkedRewardsRef.current.clear();
      return;
    }
    
    // Si cambió el usuario, resetear el estado
    if (currentUserId && currentUserId !== lastUserId) {
      setNotifications([]);
      setUnreadCount(0);
      setLastCheckedStars(0);
      setIsChecking(false);
      setLastUserId(currentUserId);
      checkedRewardsRef.current.clear();
    }
  }, [userProgress?.userId, lastUserId, userProgress]);

  // Verificar nuevas recompensas cuando cambie el progreso
  useEffect(() => {
    if (userProgress?.totalStars > lastCheckedStars && !isChecking && userProgress?.userId === lastUserId) {
      checkForNewRewards();
      setLastCheckedStars(userProgress.totalStars);
    }
  }, [userProgress?.totalStars, lastCheckedStars, isChecking, userProgress?.userId, lastUserId]);

  const checkForNewRewards = useCallback(async () => {
    if (!userProgress?.userId || isChecking) return;
    
    // No verificar recompensas si el usuario no tiene estrellas
    if (!userProgress?.totalStars || userProgress.totalStars === 0) {
      return [];
    }

    setIsChecking(true);
    
    try {
      const response = await fetch('/api/rewards/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProgress.userId,
          totalStars: userProgress.totalStars
        })
      });
      
      const data = await response.json();
      if (data.success && data.data.totalAvailable > 0) {
        const newRewards = [
          ...data.data.availableVirtual,
          ...data.data.availablePhysical
        ];
        
        // Filtrar recompensas que ya fueron notificadas
        const uniqueNewRewards = newRewards.filter(reward => {
          const rewardKey = `${reward.id}_${reward.type}`;
          if (checkedRewardsRef.current.has(rewardKey)) {
            return false;
          }
          checkedRewardsRef.current.add(rewardKey);
          return true;
        });

        if (uniqueNewRewards.length > 0) {
          // Crear notificaciones para cada recompensa nueva
          const newNotifications = uniqueNewRewards.map(reward => ({
            id: `reward_${reward.id}_${Date.now()}`,
            type: 'reward',
            reward,
            timestamp: new Date().toISOString(),
            read: false,
            claimed: false
          }));

          setNotifications(prev => [...prev, ...newNotifications]);
          setUnreadCount(prev => prev + newNotifications.length);

          // Mostrar toast de notificación solo una vez
          if (uniqueNewRewards.length === 1) {
            toast.success(`¡Nueva recompensa desbloqueada: ${uniqueNewRewards[0].name}!`, {
              duration: 5000,
              icon: '🎉',
              style: {
                background: '#10B981',
                color: '#fff',
              },
            });
          } else {
            toast.success(`¡${uniqueNewRewards.length} nuevas recompensas desbloqueadas!`, {
              duration: 5000,
              icon: '🎉',
              style: {
                background: '#10B981',
                color: '#fff',
              },
            });
          }
        }

        return uniqueNewRewards;
      }
    } catch (error) {
      console.error('Error checking new rewards:', error);
    } finally {
      setIsChecking(false);
    }
    return [];
  }, [userProgress?.userId, userProgress?.totalStars, isChecking]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const claimReward = useCallback((notificationId, rewardId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, claimed: true, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getRewardNotifications = useCallback(() => {
    return notifications.filter(n => n.type === 'reward');
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    checkedRewardsRef.current.clear();
  }, []);

  const clearDuplicateNotifications = useCallback(() => {
    setNotifications(prev => {
      const unique = new Map();
      prev.forEach(notif => {
        if (notif.type === 'reward') {
          const key = `${notif.reward.id}_${notif.reward.type}`;
          if (!unique.has(key)) {
            unique.set(key, notif);
          }
        } else {
          unique.set(notif.id, notif);
        }
      });
      return Array.from(unique.values());
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    claimReward,
    getUnreadNotifications,
    getRewardNotifications,
    checkForNewRewards,
    clearAllNotifications,
    clearDuplicateNotifications
  };
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Trophy, 
  Gift, 
  Star, 
  CheckCircle, 
  Clock,
  Award,
  Badge,
  Crown
} from 'lucide-react';
import { useRewardNotifications } from '../hooks/useRewardNotifications';
import { useGame } from '../contexts/GameContext';

const NotificationCenter = ({ userProgress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('unread');
  const dropdownRef = useRef(null);
  const { claimVirtualReward } = useGame();
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    claimReward,
    getUnreadNotifications,
    getRewardNotifications
  } = useRewardNotifications(userProgress);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (notification) => {
    if (notification.type === 'reward') {
      const reward = notification.reward;
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
    }
    return <Award className="w-5 h-5 text-usb-blue" />;
  };

  const getNotificationColor = (notification) => {
    if (notification.type === 'reward') {
      const reward = notification.reward;
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
    }
    return 'text-usb-blue';
  };

  const handleClaimReward = async (notification) => {
    try {
      const result = await claimVirtualReward(notification.reward.id);
      if (result.success) {
        claimReward(notification.id, notification.reward.id);
        // Mostrar toast de confirmación
        const toast = (await import('react-hot-toast')).default;
        toast.success(`¡${notification.reward.name} reclamada!`, {
          icon: '🎉',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  const filteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return getUnreadNotifications();
      default:
        return notifications;
    }
  };

  const tabs = [
    { id: 'unread', label: 'No leídas', count: unreadCount },
    { id: 'all', label: 'Todas', count: notifications.length }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-usb-white rounded-xl shadow-xl border border-usb-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-usb-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold usb-dark">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-usb-orange-500 hover:text-usb-orange-600 font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-usb-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-usb-orange-100 text-usb-orange-600'
                      : 'text-usb-light hover:text-usb-dark'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 bg-usb-orange-500 text-usb-white text-xs rounded-full px-1.5 py-0.5">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNotifications().length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-usb-gray-300 mx-auto mb-3" />
                <p className="text-usb-light">No hay notificaciones</p>
              </div>
            ) : (
              filteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-usb-gray-100 hover:bg-usb-gray-50 transition-colors ${
                    !notification.read ? 'bg-usb-orange-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${getNotificationColor(notification)}`}>
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'usb-dark' : 'usb-light'
                          }`}>
                            {notification.type === 'reward' ? (
                              <>
                                ¡Nueva recompensa desbloqueada!
                                <br />
                                <span className="font-semibold">{notification.reward.name}</span>
                              </>
                            ) : (
                              notification.message || 'Nueva notificación'
                            )}
                          </p>
                          
                          {notification.type === 'reward' && (
                            <p className="text-xs usb-light mt-1">
                              {notification.reward.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs usb-light">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {notification.type === 'reward' && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-usb-gold" />
                                <span className="text-xs text-usb-gold">
                                  {notification.reward.requiredStars} estrellas
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-usb-orange-500 rounded-full"></div>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 hover:bg-usb-gray-200 rounded"
                          >
                            <X className="w-3 h-3 text-usb-light" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      {notification.type === 'reward' && !notification.claimed && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => handleClaimReward(notification)}
                            className="bg-usb-gold text-usb-white px-3 py-1 rounded text-xs font-medium hover:bg-yellow-600 transition-colors"
                          >
                            Reclamar
                          </button>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-usb-light hover:text-usb-dark text-xs font-medium"
                          >
                            Marcar como leída
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-usb-gray-50 border-t border-usb-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-usb-orange-500 hover:text-usb-orange-600 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

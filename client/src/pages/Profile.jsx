import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  User, 
  Mail, 
  Hash, 
  Calendar, 
  Star, 
  Trophy, 
  Award,
  Edit3,
  Save,
  X,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { userProgress, rewards, getUserStats, getRewardStats } = useGame();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [stats, setStats] = useState(null);
  const [rewardStats, setRewardStats] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    const userStats = await getUserStats(user.id);
    const userRewardStats = await getRewardStats(user.id);
    setStats(userStats);
    setRewardStats(userRewardStats);
  };

  const handleEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      // Error manejado por toast
    }
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const getLevelIcon = (levelId) => {
    const icons = {
      cartera: '💰',
      registroAcademico: '📚',
      bienestar: '❤️',
      mercadeo: '📊',
      facultades: '🏛️'
    };
    return icons[levelId] || '🎯';
  };

  const getLevelColor = (levelId) => {
    const colors = {
      cartera: 'from-blue-500 to-blue-600',
      registroAcademico: 'from-green-500 to-green-600',
      bienestar: 'from-purple-500 to-purple-600',
      mercadeo: 'from-orange-500 to-orange-600',
      facultades: 'from-red-500 to-red-600'
    };
    return colors[levelId] || 'from-gray-500 to-gray-600';
  };

  const getAchievementIcon = (achievementId) => {
    if (achievementId.includes('first')) return '🥇';
    if (achievementId.includes('perfect')) return '⭐';
    if (achievementId.includes('graduate')) return '🎓';
    if (achievementId.includes('student')) return '📚';
    return '🏆';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header del perfil */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                Mi Perfil
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona tu información personal y revisa tu progreso.
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-usb-blue to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-gray-600">Estudiante USB Medellín</p>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-usb-blue focus:border-usb-blue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-usb-blue focus:border-usb-blue"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="btn-success flex-1 flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{user?.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{user?.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">ID: {user?.studentId}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      Miembro desde: {user?.createdAt ? 
                        new Date(user.createdAt).toLocaleDateString() : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas del juego */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progreso Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.completionPercentage || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-usb-blue" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estrellas Totales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userProgress?.totalStars || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-usb-gold" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Niveles Completados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userProgress?.completedLevels?.length || 0}/5
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-usb-green" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recompensas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {rewardStats ? rewardStats.totalRewards : 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-usb-purple" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso por niveles */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Progreso por Niveles
              </h3>
              
              <div className="space-y-4">
                {userProgress?.levelProgress && Object.entries(userProgress.levelProgress).map(([levelId, level]) => {
                  const levelInfo = userProgress.levels?.find(l => l.id === levelId);
                  return (
                    <div key={levelId} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getLevelIcon(levelId)}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {levelInfo?.name || levelId}
                          </h4>
                          <span className="text-sm text-gray-600">
                            {level.totalStars}/10 estrellas
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-usb-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(level.totalStars / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {level.completed ? (
                          <div className="flex items-center space-x-1 text-usb-green">
                            <span className="text-sm font-medium">Completado</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-usb-gold" />
                            <span className="text-sm text-gray-600">
                              {level.totalStars}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logros */}
            {userProgress?.achievements && userProgress.achievements.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Logros Obtenidos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProgress.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">
                        {getAchievementIcon(achievement.id)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

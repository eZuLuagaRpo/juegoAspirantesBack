import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Gift, 
  Star, 
  Clock, 
  CheckCircle, 
  Package, 
  Calendar,
  Filter,
  Search,
  Download,
  TrendingUp,
  Award,
  Badge,
  Crown
} from 'lucide-react';

const RewardHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    loadHistory();
    loadActivity();
  }, [userId, filter, pagination.offset]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rewards/history/${userId}?type=${filter}&limit=${pagination.limit}&offset=${pagination.offset}`);
      const data = await response.json();
      
      if (data.success) {
        if (pagination.offset === 0) {
          setHistory(data.data.history);
        } else {
          setHistory(prev => [...prev, ...data.data.history]);
        }
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const response = await fetch(`/api/rewards/activity/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setActivity(data.data);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const getRewardIcon = (rewardType) => {
    switch (rewardType) {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'claimed':
        return <CheckCircle className="w-4 h-4 text-usb-green" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-usb-orange-500" />;
      case 'completed':
        return <Package className="w-4 h-4 text-usb-blue" />;
      default:
        return <Clock className="w-4 h-4 text-usb-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'claimed':
        return 'text-usb-green bg-green-50';
      case 'pending':
        return 'text-usb-orange-600 bg-orange-50';
      case 'completed':
        return 'text-usb-blue bg-blue-50';
      default:
        return 'text-usb-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = history.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportHistory = () => {
    const csvContent = [
      ['Fecha', 'Tipo', 'Nombre', 'Estrellas', 'Estado'],
      ...filteredHistory.map(item => [
        formatDate(item.claimedAt || item.requestedAt),
        item.type === 'virtual' ? 'Virtual' : 'Física',
        item.name,
        item.stars,
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-recompensas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-usb-white rounded-xl p-6 shadow-lg border border-usb-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold usb-dark">Historial de Recompensas</h2>
          <button
            onClick={exportHistory}
            className="flex items-center space-x-2 px-4 py-2 bg-usb-orange-500 text-usb-white rounded-lg hover:bg-usb-orange-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-usb-light w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-usb-gray-300 rounded-lg focus:ring-2 focus:ring-usb-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPagination(prev => ({ ...prev, offset: 0 }));
            }}
            className="px-4 py-2 border border-usb-gray-300 rounded-lg focus:ring-2 focus:ring-usb-orange-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="virtual">Virtuales</option>
            <option value="physical">Físicas</option>
          </select>
        </div>
      </div>

      {/* Estadísticas de actividad */}
      {activity.length > 0 && (
        <div className="bg-usb-white rounded-xl p-6 shadow-lg border border-usb-gray-200">
          <h3 className="text-lg font-semibold usb-dark mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-usb-orange-500 mr-2" />
            Actividad Mensual
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activity.slice(0, 6).map((month, index) => (
              <div key={month.month} className="bg-usb-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium usb-dark">
                    {new Date(month.month + '-01').toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </h4>
                  <Calendar className="w-4 h-4 text-usb-light" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="usb-light">Virtuales:</span>
                    <span className="font-medium text-usb-gold">{month.virtual}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="usb-light">Físicas:</span>
                    <span className="font-medium text-usb-orange-500">{month.physical}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="usb-light">Estrellas:</span>
                    <span className="font-medium text-usb-green">{month.totalStars}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de historial */}
      <div className="bg-usb-white rounded-xl shadow-lg border border-usb-gray-200">
        <div className="p-6 border-b border-usb-gray-200">
          <h3 className="text-lg font-semibold usb-dark">
            Recompensas Obtenidas ({filteredHistory.length})
          </h3>
        </div>
        
        <div className="divide-y divide-usb-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-usb-orange-500 mx-auto"></div>
              <p className="usb-light mt-2">Cargando historial...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 text-usb-gray-300 mx-auto mb-3" />
              <p className="usb-light">No hay recompensas en tu historial</p>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <div key={`${item.id}-${index}`} className="p-6 hover:bg-usb-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRewardIcon(item.rewardType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium usb-dark truncate">{item.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status === 'claimed' ? 'Reclamada' : 
                           item.status === 'pending' ? 'Pendiente' : 
                           item.status === 'completed' ? 'Completada' : item.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm usb-light">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-usb-gold" />
                          <span>{item.stars} estrellas</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(item.status)}
                          <span>
                            {formatDate(item.claimedAt || item.requestedAt)}
                          </span>
                        </div>
                        
                        <span className="capitalize">
                          {item.type === 'virtual' ? 'Virtual' : 'Física'}
                        </span>
                      </div>
                      
                      {item.shippingAddress && (
                        <div className="mt-2 text-xs usb-light">
                          <p><strong>Dirección:</strong> {item.shippingAddress}</p>
                          <p><strong>Teléfono:</strong> {item.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.type === 'virtual' ? (
                      <Trophy className="w-5 h-5 text-usb-gold" />
                    ) : (
                      <Gift className="w-5 h-5 text-usb-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {pagination.hasMore && (
          <div className="p-6 border-t border-usb-gray-200 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-usb-orange-500 text-usb-white rounded-lg hover:bg-usb-orange-600 transition-colors"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardHistory;

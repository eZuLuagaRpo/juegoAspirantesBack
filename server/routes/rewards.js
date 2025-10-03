const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Simulación de base de datos de recompensas (en producción usar PostgreSQL)
let userRewards = new Map();

// Catálogo de recompensas disponibles (solo descuentos)
const rewardsCatalog = {
  virtual: [
    {
      id: 'discount_10',
      name: 'Inscripción Gratuita',
      description: 'Descuento del 100% en tu matrícula',
      type: 'discount',
      requiredStars: 10,
      discountPercentage: 100
    },
    {
      id: 'discount_20',
      name: '3% de Descuento',
      description: 'Descuento del 3% en tu matrícula',
      type: 'discount',
      requiredStars: 20,
      discountPercentage: 3
    },
    {
      id: 'discount_30',
      name: '5% de Descuento',
      description: 'Descuento del 5% en tu matrícula',
      type: 'discount',
      requiredStars: 30,
      discountPercentage: 5
    },
    {
      id: 'discount_40',
      name: '8% de Descuento',
      description: 'Descuento del 8% en tu matrícula',
      type: 'discount',
      requiredStars: 40,
      discountPercentage: 8
    }
  ],
  physical: []
};

// Obtener catálogo de recompensas
router.get('/catalog', (req, res) => {
  try {
    res.json({
      success: true,
      data: rewardsCatalog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el catálogo de recompensas'
    });
  }
});

// Obtener recompensas del usuario
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userReward = userRewards.get(userId) || {
      userId,
      virtualRewards: [],
      physicalRewards: [],
      totalStars: 0,
      availableRewards: []
    };
    
    res.json({
      success: true,
      data: userReward
    });
  } catch (error) {
    console.error('Error obteniendo recompensas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener recompensas del usuario'
    });
  }
});

// Verificar recompensas disponibles para el usuario
router.post('/check-availability', [
  body('userId').notEmpty().withMessage('ID de usuario requerido'),
  body('totalStars').isInt({ min: 0 }).withMessage('Total de estrellas debe ser numérico')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId, totalStars } = req.body;
    
    // Verificar recompensas virtuales disponibles
    const availableVirtualRewards = rewardsCatalog.virtual.filter(reward => 
      totalStars >= reward.requiredStars
    );
    
    // Verificar recompensas físicas disponibles
    const availablePhysicalRewards = rewardsCatalog.physical.filter(reward => 
      totalStars >= reward.requiredStars && reward.available
    );
    
    // Obtener recompensas ya obtenidas
    const userReward = userRewards.get(userId) || {
      userId,
      virtualRewards: [],
      physicalRewards: [],
      totalStars: 0
    };
    
    // Filtrar recompensas no obtenidas
    const newVirtualRewards = availableVirtualRewards.filter(reward =>
      !userReward.virtualRewards.find(ur => ur.id === reward.id)
    );
    
    const newPhysicalRewards = availablePhysicalRewards.filter(reward =>
      !userReward.physicalRewards.find(ur => ur.id === reward.id)
    );
    
    res.json({
      success: true,
      data: {
        availableVirtual: newVirtualRewards,
        availablePhysical: newPhysicalRewards,
        totalAvailable: newVirtualRewards.length + newPhysicalRewards.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al verificar disponibilidad de recompensas'
    });
  }
});

// Reclamar recompensa virtual
router.post('/claim-virtual', [
  body('userId').notEmpty().withMessage('ID de usuario requerido'),
  body('rewardId').notEmpty().withMessage('ID de recompensa requerido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId, rewardId } = req.body;
    
    // Verificar que la recompensa existe
    const reward = rewardsCatalog.virtual.find(r => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        error: 'Recompensa no encontrada'
      });
    }
    
    // Obtener o crear registro de recompensas del usuario
    let userReward = userRewards.get(userId);
    if (!userReward) {
      userReward = {
        userId,
        virtualRewards: [],
        physicalRewards: [],
        totalStars: 0
      };
    }
    
    // Verificar que no haya sido reclamada
    if (userReward.virtualRewards.find(r => r.id === rewardId)) {
      return res.status(400).json({
        success: false,
        error: 'Recompensa ya reclamada'
      });
    }
    
    // Agregar recompensa
    userReward.virtualRewards.push({
      ...reward,
      claimedAt: new Date().toISOString()
    });
    
    // Guardar
    userRewards.set(userId, userReward);
    
    res.json({
      success: true,
      message: 'Recompensa virtual reclamada exitosamente',
      data: {
        reward,
        claimedAt: userReward.virtualRewards[userReward.virtualRewards.length - 1].claimedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al reclamar recompensa virtual'
    });
  }
});

// Solicitar recompensa física
router.post('/request-physical', [
  body('userId').notEmpty().withMessage('ID de usuario requerido'),
  body('rewardId').notEmpty().withMessage('ID de recompensa requerido'),
  body('shippingAddress').notEmpty().withMessage('Dirección de envío requerida'),
  body('phone').notEmpty().withMessage('Teléfono requerido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId, rewardId, shippingAddress, phone } = req.body;
    
    // Verificar que la recompensa existe y está disponible
    const reward = rewardsCatalog.physical.find(r => r.id === rewardId);
    if (!reward || !reward.available) {
      return res.status(404).json({
        success: false,
        error: 'Recompensa no disponible'
      });
    }
    
    // Obtener o crear registro de recompensas del usuario
    let userReward = userRewards.get(userId);
    if (!userReward) {
      userReward = {
        userId,
        virtualRewards: [],
        physicalRewards: [],
        totalStars: 0
      };
    }
    
    // Verificar que no haya sido solicitada
    if (userReward.physicalRewards.find(r => r.id === rewardId)) {
      return res.status(400).json({
        success: false,
        error: 'Recompensa física ya solicitada'
      });
    }
    
    // Agregar solicitud de recompensa física
    userReward.physicalRewards.push({
      ...reward,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      shippingAddress,
      phone
    });
    
    // Guardar
    userRewards.set(userId, userReward);
    
    res.json({
      success: true,
      message: 'Solicitud de recompensa física enviada exitosamente',
      data: {
        reward,
        status: 'pending',
        estimatedDelivery: '15-20 días hábiles'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al solicitar recompensa física'
    });
  }
});

// Obtener estadísticas de recompensas
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userReward = userRewards.get(userId) || {
      userId,
      virtualRewards: [],
      physicalRewards: [],
      totalStars: 0
    };
    
    const stats = {
      totalVirtualRewards: userReward.virtualRewards.length,
      totalPhysicalRewards: userReward.physicalRewards.length,
      totalRewards: userReward.virtualRewards.length + userReward.physicalRewards.length,
      pendingPhysicalRewards: userReward.physicalRewards.filter(r => r.status === 'pending').length,
      completedPhysicalRewards: userReward.physicalRewards.filter(r => r.status === 'completed').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de recompensas'
    });
  }
});

// Obtener historial de recompensas
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;
    
    const userReward = userRewards.get(userId) || {
      userId,
      virtualRewards: [],
      physicalRewards: [],
      totalStars: 0
    };
    
    let history = [];
    
    // Agregar recompensas virtuales al historial
    userReward.virtualRewards.forEach(reward => {
      history.push({
        id: reward.id,
        name: reward.name,
        type: 'virtual',
        rewardType: reward.type,
        claimedAt: reward.claimedAt,
        status: 'claimed',
        stars: reward.requiredStars
      });
    });
    
    // Agregar recompensas físicas al historial
    userReward.physicalRewards.forEach(reward => {
      history.push({
        id: reward.id,
        name: reward.name,
        type: 'physical',
        rewardType: reward.type,
        requestedAt: reward.requestedAt,
        status: reward.status,
        stars: reward.requiredStars,
        shippingAddress: reward.shippingAddress,
        phone: reward.phone
      });
    });
    
    // Filtrar por tipo si se especifica
    if (type && type !== 'all') {
      history = history.filter(item => item.type === type);
    }
    
    // Ordenar por fecha (más recientes primero)
    history.sort((a, b) => {
      const dateA = new Date(a.claimedAt || a.requestedAt);
      const dateB = new Date(b.claimedAt || b.requestedAt);
      return dateB - dateA;
    });
    
    // Aplicar paginación
    const total = history.length;
    const paginatedHistory = history.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial de recompensas'
    });
  }
});

// Obtener resumen de actividad de recompensas
router.get('/activity/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userReward = userRewards.get(userId) || {
      userId,
      virtualRewards: [],
      physicalRewards: [],
      totalStars: 0
    };
    
    // Agrupar por mes
    const monthlyActivity = {};
    
    [...userReward.virtualRewards, ...userReward.physicalRewards].forEach(reward => {
      const date = new Date(reward.claimedAt || reward.requestedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyActivity[monthKey]) {
        monthlyActivity[monthKey] = {
          month: monthKey,
          virtual: 0,
          physical: 0,
          totalStars: 0
        };
      }
      
      if (reward.claimedAt) {
        monthlyActivity[monthKey].virtual++;
      } else {
        monthlyActivity[monthKey].physical++;
      }
      
      monthlyActivity[monthKey].totalStars += reward.requiredStars;
    });
    
    const activity = Object.values(monthlyActivity).sort((a, b) => b.month.localeCompare(a.month));
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener actividad de recompensas'
    });
  }
});

module.exports = router;

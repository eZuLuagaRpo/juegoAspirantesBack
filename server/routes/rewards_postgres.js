const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const RewardService = require('../services/rewardService');

// Obtener catálogo de recompensas
router.get('/catalog', async (req, res) => {
  try {
    const catalog = await RewardService.getRewardsCatalog();
    
    res.json({
      success: true,
      data: catalog
    });
  } catch (error) {
    console.error('Error obteniendo catálogo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el catálogo de recompensas'
    });
  }
});

// Obtener recompensas del usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRewards = await RewardService.getUserRewards(userId);
    
    res.json({
      success: true,
      data: userRewards
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId, totalStars } = req.body;
    const availability = await RewardService.checkRewardAvailability(userId, totalStars);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId, rewardId } = req.body;
    
    const claimedReward = await RewardService.claimVirtualReward(userId, rewardId);
    
    res.json({
      success: true,
      message: 'Recompensa reclamada exitosamente',
      data: claimedReward
    });
  } catch (error) {
    console.error('Error reclamando recompensa:', error);
    
    if (error.message === 'Recompensa no encontrada') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message === 'Recompensa ya reclamada' || 
        error.message === 'No tienes suficientes estrellas para esta recompensa') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al reclamar la recompensa'
    });
  }
});

// Solicitar recompensa física
router.post('/request-physical', [
  body('userId').notEmpty().withMessage('ID de usuario requerido'),
  body('rewardId').notEmpty().withMessage('ID de recompensa requerido'),
  body('address').notEmpty().withMessage('Dirección requerida'),
  body('city').notEmpty().withMessage('Ciudad requerida'),
  body('phone').notEmpty().withMessage('Teléfono requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId, rewardId, address, city, phone } = req.body;
    
    const requestedReward = await RewardService.requestPhysicalReward(userId, rewardId, {
      address,
      city,
      phone
    });
    
    res.json({
      success: true,
      message: 'Solicitud de recompensa física enviada exitosamente',
      data: requestedReward
    });
  } catch (error) {
    console.error('Error solicitando recompensa física:', error);
    
    if (error.message === 'Recompensa física no encontrada') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message === 'Recompensa ya solicitada' || 
        error.message === 'No tienes suficientes estrellas para esta recompensa') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al solicitar la recompensa física'
    });
  }
});

// Obtener mejor recompensa disponible
router.get('/best-reward/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bestReward = await RewardService.getBestAvailableReward(userId);
    
    res.json({
      success: true,
      data: bestReward
    });
  } catch (error) {
    console.error('Error obteniendo mejor recompensa:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la mejor recompensa'
    });
  }
});

// Obtener estadísticas de recompensas del usuario
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Obtener recompensas del usuario
    const userRewards = await RewardService.getUserRewards(userId);
    
    // Calcular estadísticas
    const stats = {
      totalRewards: userRewards.virtualRewards.length + userRewards.physicalRewards.length,
      virtualRewards: userRewards.virtualRewards.length,
      physicalRewards: userRewards.physicalRewards.length,
      totalStars: userRewards.totalStars,
      availableRewards: userRewards.availableRewards.length,
      claimedRewards: userRewards.virtualRewards.filter(r => r.status === 'claimed').length,
      pendingRewards: userRewards.physicalRewards.filter(r => r.status === 'requested').length,
      totalDiscount: userRewards.virtualRewards.reduce((sum, reward) => sum + (reward.discountPercentage || 0), 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de recompensas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de recompensas'
    });
  }
});

module.exports = router;

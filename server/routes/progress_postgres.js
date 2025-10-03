const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ProgressService = require('../services/progressService');
const { query } = require('../config/database');

// Obtener progreso del usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await ProgressService.getUserProgress(userId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el progreso'
    });
  }
});

// Actualizar progreso del usuario
router.post('/:userId/update', [
  body('levelId').notEmpty().withMessage('ID del nivel es requerido'),
  body('puzzleId').notEmpty().withMessage('ID del puzzle es requerido'),
  body('stars').isInt({ min: 0, max: 5 }).withMessage('Estrellas deben ser entre 0 y 5'),
  body('completed').isBoolean().withMessage('Completado debe ser booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId } = req.params;
    const { levelId, puzzleId, stars, completed, timeSpent = 0, errors: errorCount = 0, hintsUsed = 0 } = req.body;
    
    // Actualizar progreso
    const updatedProgress = await ProgressService.updatePuzzleProgress(
      userId, 
      levelId, 
      puzzleId, 
      stars, 
      completed, 
      timeSpent, 
      errorCount, 
      hintsUsed
    );
    
    res.json({
      success: true,
      data: updatedProgress,
      message: 'Progreso actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando progreso:', error);
    if (error.message === 'Este puzzle ya fue completado anteriormente') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el progreso'
    });
  }
});

// Obtener el siguiente puzzle disponible en un nivel
router.get('/:userId/next-puzzle/:levelId', async (req, res) => {
  try {
    const { userId, levelId } = req.params;
    
    const nextPuzzle = await ProgressService.getNextPuzzle(userId, levelId);
    
    res.json({
      success: true,
      data: nextPuzzle
    });
  } catch (error) {
    console.error('Error obteniendo siguiente puzzle:', error);
    if (error.message === 'Nivel no encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Error al obtener el siguiente puzzle'
    });
  }
});

// Verificar si un nivel está bloqueado (completado)
router.get('/:userId/level-status/:levelId', async (req, res) => {
  try {
    const { userId, levelId } = req.params;
    const status = await ProgressService.getLevelStatus(userId, levelId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error verificando estado del nivel:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar el estado del nivel'
    });
  }
});

// Obtener estadísticas del usuario
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await ProgressService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

// Función para verificar logros (mantener compatibilidad)
function checkAchievements(progress) {
  // Esta función se mantiene para compatibilidad
  // Los logros se manejan automáticamente en la base de datos
  const achievements = [];
  
  // Logro: Primera estrella
  if (progress.totalStars >= 1 && !progress.achievements.includes('first_star')) {
    achievements.push('first_star');
  }
  
  // Logro: Completador de niveles
  if (progress.completedLevels.length >= 1 && !progress.achievements.includes('level_completer')) {
    achievements.push('level_completer');
  }
  
  // Logro: Coleccionista de estrellas
  if (progress.totalStars >= 20 && !progress.achievements.includes('star_collector')) {
    achievements.push('star_collector');
  }
  
  // Agregar logros al progreso
  progress.achievements = [...new Set([...progress.achievements, ...achievements])];
  
  return achievements;
}

// Obtener información de finalización del juego
router.get('/:userId/completion', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(`
      SELECT 
        game_completed, 
        completion_code, 
        completion_reward_id, 
        completion_reward_discount,
        completed_at
      FROM user_progress 
      WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    const completion = result.rows[0];
    
    if (!completion.game_completed) {
      return res.json({
        success: true,
        data: {
          gameCompleted: false,
          message: 'El juego aún no ha sido completado'
        }
      });
    }
    
    // Obtener información de la recompensa
    let rewardInfo = null;
    if (completion.completion_reward_id) {
      const rewardResult = await query(`
        SELECT name, description 
        FROM rewards_catalog 
        WHERE id = $1
      `, [completion.completion_reward_id]);
      
      if (rewardResult.rows.length > 0) {
        rewardInfo = {
          id: completion.completion_reward_id,
          name: rewardResult.rows[0].name,
          description: rewardResult.rows[0].description,
          discountPercentage: completion.completion_reward_discount
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        gameCompleted: true,
        completionCode: completion.completion_code,
        reward: rewardInfo,
        completedAt: completion.completed_at
      }
    });
  } catch (error) {
    console.error('Error obteniendo información de finalización:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de finalización'
    });
  }
});

module.exports = router;

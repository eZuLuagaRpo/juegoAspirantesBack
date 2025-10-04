const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Simulación de base de datos en memoria (en producción usar PostgreSQL)
let userProgress = new Map();

// Obtener progreso del usuario
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress.get(userId) || {
      userId,
      currentLevel: 'mercadeo',
      completedLevels: [],
      totalStars: 0,
      achievements: [],
      lastPlayed: null
    };
    
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
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { userId } = req.params;
    const { levelId, puzzleId, stars, completed } = req.body;
    
    let progress = userProgress.get(userId);
    if (!progress) {
      progress = {
        userId,
        currentLevel: 'mercadeo',
        completedLevels: [],
        totalStars: 0,
        achievements: [],
        lastPlayed: new Date().toISOString(),
        levelProgress: {}
      };
    }
    
    // Verificar si el puzzle ya fue completado (puzzles únicos)
    if (progress.levelProgress[levelId]?.puzzles?.[puzzleId]?.completed) {
      return res.status(400).json({
        success: false,
        error: 'Este puzzle ya fue completado anteriormente'
      });
    }
    
    // Actualizar progreso del nivel
    if (!progress.levelProgress[levelId]) {
      progress.levelProgress[levelId] = {
        completed: false,
        totalStars: 0,
        puzzles: {}
      };
    }
    
    // Actualizar puzzle específico
    progress.levelProgress[levelId].puzzles[puzzleId] = {
      stars,
      completed,
      completedAt: new Date().toISOString()
    };
    
    // Recalcular estrellas totales del nivel
    const levelStars = Object.values(progress.levelProgress[levelId].puzzles)
      .reduce((sum, puzzle) => sum + puzzle.stars, 0);
    
    progress.levelProgress[levelId].totalStars = levelStars;
    
    // Verificar si el nivel está completado (todos los puzzles completados)
    // Primero necesitamos obtener la información del nivel para saber cuántos puzzles tiene
    const gameModule = require('./game');
    const gameLevels = gameModule.gameLevels;
    const level = gameLevels[levelId];
    
    if (level) {
      const totalPuzzles = level.puzzles.length;
      const completedPuzzles = Object.values(progress.levelProgress[levelId].puzzles)
        .filter(puzzle => puzzle.completed).length;
      
      // Solo marcar como completado si se han completado TODOS los puzzles del nivel
      if (completedPuzzles === totalPuzzles && !progress.levelProgress[levelId].completed) {
        progress.levelProgress[levelId].completed = true;
        progress.completedLevels.push(levelId);
        
        // Desbloquear siguiente nivel (solo si no es el último nivel)
        const levelOrder = ['mercadeo', 'registroAcademico', 'facultades', 'bienestar', 'cartera'];
        const currentIndex = levelOrder.indexOf(levelId);
        if (currentIndex < levelOrder.length - 1) {
          progress.currentLevel = levelOrder[currentIndex + 1];
        } else {
          // Si es el último nivel (cartera), mantener el nivel actual y no desbloquear nada más
          progress.currentLevel = levelId;
        }
      }
    }
    
    // Recalcular estrellas totales
    progress.totalStars = Object.values(progress.levelProgress)
      .reduce((sum, level) => sum + level.totalStars, 0);
    
    // Actualizar última vez jugado
    progress.lastPlayed = new Date().toISOString();
    
    // Verificar logros
    checkAchievements(progress);
    
    // Guardar progreso
    userProgress.set(userId, progress);
    
    res.json({
      success: true,
      data: progress,
      message: 'Progreso actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el progreso'
    });
  }
});

// Obtener el siguiente puzzle disponible en un nivel
router.get('/:userId/next-puzzle/:levelId', (req, res) => {
  try {
    const { userId, levelId } = req.params;
    let progress = userProgress.get(userId);
    
    // Si no existe progreso, crear uno inicial
    if (!progress) {
      progress = {
        userId,
        currentLevel: 'mercadeo',
        completedLevels: [],
        totalStars: 0,
        achievements: [],
        lastPlayed: null,
        levelProgress: {}
      };
      userProgress.set(userId, progress);
    }
    
    // Obtener información del nivel desde el juego
    const gameModule = require('./game');
    const gameLevels = gameModule.gameLevels;
    const level = gameLevels[levelId];
    
    if (!level) {
      return res.status(404).json({
        success: false,
        error: 'Nivel no encontrado'
      });
    }
    
    // Verificar si el nivel está completado
    const levelProgress = progress.levelProgress[levelId];
    if (levelProgress?.completed) {
      return res.json({
        success: true,
        data: {
          levelCompleted: true,
          message: 'Este nivel ya fue completado completamente'
        }
      });
    }
    
    // Encontrar el siguiente puzzle no completado
    const completedPuzzles = levelProgress?.puzzles || {};
    const completedPuzzlesCount = Object.keys(completedPuzzles).length;
    
    // Si hay cualquier progreso (al menos un puzzle completado), ir al último puzzle
    if (completedPuzzlesCount > 0) {
      const lastPuzzle = level.puzzles[level.puzzles.length - 1];
      const lastPuzzleIndex = level.puzzles.length - 1;
      
      return res.json({
        success: true,
        data: {
          levelCompleted: false,
          nextPuzzle: {
            id: lastPuzzle.id,
            type: lastPuzzle.type,
            title: lastPuzzle.title,
            description: lastPuzzle.description,
            difficulty: lastPuzzle.difficulty,
            maxStars: lastPuzzle.maxStars,
            puzzleData: lastPuzzle.puzzleData
          },
          puzzleIndex: lastPuzzleIndex,
          totalPuzzles: level.puzzles.length
        }
      });
    }
    
    // Si no hay progreso, ir al primer puzzle
    const nextPuzzle = level.puzzles.find(puzzle => !completedPuzzles[puzzle.id]?.completed);
    
    if (!nextPuzzle) {
      // Todos los puzzles están completados, marcar nivel como completado
      if (levelProgress) {
        levelProgress.completed = true;
        if (!progress.completedLevels.includes(levelId)) {
          progress.completedLevels.push(levelId);
        }
        userProgress.set(userId, progress);
      }
      
      return res.json({
        success: true,
        data: {
          levelCompleted: true,
          message: 'Todos los puzzles de este nivel han sido completados'
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        levelCompleted: false,
        nextPuzzle: {
          id: nextPuzzle.id,
          type: nextPuzzle.type,
          title: nextPuzzle.title,
          description: nextPuzzle.description,
          difficulty: nextPuzzle.difficulty,
          maxStars: nextPuzzle.maxStars,
          puzzleData: nextPuzzle.puzzleData
        },
        puzzleIndex: level.puzzles.findIndex(p => p.id === nextPuzzle.id),
        totalPuzzles: level.puzzles.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el siguiente puzzle'
    });
  }
});

// Verificar si un nivel está bloqueado (completado)
router.get('/:userId/level-status/:levelId', (req, res) => {
  try {
    const { userId, levelId } = req.params;
    const progress = userProgress.get(userId);
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          isLocked: false,
          isCompleted: false,
          canPlay: true
        }
      });
    }
    
    const levelProgress = progress.levelProgress[levelId];
    const isCompleted = levelProgress?.completed || false;
    const isLocked = isCompleted; // Un nivel completado está bloqueado
    
    res.json({
      success: true,
      data: {
        isLocked,
        isCompleted,
        canPlay: !isLocked,
        completedPuzzles: levelProgress?.puzzles ? Object.keys(levelProgress.puzzles).length : 0,
        totalStars: levelProgress?.totalStars || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al verificar el estado del nivel'
    });
  }
});

// Obtener estadísticas del usuario
router.get('/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress.get(userId);
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          totalStars: 0,
          completedLevels: 0,
          totalLevels: 5,
          completionPercentage: 0,
          averageStars: 0
        }
      });
    }
    
    const stats = {
      totalStars: progress.totalStars,
      completedLevels: progress.completedLevels.length,
      totalLevels: 5,
      completionPercentage: Math.round((progress.completedLevels.length / 5) * 100),
      averageStars: progress.totalStars > 0 ? 
        Math.round((progress.totalStars / Object.keys(progress.levelProgress).length) * 10) / 10 : 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

// Función para verificar logros
function checkAchievements(progress) {
  const achievements = [];
  
  // Logro por completar primer nivel
  if (progress.completedLevels.includes('cartera')) {
    achievements.push({
      id: 'first_level',
      name: 'Primer Paso',
      description: 'Completaste tu primer nivel',
      unlockedAt: new Date().toISOString(),
      type: 'level_completion',
      rewardStars: 5
    });
  }
  
  // Logro por obtener todas las estrellas en un nivel
  Object.entries(progress.levelProgress).forEach(([levelId, level]) => {
    // Obtener el número máximo de estrellas para este nivel
    const gameModule = require('./game');
    const gameLevels = gameModule.gameLevels;
    const levelConfig = gameLevels[levelId];
    
    if (levelConfig) {
      const maxStarsForLevel = levelConfig.puzzles.length * 5; // Cada puzzle da máximo 5 estrellas
      
      if (level.totalStars >= maxStarsForLevel) {
        achievements.push({
          id: `perfect_${levelId}`,
          name: `Perfección en ${levelId}`,
          description: `Obtuviste todas las estrellas en ${levelId}`,
          unlockedAt: new Date().toISOString(),
          type: 'perfect_score',
          rewardStars: 3
        });
      }
    }
  });
  
  // Logro por completar todos los niveles
  if (progress.completedLevels.length === 5) {
    achievements.push({
      id: 'game_complete',
      name: '¡Graduado!',
      description: 'Completaste todos los niveles del juego',
      unlockedAt: new Date().toISOString(),
      type: 'game_completion',
      rewardStars: 10
    });
  }
  
  // Logro por acumular estrellas
  if (progress.totalStars >= 25) {
    achievements.push({
      id: 'star_collector',
      name: 'Coleccionista de Estrellas',
      description: 'Acumulaste 25 estrellas',
      unlockedAt: new Date().toISOString(),
      type: 'star_milestone',
      rewardStars: 5
    });
  }
  
  if (progress.totalStars >= 50) {
    achievements.push({
      id: 'star_master',
      name: 'Maestro de Estrellas',
      description: 'Acumulaste 50 estrellas',
      unlockedAt: new Date().toISOString(),
      type: 'star_milestone',
      rewardStars: 10
    });
  }
  
  // Logro por racha de niveles completados
  if (progress.completedLevels.length >= 3) {
    achievements.push({
      id: 'streak_master',
      name: 'Racha Maestra',
      description: 'Completaste 3 niveles consecutivos',
      unlockedAt: new Date().toISOString(),
      type: 'streak',
      rewardStars: 7
    });
  }
  
  // Agregar nuevos logros
  achievements.forEach(achievement => {
    if (!progress.achievements.find(a => a.id === achievement.id)) {
      progress.achievements.push(achievement);
    }
  });
}

// Endpoint temporal para resetear progreso (solo para desarrollo)
router.delete('/:userId/reset', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Este endpoint solo está disponible en desarrollo'
      });
    }
    
    // Eliminar progreso del usuario
    userProgress.delete(userId);
    
    res.json({
      success: true,
      message: 'Progreso del usuario reseteado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error reseteando progreso'
    });
  }
});

module.exports = router;

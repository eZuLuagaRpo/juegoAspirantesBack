const { query, getClient } = require('../config/database');

class ProgressService {
  
  // Obtener progreso completo del usuario
  static async getUserProgress(userId) {
    const result = await query(`
      SELECT 
        user_id, current_level, total_stars, achievements, last_played,
        game_completed, completion_code, completion_reward_id, 
        completion_reward_discount, completed_at
      FROM user_progress WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      // Crear progreso inicial si no existe
      await this.createInitialProgress(userId);
      return await this.getUserProgress(userId);
    }
    
    const user = result.rows[0];
    
    // Obtener progreso detallado por niveles
    const levelProgressResult = await query(`
      SELECT 
        ulp.level_id,
        ulp.is_completed,
        ulp.total_stars,
        gl.name as level_name,
        gl.order_number
      FROM user_level_progress ulp
      JOIN game_levels gl ON ulp.level_id = gl.id
      WHERE ulp.user_id = $1
      ORDER BY gl.order_number
    `, [userId]);
    
    // Obtener progreso detallado por puzzles
    const puzzleProgressResult = await query(`
      SELECT 
        upp.puzzle_id,
        upp.stars,
        upp.is_completed,
        upp.time_spent,
        upp.errors,
        upp.hints_used,
        upp.completed_at,
        p.level_id,
        p.type,
        p.title
      FROM user_puzzle_progress upp
      JOIN puzzles p ON upp.puzzle_id = p.id
      WHERE upp.user_id = $1
      ORDER BY p.level_id, p.order_number
    `, [userId]);
    
    // Obtener niveles completados
    const completedLevelsResult = await query(`
      SELECT level_id FROM user_completed_levels WHERE user_id = $1
    `, [userId]);
    
    // Obtener logros
    const achievementsResult = await query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.icon,
        ua.earned_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = $1
      ORDER BY ua.earned_at
    `, [userId]);
    
    // Construir estructura de progreso similar a la memoria
    const levelProgress = {};
    const calculatedStarsByLevel = {};
    
    // Primero, calcular las estrellas reales desde los puzzles
    puzzleProgressResult.rows.forEach(puzzle => {
      if (!calculatedStarsByLevel[puzzle.level_id]) {
        calculatedStarsByLevel[puzzle.level_id] = 0;
      }
      calculatedStarsByLevel[puzzle.level_id] += puzzle.stars || 0;
    });
    
    // Inicializar progreso por nivel con estrellas calculadas
    levelProgressResult.rows.forEach(level => {
      levelProgress[level.level_id] = {
        completed: level.is_completed,
        totalStars: calculatedStarsByLevel[level.level_id] || 0, // Usar estrellas calculadas
        puzzles: {}
      };
    });
    
    // Agregar puzzles al progreso
    puzzleProgressResult.rows.forEach(puzzle => {
      if (!levelProgress[puzzle.level_id]) {
        levelProgress[puzzle.level_id] = {
          completed: false,
          totalStars: calculatedStarsByLevel[puzzle.level_id] || 0,
          puzzles: {}
        };
      }
      
      levelProgress[puzzle.level_id].puzzles[puzzle.puzzle_id] = {
        stars: puzzle.stars,
        completed: puzzle.is_completed,
        completedAt: puzzle.completed_at,
        timeSpent: puzzle.time_spent,
        errors: puzzle.errors,
        hintsUsed: puzzle.hints_used
      };
    });
    
    // Calcular total de estrellas real desde todos los puzzles
    const calculatedTotalStars = Object.values(calculatedStarsByLevel).reduce((sum, stars) => sum + stars, 0);
    
    return {
      userId: parseInt(userId),
      currentLevel: user.current_level,
      completedLevels: completedLevelsResult.rows.map(row => row.level_id),
      totalStars: calculatedTotalStars, // Usar estrellas calculadas desde puzzles
      achievements: achievementsResult.rows.map(row => row.id),
      lastPlayed: user.last_played,
      levelProgress,
      // Información de finalización del juego
      gameCompleted: user.game_completed || false,
      completionCode: user.completion_code,
      completionRewardId: user.completion_reward_id,
      completionRewardDiscount: user.completion_reward_discount,
      completedAt: user.completed_at
    };
  }
  
  // Crear progreso inicial del usuario
  static async createInitialProgress(userId) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Crear progreso general
      await client.query(`
        INSERT INTO user_progress (user_id, current_level, total_stars, achievements, last_played)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO NOTHING
      `, [userId, 'mercadeo', 0, [], new Date()]);
      
      // Crear progreso inicial para todos los niveles
      const levelsResult = await client.query('SELECT id FROM game_levels ORDER BY order_number');
      for (const level of levelsResult.rows) {
        await client.query(`
          INSERT INTO user_level_progress (user_id, level_id, is_completed, total_stars)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, level_id) DO NOTHING
        `, [userId, level.id, false, 0]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Actualizar progreso de puzzle
  static async updatePuzzleProgress(userId, levelId, puzzleId, stars, completed, timeSpent = 0, errors = 0, hintsUsed = 0) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar si el puzzle ya fue completado
      const existingResult = await client.query(`
        SELECT is_completed FROM user_puzzle_progress 
        WHERE user_id = $1 AND puzzle_id = $2
      `, [userId, puzzleId]);
      
      if (existingResult.rows.length > 0 && existingResult.rows[0].is_completed) {
        throw new Error('Este puzzle ya fue completado anteriormente');
      }
      
      // Insertar o actualizar progreso del puzzle
      await client.query(`
        INSERT INTO user_puzzle_progress 
        (user_id, puzzle_id, stars, is_completed, time_spent, errors, hints_used, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, puzzle_id) 
        DO UPDATE SET 
          stars = EXCLUDED.stars,
          is_completed = EXCLUDED.is_completed,
          time_spent = EXCLUDED.time_spent,
          errors = EXCLUDED.errors,
          hints_used = EXCLUDED.hints_used,
          completed_at = EXCLUDED.completed_at,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId, 
        puzzleId, 
        stars, 
        completed, 
        timeSpent, 
        errors, 
        hintsUsed,
        completed ? new Date() : null
      ]);
      
      // Actualizar total de estrellas del nivel
      await this.updateLevelTotalStars(client, userId, levelId);
      
      // Verificar si el nivel está completado
      await this.checkLevelCompletion(client, userId, levelId);
      
      // Verificar si el juego está completamente terminado
      await this.checkGameCompletion(client, userId);
      
      await client.query('COMMIT');
      
      // Retornar el progreso actualizado
      return await this.getUserProgress(userId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Actualizar total de estrellas del nivel
  static async updateLevelTotalStars(client, userId, levelId) {
    // Calcular total de estrellas del usuario en este nivel
    const starsResult = await client.query(`
      SELECT COALESCE(SUM(upp.stars), 0) as total_stars
      FROM user_puzzle_progress upp
      JOIN puzzles p ON upp.puzzle_id = p.id
      WHERE upp.user_id = $1 AND p.level_id = $2
    `, [userId, levelId]);
    
    const totalStars = parseInt(starsResult.rows[0].total_stars) || 0;
    
    // Actualizar el total de estrellas del nivel
    await client.query(`
      UPDATE user_level_progress 
      SET total_stars = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND level_id = $3
    `, [totalStars, userId, levelId]);
    
    // También actualizar el total general del usuario
    await this.updateUserTotalStars(client, userId);
  }
  
  // Actualizar total de estrellas del usuario
  static async updateUserTotalStars(client, userId) {
    const totalStarsResult = await client.query(`
      SELECT COALESCE(SUM(total_stars), 0) as total_stars
      FROM user_level_progress 
      WHERE user_id = $1
    `, [userId]);
    
    const totalStars = parseInt(totalStarsResult.rows[0].total_stars) || 0;
    
    await client.query(`
      UPDATE user_progress 
      SET total_stars = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [totalStars, userId]);
  }
  
  // Verificar si el juego está completamente terminado
  static async checkGameCompletion(client, userId) {
    // Obtener total de niveles
    const totalLevelsResult = await client.query('SELECT COUNT(*) as total FROM game_levels');
    const totalLevels = parseInt(totalLevelsResult.rows[0].total);
    
    // Si no hay niveles, no hacer nada
    if (totalLevels === 0) {
      return;
    }
    
    // Obtener niveles completados del usuario
    const completedLevelsResult = await client.query(`
      SELECT COUNT(*) as completed 
      FROM user_completed_levels 
      WHERE user_id = $1
    `, [userId]);
    
    const completedLevels = parseInt(completedLevelsResult.rows[0].completed);
    
    // Solo marcar como completado si hay niveles y se han completado todos
    if (completedLevels === totalLevels && totalLevels > 0) {
      // Verificar si ya está marcado como completado
      const completionResult = await client.query(`
        SELECT game_completed, completion_code 
        FROM user_progress 
        WHERE user_id = $1
      `, [userId]);
      
      if (completionResult.rows.length > 0 && !completionResult.rows[0].game_completed) {
        // Generar código único de finalización
        const completionCode = this.generateCompletionCode(userId);
        
        // Obtener información de la recompensa final (calcular desde puzzles)
        const starsResult = await client.query(`
          SELECT COALESCE(SUM(upp.stars), 0) as total_stars
          FROM user_puzzle_progress upp
          WHERE upp.user_id = $1
        `, [userId]);
        
        const totalStars = parseInt(starsResult.rows[0]?.total_stars) || 0;
        
        // Determinar recompensa basada en estrellas
        let rewardId = null;
        let rewardDiscount = 0;
        
        if (totalStars >= 40) {
          rewardId = 'discount_40';
          rewardDiscount = 8;
        } else if (totalStars >= 30) {
          rewardId = 'discount_30';
          rewardDiscount = 5;
        } else if (totalStars >= 20) {
          rewardId = 'discount_20';
          rewardDiscount = 3;
        } else if (totalStars >= 10) {
          rewardId = 'discount_10';
          rewardDiscount = 100;
        }
        
        // Marcar juego como completado
        await client.query(`
          UPDATE user_progress 
          SET 
            game_completed = true,
            completion_code = $1,
            completion_reward_id = $2,
            completion_reward_discount = $3,
            completed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $4
        `, [completionCode, rewardId, rewardDiscount, userId]);
        
        console.log(`🎉 Usuario ${userId} completó el juego! Código: ${completionCode}`);
      }
    }
  }
  
  // Generar código único de finalización
  static generateCompletionCode(userId) {
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    const userSuffix = userId.toString().padStart(3, '0'); // ID del usuario con padding
    return `USB${timestamp}${userSuffix}`;
  }
  
  // Verificar si un nivel está completado
  static async checkLevelCompletion(client, userId, levelId) {
    // Obtener total de puzzles del nivel
    const totalPuzzlesResult = await client.query(`
      SELECT COUNT(*) as total FROM puzzles WHERE level_id = $1
    `, [levelId]);
    
    const totalPuzzles = parseInt(totalPuzzlesResult.rows[0].total);
    
    // Obtener puzzles completados del usuario en este nivel
    const completedPuzzlesResult = await client.query(`
      SELECT COUNT(*) as completed 
      FROM user_puzzle_progress upp
      JOIN puzzles p ON upp.puzzle_id = p.id
      WHERE upp.user_id = $1 AND p.level_id = $2 AND upp.is_completed = true
    `, [userId, levelId]);
    
    const completedPuzzles = parseInt(completedPuzzlesResult.rows[0].completed);
    
    // Si todos los puzzles están completados, marcar nivel como completado
    if (completedPuzzles === totalPuzzles) {
      await client.query(`
        UPDATE user_level_progress 
        SET is_completed = true, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND level_id = $2
      `, [userId, levelId]);
      
      // Agregar a niveles completados
      await client.query(`
        INSERT INTO user_completed_levels (user_id, level_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, level_id) DO NOTHING
      `, [userId, levelId]);
      
      // Actualizar nivel actual del usuario
      const levelOrder = ['mercadeo', 'registroAcademico', 'facultades', 'bienestar', 'cartera'];
      const currentIndex = levelOrder.indexOf(levelId);
      if (currentIndex < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentIndex + 1];
        await client.query(`
          UPDATE user_progress 
          SET current_level = $1, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2
        `, [nextLevel, userId]);
      }
    }
  }
  
  // Obtener siguiente puzzle disponible
  static async getNextPuzzle(userId, levelId) {
    // Obtener información del nivel
    const levelResult = await query(`
      SELECT * FROM game_levels WHERE id = $1
    `, [levelId]);
    
    if (levelResult.rows.length === 0) {
      throw new Error('Nivel no encontrado');
    }
    
    const level = levelResult.rows[0];
    
    // Obtener progreso del nivel
    const levelProgressResult = await query(`
      SELECT is_completed FROM user_level_progress 
      WHERE user_id = $1 AND level_id = $2
    `, [userId, levelId]);
    
    const isLevelCompleted = levelProgressResult.rows.length > 0 && levelProgressResult.rows[0].is_completed;
    
    if (isLevelCompleted) {
      return {
        levelCompleted: true,
        message: 'Este nivel ya fue completado completamente'
      };
    }
    
    // Obtener puzzles del nivel ordenados
    const puzzlesResult = await query(`
      SELECT * FROM puzzles 
      WHERE level_id = $1 AND is_active = true
      ORDER BY order_number
    `, [levelId]);
    
    // Obtener progreso de puzzles del usuario
    const puzzleProgressResult = await query(`
      SELECT puzzle_id, is_completed FROM user_puzzle_progress 
      WHERE user_id = $1 AND puzzle_id = ANY($2)
    `, [userId, puzzlesResult.rows.map(p => p.id)]);
    
    const completedPuzzles = {};
    puzzleProgressResult.rows.forEach(row => {
      completedPuzzles[row.puzzle_id] = row.is_completed;
    });
    
    // Encontrar siguiente puzzle no completado
    const nextPuzzle = puzzlesResult.rows.find(puzzle => !completedPuzzles[puzzle.id]);
    
    if (!nextPuzzle) {
      // Todos los puzzles están completados, marcar nivel como completado
      const client = await getClient();
      try {
        await client.query('BEGIN');
        await this.checkLevelCompletion(client, userId, levelId);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
      return {
        levelCompleted: true,
        message: 'Todos los puzzles de este nivel han sido completados'
      };
    }
    
    const puzzleIndex = puzzlesResult.rows.findIndex(p => p.id === nextPuzzle.id);
    
    return {
      levelCompleted: false,
      nextPuzzle: {
        id: nextPuzzle.id,
        type: nextPuzzle.type,
        title: nextPuzzle.title,
        description: nextPuzzle.description,
        difficulty: nextPuzzle.difficulty,
        maxStars: nextPuzzle.max_stars,
        puzzleData: nextPuzzle.puzzle_data
      },
      puzzleIndex,
      totalPuzzles: puzzlesResult.rows.length
    };
  }
  
  // Obtener estado de nivel
  static async getLevelStatus(userId, levelId) {
    const result = await query(`
      SELECT 
        ulp.is_completed,
        ulp.total_stars,
        COUNT(upp.puzzle_id) as completed_puzzles
      FROM user_level_progress ulp
      LEFT JOIN user_puzzle_progress upp ON ulp.user_id = upp.user_id 
        AND upp.is_completed = true
      LEFT JOIN puzzles p ON upp.puzzle_id = p.id AND p.level_id = ulp.level_id
      WHERE ulp.user_id = $1 AND ulp.level_id = $2
      GROUP BY ulp.is_completed, ulp.total_stars
    `, [userId, levelId]);
    
    if (result.rows.length === 0) {
      return {
        isLocked: false,
        isCompleted: false,
        canPlay: true,
        completedPuzzles: 0,
        totalStars: 0
      };
    }
    
    const row = result.rows[0];
    return {
      isLocked: row.is_completed,
      isCompleted: row.is_completed,
      canPlay: !row.is_completed,
      completedPuzzles: parseInt(row.completed_puzzles),
      totalStars: row.total_stars || 0
    };
  }
  
  // Obtener estadísticas del usuario
  static async getUserStats(userId) {
    const result = await query(`
      SELECT 
        total_stars,
        completed_levels_count,
        completed_puzzles_count,
        achievements_count
      FROM user_progress_complete 
      WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return {
        totalStars: 0,
        completedLevels: 0,
        totalLevels: 5,
        completionPercentage: 0,
        averageStars: 0
      };
    }
    
    const row = result.rows[0];
    return {
      totalStars: row.total_stars || 0,
      completedLevels: row.completed_levels_count || 0,
      totalLevels: 5,
      completionPercentage: Math.round(((row.completed_levels_count || 0) / 5) * 100),
      averageStars: row.total_stars > 0 ? 
        Math.round((row.total_stars / Math.max(row.completed_puzzles_count, 1)) * 10) / 10 : 0
    };
  }
}

module.exports = ProgressService;

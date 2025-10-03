const { query, getClient } = require('../config/database');

class RewardService {
  
  // Obtener catálogo de recompensas
  static async getRewardsCatalog() {
    const result = await query(`
      SELECT 
        id, name, description, type, reward_category, 
        required_stars, discount_percentage, is_active
      FROM rewards_catalog 
      WHERE is_active = true
      ORDER BY required_stars
    `);
    
    const virtual = result.rows
      .filter(row => row.type === 'virtual')
      .map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        type: row.type,
        requiredStars: row.required_stars,
        discountPercentage: row.discount_percentage
      }));
    
    const physical = result.rows
      .filter(row => row.type === 'physical')
      .map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        type: row.type,
        requiredStars: row.required_stars,
        discountPercentage: row.discount_percentage
      }));
    
    return { virtual, physical };
  }
  
  // Obtener recompensas del usuario
  static async getUserRewards(userId) {
    const result = await query(`
      SELECT 
        ur.id,
        ur.reward_id,
        ur.reward_type,
        ur.status,
        ur.completion_code,
        ur.claimed_at,
        ur.expires_at,
        rc.name,
        rc.description,
        rc.discount_percentage
      FROM user_rewards ur
      JOIN rewards_catalog rc ON ur.reward_id = rc.id
      WHERE ur.user_id = $1
      ORDER BY ur.claimed_at DESC
    `, [userId]);
    
    const virtualRewards = result.rows
      .filter(row => row.reward_type === 'virtual')
      .map(row => ({
        id: row.reward_id,
        name: row.name,
        description: row.description,
        type: 'discount',
        requiredStars: 0, // Se puede obtener del catálogo si es necesario
        discountPercentage: row.discount_percentage,
        claimedAt: row.claimed_at,
        status: row.status,
        completionCode: row.completion_code
      }));
    
    const physicalRewards = result.rows
      .filter(row => row.reward_type === 'physical')
      .map(row => ({
        id: row.reward_id,
        name: row.name,
        description: row.description,
        claimedAt: row.claimed_at,
        status: row.status,
        completionCode: row.completion_code
      }));
    
    // Obtener total de estrellas del usuario calculadas desde puzzles
    const starsResult = await query(`
      SELECT COALESCE(SUM(upp.stars), 0) as total_stars
      FROM user_puzzle_progress upp
      WHERE upp.user_id = $1
    `, [userId]);
    
    const totalStars = parseInt(starsResult.rows[0].total_stars) || 0;
    
    // Obtener recompensas disponibles
    const availableRewards = await this.getAvailableRewards(userId, totalStars);
    
    return {
      userId: parseInt(userId),
      virtualRewards,
      physicalRewards,
      totalStars,
      availableRewards
    };
  }
  
  // Verificar recompensas disponibles
  static async getAvailableRewards(userId, totalStars) {
    // Obtener recompensas del catálogo que el usuario puede reclamar
    const catalogResult = await query(`
      SELECT 
        id, name, description, type, reward_category, 
        required_stars, discount_percentage
      FROM rewards_catalog 
      WHERE is_active = true AND required_stars <= $1
      ORDER BY required_stars
    `, [totalStars]);
    
    // Obtener recompensas ya reclamadas por el usuario
    const claimedResult = await query(`
      SELECT reward_id FROM user_rewards WHERE user_id = $1
    `, [userId]);
    
    const claimedRewardIds = new Set(claimedResult.rows.map(row => row.reward_id));
    
    // Filtrar recompensas no reclamadas
    const availableRewards = catalogResult.rows
      .filter(row => !claimedRewardIds.has(row.id))
      .map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        type: row.type,
        requiredStars: row.required_stars,
        discountPercentage: row.discount_percentage
      }));
    
    return availableRewards;
  }
  
  // Verificar disponibilidad de recompensas
  static async checkRewardAvailability(userId, totalStars) {
    const availableRewards = await this.getAvailableRewards(userId, totalStars);
    
    const availableVirtual = availableRewards.filter(r => r.type === 'virtual');
    const availablePhysical = availableRewards.filter(r => r.type === 'physical');
    
    return {
      availableVirtual,
      availablePhysical,
      totalAvailable: availableRewards.length
    };
  }
  
  // Reclamar recompensa virtual
  static async claimVirtualReward(userId, rewardId) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que la recompensa existe y está disponible
      const rewardResult = await client.query(`
        SELECT * FROM rewards_catalog 
        WHERE id = $1 AND type = 'virtual' AND is_active = true
      `, [rewardId]);
      
      if (rewardResult.rows.length === 0) {
        throw new Error('Recompensa no encontrada');
      }
      
      const reward = rewardResult.rows[0];
      
      // Verificar que el usuario tiene suficientes estrellas (calculadas desde puzzles)
      const userStarsResult = await client.query(`
        SELECT COALESCE(SUM(upp.stars), 0) as total_stars
        FROM user_puzzle_progress upp
        WHERE upp.user_id = $1
      `, [userId]);
      
      const userStars = parseInt(userStarsResult.rows[0].total_stars) || 0;
      
      if (userStars < reward.required_stars) {
        throw new Error('No tienes suficientes estrellas para esta recompensa');
      }
      
      // Verificar que no haya sido reclamada
      const existingResult = await client.query(`
        SELECT id FROM user_rewards 
        WHERE user_id = $1 AND reward_id = $2
      `, [userId, rewardId]);
      
      if (existingResult.rows.length > 0) {
        throw new Error('Recompensa ya reclamada');
      }
      
      // Generar código de recompensa único
      const completionCode = this.generateCompletionCode();
      
      // Reclamar recompensa
      await client.query(`
        INSERT INTO user_rewards 
        (user_id, reward_id, reward_type, status, completion_code, claimed_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId, 
        rewardId, 
        'virtual', 
        'claimed', 
        completionCode, 
        new Date()
      ]);
      
      await client.query('COMMIT');
      
      return {
        rewardId,
        rewardName: reward.name,
        rewardDescription: reward.description,
        discountPercentage: reward.discount_percentage,
        completionCode,
        claimedAt: new Date()
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Solicitar recompensa física
  static async requestPhysicalReward(userId, rewardId, requestData) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Verificar que la recompensa existe y está disponible
      const rewardResult = await client.query(`
        SELECT * FROM rewards_catalog 
        WHERE id = $1 AND type = 'physical' AND is_active = true
      `, [rewardId]);
      
      if (rewardResult.rows.length === 0) {
        throw new Error('Recompensa física no encontrada');
      }
      
      const reward = rewardResult.rows[0];
      
      // Verificar que el usuario tiene suficientes estrellas (calculadas desde puzzles)
      const userStarsResult = await client.query(`
        SELECT COALESCE(SUM(upp.stars), 0) as total_stars
        FROM user_puzzle_progress upp
        WHERE upp.user_id = $1
      `, [userId]);
      
      const userStars = parseInt(userStarsResult.rows[0].total_stars) || 0;
      
      if (userStars < reward.required_stars) {
        throw new Error('No tienes suficientes estrellas para esta recompensa');
      }
      
      // Verificar que no haya sido solicitada
      const existingResult = await client.query(`
        SELECT id FROM user_rewards 
        WHERE user_id = $1 AND reward_id = $2
      `, [userId, rewardId]);
      
      if (existingResult.rows.length > 0) {
        throw new Error('Recompensa ya solicitada');
      }
      
      // Crear solicitud de recompensa física
      await client.query(`
        INSERT INTO user_rewards 
        (user_id, reward_id, reward_type, status, completion_code, claimed_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        userId, 
        rewardId, 
        'physical', 
        'requested', 
        null, // Los códigos se generan cuando se entregan
        new Date()
      ]);
      
      await client.query('COMMIT');
      
      return {
        rewardId,
        rewardName: reward.name,
        rewardDescription: reward.description,
        status: 'requested',
        requestedAt: new Date(),
        message: 'Solicitud de recompensa física enviada exitosamente'
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Generar código de recompensa único
  static generateCompletionCode() {
    const prefix = 'USB';
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // 5 dígitos
    return `${prefix}${randomNumber}`;
  }
  
  // Obtener mejor recompensa disponible
  static async getBestAvailableReward(userId) {
    const userRewards = await this.getUserRewards(userId);
    const availableRewards = userRewards.availableRewards;
    
    if (availableRewards.length === 0) {
      return null;
    }
    
    // Ordenar por porcentaje de descuento descendente
    const sortedRewards = availableRewards
      .filter(reward => reward.type === 'virtual')
      .sort((a, b) => b.discountPercentage - a.discountPercentage);
    
    return sortedRewards.length > 0 ? sortedRewards[0] : null;
  }
}

module.exports = RewardService;

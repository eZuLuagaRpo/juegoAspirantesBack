const { query, getClient } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  
  // Crear usuario
  static async createUser(userData) {
    const { email, password, firstName, lastName, phone, studentId } = userData;
    
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Crear usuario
      const result = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, name, phone, student_id, role, is_first_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, first_name, last_name, name, phone, student_id, role, created_at, is_first_login
      `, [
        email, 
        hashedPassword, 
        firstName, 
        lastName, 
        `${firstName} ${lastName}`, 
        phone, 
        studentId, 
        'student', 
        true
      ]);
      
      const user = result.rows[0];
      
      // Crear progreso inicial del usuario
      await client.query(`
        INSERT INTO user_progress (user_id, current_level, total_stars, achievements, last_played)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, 'mercadeo', 0, [], new Date()]);
      
      await client.query('COMMIT');
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: user.name,
        phone: user.phone,
        studentId: user.student_id,
        role: user.role,
        createdAt: user.created_at,
        isFirstLogin: user.is_first_login
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Buscar usuario por email
  static async getUserByEmail(email) {
    const result = await query(`
      SELECT id, email, password_hash, first_name, last_name, name, phone, student_id, role, created_at, is_first_login
      FROM users 
      WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password_hash,
      firstName: user.first_name,
      lastName: user.last_name,
      name: user.name,
      phone: user.phone,
      studentId: user.student_id,
      role: user.role,
      createdAt: user.created_at,
      isFirstLogin: user.is_first_login
    };
  }
  
  // Buscar usuario por ID
  static async getUserById(userId) {
    const result = await query(`
      SELECT id, email, first_name, last_name, name, phone, student_id, role, created_at, is_first_login
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: user.name,
      phone: user.phone,
      studentId: user.student_id,
      role: user.role,
      createdAt: user.created_at,
      isFirstLogin: user.is_first_login
    };
  }
  
  // Verificar si email existe
  static async emailExists(email) {
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }
  
  // Verificar si student_id existe
  static async studentIdExists(studentId) {
    const result = await query('SELECT id FROM users WHERE student_id = $1', [studentId]);
    return result.rows.length > 0;
  }
  
  // Verificar si phone existe
  static async phoneExists(phone) {
    const result = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    return result.rows.length > 0;
  }
  
  // Actualizar primer login
  static async updateFirstLogin(userId) {
    await query(`
      UPDATE users 
      SET is_first_login = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [userId]);
  }
  
  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserService;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simulación de base de datos de usuarios (en producción usar PostgreSQL)
let users = new Map();
let usersByStudentId = new Map(); // Mapa adicional para verificar duplicados por studentId
let usersByPhone = new Map(); // Mapa adicional para verificar duplicados por teléfono

// Registro de usuario
router.post('/register', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellidos requeridos'),
  body('phone')
    .notEmpty().withMessage('Número de celular requerido')
    .isLength({ min: 10, max: 10 }).withMessage('Número de celular debe tener exactamente 10 dígitos')
    .isNumeric().withMessage('Número de celular debe contener solo números'),
  body('studentId')
    .notEmpty().withMessage('Documento de identidad requerido')
    .isLength({ min: 6, max: 12 }).withMessage('Documento de identidad debe tener entre 6 y 12 dígitos')
    .isNumeric().withMessage('Documento de identidad debe contener solo números')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { email, password, firstName, lastName, phone, studentId } = req.body;
    
    // Verificar si el email ya existe
    if (users.has(email)) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este email'
      });
    }
    
    // Verificar si el número de identificación ya existe
    if (usersByStudentId.has(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este número de identificación'
      });
    }
    
    // Verificar si el número de celular ya existe
    if (usersByPhone.has(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este número de celular'
      });
    }
    
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    
    // Crear usuario
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`, // Mantener compatibilidad con el campo name
      phone,
      studentId,
      createdAt: new Date().toISOString(),
      role: 'student',
      isFirstLogin: true
    };
    
    // Guardar usuario en todos los mapas
    users.set(email, user);
    usersByStudentId.set(studentId, user);
    usersByPhone.set(phone, user);
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'usbmeda_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          phone: user.phone,
          studentId: user.studentId,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en el registro'
    });
  }
});

// Login de usuario
router.post('/login', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    // Buscar usuario
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Marcar que ya no es el primer login si lo era
    const wasFirstLogin = user.isFirstLogin;
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'usbmeda_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          phone: user.phone,
          studentId: user.studentId,
          role: user.role,
          createdAt: user.createdAt,
          isFirstLogin: user.isFirstLogin // Usar el valor actualizado
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en el login'
    });
  }
});

// Verificar token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'usbmeda_secret_key');
    
    // Buscar usuario
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          phone: user.phone,
          studentId: user.studentId,
          role: user.role,
          createdAt: user.createdAt,
          isFirstLogin: user.isFirstLogin
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
});

// Marcar que el usuario ya no es primer login
router.post('/mark-first-login-complete/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar usuario por ID
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Marcar como no primer login
    user.isFirstLogin = false;
    
    // Actualizar en ambos mapas
    users.set(user.email, user);
    usersByStudentId.set(user.studentId, user);
    
    res.json({
      success: true,
      message: 'Primer login marcado como completado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error marcando primer login'
    });
  }
});

// Verificar si un número de identificación ya existe
router.get('/check-student-id/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (usersByStudentId.has(studentId)) {
      return res.json({
        success: true,
        exists: true,
        message: 'Este número de identificación ya está registrado'
      });
    }
    
    res.json({
      success: true,
      exists: false,
      message: 'Número de identificación disponible'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error verificando número de identificación'
    });
  }
});

// Verificar si un número de celular ya existe
router.get('/check-phone/:phone', (req, res) => {
  try {
    const { phone } = req.params;
    
    if (usersByPhone.has(phone)) {
      return res.json({
        success: true,
        exists: true,
        message: 'Este número de celular ya está registrado'
      });
    }
    
    res.json({
      success: true,
      exists: false,
      message: 'Número de celular disponible'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error verificando número de celular'
    });
  }
});

// Obtener perfil del usuario
router.get('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          phone: user.phone,
          studentId: user.studentId,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    });
  }
});

// Enviar código de recompensa por email
router.post('/send-reward-code', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('completionCode').notEmpty().withMessage('Código de recompensa requerido'),
  body('rewardTitle').notEmpty().withMessage('Título de recompensa requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, firstName, completionCode, rewardTitle, discountPercentage } = req.body;
    
    // Importar el servicio de email
    const { sendRewardEmail } = require('../services/emailService');
    
    // Determinar el porcentaje de descuento basado en el título de la recompensa
    let discount = 0;
    if (rewardTitle.includes('100%') || rewardTitle.includes('Inscripción Gratuita')) {
      discount = 100;
    } else if (rewardTitle.includes('8%')) {
      discount = 8;
    } else if (rewardTitle.includes('5%')) {
      discount = 5;
    } else if (rewardTitle.includes('3%')) {
      discount = 3;
    }

    // Enviar email
    const result = await sendRewardEmail(email, firstName, completionCode, rewardTitle, discount);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Código enviado por correo exitosamente',
        data: {
          messageId: result.messageId,
          email: email,
          rewardTitle: rewardTitle
        }
      });
    } else {
      console.error('Error enviando email:', result.error);
      res.status(500).json({
        success: false,
        error: 'Error enviando email: ' + result.error
      });
    }
  } catch (error) {
    console.error('Error en endpoint de envío de email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

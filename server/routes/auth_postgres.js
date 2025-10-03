const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const UserService = require('../services/userService');
const { sendRewardEmail } = require('../services/emailService');

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
], async (req, res) => {
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
    const emailExists = await UserService.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este email'
      });
    }
    
    // Verificar si el número de identificación ya existe
    const studentIdExists = await UserService.studentIdExists(studentId);
    if (studentIdExists) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este número de identificación'
      });
    }
    
    // Verificar si el número de celular ya existe
    const phoneExists = await UserService.phoneExists(phone);
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un usuario con este número de celular'
      });
    }
    
    // Crear usuario
    const user = await UserService.createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      studentId
    });
    
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
          createdAt: user.createdAt,
          isFirstLogin: user.isFirstLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
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
], async (req, res) => {
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
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isValidPassword = await UserService.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Marcar que ya no es el primer login si lo era
    const wasFirstLogin = user.isFirstLogin;
    if (user.isFirstLogin) {
      await UserService.updateFirstLogin(user.id);
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
          isFirstLogin: wasFirstLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el login'
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
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
    const user = await UserService.getUserById(decoded.userId);
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
    console.error('Error verificando token:', error);
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
});

// Obtener perfil del usuario
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await UserService.getUserById(userId);
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
          createdAt: user.createdAt,
          isFirstLogin: user.isFirstLogin
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil'
    });
  }
});

// Verificar disponibilidad de student ID
router.get('/check-student-id/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId || studentId.length < 6) {
      return res.json({
        exists: false,
        message: 'Student ID muy corto'
      });
    }
    
    const exists = await UserService.studentIdExists(studentId);
    
    res.json({
      exists,
      message: exists ? 'Student ID ya registrado' : 'Student ID disponible'
    });
  } catch (error) {
    console.error('Error verificando student ID:', error);
    res.status(500).json({
      exists: false,
      error: 'Error verificando student ID'
    });
  }
});

// Verificar disponibilidad de teléfono
router.get('/check-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone || phone.length !== 10) {
      return res.json({
        exists: false,
        message: 'Teléfono inválido'
      });
    }
    
    const exists = await UserService.phoneExists(phone);
    
    res.json({
      exists,
      message: exists ? 'Teléfono ya registrado' : 'Teléfono disponible'
    });
  } catch (error) {
    console.error('Error verificando teléfono:', error);
    res.status(500).json({
      exists: false,
      error: 'Error verificando teléfono'
    });
  }
});

// Marcar primer login como completado
router.post('/mark-first-login-complete/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
    }
    
    await UserService.updateFirstLogin(userId);
    
    res.json({
      success: true,
      message: 'Primer login marcado como completado'
    });
  } catch (error) {
    console.error('Error marcando primer login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar primer login como completado'
    });
  }
});

// Enviar código de recompensa por email
router.post('/send-reward-code', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('completionCode').notEmpty().withMessage('Código de recompensa requerido'),
  body('rewardTitle').notEmpty().withMessage('Título de recompensa requerido'),
  body('discountPercentage').isInt({ min: 0, max: 100 }).withMessage('Porcentaje de descuento inválido')
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
    
    // Enviar email
    const result = await sendRewardEmail(email, firstName, completionCode, rewardTitle, discountPercentage);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Código enviado por correo exitosamente',
        data: {
          messageId: result.messageId,
          email: email,
          rewardTitle: rewardTitle,
          completionCode: completionCode
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Error enviando el email'
      });
    }
  } catch (error) {
    console.error('Error enviando código:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando el código de recompensa'
    });
  }
});

module.exports = router;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Hash, CheckCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [studentIdError, setStudentIdError] = useState('');
  const [isCheckingStudentId, setIsCheckingStudentId] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const checkStudentIdAvailability = async (studentId) => {
    if (studentId.length < 6) {
      setStudentIdError('');
      return;
    }
    
    setIsCheckingStudentId(true);
    setStudentIdError('');
    
    try {
      const response = await fetch(`/api/auth/check-student-id/${studentId}`);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        setIsCheckingStudentId(false);
        return;
      }
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setIsCheckingStudentId(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setStudentIdError('Este número de identificación ya está registrado');
      } else {
        setStudentIdError('');
      }
    } catch (error) {
      // Error silencioso - no afecta el registro
    } finally {
      setIsCheckingStudentId(false);
    }
  };

  const checkPhoneAvailability = async (phone) => {
    if (phone.length < 10) {
      setPhoneError('');
      return;
    }
    
    setIsCheckingPhone(true);
    setPhoneError('');
    
    try {
      const response = await fetch(`/api/auth/check-phone/${phone}`);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        setIsCheckingPhone(false);
        return;
      }
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setIsCheckingPhone(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setPhoneError('Este número de celular ya está registrado');
      } else {
        setPhoneError('');
      }
    } catch (error) {
      // Error silencioso - no afecta el registro
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Para campos numéricos, solo permitir números
    if (name === 'studentId' || name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // Para studentId, verificar disponibilidad después de un pequeño delay
      if (name === 'studentId' && numericValue.length >= 6) {
        const timeoutId = setTimeout(() => {
          checkStudentIdAvailability(numericValue);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      } else if (name === 'studentId') {
        setStudentIdError('');
      }
      
      // Para phone, verificar disponibilidad después de un pequeño delay
      if (name === 'phone' && numericValue.length === 10) {
        const timeoutId = setTimeout(() => {
          checkPhoneAvailability(numericValue);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      } else if (name === 'phone') {
        setPhoneError('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      toast.error('Los apellidos son requeridos');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast.error('El número de celular es requerido');
      return false;
    }
    
    // Validar formato del número de celular (solo números y longitud)
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      toast.error('El número de celular debe tener exactamente 10 dígitos');
      return false;
    }
    
    if (!formData.studentId.trim()) {
      toast.error('El documento de identidad es requerido');
      return false;
    }
    
    // Validar formato del documento de identidad (solo números)
    if (!/^\d+$/.test(formData.studentId.trim())) {
      toast.error('El documento de identidad debe contener solo números');
      return false;
    }
    
    // Validar longitud del documento de identidad
    if (formData.studentId.trim().length < 6 || formData.studentId.trim().length > 12) {
      toast.error('El documento de identidad debe tener entre 6 y 12 dígitos');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    
    if (!agreedToTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return false;
    }
    
    if (studentIdError) {
      toast.error(studentIdError);
      return false;
    }
    
    if (phoneError) {
      toast.error(phoneError);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        studentId: formData.studentId.trim(),
        password: formData.password
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Aprende sobre procesos de inscripción de manera divertida',
    'Gana estrellas y desbloquea nuevos niveles',
    'Obtén recompensas virtuales y físicas',
    'Únete a la comunidad estudiantil USB',
    'Preparación completa para tu vida universitaria'
  ];

  return (
    <div className="min-h-screen bg-usb-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo y título */}
        <div className="text-center">
          <div className="mx-auto w-20 h-28 header-gradient rounded-full flex items-center justify-center mb-4 usb-shadow">
            <img src="/logo.png" alt="USB Logo" className="w-14 h-20 object-contain" />
          </div>
          <h2 className="text-3xl font-bold usb-dark font-display">
            ¡Únete a la aventura!
          </h2>
            <p className="mt-2 text-sm usb-light">
              Crea tu cuenta y comienza a aprender jugando.
            </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-usb-white py-8 px-4 usb-shadow-lg rounded-xl border border-usb-gray-200 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo de nombre */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium usb-dark mb-2">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-usb-gray-300 placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:ring-usb-orange-500 focus:border-usb-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Campo de apellidos */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium usb-dark mb-2">
                Apellidos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-usb-gray-300 placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:ring-usb-orange-500 focus:border-usb-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Tus apellidos"
                />
              </div>
            </div>

            {/* Campo de email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium usb-dark mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-usb-gray-300 placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:ring-usb-orange-500 focus:border-usb-orange-500 focus:z-10 sm:text-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Campo de número de celular */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium usb-dark mb-2">
                Número de Celular
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:z-10 sm:text-sm ${
                    phoneError 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-usb-gray-300 focus:ring-usb-orange-500 focus:border-usb-orange-500'
                  }`}
                  placeholder="3001234567"
                />
                {isCheckingPhone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-usb-orange-500"></div>
                  </div>
                )}
              </div>
              {phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
              <p className="mt-1 text-xs usb-light">
                10 dígitos, solo números
              </p>
            </div>

            {/* Campo de Documento de identidad */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium usb-dark mb-2">
                Documento de identidad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  autoComplete="off"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  maxLength={12}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:z-10 sm:text-sm ${
                    studentIdError 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-usb-gray-300 focus:ring-usb-orange-500 focus:border-usb-orange-500'
                  }`}
                  placeholder="1234567890"
                />
                {isCheckingStudentId && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-usb-orange-500"></div>
                  </div>
                )}
              </div>
              {studentIdError && (
                <p className="mt-1 text-sm text-red-600">{studentIdError}</p>
              )}
              <p className="mt-1 text-xs usb-light">
                Entre 6 y 12 dígitos, solo números
              </p>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium usb-dark mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-usb-gray-300 placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:ring-usb-orange-500 focus:border-usb-orange-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 usb-light hover:text-usb-orange-500" />
                  ) : (
                    <Eye className="h-5 w-5 usb-light hover:text-usb-orange-500" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs usb-light">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Campo de confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium usb-dark mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 usb-light" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-usb-gray-300 placeholder-usb-gray-400 usb-dark rounded-lg focus:outline-none focus:ring-usb-orange-500 focus:border-usb-orange-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 usb-light hover:text-usb-orange-500" />
                  ) : (
                    <Eye className="h-5 w-5 usb-light hover:text-usb-orange-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-usb-orange-500 focus:ring-usb-orange-500 border-usb-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="usb-dark">
                  Acepto los{' '}
                  <a href="#" className="font-medium text-usb-orange-500 hover:text-usb-orange-600">
                    Términos de Servicio
                  </a>{' '}
                  y la{' '}
                  <a href="#" className="font-medium text-usb-orange-500 hover:text-usb-orange-600">
                    Política de Privacidad
                  </a>
                </label>
              </div>
            </div>

            {/* Botón de envío */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-usb-white mr-2"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>


      {/* Información adicional */}
      <div className="mt-8 text-center">
        <p className="text-sm usb-light">
          Al crear una cuenta, aceptas nuestros términos y condiciones. 
          Tu información está segura con nosotros.
        </p>
      </div>
    </div>
  );
};

export default Register;

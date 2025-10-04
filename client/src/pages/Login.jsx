import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-usb-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo y título */}
        <div className="text-center">
          <div className="mx-auto w-20 h-28 header-gradient rounded-full flex items-center justify-center mb-4 usb-shadow">
            <img src="/logo.png" alt="USB Logo" className="w-14 h-20 object-contain" />
          </div>
          <h2 className="text-3xl font-bold usb-dark font-display">
            ¡Bienvenido de vuelta!
          </h2>
            <p className="mt-2 text-sm usb-light">
              Continúa tu aventura educativa en la USB Medellín.
            </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-usb-white py-8 px-4 usb-shadow-lg rounded-xl border border-usb-gray-200 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
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
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 text-center">
        <p className="text-sm usb-light">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="#" className="font-medium text-usb-orange-500 hover:text-usb-orange-600">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="#" className="font-medium text-usb-orange-500 hover:text-usb-orange-600">
            Política de Privacidad
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configurar axios con interceptor para token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/auth/verify');
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      
      if (error.response?.status === 429) {
        // Rate limit - reintentar después de 5 segundos
        setTimeout(() => {
          verifyToken();
        }, 5000);
        return;
      }
      
      // Error de autenticación - hacer logout
      if (error.response?.status === 401) {
        console.warn('Token inválido o expirado, limpiando sesión');
        logout();
      } else {
        console.error('Error verificando token:', error.message);
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      
      const { user: userData, token: userToken } = response.data.data;
      
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      toast.success('¡Bienvenido de vuelta!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error en el login';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      
      const { user: newUser, token: userToken } = response.data.data;
      
      setUser(newUser);
      setToken(userToken);
      localStorage.setItem('token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      toast.success('¡Registro exitoso! Bienvenido al juego');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Error en el registro';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Sesión cerrada exitosamente');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      // Aquí implementarías la actualización del perfil
      // Por ahora solo simulamos
      setUser(prev => ({ ...prev, ...profileData }));
      toast.success('Perfil actualizado exitosamente');
      return { success: true };
    } catch (error) {
      toast.error('Error actualizando perfil');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

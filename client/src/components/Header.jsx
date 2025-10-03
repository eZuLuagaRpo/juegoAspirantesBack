import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  Menu, 
  X, 
  User, 
  Trophy, 
  LogOut,
  Home,
  BarChart3
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { userProgress } = useGame();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-usb-white shadow-lg border-b border-usb-gray-200">
      <div className="responsive-container">
        <div className="flex justify-between items-center h-12 sm:h-14">
          {/* Logo y título */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-9 sm:w-8 sm:h-10 header-gradient rounded-md flex items-center justify-center usb-shadow">
              <img src="/logo.png" alt="USB Logo" className="w-4 h-6 sm:w-5 sm:h-7 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold usb-dark font-display">
                USB Medellín
              </h1>
              <p className="text-xs usb-light">Juego Educativo</p>
            </div>
          </Link>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="usb-light hover:text-usb-orange-500 px-2 py-1 rounded-md text-sm font-medium transition-colors"
            >
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="usb-light hover:text-usb-orange-500 px-2 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/rewards" 
                  className="usb-light hover:text-usb-orange-500 px-2 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Recompensas
                </Link>
              </>
            )}
          </nav>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Centro de notificaciones */}
                <NotificationCenter userProgress={userProgress} />
                
                <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-1.5 bg-usb-gray-100 hover:bg-usb-gray-200 px-2 py-1.5 rounded-md transition-colors"
                >
                  <User className="w-4 h-4 usb-light" />
                  <span className="hidden sm:block text-sm font-medium usb-dark">
                    {user?.name}
                  </span>
                </button>

                {/* Menú desplegable */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-usb-white rounded-lg usb-shadow-lg border border-usb-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm usb-dark hover:bg-usb-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </Link>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm usb-dark hover:bg-usb-gray-100 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/rewards"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm usb-dark hover:bg-usb-gray-100 transition-colors"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Recompensas</span>
                    </Link>
                    
                    <hr className="my-2 border-usb-gray-200" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-usb-red hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="usb-light hover:text-usb-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Botón de menú móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md usb-light hover:text-usb-orange-500 hover:bg-usb-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-usb-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 usb-dark hover:bg-usb-gray-100 rounded-md transition-colors"
              >
                <Home className="w-5 h-5" />
                <span></span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 usb-dark hover:bg-usb-gray-100 rounded-md transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/rewards"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 usb-dark hover:bg-usb-gray-100 rounded-md transition-colors"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>Recompensas</span>
                  </Link>
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 usb-dark hover:bg-usb-gray-100 rounded-md transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Mi Perfil</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-usb-red hover:bg-red-50 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

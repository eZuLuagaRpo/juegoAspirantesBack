import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useGame } from './contexts/GameContext';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GameLevel from './pages/GameLevel';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import LoadingSpinner from './components/LoadingSpinner';

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { user, loading } = useAuth();
  const { initializeUserProgress, resetGameState } = useGame();
  const initializationTimeoutRef = useRef(null);
  const lastUserIdRef = useRef(null);

  // Cargar progreso del usuario cuando se autentique con debouncing
  useEffect(() => {
    if (user && !loading) {
      // Si cambió el usuario, resetear el estado primero
      if (lastUserIdRef.current && lastUserIdRef.current !== user.id) {
        resetGameState();
      }
      
      // Limpiar timeout anterior si existe
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      
      // Debounce la inicialización para evitar llamadas múltiples
      initializationTimeoutRef.current = setTimeout(() => {
        initializeUserProgress(user.id);
        lastUserIdRef.current = user.id;
      }, 300);
    } else if (!user) {
      // Si no hay usuario, resetear el estado
      resetGameState();
      lastUserIdRef.current = null;
    }
    
    // Cleanup
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [user?.id, loading, initializeUserProgress, resetGameState]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/game/:levelId" 
            element={
              <ProtectedRoute>
                <GameLevel />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            } 
          />
          
          {/* Páginas públicas */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;

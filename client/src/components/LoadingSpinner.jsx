import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        {/* Spinner principal */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-usb-blue rounded-full animate-spin`}></div>
        
        {/* Spinner interno */}
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-300 rounded-full animate-spin absolute top-0 left-0`} 
             style={{ animationDelay: '-0.5s' }}></div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 font-medium text-lg">{text}</p>
      )}
      
      {/* Puntos de carga */}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-usb-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-usb-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-usb-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

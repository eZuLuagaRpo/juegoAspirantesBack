import React from 'react';

const ProgressBar = ({ 
  progress, 
  current, 
  total, 
  label = 'Progreso',
  unit = 'elementos',
  gradientColors = 'from-orange-500 to-red-600'
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{current} / {total} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`bg-gradient-to-r ${gradientColors} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;

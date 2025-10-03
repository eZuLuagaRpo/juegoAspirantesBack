import React from 'react';

const GameSidebar = ({ 
  type = 'left', // 'left' o 'right'
  title, 
  subtitle, 
  sections = [], 
  stats = null,
  words = null,
  foundWords = [],
  showHints = false,
  hintMessage = null
}) => {
  const isLeft = type === 'left';
  const bgClass = isLeft 
    ? 'bg-gradient-to-br from-orange-50 to-orange-100' 
    : 'bg-gradient-to-br from-gray-50 to-gray-100';
  const borderClass = isLeft ? 'border-r border-gray-200' : 'border-l border-gray-200';
  const titleColor = isLeft ? 'text-[#F16411]' : 'text-gray-800';

  return (
    <div className={`sidebar-responsive ${bgClass} p-2.5 sm:p-3 ${borderClass}`}>
      <div className="space-y-3">
        {/* Título principal */}
        <div className="text-center">
          <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${titleColor} mb-1.5`}>{title}</h2>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>

        {/* Secciones de contenido */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-md p-2.5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">{section.title}</h3>
            {section.type === 'list' && (
              <ul className="text-sm text-gray-600 space-y-0.5">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>• {item}</li>
                ))}
              </ul>
            )}
            {section.type === 'text' && (
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            )}
            {section.type === 'instructions' && (
              <div className="text-sm text-gray-700 space-y-0.5">
                {section.instructions.map((instruction, instIndex) => (
                  <p key={instIndex}>• {instruction}</p>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Lista de palabras (para WordSearch) */}
        {words && (
          <div className="bg-white rounded-md p-2.5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-2">🎯 Palabras a Encontrar</h3>
            <div className="space-y-1.5 max-h-[35vh] sm:max-h-[45vh] lg:max-h-[55vh] overflow-y-auto">
              {words.map((word, index) => {
                const isFound = foundWords.some(fw => fw.word === word.word);
                return (
                  <div 
                    key={index} 
                    className={`bg-white rounded-md p-1.5 shadow-sm border-l-4 ${
                      isFound 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-orange-300'
                    }`}
                  >
                    <div className={`font-semibold text-xs ${
                      isFound ? 'text-green-700 line-through' : 'text-gray-700'
                    }`}>
                      {word.word}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {word.definition}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pista activa */}
        {showHints && hintMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2.5">
            <h4 className="font-semibold text-yellow-800 mb-1.5 text-xs">💡 Pista Activa</h4>
            <p className="text-xs text-yellow-700">{hintMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSidebar;

import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  CheckCircle, 
  Star, 
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const WordSearch = forwardRef(({ 
  puzzleData, 
  onComplete, 
  onHintUsed, 
  onError,
  timeSpent,
  errors,
  hintsUsed
}, ref) => {
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const gridRef = useRef(null);

  // Palabras para la Base Mercadeo - Enfoque USBMED
  const wordCategories = {
    terminosUSBMED: [
      { word: 'USBMED', definition: 'Universidad de San Buenaventura Medellín', category: 'Término USBMED' },
      { word: 'BECAS', definition: 'Ayuda económica para estudiantes con mérito académico', category: 'Término USBMED' },
      { word: 'MATRICULA', definition: 'Proceso de inscripción académica', category: 'Término USBMED' },
      { word: 'CREDITOS', definition: 'Unidades de medida del trabajo académico', category: 'Término USBMED' },
      { word: 'FINANCIACION', definition: 'Opciones de pago y financiamiento estudiantil', category: 'Término USBMED' },
      { word: 'DESCUENTOS', definition: 'Reducciones en el costo de matrícula', category: 'Término USBMED' },
      { word: 'BONAVENTURIANO', definition: 'Estudiante de la Universidad San Buenaventura', category: 'Término USBMED' },
      { word: 'REGISTRO', definition: 'Proceso de inscripción en materias', category: 'Término USBMED' },
      { word: 'PAGOS', definition: 'Transacciones económicas estudiantiles', category: 'Término USBMED' },
      { word: 'ESTUDIANTE', definition: 'Persona que cursa estudios universitarios', category: 'Término USBMED' },
      { word: 'UNIVERSIDAD', definition: 'Institución de educación superior', category: 'Término USBMED' },
      { word: 'MEDELLIN', definition: 'Ciudad donde se ubica la universidad', category: 'Término USBMED' }
    ]
  };

  // Combinar todas las palabras
  const allWords = [
    ...wordCategories.terminosUSBMED
  ];


  // Generar cuadrícula
  const generateGrid = useCallback(() => {
    const size = 15;
    const newGrid = Array(size).fill().map(() => Array(size).fill(''));
    const newWords = allWords.slice(0, 12); // Tomar 12 palabras aleatoriamente
    
    // Colocar palabras en la cuadrícula PRIMERO
    const directions = [
      { dx: 1, dy: 0 },   // Horizontal derecha
      { dx: -1, dy: 0 },  // Horizontal izquierda
      { dx: 0, dy: 1 },   // Vertical abajo
      { dx: 0, dy: -1 },  // Vertical arriba
      { dx: 1, dy: 1 },   // Diagonal derecha-abajo
      { dx: -1, dy: -1 }, // Diagonal izquierda-arriba
      { dx: 1, dy: -1 },  // Diagonal derecha-arriba
      { dx: -1, dy: 1 }   // Diagonal izquierda-abajo
    ];

    const placedWords = [];
    
    // Intentar colocar cada palabra
    newWords.forEach(wordObj => {
      const word = wordObj.word;
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 200) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const startX = Math.floor(Math.random() * size);
        const startY = Math.floor(Math.random() * size);
        
        // Verificar si la palabra cabe en esta posición
        const endX = startX + direction.dx * (word.length - 1);
        const endY = startY + direction.dy * (word.length - 1);
        
        if (endX >= 0 && endX < size && endY >= 0 && endY < size) {
          // Verificar si no hay conflicto con palabras existentes
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const x = startX + direction.dx * i;
            const y = startY + direction.dy * i;
            if (newGrid[y][x] !== '' && newGrid[y][x] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          
          if (canPlace) {
            // Colocar la palabra
            for (let i = 0; i < word.length; i++) {
              const x = startX + direction.dx * i;
              const y = startY + direction.dy * i;
              newGrid[y][x] = word[i];
            }
            
            // Agregar información de posición a la palabra
            const wordWithPositions = {
              ...wordObj,
              positions: [],
              direction: direction,
              startX: startX,
              startY: startY
            };
            
            for (let i = 0; i < word.length; i++) {
              wordWithPositions.positions.push({
                x: startX + direction.dx * i,
                y: startY + direction.dy * i
              });
            }
            
            placedWords.push(wordWithPositions);
            placed = true;
          }
        }
        attempts++;
      }
      
      // Si no se pudo colocar, intentar con una posición más simple
      if (!placed) {
      }
    });

    // Llenar espacios vacíos con letras aleatorias
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }


    setGrid(newGrid);
    setWords(placedWords);
    setFoundWords([]);
    setProgress(0);
    setGameCompleted(false);
  }, []);

  // Inicializar juego
  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  // Scroll automático al cargar el puzzle
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    useHint: useHint
  }));

  
  // Actualizar progreso
  useEffect(() => {
    const progressPercentage = (foundWords.length / words.length) * 100;
    setProgress(progressPercentage);
    
    if (foundWords.length === words.length && words.length > 0 && !gameCompleted) {
      setGameCompleted(true);
      toast.success('¡Excelente! Has encontrado todas las palabras', {
        duration: 3000,
        icon: '🎉'
      });
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [foundWords.length, words.length, gameCompleted, onComplete]);


  // Manejar clic en celda
  const handleCellClick = (row, col) => {
    if (gameCompleted) return;

    if (!isSelecting) {
      // Iniciar selección
      setIsSelecting(true);
      setStartCell({ row, col });
      setSelectedCells([{ row, col }]);
      setCurrentWord(grid[row][col]);
    } else {
      // Completar selección
      const endCell = { row, col };
      const selectedWord = getSelectedWord(startCell, endCell);
      
      if (selectedWord) {
        checkWord(selectedWord, selectedCells);
      }
      
      // Limpiar selección
      setIsSelecting(false);
      setStartCell(null);
      setSelectedCells([]);
      setCurrentWord('');
    }
  };

  // Obtener palabra seleccionada
  const getSelectedWord = (start, end) => {
    const cells = [];
    const dx = end.col - start.col;
    const dy = end.row - start.row;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    if (steps === 0) return null;
    
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(start.col + stepX * i);
      const y = Math.round(start.row + stepY * i);
      cells.push({ row: y, col: x });
    }
    
    setSelectedCells(cells);
    return cells.map(cell => grid[cell.row][cell.col]).join('');
  };

  // Verificar palabra encontrada
  const checkWord = (word, cells) => {
    const foundWord = words.find(w => w.word === word);
    
    if (foundWord && !foundWords.some(fw => fw.word === word)) {
      // Palabra encontrada correctamente
      setFoundWords(prev => [...prev, foundWord]);
      
      // Mostrar mensaje motivador
      const motivationalMessages = [
        `¡Excelente! Encontraste "${word}" - ${foundWord.definition}`,
        `¡Muy bien! "${word}" es un concepto clave en ${foundWord.category}`,
        `¡Perfecto! "${word}" - ${foundWord.definition}`,
        `¡Genial! Has dominado el concepto de "${word}"`,
        `¡Increíble! "${word}" es fundamental en tu formación`
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      toast.success(randomMessage, {
        duration: 4000,
        icon: '🌟'
      });
    } else {
      // Palabra incorrecta
      onError();
      toast.error('Esa palabra no está en la lista. ¡Sigue intentando!', {
        duration: 2000
      });
    }
  };

  // Encontrar palabra en la grilla
  const findWordInGrid = (word) => {
    const wordUpper = word.toUpperCase();
    const positions = [];
    
    // Buscar en todas las direcciones
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        // Horizontal derecha
        if (col + wordUpper.length <= grid[row].length) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row][col + i] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row, col: col + i });
            }
            return positions;
          }
        }
        
        // Horizontal izquierda
        if (col - wordUpper.length >= -1) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row][col - i] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row, col: col - i });
            }
            return positions;
          }
        }
        
        // Vertical abajo
        if (row + wordUpper.length <= grid.length) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row + i][col] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row: row + i, col });
            }
            return positions;
          }
        }
        
        // Vertical arriba
        if (row - wordUpper.length >= -1) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row - i][col] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row: row - i, col });
            }
            return positions;
          }
        }
        
        // Diagonal abajo-derecha
        if (row + wordUpper.length <= grid.length && col + wordUpper.length <= grid[row].length) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row + i][col + i] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row: row + i, col: col + i });
            }
            return positions;
          }
        }
        
        // Diagonal abajo-izquierda
        if (row + wordUpper.length <= grid.length && col - wordUpper.length >= -1) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row + i][col - i] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row: row + i, col: col - i });
            }
            return positions;
          }
        }
        
        // Diagonal arriba-derecha
        if (row - wordUpper.length >= -1 && col + wordUpper.length <= grid[row].length) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row - i][col + i] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row: row - i, col: col + i });
            }
            return positions;
          }
        }
        
        // Diagonal arriba-izquierda
        if (row - wordUpper.length >= -1 && col - wordUpper.length >= -1) {
          let found = true;
          for (let i = 0; i < wordUpper.length; i++) {
            if (grid[row - i][col - i] !== wordUpper[i]) {
              found = false;
              break;
            }
          }
          if (found) {
            for (let i = 0; i < wordUpper.length; i++) {
              positions.push({ row: row - i, col: col - i });
            }
            return positions;
          }
        }
      }
    }
    
    return positions;
  };

  // Usar pista
  const useHint = () => {
    if (hintsUsed >= 3) {
      toast.error('Ya has usado todas las pistas disponibles', {
        duration: 2000,
        icon: '⚠️'
      });
      return;
    }

    const remainingWords = words.filter(w => !foundWords.some(fw => fw.word === w.word));
    if (remainingWords.length === 0) {
      toast.info('Todas las palabras ya han sido encontradas', {
        duration: 2000,
        icon: 'ℹ️'
      });
      return;
    }
    
    const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    
    // Usar las posiciones que ya están guardadas en el objeto de la palabra
    if (randomWord.positions && randomWord.positions.length > 0) {
      setFoundWords(prev => [...prev, randomWord]);
      onHintUsed(); // Esto incrementa el contador de pistas usadas
      
      toast.success(`Pista aplicada: "${randomWord.word}" ha sido encontrada automáticamente`, {
        duration: 3000,
        icon: '💡'
      });
      
      // Verificar si el juego está completo
      if (foundWords.length + 1 === words.length) {
        setTimeout(() => {
          setGameCompleted(true);
          onComplete();
        }, 1000);
      }
    } else {
      // Si no hay posiciones guardadas, intentar encontrarlas en la grilla
      const wordPositions = findWordInGrid(randomWord.word);
      if (wordPositions.length > 0) {
        // Crear el objeto de palabra con las posiciones correctas
        const wordWithPositions = {
          ...randomWord,
          positions: wordPositions.map(pos => ({ x: pos.col, y: pos.row }))
        };
        
        setFoundWords(prev => [...prev, wordWithPositions]);
        onHintUsed(); // Esto incrementa el contador de pistas usadas
        
        toast.success(`Pista aplicada: "${randomWord.word}" ha sido encontrada automáticamente`, {
          duration: 3000,
          icon: '💡'
        });
        
        // Verificar si el juego está completo
        if (foundWords.length + 1 === words.length) {
          setTimeout(() => {
            setGameCompleted(true);
            onComplete();
          }, 1000);
        }
      } else {
        toast.error('No se pudo encontrar la palabra en la cuadrícula', {
          duration: 2000,
          icon: '❌'
        });
      }
    }
  };

  // Reiniciar juego
  const restartGame = () => {
    generateGrid();
    setFoundWords([]);
    setSelectedCells([]);
    setIsSelecting(false);
    setStartCell(null);
    setCurrentWord('');
    setShowHints(false);
    setGameCompleted(false);
  };

  // Obtener clase de celda
  const getCellClass = (row, col) => {
    let classes = 'flex items-center justify-center font-bold border border-gray-300 cursor-pointer transition-all duration-200 hover:bg-blue-100 select-none';
    
    // Celda seleccionada
    if (selectedCells.some(cell => cell.row === row && cell.col === col)) {
      classes += ' bg-blue-200 border-blue-400 shadow-md';
    }
    
    // Celda de palabra encontrada
    const isFound = foundWords.some(foundWord => 
      foundWord.positions?.some(pos => pos.x === col && pos.y === row)
    );
    if (isFound) {
      classes += ' bg-green-200 border-green-400 text-green-800 shadow-sm';
    }
    
    // Debug: mostrar información de la celda
    if (row === 0 && col === 0) {
    }
    
    return classes;
  };

  // Configuración de las columnas laterales
  const leftSidebarConfig = {
    type: 'left',
    title: 'Base de Mercadeo',
    subtitle: 'Descubre las opciones de financiación y becas disponibles para tu formación académica',
    sections: [
      {
        title: '🎯 ¡El inicio de tu aventura universitaria!',
        type: 'text',
        content: 'En esta unidad nos encargamos de mostrarte todo lo que la USB tiene para ofrecerte. A través de campañas, eventos y actividades, te damos toda la información para que tomes la mejor decisión, es decir, ¡elegirnos! En todo momento de tu ingreso, respondemos todas tus preguntas y te guiamos para que descubras el programa perfecto para ti. ¡Prepárate para ser parte de algo increíble!'
      },
      {
        title: '🌟 ¿Qué hacemos en Mercadeo?',
        type: 'list',
        items: [
          'Campañas promocionales universitarias',
          'Eventos de bienvenida y orientación',
          'Asesoría personalizada de programas',
          'Tours virtuales y presenciales',
          'Material informativo y folletos'
        ]
      },
      {
        title: '💡 Beneficios para ti',
        type: 'list',
        items: [
          'Información completa y actualizada',
          'Asesoría personalizada sin costo',
          'Conocimiento de todas las opciones',
          'Toma de decisiones informada',
          'Proceso de admisión más fácil'
        ]
      }
    ]
  };

  const rightSidebarConfig = {
    type: 'right',
    title: 'Sopa de Letras',
    subtitle: 'Encuentra las palabras relacionadas con becas y financiación',
    sections: [
      {
        title: '📋 Instrucciones',
        type: 'instructions',
        instructions: [
          'Haz clic en la primera letra de la palabra para comenzar a seleccionar',
          'Haz clic en la última letra de la palabra para completar la selección',
          'Las palabras pueden estar en cualquier dirección',
          'Encuentra todas las palabras para completar el puzzle'
        ]
      },
      {
        title: '⏱️ Penalización por Tiempo',
        type: 'list',
        items: [
          '≤ 5 min: -0 estrellas ✅',
          '5-6 min: -1 estrella ⚠️',
          '6-7 min: -2 estrellas ⚠️',
          '7-8 min: -3 estrellas ❌'
        ]
      },
      {
        title: '❌ Penalización por Errores',
        type: 'list',
        items: [
          '0-1 errores: -0 estrellas ✅',
          '2-3 errores: -1 estrella ⚠️',
          '4-5 errores: -2 estrellas ⚠️',
          '6-7 errores: -3 estrellas ❌'
        ]
      },
      {
        title: '💡 Penalización por Pistas',
        type: 'text',
        content: 'Cada pista usada = -1 estrella. Usa 0 pistas para obtener 5 estrellas.'
      }
    ]
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      {/* Panel izquierdo - Información de la base universitaria */}
      <div className="hidden lg:block">
        <GameSidebar {...leftSidebarConfig} />
      </div>

      {/* Panel central - Juego */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Contenido principal */}
        <div className="flex-1 p-2 sm:p-3 lg:p-4">
          <div className="h-full flex flex-col">
            {/* Barra de progreso estándar */}
            <div className="mb-3">
              <ProgressBar 
                progress={progress}
                current={foundWords.length}
                total={words.length}
                label="Progreso"
                unit="palabras"
                gradientColors="from-orange-500 to-red-600"
              />
            </div>

            {/* Cuadrícula - Responsive */}
            <div className="flex-1 flex items-start justify-center pt-4 mb-3 sm:mb-4">
              <div 
                ref={gridRef}
                className="grid gap-0.5 sm:gap-1 border-2 border-gray-400 bg-white shadow-md p-1.5 sm:p-2 lg:p-3"
                style={{ 
                  gridTemplateColumns: 'repeat(15, 1fr)',
                  width: 'min(80vw, 80vh, 500px)',
                  height: 'min(80vw, 80vh, 500px)',
                  aspectRatio: '1'
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={getCellClass(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      style={{
                        fontSize: 'clamp(0.65rem, 1.5vw, 0.875rem)',
                        minHeight: '1.25rem',
                        minWidth: '1.25rem'
                      }}
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lista de palabras - Justo debajo de la sopa de letras */}
            <div className="mt-4 mb-3">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 max-w-4xl mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 text-center">🎯 Palabras a Encontrar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
                  {words.map((word, index) => {
                    const isFound = foundWords.some(fw => fw.word === word.word);
                    return (
                      <div 
                        key={index} 
                        className={`bg-white rounded-md p-2 shadow-sm border-l-4 transition-all ${
                          isFound 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-orange-300'
                        }`}
                      >
                        <div className={`font-semibold text-sm ${
                          isFound ? 'text-green-700 line-through' : 'text-gray-700'
                        }`}>
                          {word.word}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {word.definition}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel móvil con información */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-md p-2.5 border border-orange-200">
                <h3 className="font-bold text-orange-600 mb-1.5 text-sm">🎓 Base Mercadeo</h3>
                <p className="text-xs text-gray-600 mb-1">Programas: Ingeniería, Administración, Derecho, Psicología</p>
                <p className="text-xs text-gray-600">Beneficios: Becas, descuentos, financiación</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2.5 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-1.5 text-sm">📋 Instrucciones</h3>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• Haz clic en la primera letra</li>
                  <li>• Haz clic en la última letra</li>
                  <li>• Palabras en cualquier dirección</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Información del juego */}
      <div className="hidden lg:block">
        <GameSidebar {...rightSidebarConfig} />
      </div>
    </div>
  );
});

export default WordSearch;

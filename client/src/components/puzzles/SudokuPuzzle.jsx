import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const SudokuPuzzle = forwardRef(({ onComplete, onHintUsed, onError }, ref) => {
  const [grid, setGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [originalPuzzle, setOriginalPuzzle] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);
  const [editedCells, setEditedCells] = useState(new Set());

  // Generar Sudoku con dificultad media (36 celdas prellenadas)
  const generateSudoku = useCallback(() => {
    // Crear una grilla vacía
    const emptyGrid = Array(9).fill().map(() => Array(9).fill(0));
    
    // Llenar la diagonal principal con números válidos
    for (let i = 0; i < 9; i += 3) {
      fillBox(emptyGrid, i, i);
    }
    
    // Resolver el Sudoku para obtener una solución válida
    solveSudoku(emptyGrid);
    const solvedGrid = emptyGrid.map(row => [...row]);
    
    // Crear el puzzle removiendo números (dificultad media: 36 celdas prellenadas)
    const puzzleGrid = solvedGrid.map(row => [...row]);
    const cellsToRemove = 45; // 81 - 36 = 45 celdas vacías (36 prellenadas)
    
    // Remover números aleatoriamente
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (puzzleGrid[row][col] !== 0) {
        puzzleGrid[row][col] = 0;
        removed++;
      }
    }
    
    return { puzzle: puzzleGrid, solution: solvedGrid };
  }, []);

  // Llenar una caja 3x3 con números del 1-9
  const fillBox = (grid, row, col) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Mezclar números
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    let index = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[row + i][col + j] = numbers[index++];
      }
    }
  };

  // Resolver Sudoku usando backtracking
  const solveSudoku = (grid) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              if (solveSudoku(grid)) {
                return true;
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  // Verificar si un movimiento es válido
  const isValidMove = (grid, row, col, num) => {
    // Verificar fila
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    
    // Verificar columna
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    
    // Verificar caja 3x3
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    
    return true;
  };

  // Inicializar el juego
  // Scroll automático al cargar el puzzle
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isInitialized) return;
    
    const { puzzle, solution } = generateSudoku();
    setGrid(puzzle);
    setSolution(solution);
    setOriginalPuzzle(puzzle);
    setStartTime(Date.now());
    setIsInitialized(true);
  }, [generateSudoku, isInitialized]);

  // Agregar event listener para el teclado
  useEffect(() => {
    if (gameCompleted) return; // No agregar listener si el juego está completado
    
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedCell, grid, gameCompleted]);

  // Manejar clic en celda
  const handleCellClick = (row, col) => {
    if (gameCompleted) return;
    
    // No permitir editar celdas originales (que nunca fueron editadas)
    const cellKey = `${row}-${col}`;
    const isOriginal = originalPuzzle[row][col] !== 0 && !editedCells.has(cellKey);
    
    if (isOriginal) {
      return;
    }
    
    setSelectedCell({ row, col });
  };

  // Manejar entrada de número
  const handleNumberInput = (num) => {
    if (!selectedCell || gameCompleted) return;
    
    const { row, col } = selectedCell;
    const cellKey = `${row}-${col}`;
    const isOriginal = originalPuzzle[row][col] !== 0 && !editedCells.has(cellKey);
    
    if (isOriginal) {
      return; // No permitir modificar celdas originales
    }
    
    const newGrid = [...grid];
    newGrid[row][col] = num;
    setGrid(newGrid);
    setMoves(prev => prev + 1);
    
    // Marcar la celda como editada
    setEditedCells(prev => new Set([...prev, cellKey]));
    
    // Verificar si el movimiento es correcto
    if (num === solution[row][col]) {
      // Verificar si el juego está completo solo si no está ya completado
      if (!gameCompleted) {
        setTimeout(() => {
          checkGameCompletion();
        }, 100);
      }
    } else {
      setErrors(prev => prev + 1);
      onError();
    }
  };

  // Manejar entrada de teclado
  const handleKeyPress = (event) => {
    if (gameCompleted) return;
    
    const key = event.key;
    
    // Prevenir comportamiento por defecto del navegador
    event.preventDefault();
    
    // Números del 1-9
    if (key >= '1' && key <= '9') {
      handleNumberInput(parseInt(key));
    }
    // Tecla Delete o Backspace para limpiar
    else if (key === 'Delete' || key === 'Backspace') {
      if (selectedCell) {
        const { row, col } = selectedCell;
        const cellKey = `${row}-${col}`;
        const isOriginal = originalPuzzle[row][col] !== 0 && !editedCells.has(cellKey);
        
        if (!isOriginal) {
          const newGrid = [...grid];
          newGrid[row][col] = 0;
          setGrid(newGrid);
          
          // Marcar la celda como editada
          setEditedCells(prev => new Set([...prev, cellKey]));
        }
      }
    }
  };

  // Verificar si el juego está completo
  const checkGameCompletion = () => {
    // Evitar verificación múltiple si ya está completado
    if (gameCompleted) return;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    
    // Marcar como completado y llamar onComplete solo una vez
    setGameCompleted(true);
    onComplete();
  };


  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    useHint: () => {
      // Evitar usar pistas si el juego ya está completado
      if (hintCount >= 3 || gameCompleted) {
        return;
      }

      // Encontrar una celda vacía aleatoria
      const emptyCells = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            emptyCells.push({ row, col });
          }
        }
      }

      if (emptyCells.length === 0) {
        return;
      }

      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const correctNumber = solution[randomCell.row][randomCell.col];
      
      // Mostrar la pista visualmente
      setSelectedCell(randomCell);
      setTimeout(() => {
        const newGrid = [...grid];
        newGrid[randomCell.row][randomCell.col] = correctNumber;
        setGrid(newGrid);
        setSelectedCell(null);
        setHintCount(prev => prev + 1);
        onHintUsed();
        
        // Verificar si el juego está completo solo si no está ya completado
        if (!gameCompleted) {
          setTimeout(() => {
            checkGameCompletion();
          }, 100);
        }
      }, 1000);
    }
  }), [grid, solution, hintCount, onHintUsed, gameCompleted]);

  // Calcular progreso
  const filledCells = grid.flat().filter(cell => cell !== 0).length;
  const totalCells = 81;
  const progress = Math.round((filledCells / totalCells) * 100);

  // Configuración de las columnas laterales
  const leftSidebarConfig = {
    type: 'left',
    title: 'Base de Registro Académico',
    subtitle: 'Sudoku Clásico',
    sections: [
      {
        title: '🎯 ¡El momento de asegurarte que todo está en orden!',
        type: 'text',
        content: 'Aquí verificamos tus datos, validamos los documentos y aseguramos de que tu matrícula y horarios estén listos para comenzar. Durante el proceso, te ayudamos a que tu inscripción sea perfecta, para que puedas enfocarte en lo que realmente importa: ¡tu futuro académico!'
      },
      {
        title: '📋 ¿Qué hacemos en Registro?',
        type: 'list',
        items: [
          'Verificación de documentos académicos',
          'Validación de datos personales',
          'Configuración de horarios de clases',
          'Gestión de matrícula estudiantil',
          'Asesoría en procesos administrativos'
        ]
      },
      {
        title: '✅ Beneficios para ti',
        type: 'list',
        items: [
          'Proceso de inscripción simplificado',
          'Validación precisa de documentos',
          'Horarios optimizados para ti',
          'Seguimiento personalizado',
          'Tranquilidad para comenzar tus estudios'
        ]
      }
    ]
  };

  const rightSidebarConfig = {
    type: 'right',
    title: 'Instrucciones del Juego',
    subtitle: 'Sudoku Clásico 9x9',
    sections: [
      {
        title: '🎮 Cómo Jugar',
        type: 'instructions',
        instructions: [
          'Haz clic en una celda vacía para seleccionarla',
          'Usa las teclas del 1-9 para ingresar números',
          'Usa Delete o Backspace para limpiar una celda',
          'Cada fila, columna y caja 3x3 debe contener los números 1-9 sin repetir',
          'Completa todo el tablero para ganar'
        ]
      },
      {
        title: '📋 Reglas del Sudoku',
        type: 'list',
        items: [
          'Cada fila debe contener los números 1-9 sin repetir',
          'Cada columna debe contener los números 1-9 sin repetir',
          'Cada caja 3x3 debe contener los números 1-9 sin repetir',
          'No se pueden modificar los números prellenados (fondo naranja)'
        ]
      },
      {
        title: '⏱️ Penalización por Tiempo',
        type: 'list',
        items: [
          '≤ 12 min: -0 estrellas ✅',
          '12-14 min: -1 estrella ⚠️',
          '14-16 min: -2 estrellas ⚠️',
          '16-17 min: -3 estrellas ❌'
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
    ],
    stats: [
      { label: 'Celdas Llenas', value: `${filledCells}/${totalCells}`, color: 'text-blue-600' },
      { label: 'Movimientos', value: moves.toString(), color: 'text-green-600' },
      { label: 'Pistas Usadas', value: `${hintCount}/3`, color: 'text-yellow-600' },
      { label: 'Errores', value: errors.toString(), color: 'text-red-600' }
    ]
  };

  if (!isInitialized) {
    return (
      <div className="flex h-full w-full">
        <GameSidebar {...leftSidebarConfig} />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando Sudoku...</p>
          </div>
        </div>
        <GameSidebar {...rightSidebarConfig} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Panel izquierdo - Información de la base universitaria */}
      <GameSidebar {...leftSidebarConfig} />

      {/* Panel central - Juego */}
      <div className="flex-1 flex flex-col">
        {/* Contenido principal */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {/* Barra de progreso estándar */}
            <ProgressBar
              progress={progress}
              current={filledCells}
              total={totalCells}
              label="Progreso"
              unit="celdas"
              gradientColors="from-orange-500 to-red-600"
            />

            {/* Área de juego */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">

                {/* Tablero de Sudoku */}
                <div className="grid grid-cols-9 gap-0 mb-6 bg-gray-800 p-2 rounded-lg border-2 border-gray-600">
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const isOriginal = originalPuzzle[rowIndex][colIndex] !== 0 && !editedCells.has(cellKey);
                      const isCorrect = cell === solution[rowIndex][colIndex] && cell !== 0;
                      
                      // Determinar los bordes gruesos solo para los bloques 3x3
                      const isBlockBottom = (rowIndex + 1) % 3 === 0;
                      const isBlockRight = (colIndex + 1) % 3 === 0;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-lg sm:text-xl font-bold
                            border border-gray-300
                            ${isSelected 
                              ? 'bg-blue-200 border-blue-500 cursor-pointer' 
                              : isOriginal
                                ? 'bg-orange-100 border-orange-300 text-orange-800 cursor-default'
                                : isCorrect
                                  ? 'bg-green-100 border-green-500 text-green-800 cursor-pointer'
                                  : 'bg-white hover:bg-gray-50 cursor-pointer'
                            }
                            ${isBlockBottom ? 'border-b-2 border-b-gray-600' : ''}
                            ${isBlockRight ? 'border-r-2 border-r-gray-600' : ''}
                          `}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cell !== 0 ? cell : ''}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Instrucciones de teclado */}
                <div className="text-center text-gray-600 text-sm">
                  <p>Usa las teclas del 1-9 para ingresar números</p>
                  <p>Usa Delete o Backspace para limpiar una celda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Información del juego */}
      <GameSidebar {...rightSidebarConfig} />
    </div>
  );
});

export default SudokuPuzzle;

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const CrosswordPuzzle = forwardRef(({ onComplete, onHintUsed, onError }, ref) => {
  const [crossword, setCrossword] = useState([]);
  const [clues, setClues] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDirection, setCurrentDirection] = useState('across'); // 'across' o 'down'
  const [currentClue, setCurrentClue] = useState(null);
  const [writingMode, setWritingMode] = useState(false); // Modo de escritura activo
  const [completedWords, setCompletedWords] = useState(new Set()); // Palabras completadas y bloqueadas
  const [sequentialWriting, setSequentialWriting] = useState(true); // true = secuencial, false = libre

  // Banco de contenido académico
  const academicContent = {
    facultades: [
      { word: 'ARQUITECTURA', definition: 'Disciplina que combina arte, ciencia y tecnología para crear espacios habitables que respondan a necesidades humanas', category: 'Facultades', curiosity: 'La arquitectura es considerada el arte de construir espacios habitables' },
      { word: 'INGENIERIA', definition: 'Campo profesional que transforma conceptos científicos en soluciones prácticas para problemas del mundo real', category: 'Facultades', curiosity: '¿Sabías que Ingeniería viene del latín "ingenium" (ingenio)?' },
      { word: 'CIENCIAS', definition: 'Área del conocimiento que investiga fenómenos naturales mediante métodos sistemáticos y empíricos', category: 'Facultades', curiosity: 'Las ciencias naturales se basan en la observación y experimentación' }
    ],
    profesiones: [
      { word: 'INGENIERO', definition: 'Especialista que diseña, construye y optimiza sistemas técnicos aplicando principios matemáticos y científicos', category: 'Profesiones', curiosity: 'Los ingenieros son los creadores de la infraestructura moderna' },
      { word: 'PROGRAMACION', definition: 'Actividad de crear instrucciones lógicas para que las computadoras ejecuten tareas específicas', category: 'Profesiones', curiosity: 'La programación es considerada el lenguaje del futuro' }
    ],
    asignaturas: [
      { word: 'CALCULO', definition: 'Rama de las matemáticas que estudia el cambio y la acumulación mediante límites, derivadas e integrales', category: 'Asignaturas', curiosity: 'El cálculo fue inventado independientemente por Newton y Leibniz' },
      { word: 'FISICA', definition: 'Ciencia fundamental que investiga las propiedades de la materia, energía, espacio y tiempo', category: 'Asignaturas', curiosity: 'La física estudia desde partículas subatómicas hasta galaxias' },
      { word: 'PSICOLOGIA', definition: 'Disciplina científica que examina los procesos mentales, emocionales y conductuales del ser humano', category: 'Asignaturas', curiosity: 'La psicología moderna comenzó con Wilhelm Wundt en 1879' }
    ],
    conceptos: [
      { word: 'SEMESTRE', definition: 'División temporal del año académico que organiza el calendario educativo en períodos de estudio', category: 'Conceptos Académicos', curiosity: 'El sistema semestral se originó en las universidades alemanas del siglo XIX' }
    ]
  };

  // Generar crucigrama académico
  const generateCrossword = useCallback(() => {
    // Combinar todas las palabras
    const allWords = [
      ...academicContent.facultades,
      ...academicContent.profesiones,
      ...academicContent.asignaturas,
      ...academicContent.conceptos
    ];

     // Crear una grilla de 24x14 para acomodar todas las palabras
     const rows = 14;
     const cols = 24;
    const grid = Array(rows).fill().map(() => Array(cols).fill(''));
    const placedWords = [];
    const clues = [];

     // Palabras predefinidas con cruces correctos según la imagen
     const predefinedWords = [
       // Palabras horizontales (across)
       { word: 'SEMESTRE', row: 1, col: 1, direction: 'across' },     // S-E-M-E-S-T-R-E (R final cruza con R inicial de ARQUITECTURA)
       { word: 'INGENIERIA', row: 4, col: 2, direction: 'across' },   // I-N-G-E-N-I-E-R-I-A (segunda I cruza con I de ARQUITECTURA)
       { word: 'CIENCIAS', row: 6, col: 15, direction: 'across' },    // C-I-E-N-C-I-A-S
       { word: 'CALCULO', row: 7, col: 4, direction: 'across' },      // C-A-L-C-U-L-O (segunda C cruza con C de ARQUITECTURA)
       { word: 'PROGRAMACION', row: 10, col: 6, direction: 'across' }, // P-R-O-G-R-A-M-A-C-I-O-N (primera R cruza con R final de ARQUITECTURA)
       
       // Palabras verticales (down)
       { word: 'ARQUITECTURA', row: 0, col: 7, direction: 'down' },   // A-R-Q-U-I-T-E-C-T-U-R-A
       { word: 'FISICA', row: 3, col: 2, direction: 'down' },         // F-I-S-I-C-A
       { word: 'PSICOLOGIA', row: 4, col: 16, direction: 'down' },    // P-S-I-C-O-L-O-G-I-A
       { word: 'INGENIERO', row: 1, col: 20, direction: 'down' }      // I-N-G-E-N-I-E-R-O
     ];

    // Colocar palabras predefinidas
    predefinedWords.forEach(({ word, row, col, direction }) => {
      const wordData = allWords.find(w => w.word === word);
      if (wordData) {
         // Colocar la palabra en la grilla
         for (let i = 0; i < word.length; i++) {
           const r = direction === 'across' ? row : row + i;
           const c = direction === 'across' ? col + i : col;
           if (r < rows && c < cols) {
             grid[r][c] = word[i];
           }
         }

        // Crear pista
        const clueNumber = clues.length + 1;
        clues.push({
          number: clueNumber,
          word: word,
          definition: wordData.definition,
          category: wordData.category,
          curiosity: wordData.curiosity,
          direction: direction,
          row: row,
          col: col,
          length: word.length
        });

        placedWords.push({
          word: word,
          row: row,
          col: col,
          direction: direction,
          length: word.length
        });
      }
    });

    setCrossword(grid);
    setClues(clues);
    setUserAnswers({});
    setGameCompleted(false);
    setHintCount(0);
    setErrors(0);
    setStartTime(Date.now());
  }, []);

  // Inicializar el juego
  useEffect(() => {
    if (isInitialized) return;
    
    generateCrossword();
    setIsInitialized(true);
  }, [generateCrossword, isInitialized]);

  // Scroll automático al cargar el puzzle
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Agregar event listener para el teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedCell, currentDirection]);

  // Manejar clic en celda
  const handleCellClick = (row, col) => {
    if (gameCompleted) return;
    
    // Verificar si la celda es parte de una palabra
    const cellClue = findClueForCell(row, col);
    if (cellClue) {
      // Verificar si la palabra ya está completada y bloqueada
      const clueKey = `${cellClue.number}-${cellClue.direction}`;
      if (completedWords.has(clueKey)) {
        toast('Esta palabra ya está completada y bloqueada', {
          duration: 2000,
          icon: '🔒',
          style: {
            background: '#6B7280',
            color: '#fff',
          },
        });
        return;
      }
      
      setSelectedCell({ row, col });
      setCurrentClue(cellClue);
      setCurrentDirection(cellClue.direction);
      setWritingMode(true); // Activar modo de escritura
    }
  };

  // Encontrar la pista para una celda específica
  const findClueForCell = (row, col) => {
    return clues.find(clue => {
      if (clue.direction === 'across') {
        return clue.row === row && col >= clue.col && col < clue.col + clue.length;
      } else {
        return clue.col === col && row >= clue.row && row < clue.row + clue.length;
      }
    });
  };

  // Manejar entrada de letra
  const handleLetterInput = (letter) => {
    if (!selectedCell || gameCompleted || !currentClue) return;
    
    // Verificar si la palabra actual ya está completada y bloqueada
    const clueKey = `${currentClue.number}-${currentClue.direction}`;
    if (completedWords.has(clueKey)) {
      toast('Esta palabra ya está completada y bloqueada', {
        duration: 2000,
        icon: '🔒',
        style: {
          background: '#6B7280',
          color: '#fff',
        },
      });
      return;
    }
    
    const { row, col } = selectedCell;
    const clue = currentClue;
    const letterIndex = clue.direction === 'across' ? col - clue.col : row - clue.row;
    
    if (letterIndex >= 0 && letterIndex < clue.length) {
      // Obtener la respuesta actual (puede ser un objeto con posiciones o una cadena)
      const currentAnswer = userAnswers[clueKey] || {};
      
      // Crear array con la longitud completa de la palabra
      const answerArray = [];
      for (let i = 0; i < clue.length; i++) {
        answerArray[i] = '';
      }
      
      // Si hay una respuesta existente, llenar el array
      if (typeof currentAnswer === 'string') {
        // Respuesta antigua en formato cadena - convertir
        const existingLetters = currentAnswer.split('');
        for (let i = 0; i < Math.min(existingLetters.length, clue.length); i++) {
          if (existingLetters[i]) {
            answerArray[i] = existingLetters[i];
          }
        }
      } else {
        // Respuesta en formato objeto con posiciones
        for (let i = 0; i < clue.length; i++) {
          answerArray[i] = currentAnswer[i] || '';
        }
      }
      
      // IMPORTANTE: Buscar letras de cruces para completar el array
      // Esto permite que las letras de otras palabras completadas se usen en esta palabra
      for (let i = 0; i < clue.length; i++) {
        if (!answerArray[i]) {
          // Calcular la posición en la grilla para esta letra
          const cellRow = clue.direction === 'across' ? clue.row : clue.row + i;
          const cellCol = clue.direction === 'across' ? clue.col + i : clue.col;
          
          // Buscar todas las palabras que cruzan en esta celda
          const crossingClues = clues.filter(c => {
            if (c.number === clue.number && c.direction === clue.direction) {
              return false; // No buscar en la misma palabra
            }
            if (c.direction === 'across') {
              return c.row === cellRow && cellCol >= c.col && cellCol < c.col + c.length;
            } else {
              return c.col === cellCol && cellRow >= c.row && cellRow < c.row + c.length;
            }
          });
          
          // Buscar la primera letra disponible de cualquier palabra que cruce
          for (const crossClue of crossingClues) {
            const crossClueKey = `${crossClue.number}-${crossClue.direction}`;
            const crossAnswer = userAnswers[crossClueKey] || {};
            const crossLetterIndex = crossClue.direction === 'across' 
              ? cellCol - crossClue.col 
              : cellRow - crossClue.row;
            
            if (crossAnswer[crossLetterIndex]) {
              answerArray[i] = crossAnswer[crossLetterIndex];
              break;
            }
          }
        }
      }
      
      // Insertar la letra en la posición específica
      answerArray[letterIndex] = letter.toUpperCase();
      
      // Crear la cadena de respuesta para validación
      const updatedAnswer = answerArray.join('');
      
      // Crear objeto con posiciones para almacenar
      const answerObject = {};
      for (let i = 0; i < clue.length; i++) {
        if (answerArray[i]) {
          answerObject[i] = answerArray[i];
        }
      }
      
      setUserAnswers(prev => ({
        ...prev,
        [clueKey]: answerObject
      }));

      // Verificar si la palabra está completa (todas las posiciones tienen letras)
      const isComplete = answerArray.every(letter => letter !== '');
      
      if (isComplete) {
        if (updatedAnswer === clue.word) {
          // Palabra correcta - BLOQUEARLA
          setCompletedWords(prev => {
            const newSet = new Set([...prev, clueKey]);
            return newSet;
          });
          
          toast.success(`¡Correcto! "${clue.word}" - ${clue.definition}`, {
            duration: 3000,
            icon: '🌟'
          });
          
          // Mostrar curiosidad
          setTimeout(() => {
            toast(clue.curiosity, {
              duration: 4000,
              icon: '💡',
              style: {
                background: '#3B82F6',
                color: '#fff',
              },
            });
          }, 1000);
          
          // Deseleccionar la palabra completada
          setTimeout(() => {
            setSelectedCell(null);
            setCurrentClue(null);
            setWritingMode(false);
          }, 100);
        } else {
          // Palabra incorrecta - borrar la respuesta y contar error
          setErrors(prev => prev + 1);
          onError();
          
          // Borrar la respuesta incorrecta
          setUserAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[clueKey];
            return newAnswers;
          });
          
          // Devolver la selección al primer cuadrito de la palabra
          setSelectedCell({ row: clue.row, col: clue.col });
          
          toast.error('Palabra incorrecta. ¡Inténtalo de nuevo!', {
            duration: 2000
          });
        }
      }

      // Mover automáticamente SOLO si estamos en modo secuencial
      if (sequentialWriting) {
        moveToNextCellInCurrentWord(clue, letterIndex);
      }
    }
  };

  // Mover a la siguiente celda SOLO dentro de la palabra actual
  const moveToNextCellInCurrentWord = (clue, currentIndex) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < clue.length) {
      // Mover a la siguiente celda dentro de la misma palabra
      const nextRow = clue.direction === 'across' ? clue.row : clue.row + nextIndex;
      const nextCol = clue.direction === 'across' ? clue.col + nextIndex : clue.col;
      setSelectedCell({ row: nextRow, col: nextCol });
      // NO cambiar currentClue ni currentDirection - mantener la palabra actual
    } else {
      // Al llegar al final, quedarse en la última celda
      const lastRow = clue.direction === 'across' ? clue.row : clue.row + clue.length - 1;
      const lastCol = clue.direction === 'across' ? clue.col + clue.length - 1 : clue.col;
      setSelectedCell({ row: lastRow, col: lastCol });
    }
  };

  // Mover a la siguiente celda (función original para compatibilidad)
  const moveToNextCell = (clue, currentIndex) => {
    moveToNextCellInCurrentWord(clue, currentIndex);
  };

  // Encontrar la siguiente pista
  const findNextClue = (currentClue) => {
    const currentIndex = clues.findIndex(c => c.number === currentClue.number);
    const nextIndex = (currentIndex + 1) % clues.length;
    return clues[nextIndex];
  };

  // Manejar entrada de teclado
  const handleKeyPress = (event) => {
    if (gameCompleted) return;
    
    // Prevenir comportamiento por defecto del navegador SIEMPRE
    event.preventDefault();
    
    const key = event.key;
    
    // Lista completa de teclas especiales a bloquear (verificar tanto mayúsculas como minúsculas)
    const blockedKeys = [
      // Teclas modificadoras
      'Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock',
      // Teclas de navegación y control
      'Tab', 'Enter', 'Escape', ' ', 'Delete',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', 'Insert',
      // Teclas de función
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24',
      // Teclas de bloqueo
      'NumLock', 'ScrollLock', 'Pause',
      // Otras teclas especiales
      'ContextMenu', 'PrintScreen', 'Print',
      // Teclas del teclado numérico (cuando NumLock está desactivado)
      'Clear', 'Select', 'Execute', 'Help',
      // Teclas multimedia
      'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute',
      'MediaTrackNext', 'MediaTrackPrevious', 'MediaStop', 'MediaPlayPause',
      // Teclas de navegador
      'BrowserBack', 'BrowserForward', 'BrowserRefresh', 'BrowserStop',
      'BrowserSearch', 'BrowserFavorites', 'BrowserHome',
      // Teclas de aplicación
      'LaunchMail', 'LaunchApp1', 'LaunchApp2',
      // Windows/OS specific
      'OS', 'Win', 'FnLock', 'Fn', 'Hyper', 'Super',
      // Teclas de proceso
      'Process', 'Attn', 'CrSel', 'ExSel',
      // Dead keys
      'Dead', 'Compose', 'Alphanumeric'
    ];
    
    // Verificar si es una tecla bloqueada
    if (blockedKeys.includes(key)) {
      return;
    }
    
    // Verificar si la tecla tiene más de 1 carácter (teclas especiales como "Shift", "Meta", etc.)
    if (key.length > 1 && key !== 'Backspace') {
      // Es una tecla especial que no queremos, ignorarla
      return;
    }
    
    // SOLO permitir:
    // 1. Letras del alfabeto (A-Z, a-z)
    // 2. Backspace
    const upperKey = key.toUpperCase();
    
    if (key === 'Backspace') {
      handleBackspace();
    }
    else if (upperKey >= 'A' && upperKey <= 'Z' && key.length === 1) {
      // Solo letras individuales del alfabeto
      handleLetterInput(upperKey);
    }
    // Cualquier otra tecla se ignora silenciosamente
  };

  // Manejar borrado de letra con Backspace
  const handleBackspace = () => {
    if (!selectedCell || gameCompleted || !currentClue) return;
    
    // Cambiar a modo libre cuando se use Backspace
    setSequentialWriting(false);
    
    // Verificar si la palabra actual ya está completada y bloqueada
    const clueKey = `${currentClue.number}-${currentClue.direction}`;
    if (completedWords.has(clueKey)) {
      toast('Esta palabra ya está completada y bloqueada', {
        duration: 2000,
        icon: '🔒',
        style: {
          background: '#6B7280',
          color: '#fff',
        },
      });
      return;
    }
    
    const { row, col } = selectedCell;
    const clue = currentClue;
    const currentAnswer = userAnswers[clueKey] || {};
    const letterIndex = clue.direction === 'across' ? col - clue.col : row - clue.row;
    
    if (letterIndex >= 0 && letterIndex < clue.length && currentAnswer[letterIndex]) {
      // Crear objeto con las letras existentes
      const answerObject = { ...currentAnswer };
      
      // Borrar la letra en la posición específica
      delete answerObject[letterIndex];
      
      setUserAnswers(prev => ({
        ...prev,
        [clueKey]: answerObject
      }));
    }
  };


  // Verificar si el juego está completo
  const checkGameCompletion = useCallback(() => {
    const totalClues = clues.length;
    const completedClues = completedWords.size;
    
    if (completedClues === totalClues && !gameCompleted) {
      setGameCompleted(true);
      onComplete();
    }
  }, [clues.length, completedWords.size, gameCompleted, onComplete]);

  // Verificar finalización automáticamente cuando cambien las palabras completadas
  useEffect(() => {
    
    if (completedWords.size > 0 && clues.length > 0) {
      checkGameCompletion();
    }
  }, [completedWords.size, checkGameCompletion, clues.length, gameCompleted]);

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    useHint: () => {
      if (hintCount >= 3) {
        toast.error('Ya has usado todas las pistas disponibles', {
          duration: 2000,
          icon: '⚠️'
        });
        return;
      }

      // Encontrar una pista sin completar
      const incompleteClues = clues.filter(clue => {
        const clueKey = `${clue.number}-${clue.direction}`;
        const userAnswer = userAnswers[clueKey] || {};
        // Reconstruir la palabra desde el objeto
        const answerArray = [];
        for (let i = 0; i < clue.length; i++) {
          answerArray[i] = userAnswer[i] || '';
        }
        const answerString = answerArray.join('');
        return answerString !== clue.word;
      });

      if (incompleteClues.length === 0) {
        toast('Todas las palabras ya han sido completadas', {
          duration: 2000,
          icon: 'ℹ️',
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        });
        return;
      }

      const randomClue = incompleteClues[Math.floor(Math.random() * incompleteClues.length)];
      const clueKey = `${randomClue.number}-${randomClue.direction}`;
      
      // Revelar la palabra completa
      setUserAnswers(prev => ({
        ...prev,
        [clueKey]: randomClue.word
      }));
      
      // Marcar la palabra como completada y bloqueada
      setCompletedWords(prev => {
        const newSet = new Set([...prev, clueKey]);
        return newSet;
      });
      
      setHintCount(prev => prev + 1);
      onHintUsed();
      
      toast.success(`Pista aplicada: "${randomClue.word}" - ${randomClue.definition}`, {
        duration: 3000,
        icon: '💡'
      });
      
      // Mostrar curiosidad después de aplicar la pista
      setTimeout(() => {
        toast(randomClue.curiosity, {
          duration: 4000,
          icon: '✨',
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        });
      }, 1000);
      
      // La verificación de finalización se hace automáticamente en el useEffect
    }
  }), [clues, userAnswers, hintCount, onHintUsed, completedWords]);

  // Calcular progreso - usar solo palabras correctas y bloqueadas
  const completedClues = completedWords.size;
  const totalClues = clues.length;
  const progress = totalClues > 0 ? Math.round((completedClues / totalClues) * 100) : 0;

  // Configuración de las columnas laterales
  const leftSidebarConfig = {
    type: 'left',
    title: 'Base Facultades (Entrevistas)',
    subtitle: 'Crucigrama Académico Interactivo',
    sections: [
      {
        title: '🎯 ¡El lugar donde comienza tu camino académico!',
        type: 'text',
        content: 'Somos las encargadas de guiarte hacia el programa adecuado para ti, de acuerdo con tus intereses y habilidades. En las entrevistas, te asesoramos sobre los requisitos y te ayudamos a tomar decisiones clave para tu carrera. ¡Es el primer paso para formar parte de una comunidad académica única!'
      },
      
      {
        title: '💡 Beneficios para ti',
        type: 'list',
        items: [
          'Orientación vocacional profesional',
          'Conocimiento profundo de carreras',
          'Decisión informada sobre tu futuro',
          'Conexión directa con facultades',
          'Preparación para el mundo laboral'
        ]
      },
      
      {
        title: '📚 Categorías Temáticas',
        type: 'list',
        items: [
          'Facultades universitarias y áreas de estudio',
          'Profesiones y carreras profesionales',
          'Materias y asignaturas académicas',
          'Conceptos y términos del mundo académico'
        ]
      }
    ]
  };

  const rightSidebarConfig = {
    type: 'right',
    title: 'Instrucciones del Crucigrama',
    subtitle: 'Crucigrama Académico 10x10',
    sections: [
      {
        title: '🎮 Cómo Jugar',
        type: 'instructions',
        instructions: [
          'Haz clic en una celda para comenzar a escribir una palabra',
          'Escritura secuencial: Se mueve automáticamente entre celdas',
          'La validación ocurre al completar todas las letras de la palabra',
          'Cada palabra correcta muestra una curiosidad académica'
        ]
      },
      
      {
        title: '⏱️ Penalización por Tiempo',
        type: 'list',
        items: [
          '≤ 7 min: -0 estrellas ✅',
          '7-9 min: -1 estrella ⚠️',
          '9-11 min: -2 estrellas ⚠️',
          '11-14 min: -3 estrellas ❌'
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
      { label: 'Palabras Completadas', value: `${completedWords.size}/${totalClues}`, color: 'text-green-600' },
      { label: 'Palabras Bloqueadas', value: completedWords.size.toString(), color: 'text-green-800' },
      { label: 'Pistas Usadas', value: `${hintCount}/3`, color: 'text-yellow-600' },
      { label: 'Errores', value: errors.toString(), color: 'text-red-600' },
      { label: 'Pista Actual', value: currentClue ? `${currentClue.number} ${currentClue.direction === 'across' ? '→' : '↓'}` : 'Ninguna', color: 'text-blue-600' }
    ]
  };

  if (!isInitialized) {
    return (
      <div className="flex h-full w-full">
        <GameSidebar {...leftSidebarConfig} />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando Crucigrama Académico...</p>
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
        <div className="flex-1 p-4 sm:p-6">
          <div className="h-full flex flex-col">
            {/* Barra de progreso estándar */}
            <ProgressBar
              progress={progress}
              current={completedClues}
              total={totalClues}
              label="Progreso"
              unit="palabras"
              gradientColors="from-orange-500 to-red-600"
            />

            {/* Área de juego */}
              <div className="flex-1 flex items-start justify-center pt-4 mb-6">
                <div 
                  className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 max-w-4xl w-full"
                onClick={(e) => {
                  // Si se hace clic en el contenedor pero no en una celda, deseleccionar
                  if (e.target === e.currentTarget) {
                    setSelectedCell(null);
                    setCurrentClue(null);
                    setCurrentDirection('across');
                    setWritingMode(false);
                  }
                }}
              >
                {/* Instrucciones de teclado - MOVIDAS ARRIBA */}
                <div className="text-center text-gray-600 text-sm mb-4">
                  <p>Usa las teclas del alfabeto para ingresar letras.</p>
                  
                  <p className="mt-2 text-xs">
                    {sequentialWriting 
                      ? 'Se mueve automáticamente entre celdas' 
                      : 'Haz clic en cualquier casilla para escribir ahí'
                    }
                  </p>
                  {currentClue && writingMode && (
                    <p className="mt-2 text-blue-600 font-semibold">
                      Palabra {currentClue.number}: {currentClue.direction === 'across' ? '→' : '↓'} {currentClue.definition}
                    </p>
                  )}
                  {!writingMode && (
                    <p className="mt-2 text-orange-600 font-semibold">
                      Haz clic en una celda para comenzar a escribir.
                    </p>
                  )}
                </div>

                {/* Crucigrama */}
                 <div className="grid gap-1 bg-orange-50 p-2 rounded-lg border border-orange-200" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                  {crossword.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const hasLetter = cell !== '';
                      const clue = findClueForCell(rowIndex, colIndex);
                      const clueKey = clue ? `${clue.number}-${clue.direction}` : null;
                      const userAnswer = clueKey ? userAnswers[clueKey] || {} : {};
                      const letterIndex = clue ? (clue.direction === 'across' ? colIndex - clue.col : rowIndex - clue.row) : -1;
                      const userLetter = userAnswer[letterIndex] || '';
                      
                      // Verificar si hay letras de otras palabras que cruzan en esta celda
                      const allCluesForCell = clues.filter(c => {
                        if (c.direction === 'across') {
                          return c.row === rowIndex && colIndex >= c.col && colIndex < c.col + c.length;
                        } else {
                          return c.col === colIndex && rowIndex >= c.row && rowIndex < c.row + c.length;
                        }
                      });
                      
                      // Buscar la primera letra disponible de cualquier palabra que cruce
                      let displayLetter = userLetter;
                      if (!displayLetter) {
                        for (const crossClue of allCluesForCell) {
                          const crossClueKey = `${crossClue.number}-${crossClue.direction}`;
                          const crossAnswer = userAnswers[crossClueKey] || {};
                          const crossLetterIndex = crossClue.direction === 'across' ? colIndex - crossClue.col : rowIndex - crossClue.row;
                          if (crossAnswer[crossLetterIndex]) {
                            displayLetter = crossAnswer[crossLetterIndex];
                            break;
                          }
                        }
                      }
                      
                      const isBlocked = clueKey ? completedWords.has(clueKey) : false;
                      
                      return (
                         <div
                           key={`${rowIndex}-${colIndex}`}
                             className={`
                              flex items-center justify-center text-xs font-bold relative rounded-md
                              ${!hasLetter 
                                ? 'w-0 h-0 border-0 bg-transparent' 
                                : isBlocked
                                  ? 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-200 border-2 border-green-700 text-green-800 cursor-not-allowed shadow-md'
                                  : isSelected 
                                    ? 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-200 border-2 border-blue-700 cursor-pointer shadow-lg' 
                                    : displayLetter
                                      ? 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-yellow-100 border-2 border-orange-700 text-yellow-800 cursor-pointer shadow-md'
                                      : 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white border-2 border-orange-700 hover:bg-orange-100 cursor-pointer shadow-md'
                              }
                              ${hasLetter && (rowIndex + 1) % 3 === 0 ? 'border-b-4 border-b-orange-500' : ''}
                              ${hasLetter && (colIndex + 1) % 3 === 0 ? 'border-r-4 border-r-orange-500' : ''}
                           `}
                           onClick={(e) => {
                             e.stopPropagation(); // Evitar que se propague al contenedor
                             handleCellClick(rowIndex, colIndex);
                           }}
                         >
                           {/* Número de pista */}
                           {hasLetter && clue && clue.row === rowIndex && clue.col === colIndex && (
                              <div className="absolute top-0 left-0 text-xs font-bold text-gray-700 bg-white rounded-br-sm px-0.5 py-0.5 leading-none border-r border-b border-gray-400 scale-75">
                               {clue.number}
                             </div>
                           )}
                           {/* Letra */}
                           {displayLetter || ''}
                         </div>
                      );
                    })
                  )}
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

export default CrosswordPuzzle;

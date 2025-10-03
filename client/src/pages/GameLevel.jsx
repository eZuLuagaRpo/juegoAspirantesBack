import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { 
  Star, 
  Clock, 
  HelpCircle, 
  Trophy,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import Phaser from 'phaser';
import RewardNotification from '../components/RewardNotification';
import WordSearch from '../components/puzzles/WordSearch';
import JigsawPuzzle from '../components/puzzles/JigsawPuzzle';
import SudokuPuzzle from '../components/puzzles/SudokuPuzzle';
import SequentialPuzzle from '../components/puzzles/SequentialPuzzle';
import AssociationPuzzle from '../components/puzzles/AssociationPuzzle';
import CrosswordPuzzle from '../components/puzzles/CrosswordPuzzle';
import MathPuzzle from '../components/puzzles/MathPuzzle';
import MemoryMatchPuzzle from '../components/puzzles/MemoryMatchPuzzle';
import { useBestReward } from '../hooks/useBestReward';

const GameLevel = () => {
  const { levelId } = useParams();
  const { user } = useAuth();
  const { 
    levels, 
    userProgress, 
    updateProgress, 
    calculateStars,
    checkNewRewards,
    getNextPuzzle,
    isLevelLocked
  } = useGame();
  const navigate = useNavigate();
  
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);
  const jigsawRef = useRef(null);
  const wordSearchRef = useRef(null);
  const sudokuRef = useRef(null);
  const sequentialRef = useRef(null);
  const associationRef = useRef(null);
  const crosswordRef = useRef(null);
  const mathRef = useRef(null);
  const memoryMatchRef = useRef(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, completed
  const [timeSpent, setTimeSpent] = useState(0);
  const [errors, setErrors] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [finalStars, setFinalStars] = useState(0);
  const [newRewards, setNewRewards] = useState([]);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [showBestReward, setShowBestReward] = useState(false);
  const [nextPuzzleData, setNextPuzzleData] = useState(null);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [loadingNextPuzzle, setLoadingNextPuzzle] = useState(false);

  // Usar el hook de mejor recompensa
  const {
    bestReward,
    previousBestReward,
    checkForNewBestReward
  } = useBestReward(userProgress);

  const level = levels.find(l => l.id === levelId);
  // Usar nextPuzzleData si está disponible, sino usar el puzzle del índice
  const currentPuzzleData = nextPuzzleData || level?.puzzles[currentPuzzle];
  
  
  // Determinar si es un puzzle especial que requiere componente personalizado
  const isSpecialPuzzle = currentPuzzleData?.type === 'dragdrop_calculation';
  const isWordSearchPuzzle = currentPuzzleData?.type === 'wordsearch';
  const isJigsawPuzzle = currentPuzzleData?.type === 'jigsaw';
  const isSudokuPuzzle = currentPuzzleData?.type === 'sudoku';
  const isSequentialPuzzle = currentPuzzleData?.type === 'sequential';
  const isAssociationPuzzle = currentPuzzleData?.type === 'association';
  const isCrosswordPuzzle = currentPuzzleData?.type === 'crossword';
  const isMathPuzzle = currentPuzzleData?.type === 'math';
  const isMemoryMatchPuzzle = currentPuzzleData?.type === 'memorymatch';


  // Scroll automático hacia arriba cuando se carga el componente o cambia el puzzle
  useEffect(() => {
    // Scroll inmediato al cargar el componente
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [levelId]);

  // Scroll suave cuando cambia el puzzle
  useEffect(() => {
    if (currentPuzzleData) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentPuzzle, currentPuzzleData]);

  // Cargar siguiente puzzle disponible al montar el componente
  useEffect(() => {
    const loadNextPuzzle = async () => {
      if (!userProgress || !levelId) return;
      
      // Verificar si el nivel está bloqueado
      if (isLevelLocked(levelId)) {
        setLevelCompleted(true);
        return;
      }
      
      try {
        const result = await getNextPuzzle(levelId);
        if (result.success) {
          if (result.data.levelCompleted) {
            setLevelCompleted(true);
          } else {
            setNextPuzzleData(result.data.nextPuzzle);
            setCurrentPuzzle(result.data.puzzleIndex);
            // Resetear el estado del juego para el nuevo puzzle
            setTimeSpent(0);
            setErrors(0);
            setHintsUsed(0);
            setGameState('playing');
            setShowResults(false);
          }
        }
      } catch (error) {
        // Si hay error, intentar ir al último puzzle del nivel
        if (level && level.puzzles.length > 1) {
          const lastPuzzleIndex = level.puzzles.length - 1;
          const lastPuzzle = level.puzzles[lastPuzzleIndex];
          setNextPuzzleData(lastPuzzle);
          setCurrentPuzzle(lastPuzzleIndex);
          setTimeSpent(0);
          setErrors(0);
          setHintsUsed(0);
          setGameState('playing');
          setShowResults(false);
        }
      }
    };
    
    // Solo cargar si tenemos los datos necesarios
    if (userProgress && levelId) {
      loadNextPuzzle();
    }
  }, [levelId, userProgress?.userId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);


  // Initialize Phaser game
  useEffect(() => {
    if (!level || !currentPuzzleData) return;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainerRef.current,
      backgroundColor: '#f0f0f0',
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      render: {
        antialias: false,
        pixelArt: true
      },
      audio: {
        disableWebAudio: true,
        noAudio: true
      },
      banner: false
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [level, currentPuzzle]);

  // Game scene functions
  const preload = function() {
    // No cargar imágenes innecesarias que causan errores de WebGL
  };

  const create = function() {
    // Crear el puzzle específico según el tipo
    createPuzzle(this, currentPuzzleData);
  };

  const update = function() {
    // Lógica de actualización del juego
    updatePuzzle(this);
  };

  // Crear puzzle específico
  const createPuzzle = (scene, puzzleData) => {
    const { type, title, description } = puzzleData;
    
    // Fondo
    scene.add.rectangle(400, 300, 800, 600, 0xf0f0f0);
    
    // Título del puzzle
    scene.add.text(400, 50, title, {
      fontSize: '32px',
      fill: '#333',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Descripción
    scene.add.text(400, 100, description, {
      fontSize: '18px',
      fill: '#666',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Crear puzzle según el tipo
    switch (type) {
      case 'puzzle':
        createDragAndDropPuzzle(scene);
        break;
      case 'quiz':
        createQuizPuzzle(scene);
        break;
      default:
        createDefaultPuzzle(scene);
    }
  };

  // Puzzle de arrastrar y soltar
  const createDragAndDropPuzzle = (scene) => {
    // Crear elementos arrastrables
    const elements = [
      { text: 'Documento 1', x: 100, y: 200, correctX: 300, correctY: 300 },
      { text: 'Documento 2', x: 200, y: 200, correctX: 400, correctY: 300 },
      { text: 'Documento 3', x: 300, y: 200, correctX: 500, correctY: 300 }
    ];

    elements.forEach((element, index) => {
      const rect = scene.add.rectangle(element.x, element.y, 120, 60, 0x4a90e2);
      const text = scene.add.text(element.x, element.y, element.text, {
        fontSize: '14px',
        fill: '#fff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      rect.setInteractive();
      scene.input.setDraggable(rect);

      // Zona objetivo
      const targetZone = scene.add.rectangle(element.correctX, element.correctY, 140, 80, 0x90e2a4, 0.3);
      targetZone.setStrokeStyle(2, 0x4a90e2);

      // Eventos de arrastre
      scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
        text.x = dragX;
        text.y = dragY;
      });

      scene.input.on('dragend', (pointer, gameObject) => {
        const distance = Phaser.Math.Distance.Between(
          gameObject.x, gameObject.y,
          element.correctX, element.correctY
        );

        if (distance < 70) {
          // Colocado correctamente
          gameObject.setFillStyle(0x90e2a4);
          targetZone.setFillStyle(0x90e2a4, 0.8);
          checkPuzzleCompletion(scene, elements);
        } else {
          // Colocado incorrectamente
          gameObject.setFillStyle(0xe24a4a);
          setErrors(prev => prev + 1);
          toast.error('¡Ups! Intenta de nuevo');
        }
      });
    });
  };

  // Puzzle de quiz
  const createQuizPuzzle = (scene) => {
    const questions = [
      {
        question: '¿Cuál es el primer paso para la inscripción?',
        options: ['Pagar matrícula', 'Completar documentos', 'Elegir horarios', 'Ir a bienestar'],
        correct: 1
      }
    ];

    const currentQ = questions[0];
    
    // Pregunta
    scene.add.text(400, 150, currentQ.question, {
      fontSize: '20px',
      fill: '#333',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Opciones
    currentQ.options.forEach((option, index) => {
      const button = scene.add.rectangle(400, 250 + (index * 60), 400, 50, 0x4a90e2);
      const text = scene.add.text(400, 250 + (index * 60), option, {
        fontSize: '16px',
        fill: '#fff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      button.setInteractive();
      button.on('pointerdown', () => {
        if (index === currentQ.correct) {
          button.setFillStyle(0x90e2a4);
          toast.success('¡Correcto!');
          setTimeout(() => {
            completePuzzle();
          }, 1000);
        } else {
          button.setFillStyle(0xe24a4a);
          setErrors(prev => prev + 1);
          toast.error('Incorrecto, intenta de nuevo');
        }
      });

      button.on('pointerover', () => {
        button.setFillStyle(0x357abd);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x4a90e2);
      });
    });
  };

  // Puzzle por defecto
  const createDefaultPuzzle = (scene) => {
    scene.add.text(400, 300, 'Puzzle en desarrollo...', {
      fontSize: '24px',
      fill: '#666',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  };

  // Verificar completación del puzzle
  const checkPuzzleCompletion = (scene, elements) => {
    // Verificar si todos los elementos están en su lugar correcto
    const allCorrect = elements.every(element => {
      const distance = Phaser.Math.Distance.Between(
        element.x, element.y,
        element.correctX, element.correctY
      );
      return distance < 70;
    });

    if (allCorrect) {
      toast.success('¡Puzzle completado!');
      setTimeout(() => {
        completePuzzle();
      }, 1000);
    }
  };

  // Actualizar puzzle
  const updatePuzzle = (scene) => {
    // Lógica de actualización si es necesaria
  };

  // Completar puzzle
  const completePuzzle = async () => {
    setGameState('completed');
    
    // Calcular estrellas
    const stars = await calculateStars(
      currentPuzzleData.id,
      timeSpent,
      errors,
      hintsUsed
    );
    
    setFinalStars(stars);
    setShowResults(true);

    // Actualizar progreso
    const progressResult = await updateProgress(
      levelId,
      currentPuzzleData.id,
      stars,
      true
    );

    // Verificar si es el último puzzle del último nivel
    const isLastLevel = levelId === 'cartera';
    const isLastPuzzle = currentPuzzle === (level?.puzzles.length - 1);
    
    if (isLastLevel && isLastPuzzle) {
      // Es el último puzzle del último nivel, marcar como completado
      setLevelCompleted(true);
    }

    // Verificar si hay una nueva mejor recompensa después de actualizar el progreso
    if (progressResult?.success) {
      // Esperar un momento para que el contexto se actualice
      setTimeout(() => {
        const hasNewBestReward = checkForNewBestReward(userProgress);
        if (hasNewBestReward) {
          setShowBestReward(true);
        }
      }, 500);
    }

    // Las recompensas se verifican automáticamente en el GameContext
    // No es necesario verificar aquí para evitar bucles infinitos
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
    
    // Si es el rompecabezas, usar su lógica de pista
    if (isJigsawPuzzle) {
      if (jigsawRef.current) {
        jigsawRef.current.useHint();
      }
    } else if (isWordSearchPuzzle) {
      // Para la sopa de letras, llamar a la función useHint del componente WordSearch
      if (wordSearchRef.current) {
        wordSearchRef.current.useHint();
      }
    } else if (isSudokuPuzzle) {
      // Para el Sudoku, llamar a la función useHint del componente SudokuPuzzle
      if (sudokuRef.current) {
        sudokuRef.current.useHint();
      }
    } else if (isSequentialPuzzle) {
      // Para el puzzle secuencial, llamar a la función useHint del componente SequentialPuzzle
      if (sequentialRef.current) {
        sequentialRef.current.useHint();
      }
    } else if (isAssociationPuzzle) {
      // Para el puzzle de asociaciones, llamar a la función useHint del componente AssociationPuzzle
      if (associationRef.current) {
        associationRef.current.useHint();
      }
    } else if (isCrosswordPuzzle) {
      // Para el crucigrama, llamar a la función useHint del componente CrosswordPuzzle
      if (crosswordRef.current) {
        crosswordRef.current.useHint();
      }
    } else if (isMathPuzzle) {
      // Para el puzzle matemático, llamar a la función useHint del componente MathPuzzle
      if (mathRef.current) {
        mathRef.current.useHint();
      }
    } else if (isMemoryMatchPuzzle) {
      // Para el Memory Match, llamar a la función useHint del componente MemoryMatchPuzzle
      if (memoryMatchRef.current) {
        memoryMatchRef.current.useHint();
      }
    } else {
      // Para otros puzzles
      setHintsUsed(prev => prev + 1);
      toast('💡 Pista: Lee cuidadosamente las instrucciones');
    }
  };


  // Función para completar automáticamente el puzzle (solo para desarrollo)
  const completePuzzleForTesting = () => {
    if (process.env.NODE_ENV === 'production') {
      toast.error('Esta función solo está disponible en modo desarrollo', {
        duration: 3000,
        icon: '🚫'
      });
      return;
    }

    toast.success('🧪 Completando puzzle automáticamente...', {
      duration: 2000,
      icon: '⚡'
    });

    // Simular un tiempo mínimo de juego
    setTimeout(() => {
      completePuzzle();
    }, 1000);
  };

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      // Parar música si está reproduciéndose
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  // Siguiente puzzle
  const nextPuzzle = async () => {
    try {
      setLoadingNextPuzzle(true);
      
      // Verificar si es el último nivel (cartera) y el último puzzle
      const isLastLevel = levelId === 'cartera';
      const isLastPuzzle = currentPuzzle === (level?.puzzles.length - 1);
      
      if (isLastLevel && isLastPuzzle) {
        // Es el último puzzle del último nivel, marcar como completado
        setLevelCompleted(true);
        return;
      }
      
      // Obtener el siguiente puzzle disponible
      const result = await getNextPuzzle(levelId);
      
      if (result.success) {
        if (result.data.levelCompleted) {
          // Nivel completado completamente
          setLevelCompleted(true);
          // No navegar automáticamente, mostrar pantalla de completado
        } else {
          // Hay más puzzles disponibles
          setNextPuzzleData(result.data.nextPuzzle);
          setCurrentPuzzle(result.data.puzzleIndex);
          setTimeSpent(0);
          setErrors(0);
          setHintsUsed(0);
          setGameState('playing');
          setShowResults(false);
          // Scroll hacia arriba al cambiar de puzzle
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      } else {
        // Error, ir al dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      navigate('/dashboard');
    } finally {
      setLoadingNextPuzzle(false);
    }
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!level) {
    return <div>Cargando nivel...</div>;
  }

  // Mostrar pantalla de carga solo cuando se está cargando el siguiente puzzle (no en la carga inicial)
  if (loadingNextPuzzle && nextPuzzleData) {
    return (
      <div className="min-h-screen bg-usb-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-usb-orange-500 mx-auto mb-4"></div>
          <p className="text-usb-light">Cargando siguiente puzzle...</p>
        </div>
      </div>
    );
  }

  // Si el nivel está completado, mostrar pantalla de nivel completado
  if (levelCompleted) {
    return (
      <div className="min-h-screen bg-usb-gray-50 flex items-center justify-center">
        <div className="bg-usb-white rounded-xl p-8 text-center max-w-md usb-shadow-lg">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-usb-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold usb-dark mb-2">
              ¡Nivel Completado!
            </h2>
            <p className="text-usb-light">
              Has completado todos los puzzles de este nivel. ¡Excelente trabajo!
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-usb-gray-50">
      {/* Header del juego */}
      <div className="bg-usb-white shadow-lg border-b border-usb-gray-200">
        <div className="responsive-container py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold usb-dark">
                  {level.name}
                </h1>
                <p className="text-xs usb-light">
                  Puzzle {currentPuzzle + 1} de {level.puzzles.length}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2 lg:gap-3">
              {/* Tiempo */}
              <div className="flex items-center space-x-1 bg-usb-gray-100 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3 usb-light" />
                <span className="font-mono text-xs usb-dark">{formatTime(timeSpent)}</span>
              </div>

              {/* Errores */}
              <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-md">
                <span className="text-usb-red font-medium text-xs">{errors}</span>
                <span className="text-xs text-usb-red hidden sm:inline">errores</span>
              </div>

              {/* Pistas */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
                hintsUsed >= 3 ? 'bg-gray-100' : 'bg-usb-orange-100'
              }`}>
                <span className={`font-medium text-xs ${
                  hintsUsed >= 3 ? 'text-gray-500' : 'text-usb-orange-600'
                }`}>
                  {hintsUsed}/3
                </span>
                <span className={`text-xs ${
                  hintsUsed >= 3 ? 'text-gray-500' : 'text-usb-orange-600'
                } hidden sm:inline`}>
                  pistas
                </span>
              </div>

              {/* Controles */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={useHint}
                  disabled={hintsUsed >= 3}
                  className={`p-1.5 rounded-md transition-colors ${
                    hintsUsed >= 3 
                      ? 'bg-gray-200 cursor-not-allowed' 
                      : 'bg-usb-orange-100 hover:bg-usb-orange-200'
                  }`}
                  title={hintsUsed >= 3 ? 'No hay pistas disponibles' : 'Usar pista'}
                >
                  <HelpCircle className={`w-3.5 h-3.5 ${
                    hintsUsed >= 3 ? 'text-gray-400' : 'text-usb-orange-600'
                  }`} />
                </button>

                {/* Botón de prueba - Solo visible en desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={completePuzzleForTesting}
                    className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors border border-yellow-300"
                    title="🧪 Completar puzzle automáticamente (solo desarrollo)"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor del juego */}
      <div className="flex justify-center py-3 sm:py-4 lg:py-6 h-full">
        <div className="game-container-responsive w-full">
        {isWordSearchPuzzle ? (
          // Puzzle de sopa de letras - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <WordSearch
              ref={wordSearchRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isJigsawPuzzle ? (
          // Puzzle de rompecabezas - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <JigsawPuzzle
              ref={jigsawRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isSudokuPuzzle ? (
          // Puzzle de Sudoku - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <SudokuPuzzle
              ref={sudokuRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isSequentialPuzzle ? (
          // Puzzle de Orden Secuencial - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <SequentialPuzzle
              ref={sequentialRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isAssociationPuzzle ? (
          // Puzzle de Asociaciones - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <AssociationPuzzle
              ref={associationRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isCrosswordPuzzle ? (
          // Puzzle de Crucigrama - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <CrosswordPuzzle
              ref={crosswordRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isMathPuzzle ? (
          // Puzzle Matemático - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <MathPuzzle
              ref={mathRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isMemoryMatchPuzzle ? (
          // Memory Match - Usar todo el ancho y alto disponible
          <div className="w-full h-full">
            <MemoryMatchPuzzle
              ref={memoryMatchRef}
              puzzleData={currentPuzzleData}
              onComplete={completePuzzle}
              onHintUsed={() => setHintsUsed(prev => prev + 1)}
              onError={() => setErrors(prev => prev + 1)}
              timeSpent={timeSpent}
              errors={errors}
              hintsUsed={hintsUsed}
            />
          </div>
        ) : isSpecialPuzzle ? (
          // Puzzle especial de cartera
          <div className="w-full max-w-6xl">
          </div>
        ) : (
          // Puzzle estándar de Phaser
          <div className="bg-usb-white rounded-lg usb-shadow-lg border border-usb-gray-200 overflow-hidden w-full max-w-4xl mx-auto">
            <div
              ref={gameContainerRef}
              id="game-container"
              className="w-full h-[50vh] sm:h-[60vh] lg:h-[500px]"
            ></div>
          </div>
        )}
        </div>
      </div>

      {/* Resultados del puzzle */}
      {showResults && (
        <div className="fixed inset-0 bg-usb-black-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-usb-white rounded-xl p-8 text-center max-w-md usb-shadow-lg">
            <h2 className="text-2xl font-bold usb-dark mb-4">
              ¡Puzzle Completado!
            </h2>
            
            <div className="mb-6">
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= finalStars ? 'text-usb-gold' : 'text-usb-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-lg usb-dark mb-2">
                Obtuviste {finalStars} de 5 estrellas
              </p>
              
              <div className="text-sm usb-light space-y-1">
                <p>Tiempo: {formatTime(timeSpent)}</p>
                <p>Errores: {errors}</p>
                <p>Pistas: {hintsUsed}</p>
              </div>
            </div>

            {/* Notificación de nuevas recompensas */}
            {showRewardNotification && newRewards.length > 0 && (
              <RewardNotification
                rewards={newRewards}
                variant="modal"
                onClose={() => setShowRewardNotification(false)}
              />
            )}

            {/* Notificación de mejor recompensa actual */}
            {showBestReward && bestReward && (
              <div className="mb-4">
                <RewardNotification
                  bestReward={bestReward}
                  variant="best-reward"
                  showAnimation={true}
                  onClose={() => setShowBestReward(false)}
                />
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={nextPuzzle}
                className="btn-primary w-full"
              >
                {levelCompleted ? 'Completar Nivel' : 'Siguiente Puzzle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLevel;

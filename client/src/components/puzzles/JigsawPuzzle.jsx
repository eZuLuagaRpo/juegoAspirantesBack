import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const PUZZLE_CONFIG = {
  rows: 4,
  cols: 6,
  snapThreshold: 50,
  pieceSpacing: 10
};

const JigsawPuzzle = forwardRef(({ onComplete, onHintUsed, onError, timeSpent }, ref) => {
  const [pieces, setPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState([]);
  const [moves, setMoves] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [puzzleImage, setPuzzleImage] = useState(null);
  const [draggedPieceId, setDraggedPieceId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [blockedPosition, setBlockedPosition] = useState(null);
  const [lastValidationCount, setLastValidationCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [puzzleDimensions, setPuzzleDimensions] = useState({
    pieceWidth: 180,
    pieceHeight: 135,
    imageWidth: 1080,
    imageHeight: 540,
    assemblyAreaX: 50,
    assemblyAreaY: 50
  });

  // Calcular dimensiones responsivas del puzzle
  const calculatePuzzleDimensions = useCallback(() => {
    const gameArea = document.getElementById('puzzle-game-area');
    if (!gameArea) return;

    const containerWidth = gameArea.offsetWidth;
    const containerHeight = gameArea.offsetHeight;
    
    // Calcular el tamaño máximo que puede tener el puzzle
    const maxWidth = Math.min(containerWidth - 50, 1400); // 50px de margen, tamaño más grande
    const maxHeight = Math.min(containerHeight - 250, 900); // 250px para el área de piezas, más espacio
    
    // Calcular dimensiones de piezas basadas en el contenedor
    const pieceWidth = Math.floor(maxWidth / PUZZLE_CONFIG.cols);
    const pieceHeight = Math.floor(maxHeight / PUZZLE_CONFIG.rows);
    
    // Usar la dimensión más pequeña para mantener proporciones cuadradas
    const finalPieceSize = Math.min(pieceWidth, pieceHeight);
    
    const imageWidth = finalPieceSize * PUZZLE_CONFIG.cols;
    const imageHeight = finalPieceSize * PUZZLE_CONFIG.rows;
    
    // Centrar el área de ensamblaje
    const assemblyAreaX = Math.max(50, (containerWidth - imageWidth) / 2);
    const assemblyAreaY = 50;
    
    const newDimensions = {
      pieceWidth: finalPieceSize,
      pieceHeight: finalPieceSize,
      imageWidth,
      imageHeight,
      assemblyAreaX,
      assemblyAreaY
    };
    
    setPuzzleDimensions(newDimensions);
    
    // Actualizar posiciones de piezas existentes sin recrear el puzzle
    updatePiecesPositions(newDimensions);
  }, []);

  // Actualizar posiciones de piezas existentes cuando cambien las dimensiones
  const updatePiecesPositions = useCallback((newDimensions) => {
    // Solo actualizar si el juego ya está inicializado
    if (!isInitialized) return;

    setPieces(prevPieces => 
      prevPieces.map(piece => {
        if (piece.isPlaced) {
          // Recalcular posición correcta basada en las nuevas dimensiones
          const correctX = newDimensions.assemblyAreaX + piece.col * newDimensions.pieceWidth;
          const correctY = newDimensions.assemblyAreaY + piece.row * newDimensions.pieceHeight;
          
          return {
            ...piece,
            correctX,
            correctY,
            x: correctX,
            y: correctY
          };
        } else {
          // Para piezas no colocadas, mantener su posición relativa pero ajustar el área de piezas
          const piecesAreaYStart = newDimensions.assemblyAreaY + newDimensions.imageHeight + 50;
          const piecesAreaYEnd = piecesAreaYStart + 150 - newDimensions.pieceHeight;
          
          // Si la pieza está en el área de piezas, ajustar su posición
          if (piece.y > puzzleDimensions.assemblyAreaY + puzzleDimensions.imageHeight) {
            const newY = piecesAreaYStart + Math.random() * (piecesAreaYEnd - piecesAreaYStart);
            return {
              ...piece,
              y: newY,
              startY: newY
            };
          }
          
          return piece;
        }
      })
    );
  }, [puzzleDimensions, isInitialized]);

  // Cargar imagen del campus
  const loadCampusImage = useCallback(() => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setPuzzleImage(img.src);
        resolve(img.src);
      };
      img.onerror = () => {
        // Imagen de respaldo si falla la carga
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = PUZZLE_CONFIG.imageWidth;
        canvas.height = PUZZLE_CONFIG.imageHeight;
        
        // Crear imagen de respaldo
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(0.5, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir texto
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CAMPUS', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Universidad', canvas.width / 2, canvas.height / 2 + 20);
        
        const fallbackImage = canvas.toDataURL();
        setPuzzleImage(fallbackImage);
        resolve(fallbackImage);
      };
      img.src = '/banner-campus.jpg';
    });
  }, []);

  // Crear piezas del puzzle
  const createPuzzlePieces = useCallback(() => {
    const newPieces = [];
    const { rows, cols } = PUZZLE_CONFIG;
    const { pieceWidth, pieceHeight, imageWidth, imageHeight, assemblyAreaX, assemblyAreaY } = puzzleDimensions;
    
    // Área de piezas (abajo) - más espacio y mejor distribución
    const piecesAreaXStart = 50;
    const piecesAreaXEnd = imageWidth + 50 - pieceWidth; // Ajustado para el nuevo ancho
    const piecesAreaYStart = assemblyAreaY + imageHeight + 50; // Más abajo para que no tape el título
    const piecesAreaYEnd = piecesAreaYStart + 150 - pieceHeight; // Más espacio vertical

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col;
        const correctX = assemblyAreaX + col * pieceWidth;
        const correctY = assemblyAreaY + row * pieceHeight;
        
        // Posición inicial aleatoria en el área de piezas con más variación
        const randomX = piecesAreaXStart + Math.random() * (piecesAreaXEnd - piecesAreaXStart);
        const randomY = piecesAreaYStart + Math.random() * (piecesAreaYEnd - piecesAreaYStart);
        
        // Añadir rotación aleatoria para mayor desorden
        const randomRotation = (Math.random() - 0.5) * 30; // -15 a +15 grados
        
        // Colocar las primeras 3 piezas (esquina superior izquierda, centro superior, esquina superior derecha)
        if (id === 0 || id === 1 || id === 2) {
          newPieces.push({
            id,
            row,
            col,
            correctX,
            correctY,
            x: correctX,
            y: correctY,
            startX: correctX,
            startY: correctY,
            rotation: 0,
            isPlaced: true,
            isDragging: false,
            gridX: col,
            gridY: row,
            isLocked: true // Marcar como bloqueada
          });
        } else {
          newPieces.push({
            id,
            row,
            col,
            correctX,
            correctY,
            x: randomX,
            y: randomY,
            startX: randomX,
            startY: randomY,
            rotation: randomRotation,
            isPlaced: false,
            isDragging: false
          });
        }
      }
    }
    
    // Mezclar las piezas para mayor desorden
    return newPieces.sort(() => Math.random() - 0.5);
  }, [puzzleDimensions]);

  // Manejar inicio de arrastre
  const handlePieceMouseDown = useCallback((e, piece) => {
    if (gameCompleted) return;
    
    // Bloquear las piezas iniciales (las primeras 3)
    if (piece.isLocked) {
      toast.info('Esta pieza está fija y no se puede mover', {
        duration: 2000,
        icon: '🔒'
      });
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedPieceId(piece.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    
    // Si la pieza ya estaba colocada, quitarla de la grilla
    if (piece.isPlaced) {
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === piece.id 
            ? { 
                ...p, 
                isDragging: true,
                gridX: null,
                gridY: null,
                isPlaced: false
              }
            : p
        )
      );
      
      // Quitar de la lista de piezas colocadas
      setPlacedPieces(prev => prev.filter(id => id !== piece.id));
      // Resetear contador de validación para permitir revalidar
      setLastValidationCount(0);
    } else {
      // Marcar pieza como arrastrada
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === piece.id 
            ? { ...p, isDragging: true }
            : p
        )
      );
    }
  }, [gameCompleted]);

  // Manejar arrastre
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !draggedPieceId || gameCompleted) return;
    
    e.preventDefault();
    
    const gameArea = document.getElementById('puzzle-game-area');
    if (!gameArea) return;
    
    const rect = gameArea.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    // Verificar si está sobre el área de ensamblaje para feedback visual
    const { assemblyAreaX, assemblyAreaY, imageWidth, imageHeight, pieceWidth, pieceHeight } = puzzleDimensions;
    const assemblyAreaWidth = imageWidth;
    const assemblyAreaHeight = imageHeight;
    
    // Ajustar para el centro de la pieza
    const pieceCenterX = newX + pieceWidth / 2;
    const pieceCenterY = newY + pieceHeight / 2;
    
    const isOverAssemblyArea = pieceCenterX >= assemblyAreaX && 
                              pieceCenterX <= assemblyAreaX + assemblyAreaWidth && 
                              pieceCenterY >= assemblyAreaY && 
                              pieceCenterY <= assemblyAreaY + assemblyAreaHeight;
    
    // Actualizar posición de la pieza
    setPieces(prevPieces => 
      prevPieces.map(piece => 
        piece.id === draggedPieceId 
          ? { ...piece, x: newX, y: newY, isOverAssemblyArea: isOverAssemblyArea }
          : piece
      )
    );
  }, [isDragging, draggedPieceId, dragOffset, gameCompleted, puzzleDimensions]);

  // Manejar fin de arrastre - sistema simplificado
  const handleMouseUp = useCallback((e) => {
    if (!isDragging || !draggedPieceId || gameCompleted) return;
    
    e.preventDefault();
    
    const piece = pieces.find(p => p.id === draggedPieceId);
    if (!piece) return;
    
    const { x, y } = piece;
    
    // Verificar si la pieza está en el área de ensamblaje
    const { assemblyAreaX, assemblyAreaY, imageWidth, imageHeight, pieceWidth, pieceHeight } = puzzleDimensions;
    const assemblyAreaWidth = imageWidth;
    const assemblyAreaHeight = imageHeight;
    
    const pieceCenterX = x + pieceWidth / 2;
    const pieceCenterY = y + pieceHeight / 2;
    
    const isInAssemblyArea = pieceCenterX >= assemblyAreaX && 
                            pieceCenterX <= assemblyAreaX + assemblyAreaWidth && 
                            pieceCenterY >= assemblyAreaY && 
                            pieceCenterY <= assemblyAreaY + assemblyAreaHeight;
    
    if (isInAssemblyArea) {
      // Calcular la casilla más cercana en la grilla
      const gridX = Math.floor((x - assemblyAreaX) / pieceWidth);
      const gridY = Math.floor((y - assemblyAreaY) / pieceHeight);
      
      // Asegurar que esté dentro de los límites de la grilla
      const clampedGridX = Math.max(0, Math.min(gridX, PUZZLE_CONFIG.cols - 1));
      const clampedGridY = Math.max(0, Math.min(gridY, PUZZLE_CONFIG.rows - 1));
      
      // Calcular posición final en la grilla
      const finalX = assemblyAreaX + clampedGridX * pieceWidth;
      const finalY = assemblyAreaY + clampedGridY * pieceHeight;
      
      // Verificar si ya hay una pieza en esa casilla
      const existingPiece = pieces.find(p => 
        p.isPlaced && 
        p.gridX === clampedGridX && 
        p.gridY === clampedGridY && 
        p.id !== draggedPieceId
      );
      
      if (existingPiece) {
        // Si hay una pieza en esa casilla, bloquear la colocación
        // Mostrar indicador visual de posición bloqueada
        setBlockedPosition({ x: finalX, y: finalY });
        setTimeout(() => setBlockedPosition(null), 1000);
        
        // Volver la pieza a su posición original
        setPieces(prevPieces => 
          prevPieces.map(p => 
            p.id === draggedPieceId 
              ? { 
                  ...p, 
                  x: p.startX, 
                  y: p.startY, 
                  isDragging: false
                }
              : p
          )
        );
        
        toast.error('Esta casilla ya está ocupada. Intenta en otra posición', {
          duration: 2000,
          icon: '🚫'
        });
      } else {
        // Colocar la pieza en la casilla libre
        setPieces(prevPieces => 
          prevPieces.map(p => 
            p.id === draggedPieceId 
              ? { 
                  ...p, 
                  x: finalX, 
                  y: finalY, 
                  gridX: clampedGridX,
                  gridY: clampedGridY,
                  isPlaced: true, 
                  isDragging: false
                }
              : p
          )
        );
        
        setPlacedPieces(prev => [...prev, draggedPieceId]);
        
        toast.success('Pieza colocada en la grilla', {
          duration: 1500,
          icon: '✅'
        });
      }
      
      setMoves(prev => prev + 1);
      // Resetear contador de validación para permitir revalidar
      setLastValidationCount(0);
    } else {
      // Volver a posición original si no está en el área de ensamblaje
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === draggedPieceId 
            ? { 
                ...p, 
                x: p.startX, 
                y: p.startY, 
                isDragging: false
              }
            : p
        )
      );
    }
    
    // Limpiar estado de arrastre
    setDraggedPieceId(null);
    setIsDragging(false);
  }, [isDragging, draggedPieceId, pieces, gameCompleted, placedPieces.length, puzzleDimensions]);


  // Inicializar puzzle solo una vez
  // Scroll automático al cargar el puzzle
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isInitialized) return;

    const initializePuzzle = async () => {
      try {
        await loadCampusImage();
        
        // Calcular dimensiones después de cargar la imagen
        setTimeout(() => {
          calculatePuzzleDimensions();
          
          // Crear piezas después de calcular dimensiones
          setTimeout(() => {
            const newPieces = createPuzzlePieces();
            setPieces(newPieces);
            // Las primeras 3 piezas ya están colocadas, así que agregarlas a placedPieces
            setPlacedPieces([0, 1, 2]);
            setMoves(0);
            setHintCount(0);
            setGameCompleted(false);
            setIsInitialized(true);
          }, 50);
        }, 50);
      } catch (error) {
        console.error('Error inicializando puzzle:', error);
        toast.error('Error al cargar el puzzle');
      }
    };

    initializePuzzle();
  }, [isInitialized, loadCampusImage, calculatePuzzleDimensions, createPuzzlePieces]);

  // Manejar resize por separado para no reiniciar el juego
  useEffect(() => {
    if (!isInitialized) return;

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculatePuzzleDimensions();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isInitialized, calculatePuzzleDimensions]);

  // Función para validar el puzzle cuando se coloca la última pieza
  const validatePuzzle = useCallback(() => {
    const placedPiecesList = pieces.filter(p => p.isPlaced);
    
    
    if (placedPiecesList.length !== PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols) {
      return;
    }
    
    let correctPieces = 0;
    
    placedPiecesList.forEach(piece => {
      const expectedGridX = piece.col;
      const expectedGridY = piece.row;
      
      
      if (piece.gridX === expectedGridX && piece.gridY === expectedGridY) {
        correctPieces++;
      }
    });
    
    
    if (correctPieces === PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols) {
      // Puzzle completado correctamente - iniciar secuencia de animación
      setShowCompletionAnimation(true);
      
      // Después de 2 segundos, mostrar mensaje de bienvenida
      setTimeout(() => {
        setShowCompletionAnimation(false);
        setShowWelcomeMessage(true);
      }, 2000);
      
      // Después de 6 segundos más, mostrar modal de completado
      setTimeout(() => {
        setShowWelcomeMessage(false);
        setGameCompleted(true);
        onComplete();
      }, 8000);
    } else {
      // Puzzle incorrecto - sumar error en el GameControl pero permitir seguir jugando
      onError();
      toast.error(`Puzzle incorrecto. ${correctPieces}/${PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols} piezas están en la posición correcta. Puedes mover las piezas para corregirlo.`, {
        duration: 4000,
        icon: '❌'
      });
      // NO marcar como completado para permitir seguir jugando
    }
  }, [pieces, onComplete, onError]);

  // Validar automáticamente cuando se colocan todas las piezas
  useEffect(() => {
    if (placedPieces.length === PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols && !gameCompleted && placedPieces.length !== lastValidationCount) {
      setLastValidationCount(placedPieces.length);
      setTimeout(() => validatePuzzle(), 500);
    }
  }, [placedPieces.length, gameCompleted, lastValidationCount, validatePuzzle]);

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

      const unplacedPieces = pieces.filter(piece => !piece.isPlaced);
      if (unplacedPieces.length === 0) {
        toast.info('Todas las piezas ya están colocadas', {
          duration: 2000,
          icon: 'ℹ️'
        });
        return;
      }

      const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
      
      // Calcular posición en la grilla correcta
      const { assemblyAreaX, assemblyAreaY, pieceWidth, pieceHeight } = puzzleDimensions;
      const correctGridX = randomPiece.col;
      const correctGridY = randomPiece.row;
      
      const correctX = assemblyAreaX + correctGridX * pieceWidth;
      const correctY = assemblyAreaY + correctGridY * pieceHeight;
      
      // Colocar pieza en su posición correcta y marcarla como bloqueada (pista)
      setPieces(prevPieces => 
        prevPieces.map(piece => 
          piece.id === randomPiece.id 
            ? { 
                ...piece, 
                x: correctX,
                y: correctY,
                gridX: correctGridX,
                gridY: correctGridY,
                isPlaced: true,
                isLocked: true // Marcar como bloqueada por pista
              }
            : piece
        )
      );

      setPlacedPieces(prev => [...prev, randomPiece.id]);
      setHintCount(prev => prev + 1);
      onHintUsed();
      
      toast.success('Pista aplicada: Una pieza se colocó en su posición correcta', {
        duration: 2000,
        icon: '💡'
      });
    }
  }), [pieces, placedPieces, hintCount, onHintUsed, validatePuzzle]);

  // Usar pista (función interna)
  const useHint = () => {
    if (hintCount >= 3) {
      toast.error('Ya has usado todas las pistas disponibles', {
        duration: 2000,
        icon: '⚠️'
      });
      return;
    }

    const unplacedPieces = pieces.filter(piece => !piece.isPlaced);
    if (unplacedPieces.length === 0) {
      toast.info('Todas las piezas ya están colocadas', {
        duration: 2000,
        icon: 'ℹ️'
      });
      return;
    }

    const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
    
    // Calcular posición en la grilla correcta
    const assemblyAreaX = 50;
    const assemblyAreaY = 50;
    const correctGridX = randomPiece.col;
    const correctGridY = randomPiece.row;
    
    const correctX = assemblyAreaX + correctGridX * PUZZLE_CONFIG.pieceWidth;
    const correctY = assemblyAreaY + correctGridY * PUZZLE_CONFIG.pieceHeight;
    
    // Colocar pieza en su posición correcta y marcarla como bloqueada (pista)
    setPieces(prevPieces => 
      prevPieces.map(piece => 
        piece.id === randomPiece.id 
          ? { 
              ...piece, 
              x: correctX,
              y: correctY,
              gridX: correctGridX,
              gridY: correctGridY,
              isPlaced: true,
              isLocked: true // Marcar como bloqueada por pista
            }
          : piece
      )
    );

    setPlacedPieces(prev => [...prev, randomPiece.id]);
    setHintCount(prev => prev + 1);
    onHintUsed();
    
    toast.success('Pista aplicada: Una pieza se colocó en su posición correcta', {
      duration: 2000,
      icon: '💡'
    });
    
    // Verificar si es la última pieza
    if (placedPieces.length + 1 === PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols) {
      setTimeout(() => validatePuzzle(), 500);
    }
  };

  // Reiniciar puzzle
  const resetPuzzle = () => {
    const newPieces = createPuzzlePieces();
    setPieces(newPieces);
    // Las primeras 3 piezas ya están colocadas, así que agregarlas a placedPieces
    setPlacedPieces([0, 1, 2]);
    setMoves(0);
    setHintCount(0);
    setErrors(0);
    setGameCompleted(false);
    setShowWelcomeMessage(false);
    setShowCompletionAnimation(false);
    setDraggedPieceId(null);
    setIsDragging(false);
  };

  // Renderizar pieza individual
  const renderPiece = useCallback((piece) => {
    const { pieceWidth, pieceHeight, assemblyAreaX, assemblyAreaY, imageWidth, imageHeight } = puzzleDimensions;
    const isPlaced = piece.isPlaced;
    const isDragging = piece.isDragging;
    const isOverAssemblyArea = piece.isOverAssemblyArea;
    const isLocked = piece.isLocked; // Pieza bloqueada
    const isHintPiece = piece.isLocked && piece.id > 2; // Pieza bloqueada por pista (no las iniciales)
    
    
    // Calcular posición de la pieza en la imagen original
    const sourceX = piece.correctX - assemblyAreaX;
    const sourceY = piece.correctY - assemblyAreaY;
    
    const pieceStyle = {
      position: 'absolute',
      left: piece.x,
      top: piece.y,
      width: pieceWidth,
      height: pieceHeight,
      backgroundImage: `url(${puzzleImage})`,
      backgroundPosition: `-${sourceX}px -${sourceY}px`,
      backgroundSize: `${imageWidth}px ${imageHeight}px`,
      border: isHintPiece
        ? '2px solid #F97316' // Borde naranja para pieza de pista
        : isLocked
          ? '2px solid #F59E0B' // Borde dorado más delgado para pieza bloqueada inicial
          : isPlaced 
            ? '1px solid #10B981' // Borde más delgado para piezas colocadas
            : isDragging 
              ? isOverAssemblyArea 
                ? '2px solid #10B981' // Verde más delgado cuando está sobre área de ensamblaje
                : '2px solid #3B82F6' // Azul más delgado cuando no está sobre área
              : '0.5px solid #E5E7EB', // Borde muy delgado para piezas no colocadas
      borderRadius: '8px',
      cursor: isLocked ? 'not-allowed' : 'grab',
      zIndex: showCompletionAnimation || showWelcomeMessage ? 0 : (isDragging ? 1000 : 10),
      boxShadow: isHintPiece
        ? '0 4px 12px rgba(249, 115, 22, 0.3)' // Sombra naranja para pieza de pista
        : isLocked
          ? '0 4px 12px rgba(245, 158, 11, 0.3)' // Sombra dorada para pieza bloqueada inicial
          : isDragging 
            ? isOverAssemblyArea
              ? '0 8px 25px rgba(16, 185, 129, 0.4)' // Sombra verde cuando está sobre área
              : '0 8px 25px rgba(59, 130, 246, 0.3)' // Sombra azul normal
            : isPlaced 
              ? '0 2px 8px rgba(16, 185, 129, 0.2)' 
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: isDragging ? 'none' : 'all 0.3s ease',
      userSelect: 'none',
      // Asegurar que las piezas no colocadas sean visibles
      opacity: 1,
      visibility: 'visible',
      // Aplicar rotación solo si no está colocada y no se está arrastrando
      transform: isPlaced || isDragging ? 'none' : `rotate(${piece.rotation || 0}deg)`,
      // Deshabilitar eventos de mouse para pieza bloqueada
      pointerEvents: isLocked ? 'none' : 'auto'
    };

    return (
      <div
        key={piece.id}
        style={pieceStyle}
        onMouseDown={(e) => handlePieceMouseDown(e, piece)}
      />
    );
  }, [puzzleImage, handlePieceMouseDown, puzzleDimensions]);

  // Calcular progreso
  const progress = Math.round((placedPieces.length / (PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols)) * 100);

  // Configuración de las columnas laterales
  const leftSidebarConfig = {
    type: 'left',
    title: 'Base de Mercadeo',
    subtitle: 'Rompecabezas Institucional',
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
    title: 'Instrucciones del Juego',
    subtitle: 'Rompecabezas de Imagen Institucional',
    sections: [
      {
        title: '🎮 Cómo Jugar',
        type: 'instructions',
        instructions: [
          'Haz clic y arrastra las piezas desde el área inferior',
          'Coloca las piezas en el área de ensamblaje superior',
          'Las piezas se ajustarán automáticamente cuando estén cerca de su posición correcta',
          'Completa la imagen institucional para ganar'
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
      { label: 'Piezas Colocadas', value: `${placedPieces.length}/${PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols}`, color: 'text-blue-600' },
      { label: 'Movimientos', value: moves.toString(), color: 'text-green-600' },
      { label: 'Pistas Usadas', value: `${hintCount}/3`, color: 'text-yellow-600' },
      { label: 'Errores', value: errors.toString(), color: 'text-red-600' }
    ]
  };

  if (!puzzleImage) {
    return (
      <div className="flex h-full w-full">
        <GameSidebar {...leftSidebarConfig} />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando puzzle...</p>
          </div>
        </div>
        <GameSidebar {...rightSidebarConfig} />
      </div>
    );
  }

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
                current={placedPieces.length}
                total={PUZZLE_CONFIG.rows * PUZZLE_CONFIG.cols}
                label="Progreso del Puzzle"
                unit="piezas"
                gradientColors="from-orange-500 to-red-600"
              />
            </div>

            {/* Área de juego - Responsive */}
            <div className="flex-1 flex items-center justify-center mb-3 sm:mb-4">
              <div 
                id="puzzle-game-area"
                className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-md"
                style={{ 
                  width: 'min(90vw, 90vh, 800px)',
                  height: 'min(90vw, 90vh, 800px)',
                  aspectRatio: '1'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isDragging && draggedPieceId) {
                    // Volver a posición original si se sale del área
                    setPieces(prevPieces => 
                      prevPieces.map(p => 
                        p.id === draggedPieceId 
                          ? { ...p, x: p.startX, y: p.startY, isDragging: false }
                          : p
                      )
                    );
                    setDraggedPieceId(null);
                    setIsDragging(false);
                  }
                }}
              >
          {/* Área de ensamblaje */}
          <div 
            className="absolute bg-white rounded-lg shadow-lg border-4 border-blue-500"
            style={{
              left: puzzleDimensions.assemblyAreaX,
              top: puzzleDimensions.assemblyAreaY,
              width: puzzleDimensions.imageWidth,
              height: puzzleDimensions.imageHeight
            }}
          >
            
            {/* Mostrar grilla de casillas ocupadas */}
            {Array.from({ length: PUZZLE_CONFIG.rows }, (_, row) =>
              Array.from({ length: PUZZLE_CONFIG.cols }, (_, col) => {
                const isOccupied = pieces.some(p => 
                  p.isPlaced && p.gridX === col && p.gridY === row
                );
                
                if (isOccupied) {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="absolute bg-green-100 border-2 border-green-300 rounded"
                      style={{
                        left: col * puzzleDimensions.pieceWidth,
                        top: row * puzzleDimensions.pieceHeight,
                        width: puzzleDimensions.pieceWidth,
                        height: puzzleDimensions.pieceHeight,
                        opacity: 0.3
                      }}
                    />
                  );
                }
                return null;
              })
            )}
          </div>

          {/* Línea divisoria */}
          <div 
            className="absolute bg-gray-300"
            style={{
              left: 0,
              top: puzzleDimensions.assemblyAreaY + puzzleDimensions.imageHeight + 20,
              width: '100%',
              height: 3
            }}
          />

          {/* Título del área de piezas */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-700" style={{ top: puzzleDimensions.assemblyAreaY + puzzleDimensions.imageHeight + 30 }}>
            🎯 Piezas Disponibles
          </div>

          {/* Indicador de posición bloqueada */}
          {blockedPosition && (
            <div
              className="absolute bg-red-200 border-4 border-red-500 rounded-lg animate-pulse"
              style={{
                left: blockedPosition.x,
                top: blockedPosition.y,
                width: puzzleDimensions.pieceWidth,
                height: puzzleDimensions.pieceHeight,
                zIndex: 999
              }}
            >
              <div className="flex items-center justify-center h-full text-red-600 font-bold text-2xl">
                🚫
              </div>
            </div>
          )}

          {/* Renderizar piezas - ordenar para que las no colocadas estén al frente */}
          {pieces
            .sort((a, b) => {
              // Piezas no colocadas primero, luego las colocadas
              if (!a.isPlaced && b.isPlaced) return -1;
              if (a.isPlaced && !b.isPlaced) return 1;
              return 0;
            })
            .map(renderPiece)}

          {/* Animación de completado */}
          {showCompletionAnimation && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 bg-opacity-95 flex items-center justify-center rounded-2xl animate-fade-in-up z-50">
              <div className="text-center text-white p-8">
                <div className="text-8xl mb-6 animate-puzzle-celebration">🎊</div>
                <h2 className="text-5xl font-bold mb-6 animate-fade-in-up">¡FELICITACIONES!</h2>
                <p className="text-2xl mb-8 animate-fade-in-up">Has completado exitosamente el rompecabezas.</p>
                <div className="text-3xl animate-sparkle">✨</div>
              </div>
            </div>
          )}

          {/* Mensaje de bienvenida */}
          {showWelcomeMessage && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 bg-opacity-95 flex items-center justify-center rounded-2xl animate-fade-in-up z-50">
              <div className="text-center text-white p-8">
                <div className="text-6xl mb-6 animate-sparkle">💫</div>
                <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">MENSAJE DE BIENVENIDA</h2>
                <p className="text-2xl mb-8 italic leading-relaxed animate-fade-in-up">
                  "¡Bienvenido/a a nuestra institución educativa!<br/>
                  Juntos construimos conocimiento y futuro."
                </p>
                <div className="text-lg mb-6 animate-fade-in-up">
                  <span className="mr-4">🏆 Tiempo: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                  <span>📊 Movimientos: {moves}</span>
                </div>
                <div className="text-sm opacity-75 animate-pulse">
                  Preparando el siguiente paso...
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de completado final */}
          {gameCompleted && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 bg-opacity-95 flex items-center justify-center rounded-2xl z-50">
              <div className="text-center text-white p-8">
                <div className="text-6xl mb-4">🎊</div>
                <h2 className="text-4xl font-bold mb-4">¡FELICITACIONES!</h2>
                <p className="text-xl mb-6">Has completado exitosamente el rompecabezas.</p>
                <div className="text-2xl mb-6">💫 MENSAJE DE BIENVENIDA REVELADO 💫</div>
                <p className="text-lg mb-8 italic">"¡Bienvenido/a a nuestra institución educativa!<br/>Juntos construimos conocimiento y futuro."</p>
                <div className="text-lg mb-6">
                  <span className="mr-4">🏆 Tiempo: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                  <span>📊 Movimientos: {moves}</span>
                </div>
              </div>
            </div>
          )}
              </div>
            </div>

            {/* Panel móvil con información */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-md p-2.5 border border-orange-200">
                <h3 className="font-bold text-orange-600 mb-1.5 text-sm">🎓 Base Mercadeo</h3>
                <p className="text-xs text-gray-600 mb-1">Rompecabezas Institucional</p>
                <p className="text-xs text-gray-600">Arrastra las piezas para completar la imagen</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-md p-2.5 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-1.5 text-sm">📋 Instrucciones</h3>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• Arrastra las piezas al área correcta</li>
                  <li>• Las piezas se encajan automáticamente</li>
                  <li>• Completa todas las piezas para ganar</li>
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

export default JigsawPuzzle;
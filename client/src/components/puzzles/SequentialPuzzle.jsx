import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  FileText, 
  Upload, 
  CreditCard, 
  CheckCircle, 
  Lightbulb, 
  Star,
  Clock,
  AlertCircle,
  Trophy,
  RotateCcw
} from 'lucide-react';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const SequentialPuzzle = forwardRef(({ 
  onComplete, 
  onHintUsed, 
  onError,
  puzzleData,
  timeSpent: externalTimeSpent,
  errors: externalErrors,
  hintsUsed: externalHintsUsed,
  difficulty = 'medium' 
}, ref) => {
  // Estados principales
  const [gameState, setGameState] = useState('playing'); // 'playing', 'completed', 'failed'
  const [draggedCard, setDraggedCard] = useState(null);
  const [dropZones, setDropZones] = useState([null, null, null, null]);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [animations, setAnimations] = useState({});
  const [progress, setProgress] = useState(0);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Secuencia correcta del proceso de inscripción
  const correctSequence = [
    {
      id: 1,
      title: 'DILIGENCIAR FORMULARIO',
      description: 'Completar datos personales y académicos',
      icon: FileText,
      color: '#3498db',
      step: 1
    },
    {
      id: 2,
      title: 'SUBIR DOCUMENTOS',
      description: 'Adjuntar documentación requerida',
      icon: Upload,
      color: '#27ae60',
      step: 2
    },
    {
      id: 3,
      title: 'PAGAR MATRÍCULA',
      description: 'Realizar pago de derechos académicos',
      icon: CreditCard,
      color: '#f39c12',
      step: 3
    },
    {
      id: 4,
      title: 'CONFIRMAR REGISTRO',
      description: 'Validar inscripción completada',
      icon: CheckCircle,
      color: '#9b59b6',
      step: 4
    }
  ];

  // Banco de pistas inteligentes
  const hintsBank = {
    1: [
      "Todo proceso comienza con tus datos personales",
      "¿Cómo puede la institución conocerte sin tu información?",
      "El primer paso siempre es proporcionar información básica"
    ],
    2: [
      "Una vez completos tus datos, ¿qué documentos los respaldan?",
      "La información debe estar respaldada por documentos oficiales",
      "Después del formulario, necesitas evidencia de tus datos"
    ],
    3: [
      "Solo puedes pagar cuando tu solicitud esté completa",
      "¿Para qué pagar si aún no has completado tu solicitud?",
      "El pago viene después de tener todo listo"
    ],
    4: [
      "El último paso siempre es verificar que todo esté correcto",
      "¿Cómo confirmas algo que aún no has pagado?",
      "La confirmación es el paso final del proceso"
    ]
  };

  // Usar las props externas directamente

  // Inicializar juego
  // Scroll automático al cargar el puzzle
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    initializeGame();
  }, []);

  // Función para mezclar array de forma más efectiva (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    // Mezclar las tarjetas de forma más aleatoria y efectiva
    let shuffled = shuffleArray(correctSequence);
    
    // Verificar que no esté en orden correcto y mezclar de nuevo si es necesario
    let attempts = 0;
    while (shuffled.every((card, index) => card.step === index + 1) && attempts < 10) {
      shuffled = shuffleArray(correctSequence);
      attempts++;
    }
    
    setShuffledCards(shuffled);
    setDropZones([null, null, null, null]);
    setGameState('playing');
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  // El tiempo se maneja en GameLevel.jsx

  // Manejar inicio de arrastre
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    
    // Efecto visual
    setAnimations(prev => ({
      ...prev,
      [card.id]: 'dragging'
    }));
  };

  // Manejar arrastre sobre zona de drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Manejar drop en zona
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedCard) return;

    const newDropZones = [...dropZones];
    
    // Buscar si la tarjeta arrastrada ya estaba en alguna zona de drop
    const previousDropIndex = dropZones.findIndex(zone => zone && zone.id === draggedCard.id);
    const wasInDropZone = previousDropIndex !== -1;
    
    // Si ya hay una tarjeta en la posición destino, devolverla a la zona de mezcladas
    if (newDropZones[dropIndex]) {
      setShuffledCards(prev => [...prev, newDropZones[dropIndex]]);
    }
    
    // Si la tarjeta estaba en una zona de drop, removerla de ahí
    if (wasInDropZone) {
      newDropZones[previousDropIndex] = null;
    } else {
      // Si venía de la zona de mezcladas, removerla de ahí
      setShuffledCards(prev => prev.filter(card => card.id !== draggedCard.id));
    }
    
    // Colocar la tarjeta en la nueva posición
    newDropZones[dropIndex] = draggedCard;
    setDropZones(newDropZones);

    // Verificar si es correcto
    const isCorrect = draggedCard.step === dropIndex + 1;
    
    if (isCorrect) {
      // Efecto de éxito
      setAnimations(prev => ({
        ...prev,
        [draggedCard.id]: 'correct'
      }));
      
      // Sonido de éxito (simulado con vibración)
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } else {
      // Efecto de error
      setAnimations(prev => ({
        ...prev,
        [draggedCard.id]: 'incorrect'
      }));
      
      onError && onError();
      
      // Sonido de error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }

    setDraggedCard(null);
    checkGameCompletion(newDropZones);
  };

  // Verificar si el juego está completo
  const checkGameCompletion = (zones) => {
    const isComplete = zones.every((zone, index) => 
      zone && zone.step === index + 1
    );

    if (isComplete) {
      setGameState('completed');
      setProgress(100);
      
      // Efecto de celebración
      setAnimations(prev => ({
        ...prev,
        celebration: 'celebration'
      }));

      // Llamar al callback de completación sin calcular estrellas aquí
      // Las estrellas se calcularán en GameLevel.jsx
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      // Actualizar progreso
      const correctSteps = zones.filter((zone, index) => 
        zone && zone.step === index + 1
      ).length;
      const newProgress = (correctSteps / 4) * 100;
      setProgress(newProgress);
    }
  };

  // Sistema de pistas
  const useHint = () => {
    if ((externalHintsUsed || 0) >= 3) return; // Máximo 3 pistas

    // Encontrar el siguiente paso incorrecto
    const nextIncorrect = dropZones.findIndex((zone, index) => 
      !zone || zone.step !== index + 1
    );

    if (nextIncorrect !== -1) {
      const stepNumber = nextIncorrect + 1;
      const hints = hintsBank[stepNumber];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      
      setCurrentHint(randomHint);
      setShowHint(true);
      
      onHintUsed && onHintUsed();
      
      setTimeout(() => {
        setShowHint(false);
        setCurrentHint('');
      }, 5000);
    }
  };

  // Reiniciar juego
  const restartGame = () => {
    initializeGame();
    setAnimations({});
    setProgress(0);
  };

  // Configuración de las columnas laterales
  const leftSidebarConfig = {
    type: 'left',
    title: 'Base Registro Académico',
    subtitle: 'Aprende el proceso correcto de inscripción y matrícula académica',
    sections: [
      {
        title: '🎯 ¡El momento de asegurarte que todo está en orden!',
        type: 'text',
        content: 'Aquí verificamos tus datos, validamos los documentos y aseguramos de que tu matrícula y horarios estén listos para comenzar. Durante el proceso, te ayudamos a que tu inscripción sea perfecta, para que puedas enfocarte en lo que realmente importa: ¡tu futuro académico!'
      },
      {
        title: '🎓 Proceso de Inscripción',
        type: 'list',
        items: [
          'Diligenciar formulario de inscripción',
          'Subir documentos requeridos',
          'Realizar pago de matrícula',
          'Confirmar registro académico'
        ]
      },
      {
        title: '📋 Documentos Necesarios',
        type: 'list',
        items: [
          'Cédula de ciudadanía',
          'Diploma de bachillerato',
          'Fotocopia de calificaciones',
          'Fotografía reciente'
        ]
      },
      {
        title: '💡 Consejos',
        type: 'list',
        items: [
          'Revisa todos los requisitos antes de empezar',
          'Ten a mano todos los documentos',
          'Verifica las fechas límite',
          'Mantén copias de respaldo'
        ]
      }
    ]
  };

  const rightSidebarConfig = {
    type: 'right',
    title: 'Proceso de Inscripción',
    subtitle: 'Organiza los pasos del proceso de inscripción en el orden correcto',
    sections: [
      {
        title: '📋 Instrucciones',
        type: 'instructions',
        instructions: [
          'Arrastra cada tarjeta a su posición correcta en la secuencia',
          'Usa las pistas si necesitas ayuda',
          'Evita errores para mantener tu puntuación alta',
          '¡Completa el proceso lo más rápido posible!'
        ]
      },
      {
        title: '🎯 Pasos del Proceso',
        type: 'text',
        content: 'Ordena correctamente los 4 pasos del proceso de inscripción académica arrastrando las tarjetas a las zonas numeradas.'
      },
      {
        title: '⏱️ Penalización por Tiempo',
        type: 'list',
        items: [
          '≤ 3.5 min: -0 estrellas ✅',
          '3.5-5 min: -1 estrella ⚠️',
          '5-6 min: -2 estrellas ⚠️',
          '6-7 min: -3 estrellas ❌'
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
    showHints: showHint,
    hintMessage: currentHint || 'Usa las pistas para obtener ayuda sobre el siguiente paso correcto.'
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    useHint: useHint,
    restart: restartGame
  }));

  // Renderizar tarjeta
  const renderCard = (card, isInDropZone = false) => {
    const IconComponent = card.icon;
    const animationClass = animations[card.id] || '';
    
    return (
      <div
        key={card.id}
        className={`
          relative p-4 rounded-lg shadow-lg cursor-move transition-all duration-300
          ${isInDropZone ? 'w-full' : 'w-72'}
          ${animationClass === 'dragging' ? 'scale-110 rotate-2 shadow-2xl' : ''}
          ${animationClass === 'correct' ? 'animate-pulse bg-green-100' : ''}
          ${animationClass === 'incorrect' ? 'animate-bounce bg-red-100' : ''}
        `}
        style={{ backgroundColor: card.color + '20', borderColor: card.color }}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, card)}
      >
        <div className="flex items-center space-x-4">
          <div 
            className="p-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: card.color }}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-gray-800 mb-1">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar zona de drop
  const renderDropZone = (index) => {
    const card = dropZones[index];
    const isCorrect = card && card.step === index + 1;
    
    return (
      <div
        key={index}
        className={`
          min-h-24 p-4 border-2 border-dashed rounded-lg transition-all duration-300
          ${card ? 'border-solid' : 'border-gray-300'}
          ${isCorrect ? 'bg-green-50 border-green-400' : card ? 'bg-red-50 border-red-400' : 'bg-gray-50'}
          ${draggedCard ? 'hover:border-blue-400 hover:bg-blue-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        {card ? (
          <div className="relative">
            {renderCard(card, true)}
            {/* Botón para devolver a la zona de mezcladas */}
            <button
              onClick={() => {
                // Devolver tarjeta a la zona de mezcladas
                setShuffledCards(prev => [...prev, card]);
                const newDropZones = [...dropZones];
                newDropZones[index] = null;
                setDropZones(newDropZones);
                checkGameCompletion(newDropZones);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              title="Devolver a la zona de mezcladas"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm font-medium">
              Paso {index + 1}
            </span>
          </div>
        )}
      </div>
    );
  };

  // No mostrar pantalla de finalización personalizada
  // GameLevel.jsx se encargará del modal de finalización

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
              current={dropZones.filter(zone => zone !== null).length}
              total={4}
              label="Progreso"
              unit="pasos"
              gradientColors="from-orange-500 to-red-600"
            />

            {/* Pista actual */}
            {showHint && (
              <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 rounded">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">{currentHint}</p>
                </div>
              </div>
            )}

            {/* Área de juego - Usar todo el espacio disponible */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Zona de tarjetas mezcladas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                      Pasos del Proceso
                    </h3>
                    <div className="space-y-4 flex flex-col items-center">
                      {shuffledCards.map(card => renderCard(card))}
                    </div>
                  </div>

                  {/* Zona de ordenamiento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                      Orden Correcto
                    </h3>
                    <div className="space-y-4">
                      {[...Array(4)].map((_, index) => renderDropZone(index))}
                    </div>
                  </div>
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

SequentialPuzzle.displayName = 'SequentialPuzzle';

export default SequentialPuzzle;

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { 
  CheckCircle, 
  X, 
  Lightbulb, 
  Star,
  Clock,
  Target,
  RotateCcw,
  Eye,
  EyeOff,
  Trophy,
  BookOpen,
  DollarSign,
  CreditCard,
  GraduationCap,
  Calendar,
  Percent,
  Banknote,
  Award,
  TrendingUp,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const MemoryMatchPuzzle = forwardRef(({ 
  puzzleData, 
  onComplete, 
  onHintUsed, 
  onError,
  timeSpent: externalTimeSpent,
  errors: externalErrors,
  hintsUsed: externalHintsUsed
}, ref) => {
  // Estados principales
  const [gameState, setGameState] = useState('playing'); // 'playing', 'completed'
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [currentPair, setCurrentPair] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [hintLevel, setHintLevel] = useState(1);
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [educationalContent, setEducationalContent] = useState(null);
  const [animations, setAnimations] = useState({});
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Datos del puzzle - 10 pares de cartas idénticas
  const financialPairs = useMemo(() => [
    // PAGOS Y SERVICIOS (2 pares)
    {
      id: 'pair_1',
      category: 'Pagos y Servicios',
      color: '#3B82F6',
      cards: [
        {
          id: 'matricula_1',
          text: 'MATRÍCULA',
          emoji: '📚',
          description: 'Inscripción Académica',
          definition: 'La matrícula es el costo de inscripción académica que se cancela mediante un pago formal con comprobante.'
        },
        {
          id: 'matricula_2',
          text: 'MATRÍCULA',
          emoji: '📚',
          description: 'Inscripción Académica',
          definition: 'La matrícula es el costo de inscripción académica que se cancela mediante un pago formal con comprobante.'
        }
      ],
      educationalTip: 'Pagar antes de la fecha límite suele incluir descuentos por pronto pago.'
    },
    {
      id: 'pair_2',
      category: 'Pagos y Servicios',
      color: '#3B82F6',
      cards: [
        {
          id: 'pago_1',
          text: 'PAGO',
          emoji: '💳',
          description: 'Transacción Financiera',
          definition: 'El pago es la transacción financiera que se realiza para cancelar la matrícula y otros servicios académicos.'
        },
        {
          id: 'pago_2',
          text: 'PAGO',
          emoji: '💳',
          description: 'Transacción Financiera',
          definition: 'El pago es la transacción financiera que se realiza para cancelar la matrícula y otros servicios académicos.'
        }
      ],
      educationalTip: 'El pago oportuno mantiene tu historial crediticio en buen estado.'
    },
    // CRÉDITO Y FINANCIACIÓN (3 pares)
    {
      id: 'pair_3',
      category: 'Crédito y Financiación',
      color: '#10B981',
      cards: [
        {
          id: 'credito_1',
          text: 'CRÉDITO',
          emoji: '💰',
          description: 'Préstamo Educativo',
          definition: 'El crédito es un préstamo de dinero que se otorga para financiar estudios superiores.'
        },
        {
          id: 'credito_2',
          text: 'CRÉDITO',
          emoji: '💰',
          description: 'Préstamo Educativo',
          definition: 'El crédito es un préstamo de dinero que se otorga para financiar estudios superiores.'
        }
      ],
      educationalTip: 'ICETEX ofrece las mejores condiciones para créditos educativos en Colombia.'
    },
    {
      id: 'pair_4',
      category: 'Crédito y Financiación',
      color: '#10B981',
      cards: [
        {
          id: 'interes_1',
          text: 'INTERÉS',
          emoji: '📈',
          description: 'Costo del Dinero',
          definition: 'El interés es el costo adicional que se paga por usar dinero prestado.'
        },
        {
          id: 'interes_2',
          text: 'INTERÉS',
          emoji: '📈',
          description: 'Costo del Dinero',
          definition: 'El interés es el costo adicional que se paga por usar dinero prestado.'
        }
      ],
      educationalTip: 'Compara las tasas de interés antes de solicitar un crédito educativo.'
    },
    {
      id: 'pair_5',
      category: 'Crédito y Financiación',
      color: '#10B981',
      cards: [
        {
          id: 'cuotas_1',
          text: 'CUOTAS',
          emoji: '📅',
          description: 'Pagos Periódicos',
          definition: 'Las cuotas son los pagos periódicos que se realizan para cancelar un crédito.'
        },
        {
          id: 'cuotas_2',
          text: 'CUOTAS',
          emoji: '📅',
          description: 'Pagos Periódicos',
          definition: 'Las cuotas son los pagos periódicos que se realizan para cancelar un crédito.'
        }
      ],
      educationalTip: 'Planifica tus finanzas para cubrir todas las cuotas del crédito.'
    },
    // BECAS Y SUBSIDIOS (3 pares)
    {
      id: 'pair_6',
      category: 'Becas y Subsidios',
      color: '#F59E0B',
      cards: [
        {
          id: 'beca_1',
          text: 'BECA',
          emoji: '🎓',
          description: 'Ayuda Económica',
          definition: 'La beca es una ayuda económica que se otorga por méritos académicos, deportivos o situación socioeconómica.'
        },
        {
          id: 'beca_2',
          text: 'BECA',
          emoji: '🎓',
          description: 'Ayuda Económica',
          definition: 'La beca es una ayuda económica que se otorga por méritos académicos, deportivos o situación socioeconómica.'
        }
      ],
      educationalTip: 'Mantener buen promedio puede reducir significativamente tus gastos educativos.'
    },
    {
      id: 'pair_7',
      category: 'Becas y Subsidios',
      color: '#F59E0B',
      cards: [
        {
          id: 'subsidio_1',
          text: 'SUBSIDIO',
          emoji: '🤝',
          description: 'Apoyo Económico',
          definition: 'El subsidio es un apoyo económico que se otorga a estudiantes con necesidades económicas.'
        },
        {
          id: 'subsidio_2',
          text: 'SUBSIDIO',
          emoji: '🤝',
          description: 'Apoyo Económico',
          definition: 'El subsidio es un apoyo económico que se otorga a estudiantes con necesidades económicas.'
        }
      ],
      educationalTip: 'Los subsidios pueden combinarse con becas para maximizar el apoyo económico.'
    },
    {
      id: 'pair_8',
      category: 'Becas y Subsidios',
      color: '#F59E0B',
      cards: [
        {
          id: 'descuento_1',
          text: 'DESCUENTO',
          emoji: '💸',
          description: 'Reducción de Costo',
          definition: 'El descuento es la reducción en el costo de la matrícula otorgada por diferentes motivos.'
        },
        {
          id: 'descuento_2',
          text: 'DESCUENTO',
          emoji: '💸',
          description: 'Reducción de Costo',
          definition: 'El descuento es la reducción en el costo de la matrícula otorgada por diferentes motivos.'
        }
      ],
      educationalTip: 'Los descuentos por pronto pago pueden ahorrarte dinero significativo.'
    },
    // GESTIÓN FINANCIERA (2 pares)
    {
      id: 'pair_9',
      category: 'Gestión Financiera',
      color: '#8B5CF6',
      cards: [
        {
          id: 'presupuesto_1',
          text: 'PRESUPUESTO',
          emoji: '📋',
          description: 'Plan Financiero',
          definition: 'El presupuesto es la planificación financiera que incluye ingresos, gastos y ahorros.'
        },
        {
          id: 'presupuesto_2',
          text: 'PRESUPUESTO',
          emoji: '📋',
          description: 'Plan Financiero',
          definition: 'El presupuesto es la planificación financiera que incluye ingresos, gastos y ahorros.'
        }
      ],
      educationalTip: 'Un buen presupuesto estudiantil incluye matrícula, materiales, transporte y alimentación.'
    },
    {
      id: 'pair_10',
      category: 'Gestión Financiera',
      color: '#8B5CF6',
      cards: [
        {
          id: 'vencimiento_1',
          text: 'VENCIMIENTO',
          emoji: '⏰',
          description: 'Fecha Límite',
          definition: 'El vencimiento es la fecha límite para realizar un pago sin incurrir en recargos.'
        },
        {
          id: 'vencimiento_2',
          text: 'VENCIMIENTO',
          emoji: '⏰',
          description: 'Fecha Límite',
          definition: 'El vencimiento es la fecha límite para realizar un pago sin incurrir en recargos.'
        }
      ],
      educationalTip: 'Pagar antes del vencimiento evita recargos y mantiene un buen historial crediticio.'
    }
  ], []);

  // Crear mazo de cartas mezclado (se regenera cada vez que se monta el componente)
  const shuffledCards = useMemo(() => {
    const allCards = financialPairs.flatMap(pair => 
      pair.cards.map(card => ({
        ...card,
        pairId: pair.id,
        category: pair.category,
        categoryColor: pair.color,
        educationalTip: pair.educationalTip
      }))
    );
    
    // Mezclar usando algoritmo Fisher-Yates con seed basado en timestamp
    const shuffled = [...allCards];
    const seed = Date.now(); // Usar timestamp para asegurar aleatoriedad cada vez
    
    // Función de generación de números pseudoaleatorios con seed
    let currentSeed = seed;
    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }, [financialPairs, isMounted]); // Dependencia de isMounted para regenerar cada vez

  // Controlar el montaje del componente
  useEffect(() => {
    setIsMounted(true);
    setStartTime(Date.now());
    return () => setIsMounted(false);
  }, []);

  // Actualizar progreso
  useEffect(() => {
    const progressPercentage = (matchedPairs.size / financialPairs.length) * 100;
    setProgress(progressPercentage);
    
    if (matchedPairs.size === financialPairs.length && gameState === 'playing') {
      setGameState('completed');
      toast.success('¡Excelente! Has completado el Memory Match financiero', {
        duration: 3000,
        icon: '🎉'
      });
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [matchedPairs.size, financialPairs.length, gameState, onComplete]);

  // Manejar clic en carta
  const handleCardClick = useCallback((card) => {
    if (gameState !== 'playing') return;
    if (flippedCards.has(card.id) || matchedPairs.has(card.pairId)) return;
    if (currentPair.length >= 2) return;

    const newFlippedCards = new Set(flippedCards);
    newFlippedCards.add(card.id);
    setFlippedCards(newFlippedCards);

    const newCurrentPair = [...currentPair, card];
    setCurrentPair(newCurrentPair);

    // Si se han volteado 2 cartas, verificar si hacen par
    if (newCurrentPair.length === 2) {
      setAttempts(prev => prev + 1);
      
      if (newCurrentPair[0].pairId === newCurrentPair[1].pairId) {
        // Par correcto
        setMatchedPairs(prev => new Set(prev).add(card.pairId));
        
        // Mostrar contenido educativo
        const pair = financialPairs.find(p => p.id === card.pairId);
        setEducationalContent({
          pair,
          cards: newCurrentPair
        });
        setShowEducationalModal(true);

        // Efecto visual de éxito
        setAnimations(prev => ({
          ...prev,
          [newCurrentPair[0].id]: 'success',
          [newCurrentPair[1].id]: 'success'
        }));

        toast.success('¡Par encontrado! Concepto aprendido', {
          duration: 2000,
          icon: '🎓'
        });

        // Limpiar par actual después de un delay
        setTimeout(() => {
          setCurrentPair([]);
          setAnimations(prev => {
            const newAnimations = { ...prev };
            delete newAnimations[newCurrentPair[0].id];
            delete newAnimations[newCurrentPair[1].id];
            return newAnimations;
          });
        }, 1000);

      } else {
        // Par incorrecto
        onError && onError();
        
        // Efecto visual de error
        setAnimations(prev => ({
          ...prev,
          [newCurrentPair[0].id]: 'error',
          [newCurrentPair[1].id]: 'error'
        }));

        toast.error('Par incorrecto. ¡Sigue intentando!', {
          duration: 2000,
          icon: '❌'
        });

        // Voltear cartas después de un delay
        setTimeout(() => {
          setFlippedCards(prev => {
            const newFlipped = new Set(prev);
            newFlipped.delete(newCurrentPair[0].id);
            newFlipped.delete(newCurrentPair[1].id);
            return newFlipped;
          });
          setCurrentPair([]);
          setAnimations(prev => {
            const newAnimations = { ...prev };
            delete newAnimations[newCurrentPair[0].id];
            delete newAnimations[newCurrentPair[1].id];
            return newAnimations;
          });
        }, 1500);
      }
    }
  }, [gameState, flippedCards, matchedPairs, currentPair, financialPairs, onError]);

  // Sistema de pistas que voltea un par correcto
  const useHint = useCallback(() => {
    const currentHintsUsed = externalHintsUsed || 0;
    
    if (currentHintsUsed >= 3) {
      toast.error('Ya has usado todas las pistas disponibles (3/3)', {
        duration: 3000,
        icon: '⚠️'
      });
      return;
    }

    // Encontrar pares no completados
    const uncompletedPairs = financialPairs.filter(pair => 
      !matchedPairs.has(pair.id)
    );

    if (uncompletedPairs.length === 0) {
      toast.info('¡Todos los pares ya están completados!', {
        duration: 2000,
        icon: '🎉'
      });
      return;
    }

    // Seleccionar un par aleatorio no completado
    const randomPair = uncompletedPairs[Math.floor(Math.random() * uncompletedPairs.length)];
    
    // Encontrar las cartas del par en el mazo mezclado
    const card1 = shuffledCards.find(card => card.id === randomPair.cards[0].id);
    const card2 = shuffledCards.find(card => card.id === randomPair.cards[1].id);
    
    if (!card1 || !card2) {
      toast.error('Error al encontrar las cartas para la pista', {
        duration: 2000,
        icon: '❌'
      });
      return;
    }

    // Verificar que las cartas no estén ya volteadas o emparejadas
    if (flippedCards.has(card1.id) || flippedCards.has(card2.id) || matchedPairs.has(randomPair.id)) {
      toast.error('Estas cartas ya están siendo mostradas', {
        duration: 2000,
        icon: '⚠️'
      });
      return;
    }

    // Mostrar mensaje de pista
    const hintsRemaining = 3 - (currentHintsUsed + 1);
    toast.success(`💡 Pista: ¡Volteando un par correcto! Te quedan ${hintsRemaining} pistas`, {
      duration: 2000,
      icon: '🎯'
    });

    // Voltear las dos cartas del par
    const newFlippedCards = new Set(flippedCards);
    newFlippedCards.add(card1.id);
    newFlippedCards.add(card2.id);
    setFlippedCards(newFlippedCards);

    // Marcar como par completado después de un breve delay para que el usuario vea las cartas
    setTimeout(() => {
      setMatchedPairs(prev => new Set(prev).add(randomPair.id));
      
      // Mostrar contenido educativo del par
      setEducationalContent({
        pair: randomPair,
        cards: [card1, card2]
      });
      setShowEducationalModal(true);

      // Efecto visual de éxito
      setAnimations(prev => ({
        ...prev,
        [card1.id]: 'success',
        [card2.id]: 'success'
      }));

      toast.success('¡Par encontrado con pista! Concepto aprendido', {
        duration: 2000,
        icon: '🎓'
      });

      // Limpiar animación después de un tiempo
      setTimeout(() => {
        setAnimations(prev => {
          const newAnimations = { ...prev };
          delete newAnimations[card1.id];
          delete newAnimations[card2.id];
          return newAnimations;
        });
      }, 1000);

    }, 1500); // 1.5 segundos para que el usuario vea las cartas volteadas

    // Registrar el uso de la pista
    onHintUsed && onHintUsed();
    
  }, [externalHintsUsed, matchedPairs, financialPairs, shuffledCards, flippedCards, onHintUsed]);

  // Cerrar modal educativo
  const closeEducationalModal = () => {
    setShowEducationalModal(false);
    setEducationalContent(null);
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    useHint: useHint
  }));

  // Renderizar carta
  const renderCard = useCallback((card, index) => {
    const isFlipped = flippedCards.has(card.id);
    const isMatched = matchedPairs.has(card.pairId);
    const isInCurrentPair = currentPair.some(c => c.id === card.id);
    const animation = animations[card.id];

    return (
      <div
        key={card.id}
        className={`
          relative w-full h-32 cursor-pointer transition-all duration-300 transform
          ${isMatched ? 'scale-95 opacity-75' : 'hover:scale-105'}
          ${animation === 'success' ? 'animate-pulse' : ''}
          ${animation === 'error' ? 'animate-bounce' : ''}
        `}
        onClick={() => handleCardClick(card)}
      >
        <div className={`
          w-full h-full rounded-lg shadow-lg border-2 transition-all duration-500 transform-gpu
          ${isFlipped || isMatched ? 'rotate-y-180' : ''}
          ${isInCurrentPair ? 'border-blue-400 shadow-blue-200' : 'border-gray-200 hover:border-gray-300'}
          ${isMatched ? 'border-green-400 bg-green-50' : 'bg-white'}
        `}>
          {/* Reverso de la carta */}
          <div className={`
            absolute inset-0 w-full h-full rounded-lg flex flex-col items-center justify-center
            ${isFlipped || isMatched ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-500
          `}>
            <div className="text-4xl mb-2">💰</div>
            <div className="text-xs font-bold text-gray-600 text-center px-2">
              CARTERA<br/>UNIVERSITARIA
            </div>
          </div>

          {/* Anverso de la carta */}
          <div className={`
            absolute inset-0 w-full h-full rounded-lg flex flex-col items-center justify-center p-2
            ${isFlipped || isMatched ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-500
            bg-gradient-to-br from-white to-gray-50
          `}>
            <div className="text-2xl mb-1">{card.emoji}</div>
            <div className="text-xs font-bold text-gray-800 text-center leading-tight">
              {card.text}
            </div>
            <div className="text-xs text-gray-600 text-center mt-1">
              {card.description}
            </div>
            {isMatched && (
              <div className="absolute top-1 right-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [flippedCards, matchedPairs, currentPair, animations, handleCardClick]);

  // Configuración de las barras laterales
  const leftSidebarConfig = useMemo(() => ({
    type: 'left',
    title: 'Base de Cartera',
    subtitle: 'Gestiona los pagos y costos de tu matrícula universitaria',
    sections: [
      {
        title: '🎯 ¡Todo bajo control para que nada te frene!',
        type: 'text',
        content: 'Desde acá, nos encargamos de gestionar los pagos de matrícula y ofrecer opciones de financiamiento. Durante el proceso, te informamos sobre los plazos y facilidades de pago para que puedas concentrarte en tus estudios, sin preocupaciones. ¡Así que no te preocupes, tu matrícula está en buenas manos!'
      },
      {
        title: '💳 ¿Qué hacemos en Cartera?',
        type: 'list',
        items: [
          'Gestión de pagos de matrícula',
          'Opciones de financiamiento flexible',
          'Información sobre plazos de pago',
          'Facilidades de pago personalizadas',
          'Asesoría financiera estudiantil'
        ]
      },
      {
        title: '💡 Beneficios para ti',
        type: 'list',
        items: [
          'Flexibilidad en métodos de pago',
          'Información clara sobre costos',
          'Opciones de financiación accesibles',
          'Tranquilidad financiera',
          'Enfoque total en tus estudios'
        ]
      }
    ]
  }), []);

  const rightSidebarConfig = useMemo(() => ({
    type: 'right',
    title: 'Memory Match Financiero',
    subtitle: 'Encuentra las cartas idénticas',
    sections: [
      {
        title: '🎮 Cómo Jugar',
        type: 'instructions',
        instructions: [
          'Haz clic en una carta para voltearla',
          'Haz clic en otra carta para encontrar la igual',
          'Las cartas idénticas se mantienen volteadas',
          'Usa las pistas para que el juego te muestre un par automáticamente',
          'Completa todos los pares para ganar'
        ]
      },
      {
        title: '🎮 Objetivos del Juego',
        type: 'list',
        items: [
          'Memorizar conceptos financieros',
          'Encontrar cartas idénticas',
          'Desarrollar habilidades de memoria',
          'Conocer vocabulario financiero'
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
          '0-10 errores: -0 estrellas ✅',
          '10-14 errores: -1 estrella ⚠️',
          '14-18 errores: -2 estrellas ⚠️',
          '>18 errores: -3 estrellas ❌'
        ]
      },
      {
        title: '💡 Penalización por Pistas',
        type: 'text',
        content: 'Cada pista usada = -1 estrella. Usa 0 pistas para obtener 5 estrellas.'
      }
    ],
    showHints: showHint,
    hintMessage: currentHint || 'Usa las pistas para que el juego te muestre automáticamente un par correcto.'
  }), [attempts, matchedPairs.size, startTime, externalHintsUsed, showHint, currentHint, hintLevel]);

  // Si no está montado, mostrar pantalla de carga
  if (!isMounted) {
    return (
      <div className="flex h-full w-full">
        <GameSidebar {...leftSidebarConfig} />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando Memory Match financiero...</p>
          </div>
        </div>
        <GameSidebar {...rightSidebarConfig} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Panel izquierdo - Información de cartera */}
      <GameSidebar {...leftSidebarConfig} />

      {/* Panel central - Juego */}
      <div className="flex-1 flex flex-col">
        {/* Contenido principal */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="h-full flex flex-col">
            {/* Barra de progreso */}
            <ProgressBar 
              progress={progress}
              current={matchedPairs.size}
              total={financialPairs.length}
              label="Progreso"
              unit="pares"
              gradientColors="from-orange-500 to-red-600"
            />

            {/* Pista actual */}
            {showHint && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-yellow-800 font-medium text-sm leading-relaxed whitespace-pre-line">
                      {currentHint}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Área de juego */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-4xl">
                {/* Título del juego */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    🎯 Memory Match - Conceptos Financieros
                  </h2>
                  <p className="text-gray-600">
                    Encuentra las cartas idénticas para aprender sobre conceptos financieros universitarios
                  </p>
                </div>

                {/* Grid de cartas */}
                <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl sm:max-w-2xl mx-auto">
                  {shuffledCards.map((card, index) => renderCard(card, index))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Información del juego */}
      <GameSidebar {...rightSidebarConfig} />

      {/* Modal educativo */}
      {showEducationalModal && educationalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      🎓 ¡CONCEPTO APRENDIDO!
                    </h3>
                    <p className="text-sm text-gray-600">
                      {educationalContent.pair.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEducationalModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido del par */}
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{educationalContent.cards[0].emoji}</div>
                    <div className="font-bold text-gray-800 text-lg">{educationalContent.cards[0].text}</div>
                    <div className="text-sm text-gray-600">{educationalContent.cards[0].description}</div>
                  </div>
                </div>

                {/* Definición */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-center">
                    📚 DEFINICIÓN
                  </h4>
                  <p className="text-gray-700 text-sm text-center leading-relaxed">
                    {educationalContent.cards[0].definition}
                  </p>
                </div>

                {/* Tip financiero */}
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">
                        💡 TIP FINANCIERO:
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        {educationalContent.pair.educationalTip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de continuar */}
              <div className="flex justify-end">
                <button
                  onClick={closeEducationalModal}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MemoryMatchPuzzle.displayName = 'MemoryMatchPuzzle';

export default MemoryMatchPuzzle;

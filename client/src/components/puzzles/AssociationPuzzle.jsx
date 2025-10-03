import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { 
  CheckCircle, 
  X, 
  Lightbulb, 
  Star,
  Heart,
  Brain,
  Activity,
  Palette,
  Users,
  Trophy,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const AssociationPuzzle = forwardRef(({ 
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
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [connections, setConnections] = useState(new Map()); // Map<conceptId, imageId>
  const [completedAssociations, setCompletedAssociations] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [animations, setAnimations] = useState({});
  const [progress, setProgress] = useState(0);
  const [draggedLine, setDraggedLine] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Banco completo de 30 asociaciones de bienestar
  const allWellnessAssociations = useMemo(() => [
    // SALUD FÍSICA (8 asociaciones)
    { concept: 'Ejercicio Regular', image: '🏃‍♂️', category: 'Salud Física', color: '#10B981', description: 'El ejercicio regular fortalece el cuerpo y mejora la salud cardiovascular.' },
    { concept: 'Alimentación Balanceada', image: '🥗', category: 'Salud Física', color: '#10B981', description: 'Una dieta equilibrada proporciona los nutrientes necesarios para el cuerpo.' },
    { concept: 'Hidratación Adecuada', image: '💧', category: 'Salud Física', color: '#10B981', description: 'Beber suficiente agua mantiene el cuerpo hidratado y funcionando correctamente.' },
    { concept: 'Descanso Reparador', image: '😴', category: 'Salud Física', color: '#10B981', description: 'El sueño de calidad es esencial para la recuperación y el bienestar físico.' },
    { concept: 'Higiene Personal', image: '🧴', category: 'Salud Física', color: '#10B981', description: 'Mantener una buena higiene previene enfermedades y mejora la autoestima.' },
    { concept: 'Prevención Médica', image: '🩺', category: 'Salud Física', color: '#10B981', description: 'Los chequeos médicos regulares ayudan a prevenir y detectar problemas de salud.' },
    { concept: 'Actividad Física', image: '🤸‍♀️', category: 'Salud Física', color: '#10B981', description: 'Mantenerse activo mejora la fuerza, flexibilidad y resistencia física.' },
    { concept: 'Cuidado Postural', image: '🧘‍♀️', category: 'Salud Física', color: '#10B981', description: 'Una buena postura previene dolores y mejora la salud de la columna.' },

    // SALUD MENTAL (8 asociaciones)
    { concept: 'Gestión del Estrés', image: '🧘‍♂️', category: 'Salud Mental', color: '#3B82F6', description: 'Aprender a manejar el estrés mejora la calidad de vida y el rendimiento.' },
    { concept: 'Meditación', image: '🕯️', category: 'Salud Mental', color: '#3B82F6', description: 'La meditación ayuda a calmar la mente y reducir la ansiedad.' },
    { concept: 'Técnicas de Relajación', image: '🌊', category: 'Salud Mental', color: '#3B82F6', description: 'Practicar relajación reduce la tensión muscular y mental.' },
    { concept: 'Autocuidado Emocional', image: '💝', category: 'Salud Mental', color: '#3B82F6', description: 'Cuidar las emociones es fundamental para el bienestar psicológico.' },
    { concept: 'Mindfulness', image: '🌸', category: 'Salud Mental', color: '#3B82F6', description: 'Vivir el presente conscientemente mejora la atención y reduce la ansiedad.' },
    { concept: 'Terapia Psicológica', image: '🛋️', category: 'Salud Mental', color: '#3B82F6', description: 'La terapia profesional ayuda a resolver conflictos internos y emocionales.' },
    { concept: 'Gestión de Emociones', image: '🎭', category: 'Salud Mental', color: '#3B82F6', description: 'Reconocer y manejar las emociones mejora las relaciones interpersonales.' },
    { concept: 'Tiempo de Reflexión', image: '🤔', category: 'Salud Mental', color: '#3B82F6', description: 'Reservar tiempo para reflexionar ayuda a conocerse mejor y tomar decisiones.' },

    // DEPORTES (7 asociaciones)
    { concept: 'Fútbol', image: '⚽', category: 'Deportes', color: '#F59E0B', description: 'El fútbol desarrolla trabajo en equipo y resistencia física.' },
    { concept: 'Baloncesto', image: '🏀', category: 'Deportes', color: '#F59E0B', description: 'El baloncesto mejora la coordinación y la agilidad mental.' },
    { concept: 'Natación', image: '🏊‍♂️', category: 'Deportes', color: '#F59E0B', description: 'La natación es un ejercicio completo que fortalece todo el cuerpo.' },
    { concept: 'Ciclismo', image: '🚴‍♀️', category: 'Deportes', color: '#F59E0B', description: 'El ciclismo mejora la resistencia cardiovascular y es sostenible.' },
    { concept: 'Atletismo', image: '🏃‍♀️', category: 'Deportes', color: '#F59E0B', description: 'El atletismo desarrolla velocidad, resistencia y disciplina.' },
    { concept: 'Voleibol', image: '🏐', category: 'Deportes', color: '#F59E0B', description: 'El voleibol fomenta la comunicación y el trabajo en equipo.' },
    { concept: 'Tenis', image: '🎾', category: 'Deportes', color: '#F59E0B', description: 'El tenis mejora la concentración y los reflejos rápidos.' },

    // CULTURA (7 asociaciones)
    { concept: 'Música', image: '🎵', category: 'Cultura', color: '#8B5CF6', description: 'La música enriquece el alma y desarrolla la creatividad artística.' },
    { concept: 'Arte Visual', image: '🎨', category: 'Cultura', color: '#8B5CF6', description: 'El arte visual estimula la creatividad y la expresión personal.' },
    { concept: 'Literatura', image: '📚', category: 'Cultura', color: '#8B5CF6', description: 'La lectura amplía el vocabulario y desarrolla el pensamiento crítico.' },
    { concept: 'Teatro', image: '🎭', category: 'Cultura', color: '#8B5CF6', description: 'El teatro desarrolla la expresión corporal y la confianza en público.' },
    { concept: 'Danza', image: '💃', category: 'Cultura', color: '#8B5CF6', description: 'La danza mejora la coordinación y es una forma de expresión artística.' },
    { concept: 'Fotografía', image: '📸', category: 'Cultura', color: '#8B5CF6', description: 'La fotografía desarrolla la observación y la creatividad visual.' },
    { concept: 'Cine', image: '🎬', category: 'Cultura', color: '#8B5CF6', description: 'El cine es una forma de arte que combina narrativa y visual.' }
  ], []);

  // Seleccionar 15 asociaciones aleatoriamente
  const selectedAssociations = useMemo(() => {
    const shuffled = [...allWellnessAssociations];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 15);
  }, []);

  // Crear categorías basadas en las asociaciones seleccionadas
  const categories = useMemo(() => {
    const categoryMap = new Map();
    
    selectedAssociations.forEach(assoc => {
      if (!categoryMap.has(assoc.category)) {
        categoryMap.set(assoc.category, {
          name: assoc.category,
          color: assoc.color,
          associations: []
        });
      }
      categoryMap.get(assoc.category).associations.push({
        concept: assoc.concept,
        image: assoc.image,
        description: assoc.description
      });
    });
    
    return Array.from(categoryMap.values());
  }, [selectedAssociations]);

  const totalAssociations = selectedAssociations.length;
  const timeLimit = 300;

  // Verificar datos (solo cuando hay categorías)
  if (categories.length > 0) {
    // Datos cargados correctamente
  }


  // Crear lista plana de todas las asociaciones (memoizado)
  const allAssociations = useMemo(() => {
    return selectedAssociations.map(assoc => ({
      ...assoc,
      categoryName: assoc.category,
      categoryColor: assoc.color,
      id: `${assoc.category}-${assoc.concept}`
    }));
  }, [selectedAssociations]);

  // Separar conceptos e imágenes (memoizado)
  const concepts = useMemo(() => {
    return allAssociations.map(assoc => ({
    id: assoc.id,
    text: assoc.concept,
    category: assoc.categoryName,
    color: assoc.categoryColor,
    description: assoc.description
  }));
  }, [allAssociations]);

  const images = useMemo(() => {
    return allAssociations.map(assoc => ({
    id: assoc.id,
    emoji: assoc.image,
    category: assoc.categoryName,
    color: assoc.categoryColor,
    description: assoc.description
  }));
  }, [allAssociations]);

  // Función para shuffle estable con seed
  const shuffleWithSeed = useCallback((array, seed = 12345) => {
    const shuffled = [...array];
    let currentSeed = seed;
    
    // Función de generación de números pseudoaleatorios
    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Mezclar arrays para distribución aleatoria (memoizado con seed estable)
  const shuffledConcepts = useMemo(() => {
    return shuffleWithSeed(concepts, 12345);
  }, [concepts, shuffleWithSeed]);

  const shuffledImages = useMemo(() => {
    return shuffleWithSeed(images, 54321);
  }, [images, shuffleWithSeed]);

  // Controlar el montaje del componente
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Función para inicializar el canvas
  const initializeCanvas = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // Inicializar juego
  useEffect(() => {
    if (isMounted) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      initializeCanvas();
    }
  }, [isMounted, initializeCanvas]);

  // Manejar resize del canvas (memoizado)
  useEffect(() => {
    const handleResize = () => {
      initializeCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // Actualizar progreso
  useEffect(() => {
    // Solo calcular progreso si hay datos válidos
    if (totalAssociations > 0 && categories.length > 0) {
      const progressPercentage = (completedAssociations.size / totalAssociations) * 100;
      setProgress(progressPercentage);
      
      // Solo completar si realmente se completaron todas las asociaciones Y el juego está en estado playing
      if (completedAssociations.size === totalAssociations && gameState === 'playing' && completedAssociations.size > 0) {
        setGameState('completed');
        toast.success('¡Excelente! Has completado todas las asociaciones de bienestar', {
          duration: 3000,
          icon: '🎉'
        });
        
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }
  }, [completedAssociations.size, totalAssociations, gameState, onComplete, categories.length]);

  // Manejar clic en concepto
  const handleConceptClick = (concept) => {
    if (gameState !== 'playing') return;
    
    if (selectedConcept?.id === concept.id) {
      // Deseleccionar si ya está seleccionado
      setSelectedConcept(null);
    } else {
      setSelectedConcept(concept);
    }
  };

  // Manejar clic en imagen
  const handleImageClick = (image) => {
    if (gameState !== 'playing' || !selectedConcept) return;

    // Verificar si ya existe una conexión para esta imagen
    const existingConnection = Array.from(connections.entries()).find(([_, imageId]) => imageId === image.id);
    if (existingConnection) {
      toast.error('Esta imagen ya está conectada a otro concepto', {
        duration: 2000,
        icon: '⚠️'
      });
      return;
    }

    // Verificar si la asociación es correcta
    const isCorrect = selectedConcept.id === image.id;
    
    if (isCorrect) {
      // Conexión correcta
      setConnections(prev => new Map(prev).set(selectedConcept.id, image.id));
      setCompletedAssociations(prev => new Set(prev).add(selectedConcept.id));
      
      // Efecto visual de éxito
      setAnimations(prev => ({
        ...prev,
        [selectedConcept.id]: 'success'
      }));

      // Mensaje motivacional
      const motivationalMessages = [
        '¡Excelente! El bienestar es clave para el éxito académico',
        '¡Genial! Has descubierto otra forma de cuidar tu bienestar',
        '¡Perfecto! Recuerda aplicar esto en tu vida universitaria',
        '¡Increíble! Tu conocimiento en bienestar está creciendo',
        '¡Fantástico! Cada asociación te acerca más al bienestar integral'
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      toast.success(randomMessage, {
        duration: 3000,
        icon: '🌟'
      });

      // Mostrar información educativa
      setTimeout(() => {
        toast.success(selectedConcept.description, {
          duration: 5000,
          icon: '📚'
        });
      }, 1000);

    } else {
      // Conexión incorrecta
      onError && onError();
      
      // Efecto visual de error
      setAnimations(prev => ({
        ...prev,
        [selectedConcept.id]: 'error'
      }));

      toast.error('Asociación incorrecta. ¡Sigue intentando!', {
        duration: 2000,
        icon: '❌'
      });
    }

    setSelectedConcept(null);
    
    // Limpiar animación después de un tiempo
    setTimeout(() => {
      setAnimations(prev => {
        const newAnimations = { ...prev };
        delete newAnimations[selectedConcept.id];
        return newAnimations;
      });
    }, 1000);
  };

  // Sistema de pistas
  const useHint = () => {
    const currentHintsUsed = externalHintsUsed || 0;
    
    if (currentHintsUsed >= 3) {
      toast.error('Ya has usado todas las pistas disponibles (3/3)', {
        duration: 3000,
        icon: '⚠️',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    // Encontrar una asociación no completada
    const uncompletedAssociations = allAssociations.filter(assoc => 
      !completedAssociations.has(assoc.id)
    );

    if (uncompletedAssociations.length === 0) {
      toast.info('¡Todas las asociaciones ya están completadas!', {
        duration: 2000,
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      return;
    }

    const randomAssociation = uncompletedAssociations[Math.floor(Math.random() * uncompletedAssociations.length)];
    
    // Tipos de pistas más útiles y variados
    const hintTypes = [
      `💡 Pista: "${randomAssociation.concept}" pertenece a la categoría ${randomAssociation.categoryName}`,
      `💡 Pista: La imagen ${randomAssociation.image} está relacionada con ${randomAssociation.categoryName}`,
      `💡 Pista: Busca "${randomAssociation.concept}" en la categoría ${randomAssociation.categoryName}`,
      `💡 Pista: ${randomAssociation.concept} es parte de ${randomAssociation.categoryName}`,
      `💡 Pista: La imagen ${randomAssociation.image} corresponde a ${randomAssociation.concept}`,
      `💡 Pista: En ${randomAssociation.categoryName} encontrarás "${randomAssociation.concept}"`
    ];

    const randomHint = hintTypes[Math.floor(Math.random() * hintTypes.length)];
    
    setCurrentHint(randomHint);
    setShowHint(true);
    
    // Mostrar feedback de pista usada
    const hintsRemaining = 3 - (currentHintsUsed + 1);
    toast.success(`Pista activada! Te quedan ${hintsRemaining} pistas`, {
      duration: 2000,
      icon: '💡',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
    
    onHintUsed && onHintUsed();
    
    setTimeout(() => {
      setShowHint(false);
      setCurrentHint('');
    }, 5000);
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    useHint: useHint
  }));

  // Renderizar concepto (memoizado)
  const renderConcept = useCallback((concept) => {
    const isSelected = selectedConcept?.id === concept.id;
    const isCompleted = completedAssociations.has(concept.id);
    const animation = animations[concept.id];

    return (
      <div
        key={concept.id}
        className={`
          relative p-4 rounded-lg shadow-lg cursor-pointer transition-colors duration-200
          ${isCompleted ? 'bg-green-100 border-2 border-green-400' : 'bg-white border-2 border-gray-200 hover:border-gray-300'}
          ${animation === 'success' ? 'animate-pulse bg-green-200' : ''}
          ${animation === 'error' ? 'animate-bounce bg-red-100' : ''}
        `}
        style={{ 
          borderLeftColor: concept.color,
          borderLeftWidth: '4px'
        }}
        onClick={() => handleConceptClick(concept)}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: concept.color }}
          />
          <span className={`font-semibold ${isCompleted ? 'line-through text-green-700' : 'text-gray-800'}`}>
            {concept.text}
          </span>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>
        {isSelected && (
          <div className="mt-2 text-xs text-gray-600">
            Haz clic en la imagen correspondiente
          </div>
        )}
      </div>
    );
  }, [selectedConcept, completedAssociations, animations, handleConceptClick]);

  // Renderizar imagen (memoizado)
  const renderImage = useCallback((image) => {
    const isConnected = Array.from(connections.values()).includes(image.id);
    const isHovered = hoveredImage === image.id;
    const isCompleted = completedAssociations.has(image.id);

    return (
      <div
        key={image.id}
        className={`
          relative p-4 rounded-lg shadow-lg cursor-pointer transition-colors duration-200
          ${isConnected ? 'bg-green-100 border-2 border-green-400' : 'bg-white border-2 border-gray-200 hover:border-gray-300'}
          ${selectedConcept ? 'hover:border-blue-400' : ''}
        `}
        style={{ 
          borderLeftColor: '#e5e7eb',
          borderLeftWidth: '4px'
        }}
        onClick={() => handleImageClick(image)}
        onMouseEnter={() => setHoveredImage(image.id)}
        onMouseLeave={() => setHoveredImage(null)}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full bg-gray-300"
          />
          <span className="text-3xl">{image.emoji}</span>
          {isConnected && <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>
      </div>
    );
  }, [connections, hoveredImage, completedAssociations, selectedConcept, handleImageClick, setHoveredImage]);

  // Configuración de las columnas laterales (memoizado)
  const leftSidebarConfig = useMemo(() => ({
    type: 'left',
    title: 'Base de Bienestar Institucional (Becas y Descuentos)',
    subtitle: 'Descubre las opciones de financiación y becas disponibles',
    sections: [
      {
        title: '🎯 ¡Haz que tus sueños sean más accesibles!',
        type: 'text',
        content: 'Te apoyamos con becas, descuentos y ayudas económicas para que tu educación sea más fácil de alcanzar. Durante la matrícula, te orientamos sobre todas las oportunidades de apoyo económico que puedes aprovechar, porque tu futuro brillante merece el respaldo adecuado.'
      },
      {
        title: '💰 ¿Qué ofrecemos en Bienestar?',
        type: 'list',
        items: [
          'Becas por mérito académico',
          'Descuentos por hermanos en la USB',
          'Ayudas económicas especiales',
          'Financiación flexible de matrícula',
          'Programas de apoyo estudiantil'
        ]
      },
      {
        title: '📋 Tipos de Becas',
        type: 'list',
        items: [
          'Becas por excelencia académica',
          'Becas por situación económica',
          'Becas deportivas y culturales',
          'Becas para estudiantes destacados',
          'Ayudas para libros y materiales'
        ]
      },
      {
        title: '💡 Beneficios para ti',
        type: 'list',
        items: [
          'Reducción significativa de costos',
          'Acceso a educación de calidad',
          'Menos preocupaciones económicas',
          'Enfoque total en tus estudios',
          'Oportunidades de crecimiento'
        ]
      }
      
    ]
  }), []);

  const rightSidebarConfig = useMemo(() => ({
    type: 'right',
    title: 'Asociaciones de Bienestar',
    subtitle: 'Conecta los conceptos con sus imágenes correspondientes',
    sections: [
      {
        title: '🎮 Cómo Jugar',
        type: 'instructions',
        instructions: [
          'Haz clic en un concepto de la izquierda',
          'Luego haz clic en la imagen correspondiente de la derecha',
          'Las conexiones correctas se marcarán en verde',
          'Completa todas las asociaciones para ganar'
        ]
      },
      {
        title: '🎯 Categorías',
        type: 'list',
        items: [
          '🍎 Salud Física (Verde)',
          '🧠 Salud Mental (Azul)',
          '⚽ Deportes (Naranja)',
          '🎭 Cultura (Morado)',
          '👥 Vida Social (Rosa)'
        ]
      },
      {
        title: '⏱️ Penalización por Tiempo',
        type: 'list',
        items: [
          '≤ 2.5 min: -0 estrellas ✅',
          '2.5-5 min: -1 estrella ⚠️',
          '5-7 min: -2 estrellas ⚠️',
          '7-10 min: -3 estrellas ❌'
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
    hintMessage: currentHint || 'Usa las pistas para obtener ayuda sobre las asociaciones correctas.'
  }), [showHint, currentHint]);

  // Si no está montado o no hay datos del puzzle, mostrar pantalla de carga
  if (!isMounted || !puzzleData || !categories.length) {
    return (
      <div className="flex h-full w-full">
        <GameSidebar {...leftSidebarConfig} />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando puzzle de asociaciones...</p>
            <p className="text-sm text-gray-500 mt-2">
              {!puzzleData ? 'Esperando datos del servidor...' : 'No hay categorías disponibles'}
            </p>
            {!puzzleData && (
              <p className="text-xs text-red-500 mt-2">
                Si este mensaje persiste, verifica tu conexión al servidor
              </p>
            )}
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
              current={completedAssociations.size}
              total={totalAssociations}
              label="Progreso"
              unit="asociaciones"
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
                    <p className="text-yellow-800 font-medium text-sm leading-relaxed">
                      {currentHint}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Área de juego */}
            <div className="flex-1 flex items-center justify-center">
              <div 
                ref={containerRef}
                className="w-full max-w-7xl h-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                  {/* Columna de conceptos */}
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        🎯 Conceptos de Bienestar
                      </h3>
                      <p className="text-sm text-gray-600">
                        Haz clic en un concepto para seleccionarlo
                      </p>
                    </div>
                    
                    <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                      {shuffledConcepts.map(renderConcept)}
                    </div>
                  </div>

                  {/* Columna de imágenes */}
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        🖼️ Imágenes Correspondientes
                      </h3>
                      <p className="text-sm text-gray-600">
                        Haz clic en la imagen que corresponde al concepto seleccionado
                      </p>
                    </div>
                    
                    <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                      {shuffledImages.map(renderImage)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de selección */}
            {selectedConcept && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Concepto seleccionado: <strong>{selectedConcept.text}</strong>
                  </span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Ahora haz clic en la imagen correspondiente de la derecha
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho - Información del juego */}
      <GameSidebar {...rightSidebarConfig} />
    </div>
  );
});

AssociationPuzzle.displayName = 'AssociationPuzzle';

export default AssociationPuzzle;

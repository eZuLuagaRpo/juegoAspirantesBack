const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Datos de los niveles del juego (orden: mercadeo, registro, bienestar, facultades, cartera)
const gameLevels = {
  mercadeo: {
    id: 'mercadeo',
    name: 'Mercadeo',
    description: 'Conoce las opciones de financiación y becas',
    order: 1,
    puzzles: [
      {
        id: 'mercadeo_1',
        type: 'wordsearch',
        title: 'Sopa de Letras Interactiva',
        description: 'Encuentra las palabras relacionadas con Mercadeo y la USBMED',
        difficulty: 2,
        maxStars: 5,
        puzzleData: {
          gridSize: 15,
          wordCount: 12,
          categories: [
            {
              name: 'Programas Académicos',
              words: ['MARKETING', 'PUBLICIDAD', 'COMUNICACION', 'BRANDING', 'DIGITAL', 'ESTRATEGIA']
            },
            {
              name: 'Valores Institucionales', 
              words: ['EXCELENCIA', 'INNOVACION', 'INTEGRIDAD', 'COMPROMISO', 'LIDERAZGO', 'CALIDAD']
            },
            {
              name: 'Términos USBMED',
              words: ['USBMED', 'BECAS', 'MATRICULA', 'CREDITOS']
            }
          ],
          directions: ['horizontal', 'vertical', 'diagonal'],
          timeLimit: 300, // 5 minutos
          hintsAvailable: 3
        }
      },
      {
        id: 'mercadeo_2',
        type: 'jigsaw',
        title: 'Rompecabezas de Bienvenida Institucional',
        description: 'Reconstruye el afiche de bienvenida arrastrando las piezas a su posición correcta',
        difficulty: 2,
        maxStars: 5,
        puzzleData: {
          imageTheme: 'institutional_welcome',
          pieceCount: 20,
          gridSize: { rows: 5, cols: 4 },
          timeLimit: 300, // 5 minutos
          hintsAvailable: 3,
          snapThreshold: 20
        }
      }
    ]
  },
  registroAcademico: {
    id: 'registroAcademico',
    name: 'Registro Académico',
    description: 'Completa tu información académica y documentos',
    order: 2,
    puzzles: [
      {
        id: 'registro_1',
        type: 'sudoku',
        title: 'Sudoku Clásico',
        description: 'Completa el Sudoku siguiendo las reglas clásicas del juego',
        difficulty: 3,
        maxStars: 5,
        puzzleData: {
          gridSize: 9,
          difficulty: 'medium',
          preFilledCells: 36, // 36 celdas prellenadas para dificultad media
          timeLimit: 600, // 10 minutos
          hintsAvailable: 3,
          rules: [
            'Cada fila debe contener los números 1-9 sin repetir',
            'Cada columna debe contener los números 1-9 sin repetir',
            'Cada caja 3x3 debe contener los números 1-9 sin repetir',
            'No se pueden modificar los números prellenados (fondo naranja)'
          ]
        }
      },
      {
        id: 'registro_2',
        type: 'sequential',
        title: 'Proceso de Inscripción',
        description: 'Ordena los pasos del proceso de inscripción académica en el orden correcto',
        difficulty: 2,
        maxStars: 5,
        puzzleData: {
          steps: [
            {
              id: 1,
              title: 'DILIGENCIAR FORMULARIO',
              description: 'Completar datos personales y académicos',
              step: 1
            },
            {
              id: 2,
              title: 'SUBIR DOCUMENTOS',
              description: 'Adjuntar documentación requerida',
              step: 2
            },
            {
              id: 3,
              title: 'PAGAR MATRÍCULA',
              description: 'Realizar pago de derechos académicos',
              step: 3
            },
            {
              id: 4,
              title: 'CONFIRMAR REGISTRO',
              description: 'Validar inscripción completada',
              step: 4
            }
          ],
          timeLimit: 90, // 1.5 minutos
          hintsAvailable: 3
        }
      }
    ]
  },
  bienestar: {
    id: 'bienestar',
    name: 'Bienestar',
    description: 'Descubre los servicios de bienestar universitario',
    order: 3,
    puzzles: [
      {
        id: 'bienestar_1',
        type: 'association',
        title: 'Asociaciones de Bienestar',
        description: 'Conecta los conceptos de bienestar con sus imágenes correspondientes',
        difficulty: 3,
        maxStars: 5,
        puzzleData: {
          categories: [
            {
              name: 'Salud Física',
              color: '#27ae60',
              associations: [
                // DIFÍCILES (2)
                { concept: 'Descanso', image: '🌙', description: 'Dormir 7-8 horas diarias es esencial para la consolidación de la memoria.' },
                { concept: 'Chequeos', image: '🩺', description: 'Los chequeos médicos regulares previenen enfermedades y mantienen tu salud.' },
                // MODERADAS (1)
                { concept: 'Hidratación', image: '🥤', description: 'Mantener una buena hidratación mejora la función cerebral.' }
              ]
            },
            {
              name: 'Salud Mental',
              color: '#3498db',
              associations: [
                // OBVIAS (1)
                { concept: 'Meditación', image: '🕉️', description: 'La meditación puede reducir la ansiedad universitaria hasta en un 40%.' },
                // MODERADAS (1)
                { concept: 'Relajación', image: '🕊️', description: 'Técnicas de relajación ayudan a manejar el estrés académico.' },
                // DIFÍCILES (1)
                { concept: 'Mindfulness', image: '🌅', description: 'La atención plena mejora la concentración y reduce la ansiedad.' }
              ]
            },
            {
              name: 'Deportes y Recreación',
              color: '#f39c12',
              associations: [
                // DIFÍCILES (1)
                { concept: 'Ciclismo', image: '🚴‍♀️', description: 'El ciclismo es una excelente forma de transporte sostenible y ejercicio.' },
                // MODERADAS (1)
                { concept: 'Natación', image: '🌊', description: 'La natación es un ejercicio completo que fortalece todos los músculos.' },
                // DIFÍCILES (1)
                { concept: 'Yoga', image: '🧘', description: 'El yoga combina flexibilidad, fuerza y relajación mental.' }
              ]
            },
            {
              name: 'Cultura y Arte',
              color: '#9b59b6',
              associations: [
                // DIFÍCILES (1)
                { concept: 'Literatura', image: '✍️', description: 'La lectura desarrolla el pensamiento crítico y comprensión lectora.' },
                // MODERADAS (1)
                { concept: 'Teatro', image: '🎤', description: 'Las actividades artísticas desarrollan creatividad y confianza.' },
                // DIFÍCILES (1)
                { concept: 'Pintura', image: '🎨', description: 'La pintura desarrolla la creatividad y es una terapia artística.' }
              ]
            },
            {
              name: 'Vida Social',
              color: '#e91e63',
              associations: [
                // DIFÍCILES (1)
                { concept: 'Eventos', image: '🎆', description: 'Los eventos estudiantiles fomentan la integración y diversión.' },
                // OBVIAS (1)
                { concept: 'Comunidad', image: '🏛️', description: 'Sentirse parte de una comunidad fortalece la identidad estudiantil.' },
                // MODERADAS (1)
                { concept: 'Voluntariado', image: '🤲', description: 'El voluntariado desarrolla empatía y responsabilidad social.' }
              ]
            }
          ],
          timeLimit: 300, // 5 minutos
          hintsAvailable: 3,
          totalAssociations: 15
        }
      }
    ]
  },
  facultades: {
    id: 'facultades',
    name: 'Facultades',
    description: 'Explora las diferentes facultades y programas',
    order: 4,
    puzzles: [
      {
        id: 'facultades_1',
        type: 'crossword',
        title: 'Crucigrama Académico Interactivo',
        description: 'Completa el crucigrama con términos de facultades, carreras y conceptos académicos',
        difficulty: 3,
        maxStars: 5,
        puzzleData: {
          gridSize: 15,
          wordCount: 10,
          categories: [
            {
              name: 'Facultades',
              words: ['INGENIERIA', 'EDUCACION', 'ARQUITECTURA'],
              definitions: [
                'Facultad que forma profesionales en ciencias aplicadas',
                'Facultad que forma maestros y pedagogos',
                'Arte y técnica de diseñar edificios'
              ]
            },
            {
              name: 'Profesiones',
              words: ['ABOGADO', 'CONTADOR', 'ARQUITECTO'],
              definitions: [
                'Profesional experto en leyes y defensa legal',
                'Experto en finanzas y contabilidad',
                'Diseñador de espacios y edificaciones'
              ]
            },
            {
              name: 'Asignaturas',
              words: ['CALCULO', 'FISICA', 'HISTORIA'],
              definitions: [
                'Matemática avanzada con derivadas e integrales',
                'Ciencia que estudia la materia y energía',
                'Estudio de eventos del pasado humano'
              ]
            },
            {
              name: 'Conceptos Académicos',
              words: ['SEMESTRE'],
              definitions: [
                'Período académico de seis meses'
              ]
            }
          ],
          timeLimit: 600, // 10 minutos
          hintsAvailable: 3,
          curiosities: [
            '¿Sabías que Ingeniería viene del latín "ingenium" (ingenio)?',
            'La Facultad de Medicina más antigua de América está en México (1551)',
            'Los primeros médicos especializados aparecieron en el Antiguo Egipto',
            'La profesión de contador existe desde hace más de 7,000 años',
            'El término "arquitecto" significa "constructor jefe" en griego',
            'El cálculo fue inventado independientemente por Newton y Leibniz',
            'La física estudia desde partículas subatómicas hasta galaxias',
            'El sistema semestral se originó en las universidades alemanas del siglo XIX'
          ]
        }
      }
    ]
  },
  cartera: {
    id: 'cartera',
    name: 'Cartera',
    description: 'Gestiona los pagos y costos de tu matrícula',
    order: 5,
    puzzles: [
      {
        id: 'cartera_1',
        type: 'math',
        title: 'Generador de Puzzle Matemático - Cartera Estudiantil',
        description: 'Resuelve 8 problemas matemáticos financieros sobre pagos, becas, descuentos y presupuesto estudiantil',
        difficulty: 3,
        maxStars: 5,
        puzzleData: {
          totalProblems: 8,
          categories: [
            {
              name: 'Pagos y Matrículas',
              problems: 2,
              description: 'Cálculos de matrícula y comparación de planes de pago'
            },
            {
              name: 'Becas y Subsidios',
              problems: 2,
              description: 'Becas académicas y combinación de beneficios'
            },
            {
              name: 'Descuentos Especiales',
              problems: 2,
              description: 'Descuentos por pronto pago y descuentos sucesivos'
            },
            {
              name: 'Presupuesto Estudiantil',
              problems: 2,
              description: 'Planificación financiera y análisis costo-beneficio'
            }
          ],
          timeLimit: 1200, // 20 minutos (reducido por tener menos problemas)
          hintsAvailable: 3,
          calculatorEnabled: true,
          maxAttemptsPerProblem: 2, // Nuevo: máximo 2 intentos por problema
          achievements: [
            { id: 'ahorrador_experto', name: 'Ahorrador Experto', description: 'Calcular correctamente 5 descuentos consecutivos' },
            { id: 'becado_estratega', name: 'Becado Estratega', description: 'Dominar todos los problemas de becas' },
            { id: 'calculadora_humana', name: 'Calculadora Humana', description: 'Resolver problema en menos de 1 minuto' },
            { id: 'cfo_estudiantil', name: 'CFO Estudiantil', description: 'Completar todos los niveles con 90%+ precisión' },
            { id: 'master_finanzas', name: 'Máster en Finanzas', description: 'Terminar sin usar pistas' },
            { id: 'optimizador', name: 'Optimizador', description: 'Encontrar la mejor opción en problemas comparativos' },
            { id: 'planificador', name: 'Planificador', description: 'Excelencia en problemas de presupuesto' }
          ],
          educationalTips: [
            'Los descuentos por pronto pago pueden ahorrarte cientos de miles de pesos al año',
            'Mantén un promedio alto desde primer semestre para acceder a mejores becas',
            'Las becas combinadas pueden maximizar tu ahorro, pero respetan límites institucionales',
            'Siempre compara el costo total, no solo las cuotas mensuales',
            'La planificación financiera es clave para el éxito universitario',
            'Considera el costo total de la carrera, no solo el costo por semestre',
            'La inflación educativa es real. Planifica con anticipación'
          ]
        }
      },
      {
        id: 'cartera_2',
        type: 'memorymatch',
        title: 'Memory Match - Conceptos Financieros',
        description: 'Empareja conceptos financieros relacionados para aprender sobre cartera universitaria',
        difficulty: 3,
        maxStars: 5,
        puzzleData: {
          totalPairs: 10,
          categories: [
            {
              name: 'Pagos y Servicios',
              color: '#3B82F6',
              pairs: 2,
              description: 'Conceptos relacionados con pagos y servicios académicos'
            },
            {
              name: 'Crédito y Financiación',
              color: '#10B981',
              pairs: 3,
              description: 'Términos de financiación y créditos educativos'
            },
            {
              name: 'Becas y Subsidios',
              color: '#F59E0B',
              pairs: 3,
              description: 'Ayudas económicas y beneficios estudiantiles'
            },
            {
              name: 'Gestión Financiera',
              color: '#8B5CF6',
              pairs: 2,
              description: 'Planificación y control financiero estudiantil'
            }
          ],
          timeLimit: 600, // 10 minutos
          hintsAvailable: 3,
          educationalContent: true,
          achievements: [
            { id: 'memory_master', name: 'Máster de la Memoria', description: 'Completar sin usar pistas' },
            { id: 'speed_demon', name: 'Demonio de la Velocidad', description: 'Completar en menos de 3 minutos' },
            { id: 'financial_expert', name: 'Experto Financiero', description: 'Aprender todos los conceptos financieros' },
            { id: 'perfect_match', name: 'Emparejamiento Perfecto', description: 'Encontrar todos los pares sin errores' },
            { id: 'hint_conservationist', name: 'Conservador de Pistas', description: 'Completar usando solo 1 pista' }
          ]
        }
      }
    ]
  }
};

// Obtener todos los niveles
router.get('/levels', (req, res) => {
  try {
    // Ordenar los niveles por el campo 'order'
    const sortedLevels = Object.values(gameLevels).sort((a, b) => a.order - b.order);
    
    res.json({
      success: true,
      data: sortedLevels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener los niveles del juego'
    });
  }
});

// Obtener un nivel específico
router.get('/levels/:levelId', (req, res) => {
  try {
    const { levelId } = req.params;
    const level = gameLevels[levelId];
    
    if (!level) {
      return res.status(404).json({
        success: false,
        error: 'Nivel no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: level
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el nivel'
    });
  }
});

// Obtener un puzzle específico
router.get('/puzzles/:puzzleId', (req, res) => {
  try {
    const { puzzleId } = req.params;
    let puzzle = null;
    let level = null;
    
    // Buscar el puzzle en todos los niveles
    for (const levelKey in gameLevels) {
      const foundPuzzle = gameLevels[levelKey].puzzles.find(p => p.id === puzzleId);
      if (foundPuzzle) {
        puzzle = foundPuzzle;
        level = gameLevels[levelKey];
        break;
      }
    }
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        puzzle,
        level: {
          id: level.id,
          name: level.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el puzzle'
    });
  }
});

// Calcular estrellas basado en rendimiento
router.post('/calculate-stars', [
  body('puzzleId').notEmpty().withMessage('ID del puzzle es requerido'),
  body('timeSpent').isNumeric().withMessage('Tiempo debe ser numérico'),
  body('errors').isNumeric().withMessage('Errores debe ser numérico'),
  body('hintsUsed').isNumeric().withMessage('Pistas usadas debe ser numérico')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { puzzleId, timeSpent, errors: errorCount, hintsUsed } = req.body;
    
    // Encontrar el puzzle
    let puzzle = null;
    for (const levelKey in gameLevels) {
      const foundPuzzle = gameLevels[levelKey].puzzles.find(p => p.id === puzzleId);
      if (foundPuzzle) {
        puzzle = foundPuzzle;
        break;
      }
    }
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle no encontrado'
      });
    }
    
    // ==========================================
    // NUEVO SISTEMA DE PUNTUACIÓN
    // ==========================================
    let stars = 5; // Empezamos con 5 estrellas
    let timePenalty = 0;
    let errorPenalty = 0;
    let hintPenalty = 0;
    let optimalTime = 0;
    
    // CÁLCULO ESPECÍFICO POR PUZZLE
    
    // 1. SOPA DE LETRAS (mercadeo_1)
    if (puzzleId === 'mercadeo_1') {
      optimalTime = 300; // 5 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 300) {
        timePenalty = 0; // <= 5 min: Tiempo óptimo
      } else if (timeSpent <= 360) {
        timePenalty = 1; // 5-6 min: -1 estrella
      } else if (timeSpent <= 420) {
        timePenalty = 2; // 6-7 min: -2 estrellas
      } else if (timeSpent <= 480) {
        timePenalty = 3; // 7-8 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 8 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores
      if (errorCount <= 1) {
        errorPenalty = 0; // 0-1 errores
      } else if (errorCount <= 3) {
        errorPenalty = 1; // 2-3 errores: -1 estrella
      } else if (errorCount <= 5) {
        errorPenalty = 2; // 4-5 errores: -2 estrellas
      } else if (errorCount <= 7) {
        errorPenalty = 3; // 6-7 errores: -3 estrellas
      } else {
        errorPenalty = 3; // Más de 7 errores: -3 estrellas (máximo)
      }
    }
    
    // 2. ROMPECABEZAS (mercadeo_2)
    else if (puzzleId === 'mercadeo_2') {
      optimalTime = 300; // 5 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 300) {
        timePenalty = 0; // Tiempo óptimo
      } else if (timeSpent <= 420) {
        timePenalty = 1; // 5-7 min: -1 estrella
      } else if (timeSpent <= 540) {
        timePenalty = 2; // 7-9 min: -2 estrellas
      } else if (timeSpent <= 720) {
        timePenalty = 3; // 9-12 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 12 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores
      if (errorCount <= 1) {
        errorPenalty = 0; // 0-1 errores
      } else if (errorCount <= 3) {
        errorPenalty = 1; // 2-3 errores: -1 estrella
      } else if (errorCount <= 5) {
        errorPenalty = 2; // 4-5 errores: -2 estrellas
      } else if (errorCount <= 7) {
        errorPenalty = 3; // 6-7 errores: -3 estrellas
      } else {
        errorPenalty = 3; // Más de 7 errores: -3 estrellas (máximo)
      }
    }
    
    // 3. SUDOKU (registro_1)
    else if (puzzleId === 'registro_1') {
      optimalTime = 720; // 12 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 720) {
        timePenalty = 0; // <= 12 min: Tiempo óptimo
      } else if (timeSpent <= 840) {
        timePenalty = 1; // 12-14 min: -1 estrella
      } else if (timeSpent <= 960) {
        timePenalty = 2; // 14-16 min: -2 estrellas
      } else if (timeSpent <= 1020) {
        timePenalty = 3; // 16-17 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 17 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores
      if (errorCount <= 1) {
        errorPenalty = 0; // 0-1 errores
      } else if (errorCount <= 3) {
        errorPenalty = 1; // 2-3 errores: -1 estrella
      } else if (errorCount <= 5) {
        errorPenalty = 2; // 4-5 errores: -2 estrellas
      } else if (errorCount <= 7) {
        errorPenalty = 3; // 6-7 errores: -3 estrellas
      } else {
        errorPenalty = 3; // Más de 7 errores: -3 estrellas (máximo)
      }
    }
    
    // 4. PROCESO SECUENCIAL (registro_2)
    else if (puzzleId === 'registro_2') {
      optimalTime = 90; // 1.5 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 90) {
        timePenalty = 0; // Tiempo óptimo
      } else if (timeSpent <= 180) {
        timePenalty = 1; // 1.5-3 min: -1 estrella
      } else if (timeSpent <= 240) {
        timePenalty = 2; // 3-4 min: -2 estrellas
      } else if (timeSpent <= 300) {
        timePenalty = 3; // 4-5 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 5 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores
      if (errorCount <= 1) {
        errorPenalty = 0; // 0-1 errores
      } else if (errorCount <= 3) {
        errorPenalty = 1; // 2-3 errores: -1 estrella
      } else if (errorCount <= 5) {
        errorPenalty = 2; // 4-5 errores: -2 estrellas
      } else if (errorCount <= 7) {
        errorPenalty = 3; // 6-7 errores: -3 estrellas
      } else {
        errorPenalty = 3; // Más de 7 errores: -3 estrellas (máximo)
      }
    }
    
    // 5. ASOCIACIONES (bienestar_1)
    else if (puzzleId === 'bienestar_1') {
      optimalTime = 150; // 2.5 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 150) {
        timePenalty = 0; // Tiempo óptimo
      } else if (timeSpent <= 300) {
        timePenalty = 1; // 2.5-5 min: -1 estrella
      } else if (timeSpent <= 420) {
        timePenalty = 2; // 5-7 min: -2 estrellas
      } else if (timeSpent <= 600) {
        timePenalty = 3; // 7-10 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 10 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores
      if (errorCount <= 1) {
        errorPenalty = 0; // 0-1 errores
      } else if (errorCount <= 3) {
        errorPenalty = 1; // 2-3 errores: -1 estrella
      } else if (errorCount <= 5) {
        errorPenalty = 2; // 4-5 errores: -2 estrellas
      } else if (errorCount <= 7) {
        errorPenalty = 3; // 6-7 errores: -3 estrellas
      } else {
        errorPenalty = 3; // Más de 7 errores: -3 estrellas (máximo)
      }
    }
    
    // 6. CRUCIGRAMA (facultades_1)
    else if (puzzleId === 'facultades_1') {
      optimalTime = 300; // 5 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 300) {
        timePenalty = 0; // Tiempo óptimo
      } else if (timeSpent <= 420) {
        timePenalty = 1; // 5-7 min: -1 estrella
      } else if (timeSpent <= 540) {
        timePenalty = 2; // 7-9 min: -2 estrellas
      } else if (timeSpent <= 720) {
        timePenalty = 3; // 9-12 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 12 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores
      if (errorCount <= 1) {
        errorPenalty = 0; // 0-1 errores
      } else if (errorCount <= 3) {
        errorPenalty = 1; // 2-3 errores: -1 estrella
      } else if (errorCount <= 5) {
        errorPenalty = 2; // 4-5 errores: -2 estrellas
      } else if (errorCount <= 7) {
        errorPenalty = 3; // 6-7 errores: -3 estrellas
      } else {
        errorPenalty = 3; // Más de 7 errores: -3 estrellas (máximo)
      }
    }
    
    // 7. MATEMÁTICAS (cartera_1)
    else if (puzzleId === 'cartera_1') {
      optimalTime = 420; // 7 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 420) {
        timePenalty = 0; // <= 7 min: Tiempo óptimo
      } else if (timeSpent <= 600) {
        timePenalty = 1; // 7-10 min: -1 estrella
      } else if (timeSpent <= 780) {
        timePenalty = 2; // 10-13 min: -2 estrellas
      } else {
        timePenalty = 3; // >13 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores - Sistema específico para matemáticas
      // Cada problema fallado (después de 2 intentos) cuenta como 1 error
      if (errorCount === 0) {
        errorPenalty = 0; // 0 errores: sin penalización
      } else if (errorCount <= 1) {
        errorPenalty = 1; // 1 error: -1 estrella
      } else if (errorCount <= 2) {
        errorPenalty = 2; // 2 errores: -2 estrellas
      } else {
        errorPenalty = 3; // 3+ errores: -3 estrellas
      }
    }
    
    // 8. MEMORY MATCH (cartera_2)
    else if (puzzleId === 'cartera_2') {
      optimalTime = 300; // 5 minutos
      
      // Penalización por tiempo
      if (timeSpent <= 300) {
        timePenalty = 0; // Tiempo óptimo
      } else if (timeSpent <= 420) {
        timePenalty = 1; // 5-7 min: -1 estrella
      } else if (timeSpent <= 540) {
        timePenalty = 2; // 7-9 min: -2 estrellas
      } else if (timeSpent <= 720) {
        timePenalty = 3; // 9-12 min: -3 estrellas
      } else {
        timePenalty = 3; // Más de 12 min: -3 estrellas (máximo)
      }
      
      // Penalización por errores - MEMORY MATCH
      if (errorCount <= 10) {
        errorPenalty = 0; // 0-10 errores: -0 estrellas
      } else if (errorCount <= 14) {
        errorPenalty = 1; // 10-14 errores: -1 estrella
      } else if (errorCount <= 18) {
        errorPenalty = 2; // 14-18 errores: -2 estrellas
      } else {
        errorPenalty = 3; // >18 errores: -3 estrellas
      }
    }
    
    // FALLBACK: En caso de que se agregue un puzzle nuevo sin configuración
    else {
      // Sistema genérico por defecto
      optimalTime = 300; // 5 minutos por defecto
      
      // Penalización genérica por tiempo
      if (timeSpent > optimalTime * 3) {
        timePenalty = 3;
      } else if (timeSpent > optimalTime * 2) {
        timePenalty = 2;
      } else if (timeSpent > optimalTime * 1.5) {
        timePenalty = 1;
      }
      
      // Penalización genérica por errores
      if (errorCount <= 1) {
        errorPenalty = 0;
      } else if (errorCount <= 3) {
        errorPenalty = 1;
      } else if (errorCount <= 5) {
        errorPenalty = 2;
      } else {
        errorPenalty = 3;
      }
    }
    
    // Penalización por pistas - UNIVERSAL: cada pista = -1 estrella
    hintPenalty = hintsUsed;
    
    // Calcular estrellas finales
    stars = stars - timePenalty - errorPenalty - hintPenalty;
    
    // Asegurar que esté entre 0 y 5 estrellas
    stars = Math.max(0, Math.min(5, stars));
    
    res.json({
      success: true,
      data: {
        puzzleId,
        stars,
        maxStars: 5,
        timeSpent,
        errors: errorCount,
        hintsUsed,
        difficulty: puzzle.difficulty,
        isPerfect: stars === 5 && errorCount === 0 && hintsUsed === 0,
        isFast: timeSpent <= optimalTime,
        optimalTime,
        penalties: {
          time: timePenalty,
          errors: errorPenalty,
          hints: hintPenalty,
          total: timePenalty + errorPenalty + hintPenalty
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al calcular estrellas'
    });
  }
});

module.exports = router;
module.exports.gameLevels = gameLevels;

import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { 
  Calculator, 
  Lightbulb, 
  CheckCircle, 
  X, 
  Clock, 
  Star,
  DollarSign,
  Percent,
  TrendingUp,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GameSidebar from '../GameSidebar';
import ProgressBar from '../ProgressBar';

const MathPuzzle = forwardRef(({ onComplete, onHintUsed, onError, hintsUsed = 0 }, ref) => {
  // Estados principales
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [gameCompleted, setGameCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [achievements, setAchievements] = useState(new Set());
  const [calculatorValue, setCalculatorValue] = useState('0');
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [attemptsPerProblem, setAttemptsPerProblem] = useState({});
  const [problemsWithErrors, setProblemsWithErrors] = useState(new Set());

  // Banco completo de 20 problemas financieros estudiantiles
  // Banco completo de 20 problemas financieros estudiantiles - CORREGIDO
const allFinancialProblems = [
  // NIVEL 1: MUY FÁCIL (2 problemas)
  {
    id: 1,
    category: 'Pagos y Matrículas',
    level: 'Muy Fácil',
    title: 'Cálculo de Descuento Simple',
    problem: `Tu matrícula cuesta $1,000,000. Si pagas antes de la fecha límite, tienes un descuento del 5%. ¿Cuánto pagarías con descuento? (Respuesta: solo el número, sin comas ni puntos)`,
    answer: 950000,
    tolerance: 0.01,
    concept: 'Porcentajes básicos',
    tips: [
      'El descuento del 5% significa que pagas el 95% del valor original',
      'Fórmula: $1,000,000 × 0.95 = ?',
      'Multiplica 1,000,000 por 0.95 para obtener la respuesta'
    ],
    educationalTip: 'Los descuentos por pronto pago son una excelente forma de ahorrar dinero.',
    curiosity: 'Un descuento del 5% puede parecer poco, pero en una matrícula de $1,000,000 significa $50,000 de ahorro.'
  },
  {
    id: 2,
    category: 'Becas y Subsidios',
    level: 'Muy Fácil',
    title: 'Beca de Excelencia Básica',
    problem: `Tu promedio es 4.2/5.0. La beca cubre 10% por cada 0.1 sobre 4.0. ¿Qué porcentaje de beca recibes? (Respuesta: solo el número del porcentaje, sin el símbolo %)`,
    answer: 20,
    tolerance: 0.01,
    concept: 'Proporciones simples',
    tips: [
      'Tienes 0.2 puntos sobre 4.0 (4.2 - 4.0 = 0.2)',
      'Cada 0.1 te da 10% de beca',
      '0.2 ÷ 0.1 = 2, entonces 2 × 10% = 20%'
    ],
    educationalTip: 'Mantener un buen promedio desde el inicio te da acceso a becas automáticamente.',
    curiosity: 'Las becas por excelencia académica se otorgan automáticamente según tu promedio.'
  },
  
  // NIVEL 2: FÁCIL (2 problemas)
  {
    id: 3,
    category: 'Descuentos Especiales',
    level: 'Fácil',
    title: 'Descuentos Acumulativos',
    problem: `Matrícula: $1,500,000. Descuento pronto pago: 8%. Descuento pronto pago: 5%. ¿Cuánto ahorras con ambos descuentos? (Respuesta: solo el número del ahorro en pesos, sin comas ni puntos)`,
    answer: 195000,
    tolerance: 0.01,
    concept: 'Descuentos acumulativos',
    tips: [
      'Suma los porcentajes: 8% + 5% = 13%',
      'Calcula el 13% de $1,500,000',
      'Fórmula: $1,500,000 × 0.13 = ?'
    ],
    educationalTip: 'Los descuentos se pueden acumular, ¡aprovecha todas las opciones disponibles!',
    curiosity: 'Los descuentos por pronto pago pueden ahorrarte mucho dinero.'
  },
  {
    id: 4,
    category: 'Presupuesto Estudiantil',
    level: 'Fácil',
    title: 'Ahorro Mensual Simple',
    problem: `Ganas $600,000 mensuales y gastas $400,000 en gastos fijos. ¿Cuánto puedes ahorrar por mes? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 200000,
    tolerance: 0.01,
    concept: 'Aritmética básica',
    tips: [
      'Ahorro = Ingresos - Gastos',
      'Ahorro = $600,000 - $400,000',
      'Realiza la resta: 600,000 - 400,000 = ?'
    ],
    educationalTip: 'La regla de oro: siempre gasta menos de lo que ganas para poder ahorrar.',
    curiosity: 'Ahorrar $200,000 mensuales te da $2,400,000 al año, suficiente para una matrícula universitaria.'
  },
  
  // NIVEL 3: INTERMEDIO (2 problemas)
  {
    id: 5,
    category: 'Pagos y Matrículas',
    level: 'Intermedio',
    title: 'Descuentos Sucesivos',
    problem: `Matrícula: $2,000,000. Descuento pronto pago: 10%. Descuento por convenio: 5%. ¿Cuál es el valor final a pagar? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1710000,
    tolerance: 0.01,
    concept: 'Descuentos sucesivos',
    tips: [
      'Primer descuento: $2,000,000 × 0.90 = $1,800,000',
      'Segundo descuento: $1,800,000 × 0.95 = ?',
      'Multiplica 1,800,000 por 0.95 para obtener la respuesta final'
    ],
    educationalTip: 'Los descuentos sucesivos se aplican uno sobre el otro, no se suman.',
    curiosity: 'Los descuentos sucesivos pueden ser más beneficiosos que un descuento único equivalente.'
  },
  {
    id: 6,
    category: 'Becas y Subsidios',
    level: 'Intermedio',
    title: 'Beca Combinada con Límite',
    problem: `Matrícula: $2,500,000. Beca académica: 25%. Beca socioeconómica: 20%. Límite máximo: 40%. ¿Cuánto pagas finalmente? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1500000,
    tolerance: 0.01,
    concept: 'Límites y combinaciones',
    tips: [
      'Suma las becas: 25% + 20% = 45%',
      'Como 45% > 40%, solo puedes usar el 40%',
      'Pagas el 60% restante: $2,500,000 × 0.60 = ?'
    ],
    educationalTip: 'Las becas tienen límites máximos para evitar que excedan el 100% de la matrícula.',
    curiosity: 'Algunas universidades permiten combinar hasta 3 tipos diferentes de becas.'
  },
  
  // NIVEL 4: AVANZADO (2 problemas)
  {
    id: 7,
    category: 'Presupuesto Estudiantil',
    level: 'Avanzado',
    title: 'Planificación Semestral',
    problem: `Ingresos mensuales: $800,000. Gastos fijos: $500,000. Matrícula semestral: $2,400,000. ¿En cuántos meses puedes ahorrar para la matrícula? (Respuesta: solo el número de meses)`,
    answer: 8,
    tolerance: 0.1,
    concept: 'Planificación financiera',
    tips: [
      'Ahorro mensual: $800,000 - $500,000 = $300,000',
      'Meses necesarios: $2,400,000 ÷ $300,000 = 8 meses',
      'Redondea hacia arriba si el resultado no es exacto'
    ],
    educationalTip: 'La planificación financiera es clave para el éxito universitario.',
    curiosity: 'Los estudiantes que planifican sus finanzas tienen 3x más probabilidades de graduarse.'
  },
  {
    id: 8,
    category: 'Pagos y Matrículas',
    level: 'Avanzado',
    title: 'Comparación de Planes de Pago',
    problem: `Plan A: $3,000,000 al contado con 12% descuento. Plan B: $1,000,000 inicial + 4 cuotas de $550,000. ¿Qué plan es más económico y por cuánto? (Respuesta: solo el número de la diferencia en pesos, sin comas ni puntos)`,
    answer: 560000, // CORREGIDO: Diferencia correcta
    tolerance: 0.01,
    concept: 'Análisis comparativo',
    tips: [
      'Plan A: $3,000,000 × 0.88 = $2,640,000',
      'Plan B: $1,000,000 + (4 × $550,000) = $3,200,000',
      'Diferencia: $3,200,000 - $2,640,000 = $560,000 (Plan A es mejor)'
    ],
    educationalTip: 'Siempre compara el costo total, no solo las cuotas mensuales.',
    curiosity: 'Los descuentos por pago al contado suelen ser más beneficiosos que las cuotas sin interés.'
  },

  // PROBLEMAS ADICIONALES (12 problemas más)
  {
    id: 9,
    category: 'Becas y Subsidios',
    level: 'Muy Fácil',
    title: 'Descuento por convenio',
    problem: `Si tienes un convenio con una institución aliada a la universidad, recibes 15% de descuento. Matrícula: $1,200,000. ¿Cuánto pagas con el descuento? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1020000,
    tolerance: 0.01,
    concept: 'Porcentajes básicos',
    tips: [
      'Con 15% de beca, pagas el 85% del valor original',
      'Fórmula: $1,200,000 × 0.85 = ?',
      'Multiplica 1,200,000 por 0.85 para obtener la respuesta'
    ],
    educationalTip: 'Los descuentos por convenios son una excelente forma de ahorrar en educación.',
    curiosity: 'Los convenios con instituciones aliadas a la universidad son una excelente forma de ahorrar en educación.'
  },
  {
    id: 10,
    category: 'Descuentos Especiales',
    level: 'Fácil',
    title: 'Descuento por Pago Anticipado',
    problem: `Matrícula: $1,800,000. Descuento por pago anticipado: 10%. Descuento por excelencia académica: 8%. ¿Cuánto ahorras en total? (Respuesta: solo el número del ahorro en pesos, sin comas ni puntos)`,
    answer: 324000,
    tolerance: 0.01,
    concept: 'Descuentos acumulativos',
    tips: [
      'Suma los porcentajes: 10% + 8% = 18%',
      'Calcula el 18% de $1,800,000',
      'Fórmula: $1,800,000 × 0.18 = ?'
    ],
    educationalTip: 'Los descuentos se pueden combinar para maximizar el ahorro.',
    curiosity: 'Los estudiantes que pagan anticipadamente ahorran en promedio $300,000 por semestre.'
  },
  {
    id: 11,
    category: 'Presupuesto Estudiantil',
    level: 'Fácil',
    title: 'Gastos Mensuales',
    problem: `Transporte: $150,000. Alimentación: $300,000. Materiales: $100,000. Otros: $50,000. ¿Cuál es el total de gastos mensuales? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 600000,
    tolerance: 0.01,
    concept: 'Suma de gastos',
    tips: [
      'Suma todos los gastos: $150,000 + $300,000 + $100,000 + $50,000',
      'Total: $600,000',
      'Es una suma directa de todos los conceptos'
    ],
    educationalTip: 'Llevar un control de gastos te ayuda a administrar mejor tu presupuesto.',
    curiosity: 'Los estudiantes que controlan sus gastos tienen 40% menos probabilidades de tener problemas financieros.'
  },
  {
    id: 12,
    category: 'Pagos y Matrículas',
    level: 'Intermedio',
    title: 'Descuentos Sucesivos Complejos',
    problem: `Matrícula: $2,500,000. Primer descuento: 12%. Segundo descuento sobre el resultado: 8%. ¿Cuánto pagas finalmente? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 2024000,
    tolerance: 0.01,
    concept: 'Descuentos sucesivos',
    tips: [
      'Primer descuento: $2,500,000 × 0.88 = $2,200,000',
      'Segundo descuento: $2,200,000 × 0.92 = $2,024,000',
      'Los descuentos sucesivos se aplican sobre el resultado anterior'
    ],
    educationalTip: 'Los descuentos sucesivos son diferentes a los acumulativos.',
    curiosity: 'Los descuentos sucesivos suelen ser más beneficiosos que los acumulativos para el estudiante.'
  },
  {
    id: 13,
    category: 'Becas y Subsidios',
    level: 'Intermedio',
    title: 'Beca por Rendimiento',
    problem: `Promedio: 4.5/5.0. Beca: 5% por cada 0.1 sobre 4.0, máximo 25%. Matrícula: $2,000,000. ¿Cuánto pagas con la beca? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1500000,
    tolerance: 0.01,
    concept: 'Becas con límite',
    tips: [
      'Puntos sobre 4.0: 4.5 - 4.0 = 0.5',
      'Beca calculada: 0.5 ÷ 0.1 × 5% = 25% (máximo)',
      'Pago: $2,000,000 × 0.75 = $1,500,000'
    ],
    educationalTip: 'Mantener un excelente promedio te da acceso a becas significativas.',
    curiosity: 'Los estudiantes con promedio superior a 4.5 ahorran en promedio $500,000 por semestre.'
  },
  {
    id: 14,
    category: 'Presupuesto Estudiantil',
    level: 'Intermedio',
    title: 'Ahorro para Emergencias',
    problem: `Ingresos: $700,000. Gastos fijos: $450,000. Quieres ahorrar 20% de tus ingresos. ¿Cuánto puedes gastar en ocio? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 110000,
    tolerance: 0.01,
    concept: 'Planificación de ahorro',
    tips: [
      'Ahorro: $700,000 × 0.20 = $140,000',
      'Gastos totales: $450,000 + $140,000 = $590,000',
      'Ocio: $700,000 - $590,000 = $110,000'
    ],
    educationalTip: 'El ahorro de emergencia es fundamental para la estabilidad financiera.',
    curiosity: 'Los estudiantes con fondo de emergencia tienen 60% menos estrés financiero.'
  },
  {
    id: 15,
    category: 'Pagos y Matrículas',
    level: 'Avanzado',
    title: 'Plan de Financiación',
    problem: `Matrícula: $3,500,000. Cuota inicial: 30%. Resto en 6 cuotas iguales. ¿Cuánto pagas en cada cuota? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 408333,
    tolerance: 0.01,
    concept: 'Financiación con cuota inicial',
    tips: [
      'Cuota inicial: $3,500,000 × 0.30 = $1,050,000',
      'Resto: $3,500,000 - $1,050,000 = $2,450,000',
      'Cuota mensual: $2,450,000 ÷ 6 = $408,333'
    ],
    educationalTip: 'Los planes de financiación te permiten distribuir los pagos en el tiempo.',
    curiosity: 'El 70% de los estudiantes universitarios utilizan algún tipo de financiación.'
  },
  {
    id: 16,
    category: 'Becas y Subsidios',
    level: 'Avanzado',
    title: 'Beca Combinada Compleja',
    problem: `Matrícula: $2,800,000. Beca excelencia: 20%. Beca socioeconómica: 15%. Límite combinado: 30%. ¿Cuánto pagas finalmente? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1960000,
    tolerance: 0.01,
    concept: 'Becas con límite combinado',
    tips: [
      'Beca total: 20% + 15% = 35%, pero límite es 30%',
      'Aplicar 30% de beca: $2,800,000 × 0.70 = $1,960,000',
      'El límite combinado prevalece sobre la suma individual'
    ],
    educationalTip: 'Los límites de becas combinadas protegen la sostenibilidad del programa.',
    curiosity: 'Los límites de becas combinadas aseguran que más estudiantes puedan beneficiarse.'
  },
  {
    id: 17,
    category: 'Descuentos Especiales',
    level: 'Avanzado',
    title: 'Descuento por Puntualidad',
    problem: `Matrícula: $1,600,000. Descuento por pago puntual: 8%. Descuento por referido: 5%. Descuento por excelencia: 10%. Límite total: 20%. ¿Cuánto pagas? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1280000,
    tolerance: 0.01,
    concept: 'Descuentos con límite total',
    tips: [
      'Descuentos totales: 8% + 5% + 10% = 23%, pero límite es 20%',
      'Aplicar 20% de descuento: $1,600,000 × 0.80 = $1,280,000',
      'El límite total prevalece sobre la suma de descuentos'
    ],
    educationalTip: 'Los límites de descuentos aseguran la viabilidad financiera de la institución.',
    curiosity: 'Los estudiantes que cumplen múltiples criterios de descuento ahorran significativamente.'
  },
  {
    id: 18,
    category: 'Presupuesto Estudiantil',
    level: 'Avanzado',
    title: 'Presupuesto Semestral Completo',
    problem: `Ingresos mensuales: $900,000. Gastos fijos: $600,000. Matrícula semestral: $3,000,000. Gastos adicionales semestrales: $800,000. ¿En cuántos meses puedes cubrir todo? (Respuesta: solo el número de meses)`,
    answer: 13,
    tolerance: 0.1,
    concept: 'Planificación financiera completa',
    tips: [
      'Ahorro mensual: $900,000 - $600,000 = $300,000',
      'Gastos totales semestrales: $3,000,000 + $800,000 = $3,800,000',
      'Meses necesarios: $3,800,000 ÷ $300,000 = 12.67 → 13 meses'
    ],
    educationalTip: 'La planificación financiera completa incluye todos los gastos académicos.',
    curiosity: 'Los estudiantes que planifican todos sus gastos tienen 80% menos problemas financieros.'
  },
  {
    id: 19,
    category: 'Becas y Subsidios',
    level: 'Avanzado',
    title: 'Beca por Méritos Múltiples',
    problem: `Matrícula: $3,200,000. Beca académica: 25%. Beca deportiva: 10%. Beca cultural: 8%. Beca social: 12%. Límite combinado: 40%. ¿Cuánto pagas finalmente? (Respuesta: solo el número en pesos, sin comas ni puntos)`,
    answer: 1920000,
    tolerance: 0.01,
    concept: 'Becas múltiples con límite',
    tips: [
      'Becas totales: 25% + 10% + 8% + 12% = 55%, pero límite es 40%',
      'Aplicar 40% de beca: $3,200,000 × 0.60 = $1,920,000',
      'El límite combinado prevalece sobre la suma de todas las becas'
    ],
    educationalTip: 'Las becas por méritos múltiples reconocen el talento integral del estudiante.',
    curiosity: 'Los estudiantes con múltiples talentos pueden acceder a becas significativas.'
  }
];

  // Seleccionar 8 problemas aleatoriamente
  const financialProblems = useMemo(() => {
    const shuffled = [...allFinancialProblems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8);
  }, []);

  // Inicializar el juego
  useEffect(() => {
    if (isInitialized) return;
    
    setStartTime(Date.now());
    setIsInitialized(true);
    
    // Scroll automático al cargar el puzzle
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [isInitialized]);

  // Manejar eventos de teclado para la calculadora
  useEffect(() => {
    const handleKeyboardInput = (event) => {
      // Solo procesar si la calculadora está abierta
      if (!showCalculator) return;
      
      const key = event.key;
      
      // Prevenir comportamiento por defecto para teclas que manejamos
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '.', 'Enter', 'Escape', 'Backspace', 'Delete'].includes(key)) {
        event.preventDefault();
      }
      
      // Números del teclado principal y numérico
      if (key >= '0' && key <= '9') {
        handleCalculatorInput(key);
      }
      // Operaciones matemáticas
      else if (key === '+') {
        handleCalculatorInput('+');
      }
      else if (key === '-') {
        handleCalculatorInput('-');
      }
      else if (key === '*') {
        handleCalculatorInput('*');
      }
      else if (key === '/') {
        handleCalculatorInput('/');
      }
      // Punto decimal
      else if (key === '.') {
        handleCalculatorInput('.');
      }
      // Enter para calcular
      else if (key === 'Enter') {
        handleCalculatorInput('=');
      }
      // Escape para limpiar
      else if (key === 'Escape') {
        handleCalculatorInput('C');
      }
      // Backspace para borrar
      else if (key === 'Backspace') {
        handleCalculatorInput('←');
      }
      // Delete para limpiar
      else if (key === 'Delete') {
        handleCalculatorInput('C');
      }
    };

    // Agregar event listener
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Limpiar event listener al desmontar
    return () => {
      document.removeEventListener('keydown', handleKeyboardInput);
    };
  }, [showCalculator]);

  // Manejar entrada de respuesta
  const handleAnswerSubmit = (answer) => {
    if (gameCompleted) return;
    
    const problem = financialProblems[currentProblem];
    const userAnswer = parseFloat(answer);
    const correctAnswer = problem.answer;
    const tolerance = problem.tolerance;
    
    // Verificar si la respuesta está dentro del rango de tolerancia
    const isCorrect = Math.abs(userAnswer - correctAnswer) <= (correctAnswer * tolerance);
    
    if (isCorrect) {
      // Respuesta correcta
      setUserAnswers(prev => ({
        ...prev,
        [problem.id]: userAnswer
      }));
      
      setCompletedProblems(prev => new Set([...prev, problem.id]));
      
      // Limpiar intentos del problema actual
      setAttemptsPerProblem(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[problem.id];
        return newAttempts;
      });
      
      // Limpiar el problema de la lista de errores si estaba ahí
      setProblemsWithErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(problem.id);
        return newErrors;
      });
      
      // Mensaje motivacional
      const motivationalMessages = [
        '¡Excelente! Tu conocimiento financiero está creciendo',
        '¡Perfecto! Has dominado este concepto financiero',
        '¡Genial! Cada cálculo te acerca más a ser un experto en finanzas',
        '¡Increíble! Tu habilidad matemática financiera es impresionante',
        '¡Fantástico! Has resuelto correctamente este problema financiero'
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      toast.success(randomMessage, {
        duration: 3000,
        icon: '🌟'
      });
      
      // Mostrar consejo educativo
      setTimeout(() => {
        toast.success(problem.educationalTip, {
          duration: 5000,
          icon: '💡',
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        });
      }, 1000);
      
      // Mostrar curiosidad
      setTimeout(() => {
        toast(problem.curiosity, {
          duration: 4000,
          icon: '📚',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      }, 2000);
      
      // Verificar logros
      checkAchievements();
      
      // Avanzar al siguiente problema
      setTimeout(() => {
        if (currentProblem < financialProblems.length - 1) {
          setCurrentProblem(prev => prev + 1);
        } else {
          setGameCompleted(true);
          onComplete();
        }
      }, 3000);
      
    } else {
      // Respuesta incorrecta
      // Incrementar intentos para este problema
      const currentAttempts = attemptsPerProblem[problem.id] || 0;
      const newAttempts = currentAttempts + 1;
      
      setAttemptsPerProblem(prev => ({
        ...prev,
        [problem.id]: newAttempts
      }));
      
      if (newAttempts >= 2) {
        // Después de 2 intentos, contar como error SOLO si no se ha contado antes
        if (!problemsWithErrors.has(problem.id)) {
          setErrors(prev => prev + 1);
          onError();
          setProblemsWithErrors(prev => new Set([...prev, problem.id]));
        }
        
        toast.error('Has alcanzado el límite de intentos. Pasando al siguiente problema...', {
          duration: 3000,
          icon: '⏭️',
          style: {
            background: '#F59E0B',
            color: '#fff',
          },
        });
        
        // Marcar como completado (aunque no sea correcto) para evitar bucles
        setCompletedProblems(prev => new Set([...prev, problem.id]));
        
        // Avanzar al siguiente problema después de un breve delay
        setTimeout(() => {
          if (currentProblem < financialProblems.length - 1) {
            setCurrentProblem(prev => prev + 1);
          } else {
            setGameCompleted(true);
            onComplete();
          }
        }, 2000);
      } else {
        // Primer intento fallido, NO contar como error aún
        toast.error(`Respuesta incorrecta. Intento ${newAttempts}/2. ¡Revisa tus cálculos!`, {
          duration: 2000,
          icon: '❌'
        });
      }
    }
  };

  // Verificar logros
  const checkAchievements = () => {
    const newAchievements = new Set(achievements);
    
    // Logro: Ahorrador Experto (4 problemas correctos)
    if (completedProblems.size >= 4 && !newAchievements.has('ahorrador_experto')) {
      newAchievements.add('ahorrador_experto');
      toast.success('🏆 Logro desbloqueado: Ahorrador Experto', {
        duration: 4000,
        icon: '💰'
      });
    }
    
    // Logro: Becado Estratega (completar problemas de becas)
    const becasCompleted = financialProblems.filter(p => 
      p.category === 'Becas y Subsidios' && completedProblems.has(p.id)
    ).length;
    if (becasCompleted >= 2 && !newAchievements.has('becado_estratega')) {
      newAchievements.add('becado_estratega');
      toast.success('🏆 Logro desbloqueado: Becado Estratega', {
        duration: 4000,
        icon: '🎓'
      });
    }
    
    // Logro: Calculadora Humana (resolver problema en menos de 1 minuto)
    const timeSpent = (Date.now() - startTime) / 1000;
    if (timeSpent < 60 && !newAchievements.has('calculadora_humana')) {
      newAchievements.add('calculadora_humana');
      toast.success('🏆 Logro desbloqueado: Calculadora Humana', {
        duration: 4000,
        icon: '⚡'
      });
    }
    
    // Logro: CFO Estudiantil (7/8 problemas correctos)
    if (completedProblems.size >= 7 && !newAchievements.has('cfo_estudiantil')) {
      newAchievements.add('cfo_estudiantil');
      toast.success('🏆 Logro desbloqueado: CFO Estudiantil', {
        duration: 4000,
        icon: '🏆'
      });
    }
    
    // Logro: Máster en Finanzas (sin usar pistas)
    if (hintsUsed === 0 && completedProblems.size >= 6 && !newAchievements.has('master_finanzas')) {
      newAchievements.add('master_finanzas');
      toast.success('🏆 Logro desbloqueado: Máster en Finanzas', {
        duration: 4000,
        icon: '💎'
      });
    }
    
    setAchievements(newAchievements);
  };

  // Sistema de pistas progresivas
  const useHint = () => {
    if (hintsUsed >= 3) {
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

    const problem = financialProblems[currentProblem];
    const hintLevel = hintsUsed + 1;
    
    let hintMessage = '';
    
    switch (hintLevel) {
      case 1:
        hintMessage = `💡 PISTA BÁSICA: ${problem.tips[0]}`;
        break;
      case 2:
        hintMessage = `💡 PISTA INTERMEDIA: ${problem.tips[1]}`;
        break;
      case 3:
        hintMessage = `💡 PISTA AVANZADA: ${problem.tips[2]}`;
        break;
      default:
        hintMessage = `💡 PISTA FINAL: La respuesta es aproximadamente $${problem.answer.toLocaleString()}`;
    }
    
    setCurrentHint(hintMessage);
    setShowHint(true);
    onHintUsed(); // Notificar al componente padre
    
    // Mostrar feedback de pista usada - usar el nuevo valor
    const hintsRemaining = 3 - (hintsUsed + 1);
    toast.success(`Pista activada! Te quedan ${hintsRemaining} pistas`, {
      duration: 2000,
      icon: '💡',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
    
    setTimeout(() => {
      setShowHint(false);
      setCurrentHint('');
    }, 5000);
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    useHint: useHint
  }));

  // Funciones de la calculadora
  const handleCalculatorInput = (value) => {
    if (value === 'C') {
      setCalculatorValue('0');
    } else if (value === '=') {
      try {
        const result = eval(calculatorValue);
        setCalculatorValue(result.toString());
      } catch (error) {
        setCalculatorValue('Error');
      }
    } else if (value === '←') {
      setCalculatorValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setCalculatorValue(prev => prev === '0' ? value : prev + value);
    }
  };

  // Calcular progreso
  const progress = (completedProblems.size / financialProblems.length) * 100;
  const currentProblemData = financialProblems[currentProblem];

  // Configuración de las columnas laterales
  const leftSidebarConfig = {
    type: 'left',
    title: 'Base de Cartera',
    subtitle: 'Gestión Financiera Estudiantil',
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
          'Asesoría financiera estudiantil',
          'Procesamiento de descuentos y becas',
          'Seguimiento de estados de cuenta'
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
      },
      {
        title: '🎮 Objetivos del Juego',
        type: 'list',
        items: [
          'Dominar cálculos financieros básicos',
          'Entender sistemas de becas y descuentos',
          'Aprender planificación presupuestal',
          'Desarrollar habilidades de análisis financiero'
        ]
      },
      {
        title: '📊 Progresión de Dificultad',
        type: 'list',
        items: [
          'Nivel 1: Muy Fácil (2 problemas)',
          'Nivel 2: Fácil (2 problemas)',
          'Nivel 3: Intermedio (2 problemas)',
          'Nivel 4: Avanzado (2 problemas)'
        ]
      }
    ]
  };

  const rightSidebarConfig = {
    type: 'right',
    title: 'Puzzle Matemático Financiero',
    subtitle: '8 Problemas de Cálculo Financiero',
    sections: [
      {
        title: '🎮 Cómo Jugar',
        type: 'instructions',
        instructions: [
          'Lee cuidadosamente cada problema financiero',
          'Usa la calculadora integrada si necesitas',
          'Ingresa tu respuesta en el campo numérico',
          'Cada respuesta correcta te da consejos financieros',
          'NOTA: para escribir en el campo de respuesta, debes ocultar la calculadora'
        ]
      },
      {
        title: '📝 Formato de Respuestas',
        type: 'list',
        items: [
          '💰 Montos en pesos: Solo números (ej: 1500000)',
          '📊 Porcentajes: Solo números (ej: 25 para 25%)',
          '📅 Tiempo: Solo números (ej: 8 para 8 meses)',
          '🔢 No uses comas, puntos o símbolos',
          '💡 Usa la calculadora para operaciones complejas'
        ]
      },
      {
        title: '🧮 Calculadora Integrada',
        type: 'text',
        content: 'Usa la calculadora para realizar operaciones complejas. Haz clic en el botón "Calculadora" para abrirla. Soporta teclado numérico y teclas de operación.'
      },
      
      {
        title: '⏱️ Penalización por Tiempo',
        type: 'list',
        items: [
          '≤ 9 min: -0 estrellas ✅',
          '9-12 min: -1 estrella ⚠️',
          '12-15 min: -2 estrellas ⚠️',
          '>15 min: -3 estrellas ❌'
        ]
      },
      {
        title: '❌ Penalización por Errores',
        type: 'list',
        items: [
          '0 problemas fallados: -0 estrellas ✅',
          '1 problema fallado: -1 estrella ⚠️',
          '2 problemas fallados: -2 estrellas ⚠️',
          '3+ problemas fallados: -3 estrellas ❌'
        ]
      },
      {
        title: '🎯 Sistema de Intentos',
        type: 'text',
        content: 'Cada problema te da 2 oportunidades. Si usas ambas oportunidades sin acertar, el problema se marca como fallido y pasa al siguiente. Cada problema fallido cuenta como 1 error.'
      },
      {
        title: '💡 Penalización por Pistas',
        type: 'text',
        content: 'Cada pista usada = -1 estrella. Usa 0 pistas para obtener 5 estrellas.'
      }
    ],
    showHints: showHint,
    hintMessage: currentHint || 'Usa las pistas para obtener ayuda sobre la solución del problema.',
    stats: [
      { label: 'Problemas Completados', value: `${completedProblems.size}/${financialProblems.length}`, color: 'text-green-600' },
      { label: 'Problema Actual', value: `${currentProblem + 1}`, color: 'text-blue-600' },
      { label: 'Intentos Actuales', value: `${attemptsPerProblem[financialProblems[currentProblem]?.id] || 0}/2`, color: 'text-orange-600' },
      { label: 'Pistas Usadas', value: `${hintsUsed}/3`, color: 'text-yellow-600' },
      { label: 'Problemas con Error', value: `${problemsWithErrors.size}`, color: 'text-red-600' },
      { label: 'Logros', value: achievements.size.toString(), color: 'text-purple-600' }
    ]
  };

  if (!isInitialized) {
    return (
      <div className="flex h-full w-full">
        <GameSidebar {...leftSidebarConfig} />
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando puzzle matemático financiero...</p>
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
              current={completedProblems.size}
              total={financialProblems.length}
              label="Progreso"
              unit="problemas"
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
             <div className="flex-1 flex items-start justify-center pt-4">
               <div className="w-full max-w-4xl">
                {/* Información del problema actual */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {currentProblemData.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{currentProblemData.category}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>Nivel {currentProblemData.level}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{currentProblemData.concept}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-600">
                        {currentProblem + 1}/{financialProblems.length}
                      </div>
                      <div className="text-sm text-gray-500">Problema</div>
                    </div>
                  </div>

                  {/* Enunciado del problema */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {currentProblemData.problem}
                    </p>
                  </div>

                  {/* Campo de respuesta */}
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tu respuesta:
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                        placeholder="Solo números (ej: 1500000, 25, 8)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAnswerSubmit(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[type="number"]');
                        if (input.value) {
                          handleAnswerSubmit(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Verificar
                    </button>
                  </div>
                </div>

                {/* Botón de calculadora */}
                <div className="text-center">
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    <Calculator className="w-5 h-5 inline mr-2" />
                    {showCalculator ? 'Ocultar' : 'Mostrar'} Calculadora
                  </button>
                </div>

                {/* Calculadora */}
                {showCalculator && (
                  <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                      Calculadora Integrada
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      💡 Puedes usar el teclado numérico o las teclas: +, -, *, /, Enter, Escape, Backspace
                    </p>
                    <div className="max-w-xs mx-auto">
                      {/* Pantalla */}
                      <div className="bg-gray-900 text-white p-4 rounded-lg mb-4 text-right text-2xl font-mono">
                        {calculatorValue}
                      </div>
                      
                      {/* Teclado */}
                      <div className="grid grid-cols-4 gap-2">
                        {['C', '←', '%', '/'].map((btn) => (
                          <button
                            key={btn}
                            onClick={() => handleCalculatorInput(btn)}
                            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                          >
                            {btn}
                          </button>
                        ))}
                        {['7', '8', '9', '*'].map((btn) => (
                          <button
                            key={btn}
                            onClick={() => handleCalculatorInput(btn)}
                            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                          >
                            {btn}
                          </button>
                        ))}
                        {['4', '5', '6', '-'].map((btn) => (
                          <button
                            key={btn}
                            onClick={() => handleCalculatorInput(btn)}
                            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                          >
                            {btn}
                          </button>
                        ))}
                        {['1', '2', '3', '+'].map((btn) => (
                          <button
                            key={btn}
                            onClick={() => handleCalculatorInput(btn)}
                            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                          >
                            {btn}
                          </button>
                        ))}
                        {['0', '.', '='].map((btn, index) => (
                          <button
                            key={`${btn}-${index}`}
                            onClick={() => handleCalculatorInput(btn)}
                            className={`p-3 rounded-lg font-medium ${
                              btn === '0' ? 'col-span-2 bg-gray-200 hover:bg-gray-300' :
                              btn === '=' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                              'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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

MathPuzzle.displayName = 'MathPuzzle';

export default MathPuzzle;

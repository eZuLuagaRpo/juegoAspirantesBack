# 🎮 Respuestas y Configuración de Puzzles - Juego de Aspirantes USB

## 📋 Índice
1. [Puzzles con Respuestas Exactas](#puzzles-con-respuestas-exactas)
2. [Configuración Backend](#configuración-backend)
3. [Sistema de Estrellas](#sistema-de-estrellas)
4. [Tiempos Óptimos](#tiempos-óptimos)

---

## 🎯 Puzzles con Respuestas Exactas

### 1. **MathPuzzle (Base de Cartera)**
**Respuestas exactas de los 8 problemas:**

#### **Nivel 1: Muy Fácil (2 problemas)**
1. **Cálculo de Descuento Simple**
   - Pregunta: Matrícula $1,000,000 con 5% descuento
   - **Respuesta: `950000`**

2. **Beca de Excelencia Básica**
   - Pregunta: Promedio 4.2/5.0, 10% por cada 0.1 sobre 4.0
   - **Respuesta: `20`**

#### **Nivel 2: Fácil (2 problemas)**
3. **Descuentos Acumulativos**
   - Pregunta: Matrícula $1,500,000, descuentos 8% + 5%
   - **Respuesta: `195000`**

4. **Ahorro Mensual Simple**
   - Pregunta: Ingresos $600,000, gastos $400,000
   - **Respuesta: `200000`**

#### **Nivel 3: Intermedio (2 problemas)**
5. **Descuentos Sucesivos**
   - Pregunta: Matrícula $2,000,000, descuentos 10% y 5% sucesivos
   - **Respuesta: `1710000`**

6. **Beca Combinada con Límite**
   - Pregunta: Matrícula $2,500,000, becas 25% + 20%, límite 40%
   - **Respuesta: `1500000`**

#### **Nivel 4: Avanzado (2 problemas)**
7. **Planificación Semestral**
   - Pregunta: Ingresos $800,000, gastos $500,000, matrícula $2,400,000
   - **Respuesta: `8`** (meses)

8. **Comparación de Planes de Pago**
   - Pregunta: Plan A $3,000,000 con 12% descuento vs Plan B $1,000,000 + 4 cuotas $550,000
   - **Respuesta: `140000`** (diferencia a favor del Plan A)

---

### 2. **CrosswordPuzzle (Base de Facultades)**
**Respuestas exactas del crucigrama:**

#### **Palabras Horizontales (Across):**
1. **SEMESTRE** (Posición: fila 1, columna 1)
   - Definición: "Período académico de seis meses"
   - **Respuesta: `SEMESTRE`**

2. **INGENIERIA** (Posición: fila 4, columna 2)
   - Definición: "Facultad que forma profesionales en ciencias aplicadas"
   - **Respuesta: `INGENIERIA`**

3. **CIENCIAS** (Posición: fila 6, columna 15)
   - Definición: "Facultad que estudia las ciencias naturales y exactas"
   - **Respuesta: `CIENCIAS`**

4. **CALCULO** (Posición: fila 7, columna 4)
   - Definición: "Matemática avanzada con derivadas e integrales"
   - **Respuesta: `CALCULO`**

5. **PROGRAMACION** (Posición: fila 10, columna 6)
   - Definición: "Profesión que desarrolla software y aplicaciones"
   - **Respuesta: `PROGRAMACION`**

#### **Palabras Verticales (Down):**
6. **ARQUITECTURA** (Posición: fila 0, columna 7)
   - Definición: "Facultad que estudia el diseño y construcción de edificios"
   - **Respuesta: `ARQUITECTURA`**

7. **FISICA** (Posición: fila 3, columna 2)
   - Definición: "Ciencia que estudia la materia y energía"
   - **Respuesta: `FISICA`**

8. **PSICOLOGIA** (Posición: fila 4, columna 16)
   - Definición: "Ciencia que estudia el comportamiento y la mente humana"
   - **Respuesta: `PSICOLOGIA`**

9. **INGENIERO** (Posición: fila 1, columna 20)
   - Definición: "Profesional que aplica conocimientos científicos y técnicos"
   - **Respuesta: `INGENIERO`**

---

### 3. **SequentialPuzzle (Base de Registro Académico)**
**Orden correcto de los pasos:**

1. **DILIGENCIAR FORMULARIO** - Completar datos personales y académicos
2. **SUBIR DOCUMENTOS** - Adjuntar documentación requerida
3. **PAGAR MATRÍCULA** - Realizar pago de derechos académicos
4. **CONFIRMAR REGISTRO** - Validar inscripción completada

---

## 🔧 Configuración Backend

### **Base de Mercadeo (Orden: 1)**

#### **Puzzle 1: Sopa de Letras (wordsearch)**
```json
{
  "id": "mercadeo_1",
  "type": "wordsearch",
  "difficulty": 2,
  "maxStars": 5,
  "timeLimit": 300, // 5 minutos
  "hintsAvailable": 3,
  "gridSize": 15,
  "wordCount": 12
}
```

**Palabras a encontrar:**
- **Programas Académicos**: MARKETING, PUBLICIDAD, COMUNICACION, BRANDING, DIGITAL, ESTRATEGIA
- **Valores Institucionales**: EXCELENCIA, INNOVACION, INTEGRIDAD, COMPROMISO, LIDERAZGO, CALIDAD
- **Términos USBMED**: USBMED, BECAS, MATRICULA, CREDITOS

#### **Puzzle 2: Rompecabezas (jigsaw)**
```json
{
  "id": "mercadeo_2",
  "type": "jigsaw",
  "difficulty": 2,
  "maxStars": 5,
  "timeLimit": 420, // 7 minutos
  "hintsAvailable": 3,
  "pieceCount": 20,
  "gridSize": { "rows": 5, "cols": 4 }
}
```

---

### **Base de Registro Académico (Orden: 2)**

#### **Puzzle 1: Sudoku**
```json
{
  "id": "registro_1",
  "type": "sudoku",
  "difficulty": 3,
  "maxStars": 5,
  "timeLimit": 600, // 10 minutos
  "hintsAvailable": 3,
  "gridSize": 9,
  "preFilledCells": 36
}
```

#### **Puzzle 2: Proceso Secuencial**
```json
{
  "id": "registro_2",
  "type": "sequential",
  "difficulty": 2,
  "maxStars": 5,
  "timeLimit": 180, // 3 minutos
  "hintsAvailable": 3
}
```

---

### **Base de Facultades (Orden: 3)**

#### **Puzzle 1: Crucigrama**
```json
{
  "id": "facultades_1",
  "type": "crossword",
  "difficulty": 3,
  "maxStars": 5,
  "timeLimit": 480, // 8 minutos
  "hintsAvailable": 3,
  "gridSize": { "rows": 14, "cols": 24 },
  "wordCount": 9
}
```

---

### **Base de Bienestar Institucional (Orden: 4)**

#### **Puzzle 1: Asociaciones**
```json
{
  "id": "bienestar_1",
  "type": "association",
  "difficulty": 2,
  "maxStars": 5,
  "timeLimit": 300, // 5 minutos
  "hintsAvailable": 3,
  "conceptCount": 12,
  "categoryCount": 4
}
```

---

### **Base de Cartera (Orden: 5)**

#### **Puzzle 1: Matemáticas Financieras**
```json
{
  "id": "cartera_1",
  "type": "math",
  "difficulty": 3,
  "maxStars": 5,
  "timeLimit": 1200, // 20 minutos
  "hintsAvailable": 3,
  "totalProblems": 8,
  "maxAttemptsPerProblem": 2
}
```

#### **Puzzle 2: Memory Match**
```json
{
  "id": "cartera_2",
  "type": "memorymatch",
  "difficulty": 2,
  "maxStars": 5,
  "timeLimit": 420, // 7 minutos
  "hintsAvailable": 3,
  "pairCount": 10
}
```

---

## ⭐ Sistema de Estrellas

### **🎯 Mecánica del Sistema de Puntuación:**

El sistema comienza con **5 estrellas** y se restan penalizaciones por:
1. **Tiempo**: Según rangos específicos de cada puzzle
2. **Errores**: Según cantidad de errores cometidos
3. **Pistas**: -1 estrella por cada pista usada (universal)

**Fórmula:** `Estrellas Finales = 5 - Penalización Tiempo - Penalización Errores - Penalización Pistas`

Las estrellas finales siempre están entre **0 y 5**.

---

### **📊 Sistema de Penalización Detallado por Puzzle:**

#### **1. 🔍 Sopa de Letras (mercadeo_1)**
**Tiempo Óptimo:** 5 minutos (300 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 5 min (300s): **0 estrellas** de penalización
- ⚠️ 5-6 min (301-360s): **-1 estrella**
- ⚠️ 6-7 min (361-420s): **-2 estrellas**
- ❌ 7-8 min (421-480s): **-3 estrellas**
- ❌ > 8 min (>480s): **-3 estrellas** (máximo)

**Penalización por Errores:**
- ✅ 0-1 errores: **0 estrellas**
- ⚠️ 2-3 errores: **-1 estrella**
- ⚠️ 4-5 errores: **-2 estrellas**
- ❌ 6-7 errores: **-3 estrellas**
- ❌ > 7 errores: **-3 estrellas** (máximo)

**Penalización por Pistas:** -1 estrella cada una

---

#### **2. 🧩 Rompecabezas (mercadeo_2)**
**Tiempo Óptimo:** 5 minutos (300 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 5 min (300s): **0 estrellas** de penalización
- ⚠️ 5-7 min (301-420s): **-1 estrella**
- ⚠️ 7-9 min (421-540s): **-2 estrellas**
- ❌ 9-12 min (541-720s): **-3 estrellas**
- ❌ > 12 min (>720s): **-3 estrellas** (máximo)

**Penalización por Errores:**
- ✅ 0-1 errores: **0 estrellas**
- ⚠️ 2-3 errores: **-1 estrella**
- ⚠️ 4-5 errores: **-2 estrellas**
- ❌ 6-7 errores: **-3 estrellas**
- ❌ > 7 errores: **-3 estrellas** (máximo)

**Penalización por Pistas:** -1 estrella cada una

---

#### **3. 🔢 Sudoku (registro_1)**
**Tiempo Óptimo:** 12 minutos (720 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 12 min (720s): **0 estrellas** de penalización
- ⚠️ 12-14 min (721-840s): **-1 estrella**
- ⚠️ 14-16 min (841-960s): **-2 estrellas**
- ❌ 16-17 min (961-1020s): **-3 estrellas**
- ❌ > 17 min (>1020s): **-3 estrellas** (máximo)

**Penalización por Errores:**
- ✅ 0-1 errores: **0 estrellas**
- ⚠️ 2-3 errores: **-1 estrella**
- ⚠️ 4-5 errores: **-2 estrellas**
- ❌ 6-7 errores: **-3 estrellas**
- ❌ > 7 errores: **-3 estrellas** (máximo)

**Penalización por Pistas:** -1 estrella cada una

---

#### **4. 📋 Proceso Secuencial (registro_2)**
**Tiempo Óptimo:** 1.5 minutos (90 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 1.5 min (90s): **0 estrellas** de penalización
- ⚠️ 1.5-3 min (91-180s): **-1 estrella**
- ⚠️ 3-4 min (181-240s): **-2 estrellas**
- ❌ 4-5 min (241-300s): **-3 estrellas**
- ❌ > 5 min (>300s): **-3 estrellas** (máximo)

**Penalización por Errores:**
- ✅ 0-1 errores: **0 estrellas**
- ⚠️ 2-3 errores: **-1 estrella**
- ⚠️ 4-5 errores: **-2 estrellas**
- ❌ 6-7 errores: **-3 estrellas**
- ❌ > 7 errores: **-3 estrellas** (máximo)

**Penalización por Pistas:** -1 estrella cada una

---

#### **5. 🔗 Asociaciones (bienestar_1)**
**Tiempo Óptimo:** 2.5 minutos (150 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 2.5 min (150s): **0 estrellas** de penalización
- ⚠️ 2.5-5 min (151-300s): **-1 estrella**
- ⚠️ 5-7 min (301-420s): **-2 estrellas**
- ❌ 7-10 min (421-600s): **-3 estrellas**
- ❌ > 10 min (>600s): **-3 estrellas** (máximo)

**Penalización por Errores:**
- ✅ 0-1 errores: **0 estrellas**
- ⚠️ 2-3 errores: **-1 estrella**
- ⚠️ 4-5 errores: **-2 estrellas**
- ❌ 6-7 errores: **-3 estrellas**
- ❌ > 7 errores: **-3 estrellas** (máximo)

**Penalización por Pistas:** -1 estrella cada una

---

#### **6. ✏️ Crucigrama (facultades_1)**
**Tiempo Óptimo:** 5 minutos (300 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 5 min (300s): **0 estrellas** de penalización
- ⚠️ 5-7 min (301-420s): **-1 estrella**
- ⚠️ 7-9 min (421-540s): **-2 estrellas**
- ❌ 9-12 min (541-720s): **-3 estrellas**
- ❌ > 12 min (>720s): **-3 estrellas** (máximo)

**Penalización por Errores:**
- ✅ 0-1 errores: **0 estrellas**
- ⚠️ 2-3 errores: **-1 estrella**
- ⚠️ 4-5 errores: **-2 estrellas**
- ❌ 6-7 errores: **-3 estrellas**
- ❌ > 7 errores: **-3 estrellas** (máximo)

**Penalización por Pistas:** -1 estrella cada una

---

#### **7. 🔢 Matemáticas Financieras (cartera_1)**
**Tiempo Óptimo:** 7 minutos (420 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 7 min (420s): **0 estrellas** de penalización
- ⚠️ 7-10 min (421-600s): **-1 estrella**
- ⚠️ 10-13 min (601-780s): **-2 estrellas**
- ❌ >13 min (>780s): **-3 estrellas** (máximo)

**Penalización por Errores (Sistema especial):**
- ✅ 0 problemas fallados: **0 estrellas**
- ⚠️ 1 problema fallado: **-1 estrella**
- ⚠️ 2 problemas fallados: **-2 estrellas**
- ❌ 3+ problemas fallados: **-3 estrellas**

**Nota:** Cada problema tiene 2 intentos. Solo cuenta como error si fallas ambos intentos y pasas al siguiente problema.

**Penalización por Pistas:** -1 estrella cada una

---

#### **8. 🃏 Memory Match (cartera_2)**
**Tiempo Óptimo:** 5 minutos (300 segundos)

**Penalización por Tiempo:**
- ✅ ≤ 5 min (300s): **0 estrellas** de penalización
- ⚠️ 5-7 min (301-420s): **-1 estrella**
- ⚠️ 7-9 min (421-540s): **-2 estrellas**
- ❌ 9-12 min (541-720s): **-3 estrellas**
- ❌ > 12 min (>720s): **-3 estrellas** (máximo)

**Penalización por Errores (Sistema especial):**
- ✅ 0-10 errores: **0 estrellas** (Sin penalización)
- ⚠️ 10-14 errores: **-1 estrella**
- ⚠️ 14-18 errores: **-2 estrellas**
- ❌ >18 errores: **-3 estrellas** (máximo)

**Nota:** La penalización comienza a partir del 11vo error. Cada 4 errores adicionales resta 1 estrella.

**Penalización por Pistas:** -1 estrella cada una

---

### **🏆 Ejemplos de Cálculo:**

#### **Ejemplo 1: Sopa de Letras**
- Tiempo: 5.5 minutos (330s) → -1 estrella
- Errores: 2 → -1 estrella  
- Pistas: 1 → -1 estrella
- **Resultado:** 5 - 1 - 1 - 1 = **⭐⭐ 2 estrellas**

#### **Ejemplo 2: Sudoku Perfecto**
- Tiempo: 10 minutos (600s) → 0 estrellas
- Errores: 0 → 0 estrellas
- Pistas: 0 → 0 estrellas
- **Resultado:** 5 - 0 - 0 - 0 = **⭐⭐⭐⭐⭐ 5 estrellas**

#### **Ejemplo 3: Memory Match**
- Tiempo: 8 minutos (480s) → -2 estrellas
- Errores: 12 → -1 estrella
- Pistas: 1 → -1 estrella
- **Resultado:** 5 - 2 - 1 - 1 = **⭐ 1 estrella**

---

### **💡 Consejos para Obtener 5 Estrellas:**

1. **No uses pistas** (cada una resta 1 estrella)
2. **Completa en el tiempo óptimo** (primer rango de tiempo)
3. **Minimiza errores** (máximo 1 error permitido)
4. **Planifica antes de actuar** (evita intentos apresurados)
5. **Practica cada puzzle** para mejorar tu tiempo

---

## ⏱️ Tabla Resumen de Tiempos

### **Tiempos por Puzzle:**

| # | Puzzle | Tiempo Óptimo (0 penalización) | Rango -1⭐ | Rango -2⭐ | Rango -3⭐ |
|---|--------|-------------------------------|-----------|-----------|-----------|
| 1 | 🔍 Sopa de Letras | ≤ 5 min | 5-6 min | 6-7 min | 7-8 min |
| 2 | 🧩 Rompecabezas | ≤ 5 min | 5-7 min | 7-9 min | 9-12 min |
| 3 | 🔢 Sudoku | ≤ 12 min | 12-14 min | 14-16 min | 16-17 min |
| 4 | 📋 Proceso Secuencial | ≤ 1.5 min | 1.5-3 min | 3-4 min | 4-5 min |
| 5 | 🔗 Asociaciones | ≤ 2.5 min | 2.5-5 min | 5-7 min | 7-10 min |
| 6 | ✏️ Crucigrama | ≤ 5 min | 5-7 min | 7-9 min | 9-12 min |
| 7 | 🔢 Matemáticas | ≤ 7 min | 7-10 min | 10-13 min | >13 min |
| 8 | 🃏 Memory Match | ≤ 5 min | 5-7 min | 7-9 min | 9-12 min |

### **Tiempos Totales del Juego Completo:**
- **Tiempo óptimo total** (0 penalización por tiempo): **39 minutos**
- **Tiempo aceptable** (algunas penalizaciones): **45-55 minutos**
- **Tiempo máximo antes de máxima penalización**: **~88 minutos**

### **Desglose del Tiempo Óptimo:**
```
1. Sopa de Letras:      3.0 min
2. Rompecabezas:        5.0 min
3. Sudoku:              7.0 min
4. Proceso Secuencial:  1.5 min
5. Asociaciones:        2.5 min
6. Crucigrama:          5.0 min
7. Matemáticas:        10.0 min
8. Memory Match:        5.0 min
─────────────────────────────
TOTAL:                 39.0 min
```

---

## 🎯 Notas Importantes

### **Puzzles SIN Respuestas Exactas:**
- **Sopa de Letras**: Las palabras se generan aleatoriamente de un banco
- **Sudoku**: Cada partida genera un tablero único
- **Rompecabezas**: Las piezas se mezclan aleatoriamente
- **Asociaciones**: Las conexiones se establecen dinámicamente
- **Memory Match**: Las cartas se barajan aleatoriamente

### **Sistema de Pistas:**
- Cada puzzle tiene **3 pistas disponibles**
- Las pistas reducen la puntuación final
- **0 pistas = máximo de estrellas**
- **1-2 pistas = puntuación moderada**
- **3 pistas = puntuación mínima**

### **Sistema de Errores por Juego:**

#### **1. Sopa de Letras (WordSearch)**
- **Tipo de error**: Selección incorrecta de palabras
- **Penalización**: Cada palabra incorrecta cuenta como 1 error
- **Umbral**: 0-2 errores = buena puntuación, 3+ errores = puntuación reducida

#### **2. Rompecabezas (Jigsaw)**
- **Tipo de error**: Colocación incorrecta de piezas
- **Penalización**: Cada pieza colocada incorrectamente cuenta como 1 error
- **Umbral**: 0-3 errores = buena puntuación, 4+ errores = puntuación reducida

#### **3. Sudoku**
- **Tipo de error**: Número incorrecto en celda
- **Penalización**: Cada número incorrecto cuenta como 1 error
- **Umbral**: 0-2 errores = buena puntuación, 3+ errores = puntuación reducida

#### **4. Proceso Secuencial**
- **Tipo de error**: Orden incorrecto de pasos
- **Penalización**: Cada paso en posición incorrecta cuenta como 1 error
- **Umbral**: 0-1 errores = buena puntuación, 2+ errores = puntuación reducida

#### **5. Crucigrama**
- **Tipo de error**: Palabra incorrecta completada
- **Penalización**: Cada palabra incorrecta cuenta como 1 error
- **Umbral**: 0-2 errores = buena puntuación, 3+ errores = puntuación reducida

#### **6. Asociaciones**
- **Tipo de error**: Conexión incorrecta entre concepto e imagen
- **Penalización**: Cada asociación incorrecta cuenta como 1 error
- **Umbral**: 0-2 errores = buena puntuación, 3+ errores = puntuación reducida

#### **7. Matemáticas Financieras**
- **Tipo de error**: Problema no resuelto después de 2 intentos
- **Sistema de intentos**: Cada problema tiene 2 oportunidades
  - **1er intento incorrecto**: No cuenta como error, permite segundo intento
  - **2do intento incorrecto**: Cuenta como 1 error y pasa al siguiente problema
- **Penalización**: Solo cuenta 1 error por problema (no importa cuántos intentos)
- **Sistema especial**: Cada problema fallado cuenta como 1 error directo
- **Umbral**: 0 problemas fallados = sin penalización, 1 = -1★, 2 = -2★, 3+ = -3★

#### **8. Memory Match**
- **Tipo de error**: Par de cartas incorrecto
- **Penalización**: Cada par incorrecto cuenta como 1 error
- **Sistema especial**: Los primeros 10 errores NO penalizan, luego cada 4 errores = -1 estrella
- **Umbral**: 0-10 errores = sin penalización, 10-14 = -1★, 14-18 = -2★, >18 = -3★
- **Nota**: Este juego permite exploración inicial sin penalización hasta el 10mo error

### **Sistema Unificado de Puntuación - Resumen:**

#### **✅ Reglas Universales:**
1. **Inicio:** Todos los puzzles empiezan con **5 estrellas**
2. **Pistas:** Cada pista usada = **-1 estrella** (aplicable a todos los puzzles)
3. **Mínimo/Máximo:** Las estrellas finales están entre **0 y 5**

#### **⏱️ Penalización por Tiempo (específica por puzzle):**
- **Rango 1 (Óptimo):** 0 estrellas de penalización
- **Rango 2:** -1 estrella
- **Rango 3:** -2 estrellas  
- **Rango 4+:** -3 estrellas (penalización máxima)

#### **❌ Penalización por Errores:**
- **6 puzzles estándar:** Sistema progresivo (0-1 = 0★ | 2-3 = -1★ | 4-5 = -2★ | 6-7 = -3★)
  - WordSearch, Jigsaw, Sudoku, Sequential, Association, Crossword
- **Matemáticas:** Sistema especial con 2 intentos por problema (0 = 0★ | 1 = -1★ | 2 = -2★ | 3+ = -3★)
- **Memory Match:** Sistema especial con margen inicial (0-10 = 0★ | 10-14 = -1★ | 14-18 = -2★ | >18 = -3★)

#### **🎯 Para Obtener 5 Estrellas:**
```
Condiciones necesarias (6 puzzles estándar):
✓ Completar en tiempo óptimo (primer rango)
✓ Máximo 1 error
✓ No usar pistas
= 5 - 0 - 0 - 0 = ⭐⭐⭐⭐⭐

Condiciones para Memory Match:
✓ Completar en tiempo óptimo (≤ 5 min)
✓ Máximo 10 errores
✓ No usar pistas
= 5 - 0 - 0 - 0 = ⭐⭐⭐⭐⭐
```

#### **⚖️ Distribución Típica de Estrellas:**
- **5⭐:** Rendimiento perfecto (~10% de jugadores)
- **4⭐:** Rendimiento excelente (~20% de jugadores)
- **3⭐:** Rendimiento bueno (~40% de jugadores)
- **2⭐:** Rendimiento aceptable (~20% de jugadores)
- **0-1⭐:** Necesita mejorar (~10% de jugadores)

---

*Este documento contiene toda la información necesaria para entender y configurar el sistema de puzzles del juego de aspirantes USB.*


# 📊 Guía de Migración a PostgreSQL

## 🎯 Resumen de la Migración

Este documento describe el proceso completo para migrar el sistema de almacenamiento en memoria a PostgreSQL, manteniendo toda la funcionalidad existente.

## 📋 Archivos de Base de Datos Creados

### 1. **`database_schema.sql`**
- Script principal para crear todas las tablas
- 12 tablas principales + índices + triggers + vistas
- Estructura completa del sistema

### 2. **`database_puzzles_data.sql`**
- Datos específicos de todos los puzzles del juego
- 8 puzzles únicos distribuidos en 5 niveles
- Configuración JSON completa para cada puzzle

### 3. **`database_config_example.env`**
- Configuración de variables de entorno para PostgreSQL
- Ejemplos para desarrollo y producción
- Instrucciones de seguridad

## 🗂️ Estructura de Tablas Migrada

### **Tablas Principales:**

| Tabla | Propósito | Relaciones |
|-------|-----------|------------|
| `users` | Usuarios del sistema | → user_progress, user_rewards |
| `game_levels` | 5 niveles del juego | → puzzles |
| `puzzles` | 8 puzzles específicos | → user_puzzle_progress |
| `user_progress` | Progreso general | ← users |
| `user_completed_levels` | Niveles completados | ← users, game_levels |
| `user_level_progress` | Progreso por nivel | ← users, game_levels |
| `user_puzzle_progress` | Progreso por puzzle | ← users, puzzles |
| `rewards_catalog` | Catálogo de recompensas | → user_rewards |
| `user_rewards` | Recompensas obtenidas | ← users, rewards_catalog |
| `game_sessions` | Sesiones activas | ← users |
| `achievements` | Logros disponibles | → user_achievements |
| `user_achievements` | Logros obtenidos | ← users, achievements |

### **Datos Migrados:**

#### **Niveles del Juego (5):**
1. **Mercadeo** (orden: 1)
   - Puzzle 1: Sopa de Letras Interactiva
   - Puzzle 2: Rompecabezas Institucional

2. **Registro Académico** (orden: 2)
   - Puzzle 1: Sudoku Clásico
   - Puzzle 2: Proceso de Inscripción

3. **Bienestar** (orden: 3)
   - Puzzle 1: Asociaciones de Bienestar

4. **Facultades** (orden: 4)
   - Puzzle 1: Crucigrama Académico

5. **Cartera** (orden: 5)
   - Puzzle 1: Matemáticas Financieras
   - Puzzle 2: Memory Match Financiero

#### **Recompensas (4):**
- Inscripción Gratuita (100% descuento) - 10 estrellas
- 3% de Descuento - 20 estrellas
- 5% de Descuento - 30 estrellas
- 8% de Descuento - 40 estrellas

#### **Logros (5):**
- Primera Estrella
- Completador de Niveles
- Coleccionista de Estrellas
- Maestro de Puzzles
- Demonio de la Velocidad

## 🔄 Mapeo de Datos en Memoria → PostgreSQL

### **Usuarios:**
```javascript
// ANTES (Memoria)
let users = new Map();
let usersByStudentId = new Map();
let usersByPhone = new Map();

// DESPUÉS (PostgreSQL)
// Tabla: users
// Índices únicos: email, student_id, phone
```

### **Progreso:**
```javascript
// ANTES (Memoria)
let userProgress = new Map();
// Estructura: { userId, currentLevel, completedLevels[], totalStars, achievements[], lastPlayed, levelProgress{} }

// DESPUÉS (PostgreSQL)
// Tablas: user_progress, user_completed_levels, user_level_progress, user_puzzle_progress
```

### **Recompensas:**
```javascript
// ANTES (Memoria)
let userRewards = new Map();
const rewardsCatalog = { virtual: [...], physical: [] };

// DESPUÉS (PostgreSQL)
// Tablas: rewards_catalog, user_rewards
```

## 🚀 Pasos de Migración

### **Paso 1: Preparación**
```bash
# Instalar PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Verificar instalación
psql --version
```

### **Paso 2: Crear Base de Datos**
```sql
-- Conectar como superusuario
psql -U postgres

-- Crear base de datos y usuario
CREATE DATABASE usbmeda_db;
CREATE USER usbmeda_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE usbmeda_db TO usbmeda_user;
\q
```

### **Paso 3: Ejecutar Scripts SQL**
```bash
# Ejecutar script principal
psql -U usbmeda_user -d usbmeda_db -f database_schema.sql

# Ejecutar datos de puzzles
psql -U usbmeda_user -d usbmeda_db -f database_puzzles_data.sql

# Verificar creación
psql -U usbmeda_user -d usbmeda_db -c "\dt"
```

### **Paso 4: Configurar Variables de Entorno**
```bash
# Copiar archivo de configuración
cp database_config_example.env server/.env

# Editar credenciales
nano server/.env
```

### **Paso 5: Instalar Dependencias**
```bash
cd server
npm install pg
```

### **Paso 6: Actualizar Código del Servidor**
```javascript
// Agregar conexión a PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

## 🔧 Cambios Necesarios en el Código

### **1. Reemplazar Maps por Consultas SQL**

#### **Antes (Memoria):**
```javascript
// Obtener usuario
const user = users.get(email);

// Actualizar progreso
userProgress.set(userId, progress);
```

#### **Después (PostgreSQL):**
```javascript
// Obtener usuario
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];

// Actualizar progreso
await pool.query(
  'INSERT INTO user_progress (user_id, current_level, total_stars) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET current_level = $2, total_stars = $3',
  [userId, currentLevel, totalStars]
);
```

### **2. Modificar Rutas de la API**

#### **Autenticación:**
- `POST /api/auth/register` → Insertar en `users`
- `POST /api/auth/login` → Consultar `users` + verificar contraseña
- `GET /api/auth/profile/:userId` → SELECT de `users`

#### **Progreso:**
- `GET /api/progress/:userId` → JOIN de múltiples tablas
- `POST /api/progress/:userId/update` → INSERT/UPDATE en tablas de progreso

#### **Recompensas:**
- `GET /api/rewards/catalog` → SELECT de `rewards_catalog`
- `GET /api/rewards/user/:userId` → JOIN de `user_rewards` + `rewards_catalog`

### **3. Implementar Transacciones**

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Actualizar progreso del puzzle
  await client.query('INSERT INTO user_puzzle_progress...');
  
  // Actualizar progreso del nivel
  await client.query('UPDATE user_level_progress...');
  
  // Actualizar progreso general
  await client.query('UPDATE user_progress...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## 📊 Vistas Útiles Creadas

### **`user_progress_complete`**
Vista que combina toda la información de progreso del usuario:
```sql
SELECT * FROM user_progress_complete WHERE user_id = 1;
```

### **`level_stats`**
Estadísticas de cada nivel:
```sql
SELECT * FROM level_stats ORDER BY order_number;
```

## 🔒 Consideraciones de Seguridad

### **1. Conexión Segura**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **2. Validación de Datos**
```javascript
// Usar prepared statements para prevenir SQL injection
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND student_id = $2',
  [email, studentId]
);
```

### **3. Índices de Rendimiento**
- Índices únicos en campos críticos
- Índices compuestos para consultas frecuentes
- Triggers automáticos para mantener consistencia

## 📈 Beneficios de la Migración

### **1. Persistencia de Datos**
- ✅ Datos permanecen entre reinicios del servidor
- ✅ Backup y recuperación automática
- ✅ Escalabilidad horizontal

### **2. Integridad Referencial**
- ✅ Constraints de base de datos
- ✅ Transacciones ACID
- ✅ Validación a nivel de BD

### **3. Rendimiento**
- ✅ Índices optimizados
- ✅ Consultas eficientes
- ✅ Pool de conexiones

### **4. Escalabilidad**
- ✅ Múltiples instancias del servidor
- ✅ Load balancing
- ✅ Replicación de datos

## 🧪 Testing de la Migración

### **1. Verificar Estructura**
```sql
-- Verificar todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verificar puzzles insertados
SELECT level_id, COUNT(*) FROM puzzles GROUP BY level_id;

-- Verificar niveles
SELECT * FROM game_levels ORDER BY order_number;
```

### **2. Probar Funcionalidad**
```javascript
// Probar registro de usuario
// Probar login
// Probar actualización de progreso
// Probar sistema de recompensas
// Probar todos los puzzles
```

### **3. Verificar Rendimiento**
```sql
-- Analizar consultas lentas
EXPLAIN ANALYZE SELECT * FROM user_progress_complete WHERE user_id = 1;

-- Verificar uso de índices
SELECT * FROM pg_stat_user_indexes;
```

## 📝 Checklist de Migración

- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos `usbmeda_db` creada
- [ ] Usuario `usbmeda_user` creado con permisos
- [ ] Script `database_schema.sql` ejecutado
- [ ] Script `database_puzzles_data.sql` ejecutado
- [ ] Variables de entorno configuradas en `.env`
- [ ] Dependencia `pg` instalada
- [ ] Código del servidor actualizado
- [ ] Todas las rutas de API probadas
- [ ] Sistema de autenticación funcionando
- [ ] Sistema de progreso funcionando
- [ ] Sistema de recompensas funcionando
- [ ] Todos los puzzles funcionando
- [ ] Datos persistiendo correctamente
- [ ] Rendimiento aceptable
- [ ] Backup configurado

## 🆘 Solución de Problemas

### **Error de Conexión:**
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar credenciales
psql -U usbmeda_user -d usbmeda_db -c "SELECT 1;"
```

### **Error de Permisos:**
```sql
-- Otorgar permisos completos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO usbmeda_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO usbmeda_user;
```

### **Error de Datos:**
```sql
-- Verificar integridad de datos
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM puzzles;
SELECT COUNT(*) FROM game_levels;
```

## 🎯 Resultado Final

Después de completar la migración, tendrás:

- ✅ **12 tablas** optimizadas con índices
- ✅ **8 puzzles** completamente configurados
- ✅ **5 niveles** del juego
- ✅ **4 recompensas** disponibles
- ✅ **5 logros** implementados
- ✅ **Triggers automáticos** para consistencia
- ✅ **Vistas optimizadas** para consultas
- ✅ **Sistema escalable** y robusto

El sistema mantendrá **100% de la funcionalidad** existente mientras proporciona una base sólida para el crecimiento futuro.

-- =====================================================
-- BASE DE DATOS POSTGRESQL - JUEGO EDUCATIVO USB MEDELLÍN
-- =====================================================
-- Script para crear todas las tablas necesarias para el sistema
-- Basado en el análisis completo de la estructura de datos en memoria

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE usbmeda_db;
-- \c usbmeda_db;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL, -- firstName + lastName para compatibilidad
    phone VARCHAR(10) UNIQUE NOT NULL,
    student_id VARCHAR(12) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- TABLA DE NIVELES DEL JUEGO
-- =====================================================
CREATE TABLE game_levels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los 5 niveles del juego
INSERT INTO game_levels (id, name, description, order_number) VALUES
('mercadeo', 'Mercadeo', 'Conoce las opciones de financiación y becas', 1),
('registroAcademico', 'Registro Académico', 'Aprende sobre el proceso de inscripción', 2),
('bienestar', 'Bienestar Institucional', 'Descubre los servicios de bienestar', 3),
('facultades', 'Facultades', 'Conoce las facultades y programas', 4),
('cartera', 'Cartera', 'Entiende los aspectos financieros', 5);

-- =====================================================
-- TABLA DE PUZZLES
-- =====================================================
CREATE TABLE puzzles (
    id VARCHAR(50) PRIMARY KEY,
    level_id VARCHAR(50) NOT NULL REFERENCES game_levels(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- wordsearch, jigsaw, sudoku, sequential, association, crossword, math, memorymatch
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    max_stars INTEGER NOT NULL CHECK (max_stars >= 1 AND max_stars <= 5),
    puzzle_data JSONB NOT NULL, -- Configuración específica del puzzle
    order_number INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para puzzles
CREATE INDEX idx_puzzles_level_id ON puzzles(level_id);
CREATE INDEX idx_puzzles_type ON puzzles(type);
CREATE INDEX idx_puzzles_order ON puzzles(level_id, order_number);

-- =====================================================
-- TABLA DE PROGRESO GENERAL DEL USUARIO
-- =====================================================
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_level VARCHAR(50) DEFAULT 'mercadeo',
    total_stars INTEGER DEFAULT 0,
    achievements TEXT[], -- Array de strings con logros
    game_completed BOOLEAN DEFAULT FALSE,
    completion_code VARCHAR(20) UNIQUE,
    completion_reward_id VARCHAR(50),
    completion_reward_discount INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_played TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Índices para progreso
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_current_level ON user_progress(current_level);
CREATE INDEX idx_user_progress_total_stars ON user_progress(total_stars);

-- =====================================================
-- TABLA DE NIVELES COMPLETADOS POR USUARIO
-- =====================================================
CREATE TABLE user_completed_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id VARCHAR(50) NOT NULL REFERENCES game_levels(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id)
);

-- Índices para niveles completados
CREATE INDEX idx_user_completed_levels_user_id ON user_completed_levels(user_id);
CREATE INDEX idx_user_completed_levels_level_id ON user_completed_levels(level_id);

-- =====================================================
-- TABLA DE PROGRESO POR NIVEL
-- =====================================================
CREATE TABLE user_level_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id VARCHAR(50) NOT NULL REFERENCES game_levels(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    total_stars INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id)
);

-- Índices para progreso por nivel
CREATE INDEX idx_user_level_progress_user_id ON user_level_progress(user_id);
CREATE INDEX idx_user_level_progress_level_id ON user_level_progress(level_id);

-- =====================================================
-- TABLA DE PROGRESO POR PUZZLE
-- =====================================================
CREATE TABLE user_puzzle_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id VARCHAR(50) NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars >= 0 AND stars <= 5),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    time_spent INTEGER DEFAULT 0, -- tiempo en segundos
    errors INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, puzzle_id)
);

-- Índices para progreso por puzzle
CREATE INDEX idx_user_puzzle_progress_user_id ON user_puzzle_progress(user_id);
CREATE INDEX idx_user_puzzle_progress_puzzle_id ON user_puzzle_progress(puzzle_id);
CREATE INDEX idx_user_puzzle_progress_completed ON user_puzzle_progress(is_completed);

-- =====================================================
-- TABLA DE CATÁLOGO DE RECOMPENSAS
-- =====================================================
CREATE TABLE rewards_catalog (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- virtual, physical
    reward_category VARCHAR(50), -- discount, merchandise, certificate, etc.
    required_stars INTEGER NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar catálogo de recompensas
INSERT INTO rewards_catalog (id, name, description, type, reward_category, required_stars, discount_percentage) VALUES
('discount_10', 'Inscripción Gratuita', 'Descuento del 100% en tu matrícula', 'virtual', 'discount', 10, 100),
('discount_20', '3% de Descuento', 'Descuento del 3% en tu matrícula', 'virtual', 'discount', 20, 3),
('discount_30', '5% de Descuento', 'Descuento del 5% en tu matrícula', 'virtual', 'discount', 30, 5),
('discount_40', '8% de Descuento', 'Descuento del 8% en tu matrícula', 'virtual', 'discount', 40, 8);

-- =====================================================
-- TABLA DE RECOMPENSAS DE USUARIOS
-- =====================================================
CREATE TABLE user_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id VARCHAR(50) NOT NULL REFERENCES rewards_catalog(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL, -- virtual, physical
    status VARCHAR(50) DEFAULT 'claimed', -- claimed, requested, delivered
    completion_code VARCHAR(50) UNIQUE, -- Código único para recompensas
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para recompensas de usuarios
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_reward_id ON user_rewards(reward_id);
CREATE INDEX idx_user_rewards_status ON user_rewards(status);
CREATE INDEX idx_user_rewards_completion_code ON user_rewards(completion_code);

-- =====================================================
-- TABLA DE SESIONES DE JUEGO
-- =====================================================
CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para sesiones
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_token ON game_sessions(session_token);
CREATE INDEX idx_game_sessions_active ON game_sessions(is_active);

-- =====================================================
-- TABLA DE LOGROS
-- =====================================================
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    criteria JSONB NOT NULL, -- Criterios para obtener el logro
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar logros básicos
INSERT INTO achievements (id, name, description, icon, criteria) VALUES
('first_star', 'Primera Estrella', 'Obtén tu primera estrella', '⭐', '{"minStars": 1}'),
('level_completer', 'Completador de Niveles', 'Completa un nivel completo', '🏆', '{"completedLevels": 1}'),
('star_collector', 'Coleccionista de Estrellas', 'Obtén 20 estrellas en total', '🌟', '{"totalStars": 20}'),
('puzzle_master', 'Maestro de Puzzles', 'Completa todos los puzzles de un nivel', '🧩', '{"allPuzzlesLevel": true}'),
('speed_demon', 'Demonio de la Velocidad', 'Completa un puzzle en tiempo récord', '⚡', '{"speedBonus": true}');

-- =====================================================
-- TABLA DE LOGROS DE USUARIOS
-- =====================================================
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Índices para logros de usuarios
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_level_progress_updated_at BEFORE UPDATE ON user_level_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_puzzle_progress_updated_at BEFORE UPDATE ON user_puzzle_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS DEL USUARIO
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar total de estrellas en user_progress
    UPDATE user_progress 
    SET total_stars = (
        SELECT COALESCE(SUM(stars), 0)
        FROM user_puzzle_progress 
        WHERE user_id = NEW.user_id
    ),
    last_played = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
    
    -- Actualizar estrellas del nivel
    UPDATE user_level_progress 
    SET total_stars = (
        SELECT COALESCE(SUM(upp.stars), 0)
        FROM user_puzzle_progress upp
        JOIN puzzles p ON upp.puzzle_id = p.id
        WHERE upp.user_id = NEW.user_id AND p.level_id = (
            SELECT p2.level_id FROM puzzles p2 WHERE p2.id = NEW.puzzle_id
        )
    )
    WHERE user_id = NEW.user_id AND level_id = (
        SELECT p.level_id FROM puzzles p WHERE p.id = NEW.puzzle_id
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar estadísticas cuando se actualiza progreso de puzzle
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT OR UPDATE ON user_puzzle_progress
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =====================================================
-- VISTAS ÚTILES PARA CONSULTAS FRECUENTES
-- =====================================================

-- Vista para obtener progreso completo del usuario
CREATE VIEW user_progress_complete AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.name,
    up.current_level,
    up.total_stars,
    up.achievements,
    up.last_played,
    COUNT(DISTINCT ucl.level_id) as completed_levels_count,
    COUNT(DISTINCT upp.puzzle_id) as completed_puzzles_count,
    COUNT(DISTINCT ua.achievement_id) as achievements_count
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_completed_levels ucl ON u.id = ucl.user_id
LEFT JOIN user_puzzle_progress upp ON u.id = upp.user_id AND upp.is_completed = true
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.name, up.current_level, up.total_stars, up.achievements, up.last_played;

-- Vista para obtener estadísticas de niveles
CREATE VIEW level_stats AS
SELECT 
    gl.id as level_id,
    gl.name as level_name,
    gl.order_number,
    COUNT(DISTINCT p.id) as total_puzzles,
    COUNT(DISTINCT upp.user_id) as users_attempted,
    COUNT(DISTINCT CASE WHEN upp.is_completed = true THEN upp.user_id END) as users_completed,
    AVG(CASE WHEN upp.is_completed = true THEN upp.stars END) as avg_stars_completed
FROM game_levels gl
LEFT JOIN puzzles p ON gl.id = p.level_id
LEFT JOIN user_puzzle_progress upp ON p.id = upp.puzzle_id
GROUP BY gl.id, gl.name, gl.order_number
ORDER BY gl.order_number;

-- =====================================================
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear usuario específico para la aplicación
-- CREATE USER usbmeda_app WITH PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE usbmeda_db TO usbmeda_app;
-- GRANT USAGE ON SCHEMA public TO usbmeda_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO usbmeda_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO usbmeda_app;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================
COMMENT ON TABLE users IS 'Tabla principal de usuarios del juego educativo';
COMMENT ON TABLE game_levels IS 'Niveles del juego (mercadeo, registro, bienestar, facultades, cartera)';
COMMENT ON TABLE puzzles IS 'Puzzles específicos de cada nivel con su configuración';
COMMENT ON TABLE user_progress IS 'Progreso general de cada usuario';
COMMENT ON TABLE user_completed_levels IS 'Niveles completados por cada usuario';
COMMENT ON TABLE user_level_progress IS 'Progreso específico por nivel de usuario';
COMMENT ON TABLE user_puzzle_progress IS 'Progreso detallado de cada puzzle por usuario';
COMMENT ON TABLE rewards_catalog IS 'Catálogo de recompensas disponibles';
COMMENT ON TABLE user_rewards IS 'Recompensas obtenidas por usuarios';
COMMENT ON TABLE game_sessions IS 'Sesiones activas de usuarios';
COMMENT ON TABLE achievements IS 'Logros disponibles en el juego';
COMMENT ON TABLE user_achievements IS 'Logros obtenidos por usuarios';

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Mostrar resumen de tablas creadas
SELECT 
    COUNT(*) as total_tables,
    'Tablas creadas exitosamente' as status
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
INSTRUCCIONES PARA EJECUTAR ESTE SCRIPT:

1. Conectar a PostgreSQL como superusuario:
   psql -U postgres

2. Crear la base de datos:
   CREATE DATABASE usbmeda_db;
   \c usbmeda_db;

3. Ejecutar este script:
   \i database_schema.sql

4. Verificar la creación:
   \dt
   \d users
   \d user_progress

5. Configurar usuario de aplicación (opcional):
   CREATE USER usbmeda_app WITH PASSWORD 'tu_password_seguro';
   GRANT ALL PRIVILEGES ON DATABASE usbmeda_db TO usbmeda_app;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO usbmeda_app;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO usbmeda_app;

ESTRUCTURA DE DATOS MIGRADA:
- ✅ Usuarios con autenticación
- ✅ Niveles del juego (5 niveles)
- ✅ Puzzles con configuración JSON
- ✅ Progreso de usuarios
- ✅ Sistema de estrellas
- ✅ Recompensas y catálogo
- ✅ Logros y sesiones
- ✅ Triggers automáticos
- ✅ Vistas optimizadas
- ✅ Índices de rendimiento

TOTAL DE TABLAS: 12
TOTAL DE ÍNDICES: 25+
TOTAL DE TRIGGERS: 5
TOTAL DE VISTAS: 2
*/

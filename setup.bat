@echo off
echo ========================================
echo    USB MEDELLIN - JUEGO SERIO
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado: 
node --version
echo.

echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)

echo npm encontrado:
npm --version
echo.

echo ========================================
echo Instalando dependencias del servidor...
echo ========================================
cd server
npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del servidor
    pause
    exit /b 1
)

echo.
echo ========================================
echo Instalando dependencias del cliente...
echo ========================================
cd ..\client
npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del cliente
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configurando variables de entorno...
echo ========================================
cd ..\server
if not exist .env (
    echo Creando archivo .env...
    echo PORT=5000 > .env
    echo NODE_ENV=development >> .env
    echo DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/usbmeda_db >> .env
    echo JWT_SECRET=usbmeda_super_secret_key_2024_change_in_production >> .env
    echo CLIENT_URL=http://localhost:3000 >> .env
    echo CORS_ORIGIN=http://localhost:3000 >> .env
    echo RATE_LIMIT_WINDOW_MS=60000 >> .env
    echo RATE_LIMIT_MAX_REQUESTS=1000 >> .env
    echo HELMET_ENABLED=true >> .env
    echo CORS_ENABLED=true >> .env
    echo Archivo .env creado exitosamente!
) else (
    echo Archivo .env ya existe.
    echo Actualizando configuración de rate limiting...
    echo RATE_LIMIT_WINDOW_MS=60000 >> .env
    echo RATE_LIMIT_MAX_REQUESTS=1000 >> .env
)

echo.
echo ========================================
echo    CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Para ejecutar el proyecto:
echo.
echo Terminal 1 (Servidor):
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 (Cliente):
echo   cd client
echo   npm run dev
echo.
echo O ejecutar desde la raiz:
echo   npm run dev
echo.
echo El juego estara disponible en:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
pause

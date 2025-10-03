@echo off
REM 🚀 Script de Despliegue a Producción para Windows
REM Juego Educativo USB Medellín

echo 🚀 Iniciando despliegue a producción...

REM 1. Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Ejecuta este script desde la raíz del proyecto (donde están las carpetas client/ y server/)
    pause
    exit /b 1
)

if not exist "client" (
    echo ❌ Carpeta client/ no encontrada
    pause
    exit /b 1
)

if not exist "server" (
    echo ❌ Carpeta server/ no encontrada
    pause
    exit /b 1
)

echo ✅ Directorio correcto detectado

REM 2. Compilar frontend
echo 📦 Compilando frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error compilando frontend
    pause
    exit /b 1
)
echo ✅ Frontend compilado correctamente
cd ..

REM 3. Configurar servidor para Neon
echo ⚙️ Configurando servidor para Neon...
cd server

REM Copiar configuración de Neon
if exist "neon-config.env" (
    copy "neon-config.env" ".env" >nul
    echo ✅ Configuración de Neon copiada
) else (
    echo ❌ Archivo neon-config.env no encontrado
    pause
    exit /b 1
)

REM 4. Verificar base de datos
echo 🗄️ Verificando base de datos...
node test-neon-connection.js | findstr "Tablas encontradas" >nul
if %errorlevel% equ 0 (
    echo ✅ Base de datos ya inicializada
) else (
    echo 📄 Inicializando base de datos...
    node init-neon-db.js
    if %errorlevel% neq 0 (
        echo ❌ Error inicializando base de datos
        pause
        exit /b 1
    )
    echo ✅ Base de datos inicializada correctamente
)

cd ..

REM 5. Verificar Git
echo 📝 Verificando Git...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Repositorio Git detectado
    
    REM Agregar archivos si hay cambios
    git status --porcelain | findstr /v "^$" >nul
    if %errorlevel% equ 0 (
        echo 📝 Agregando cambios a Git...
        git add .
        for /f "tokens=*" %%i in ('date /t') do set mydate=%%i
        for /f "tokens=*" %%i in ('time /t') do set mytime=%%i
        git commit -m "Preparado para despliegue a producción - %mydate% %mytime%"
        echo ✅ Cambios guardados en Git
    ) else (
        echo ⚠️ No hay cambios para guardar en Git
    )
) else (
    echo ⚠️ No se detectó repositorio Git
)

REM 6. Mostrar instrucciones finales
echo.
echo 🎉 ¡Despliegue preparado exitosamente!
echo.
echo 📋 Próximos pasos:
echo.
echo 1. 🌐 FRONTEND (Vercel):
echo    - Ve a https://vercel.com
echo    - Conecta tu GitHub
echo    - Importa el proyecto
echo    - Configura:
echo      • Framework: Vite
echo      • Root Directory: client
echo      • Build Command: npm run build
echo      • Output Directory: dist
echo.
echo 2. ⚙️ BACKEND (Railway):
echo    - Ve a https://railway.app
echo    - Conecta tu GitHub
echo    - New Project → Deploy from GitHub
echo    - Configura:
echo      • Root Directory: server
echo      • Variables de entorno: (ver DEPLOYMENT_GUIDE.md)
echo.
echo 3. 🔗 CONFIGURAR URLs:
echo    - Actualiza CLIENT_URL en Railway con tu URL de Vercel
echo    - Actualiza VITE_API_URL en Vercel con tu URL de Railway
echo.
echo 📖 Guía completa: DEPLOYMENT_GUIDE.md
echo.
echo ✅ ¡Todo listo para producción! 🚀
pause

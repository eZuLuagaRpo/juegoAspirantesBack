#!/bin/bash

echo "🎮 Configurando Juego Educativo USB Medellín..."
echo "================================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 16+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Se requiere Node.js 16 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias del servidor
echo "📦 Instalando dependencias del servidor..."
cd server
npm install
cd ..

# Instalar dependencias del cliente
echo "📦 Instalando dependencias del cliente..."
cd client
npm install
cd ..

# Crear archivo .env del servidor
echo "⚙️ Configurando variables de entorno..."
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    echo "📝 Archivo .env creado. Por favor edita las configuraciones según tu entorno."
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Para ejecutar el proyecto:"
echo "1. Edita server/.env con tus configuraciones"
echo "2. Ejecuta: npm run dev"
echo ""
echo "🚀 El juego estará disponible en:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo ""
echo "📚 Documentación disponible en README.md"

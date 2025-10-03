#!/bin/bash

# 🚀 Script de Despliegue a Producción
# Juego Educativo USB Medellín

echo "🚀 Iniciando despliegue a producción..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    print_error "Ejecuta este script desde la raíz del proyecto (donde están las carpetas client/ y server/)"
    exit 1
fi

print_status "Directorio correcto detectado ✅"

# 2. Compilar frontend
print_status "Compilando frontend..."
cd client
if npm run build; then
    print_success "Frontend compilado correctamente ✅"
else
    print_error "Error compilando frontend"
    exit 1
fi
cd ..

# 3. Configurar servidor para Neon
print_status "Configurando servidor para Neon..."
cd server

# Copiar configuración de Neon
if [ -f "neon-config.env" ]; then
    cp neon-config.env .env
    print_success "Configuración de Neon copiada ✅"
else
    print_error "Archivo neon-config.env no encontrado"
    exit 1
fi

# 4. Inicializar base de datos (si no está ya inicializada)
print_status "Verificando base de datos..."
if node test-neon-connection.js | grep -q "Tablas encontradas"; then
    print_success "Base de datos ya inicializada ✅"
else
    print_status "Inicializando base de datos..."
    if node init-neon-db.js; then
        print_success "Base de datos inicializada correctamente ✅"
    else
        print_error "Error inicializando base de datos"
        exit 1
    fi
fi

cd ..

# 5. Verificar Git
print_status "Verificando Git..."
if git status &> /dev/null; then
    print_success "Repositorio Git detectado ✅"
    
    # Agregar archivos si hay cambios
    if [ -n "$(git status --porcelain)" ]; then
        print_status "Agregando cambios a Git..."
        git add .
        git commit -m "Preparado para despliegue a producción - $(date)"
        print_success "Cambios guardados en Git ✅"
    else
        print_warning "No hay cambios para guardar en Git"
    fi
else
    print_warning "No se detectó repositorio Git"
fi

# 6. Mostrar instrucciones finales
echo ""
echo "🎉 ¡Despliegue preparado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. 🌐 FRONTEND (Vercel):"
echo "   - Ve a https://vercel.com"
echo "   - Conecta tu GitHub"
echo "   - Importa el proyecto"
echo "   - Configura:"
echo "     • Framework: Vite"
echo "     • Root Directory: client"
echo "     • Build Command: npm run build"
echo "     • Output Directory: dist"
echo ""
echo "2. ⚙️ BACKEND (Railway):"
echo "   - Ve a https://railway.app"
echo "   - Conecta tu GitHub"
echo "   - New Project → Deploy from GitHub"
echo "   - Configura:"
echo "     • Root Directory: server"
echo "     • Variables de entorno: (ver DEPLOYMENT_GUIDE.md)"
echo ""
echo "3. 🔗 CONFIGURAR URLs:"
echo "   - Actualiza CLIENT_URL en Railway con tu URL de Vercel"
echo "   - Actualiza VITE_API_URL en Vercel con tu URL de Railway"
echo ""
echo "📖 Guía completa: DEPLOYMENT_GUIDE.md"
echo ""
print_success "¡Todo listo para producción! 🚀"

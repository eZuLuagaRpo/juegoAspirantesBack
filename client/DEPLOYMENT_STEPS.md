# 🚀 Pasos para Desplegar en Render

## ✅ Preparación Completada
- ✅ Build funcionando correctamente
- ✅ Configuración de API para Render
- ✅ Scripts de package.json actualizados
- ✅ Archivo de redirects creado
- ✅ Configuración de Render creada

## 📋 Pasos a Seguir

### 1. Subir Código a GitHub
```bash
git add .
git commit -m "Configuración para deployment en Render"
git push origin main
```

### 2. Crear Servicio en Render
1. Ve a [render.com](https://render.com)
2. **"New +"** → **"Static Site"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio con tu cliente

### 3. Configurar el Servicio
- **Name**: `juego-aspirantes-client`
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 4. Variables de Entorno
```
NODE_ENV=production
```

### 5. Deploy
- Click **"Create Static Site"**
- Espera a que termine el build
- **Copia la URL generada** (ej: `https://juego-aspirantes-client.onrender.com`)

### 6. ⚠️ IMPORTANTE: Actualizar Backend CORS
1. Ve a tu servicio backend en Render
2. **Environment Variables**
3. Actualiza `CLIENT_URL` con la URL de tu cliente:
```
CLIENT_URL=https://juego-aspirantes-client.onrender.com
```
4. **Redeploy** del backend

## 🧪 Verificación Final
1. Abre la URL de tu cliente
2. Abre DevTools (F12) → Network
3. Intenta hacer login
4. Verifica que las peticiones van a `https://juegoaspirantesback.onrender.com`

## 🎯 URLs Finales
- **Cliente**: `https://tu-cliente.onrender.com`
- **Backend**: `https://juegoaspirantesback.onrender.com`

¡Listo! 🎉

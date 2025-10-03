# 🚀 Guía para Desplegar el Cliente en Render

## 📋 Preparación

### 1. Verificar que el Build Funciona
```bash
cd client
npm run build
```
✅ Si no hay errores, estás listo para desplegar.

### 2. Subir el Código a GitHub
Asegúrate de que tu código esté en un repositorio de GitHub:
```bash
git add .
git commit -m "Configuración para deployment en Render"
git push origin main
```

## 🔧 Configuración en Render

### Paso 1: Crear Nuevo Servicio
1. Ve a [render.com](https://render.com) y inicia sesión
2. Haz clic en **"New +"** → **"Static Site"**
3. Conecta tu repositorio de GitHub

### Paso 2: Configuración del Servicio
- **Name**: `juego-aspirantes-client` (o el nombre que prefieras)
- **Branch**: `main` (o la rama que uses)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Paso 3: Variables de Entorno
En la sección **Environment Variables**, agrega:
```
NODE_ENV=production
```

### Paso 4: Configuración Avanzada (Opcional)
Si quieres usar el archivo `render.yaml` que creé:
- En **Advanced Settings** → **Build & Deploy**
- Selecciona **"Use render.yaml"**

## 🔗 Configurar CORS en el Backend

### Importante: Actualizar Backend
Una vez que tengas la URL de tu cliente desplegado, necesitas actualizar la variable de entorno en tu backend:

1. Ve a tu servicio backend en Render
2. En **Environment Variables**, actualiza:
```
CLIENT_URL=https://tu-cliente-url.onrender.com
```

## 📝 Pasos Detallados

### 1. Crear el Servicio
```
1. Login en Render.com
2. Click "New +" → "Static Site"
3. Conectar repositorio GitHub
4. Seleccionar el repositorio con tu cliente
```

### 2. Configurar Build
```
Build Command: npm install && npm run build
Publish Directory: dist
Node Version: 18 (o superior)
```

### 3. Variables de Entorno
```
NODE_ENV=production
```

### 4. Deploy
```
1. Click "Create Static Site"
2. Esperar a que termine el build
3. Copiar la URL generada
```

### 5. Actualizar Backend CORS
```
1. Ir a tu servicio backend
2. Environment Variables
3. Actualizar CLIENT_URL con la nueva URL del cliente
4. Redeploy del backend
```

## 🧪 Verificación

### 1. Probar el Cliente
- Abre la URL de tu cliente desplegado
- Verifica que carga correctamente
- Abre DevTools (F12) → Network
- Intenta hacer login o cualquier acción
- Verifica que las peticiones van a tu backend

### 2. Verificar CORS
Si ves errores de CORS:
- Verifica que `CLIENT_URL` en el backend coincida exactamente
- Asegúrate de que no haya `/` al final de la URL

## 🔧 Configuración Alternativa (Sin render.yaml)

Si prefieres no usar el archivo `render.yaml`, puedes configurar manualmente:

### Build Settings:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

### Environment Variables:
- `NODE_ENV`: `production`

## 🆘 Solución de Problemas

### Error de Build
```
❌ Build failed
```
**Solución**: Verifica que `npm run build` funcione localmente

### Error de CORS
```
❌ Access to fetch blocked by CORS policy
```
**Solución**: Actualiza `CLIENT_URL` en el backend con la URL exacta del cliente

### Error 404 en Rutas
```
❌ Cannot GET /login
```
**Solución**: Configura redirects para SPA en Render (ver sección siguiente)

## 🔄 Configuración de Redirects para SPA

Crea un archivo `_redirects` en la carpeta `public`:

```
/*    /index.html   200
```

Esto asegura que todas las rutas de React Router funcionen correctamente.

## 📊 Monitoreo

### Logs
- Ve a tu servicio en Render
- Sección **Logs** para ver errores
- **Metrics** para ver rendimiento

### Health Check
Tu cliente debería responder en la URL base sin errores.

## 🎯 URLs Finales

Después del deployment tendrás:
- **Cliente**: `https://tu-cliente.onrender.com`
- **Backend**: `https://juegoaspirantesback.onrender.com`

¡Y todo debería funcionar perfectamente! 🎉

# 🌐 Deploy como Static Site en Render

## ✅ Configuración Correcta para Static Site

### En Render Dashboard:

1. **Service Type**: `Static Site` (no Web Service)
2. **Build Command**: `cd client && npm ci && npm run build`
3. **Publish Directory**: `client/dist`
4. **Node Version**: `18`

### Environment Variables:
- `NODE_ENV`: `production`

## 🔧 Diferencias Clave

### Static Site vs Web Service:
- **Static Site**: Solo sirve archivos estáticos (HTML, CSS, JS)
- **No necesita**: `startCommand`, `PORT`, servidor Node.js
- **Solo necesita**: Build y directorio de publicación

## 📋 Configuración Paso a Paso

### 1. Crear Static Site
1. Ve a [render.com](https://render.com)
2. **"New +"** → **"Static Site"** (no Web Service)
3. Conecta tu repositorio de GitHub

### 2. Configurar Build
- **Name**: `juego-aspirantes-client`
- **Branch**: `main`
- **Build Command**: `cd client && npm ci && npm run build`
- **Publish Directory**: `client/dist`

### 3. Environment Variables
- `NODE_ENV`: `production`

### 4. Deploy
- Click **"Create Static Site"**
- Espera a que termine el build

## 🎯 Resultado Esperado

```
==> Running build command 'cd client && npm ci && npm run build'...
==> Installing dependencies...
==> Building application...
==> Build completed successfully
==> Your site is live at https://tu-cliente.onrender.com
```

## 🔍 Verificación

1. **Abre la URL** de tu Static Site
2. **Verifica** que carga correctamente
3. **Abre DevTools** (F12) → Network
4. **Prueba** hacer login
5. **Verifica** que las peticiones van a `https://juegoaspirantesback.onrender.com`

## ⚠️ Importante: Actualizar CORS del Backend

Una vez que tengas la URL de tu Static Site:

1. Ve a tu **backend** en Render
2. **Environment Variables**
3. Actualiza `CLIENT_URL` con la URL de tu Static Site:
   ```
   CLIENT_URL=https://tu-cliente.onrender.com
   ```
4. **Redeploy** el backend

## 🆘 Solución de Problemas

### Error: "vite: not found"
**Solución**: Asegúrate de que el Build Command sea:
```
cd client && npm ci && npm run build
```

### Error: "Build failed"
**Solución**: Verifica que:
- El directorio `client` existe
- El `package.json` está en `client/`
- Las dependencias se instalan correctamente

### Error de CORS
**Solución**: Actualiza `CLIENT_URL` en el backend con la URL exacta del Static Site

## 🎉 ¡Listo!

Con esta configuración, tu cliente se desplegará como un Static Site y se conectará correctamente a tu backend en Render.

# Configuración del Cliente para Backend en Render

## ✅ Cambios Realizados

### 1. Configuración de API
- **Archivo creado**: `client/src/config/api.js`
- **Propósito**: Maneja la configuración de URLs para diferentes entornos
- **Funcionalidad**: Detecta automáticamente si está en desarrollo o producción

### 2. Configuración de Axios
- **Archivo creado**: `client/src/utils/axiosConfig.js`
- **Propósito**: Configura axios con la URL base correcta según el entorno
- **Funcionalidad**: 
  - En desarrollo: usa proxy local (localhost:5000)
  - En producción: usa tu backend en Render (https://juegoaspirantesback.onrender.com)

### 3. Actualización de Vite
- **Archivo modificado**: `client/vite.config.js`
- **Cambios**:
  - Proxy solo se activa en desarrollo
  - Define variable de entorno para la URL base
  - Configuración optimizada para producción

### 4. Actualización de Contextos
- **Archivos modificados**: 
  - `client/src/contexts/AuthContext.jsx`
  - `client/src/contexts/GameContext.jsx`
- **Cambio**: Ahora usan el axios configurado en lugar del axios directo

## 🔧 Configuración Requerida en Render

### Variable de Entorno CORS
En tu dashboard de Render, necesitas agregar la siguiente variable de entorno:

```
CLIENT_URL=https://tu-dominio-de-cliente.com
```

**Nota**: Reemplaza `https://tu-dominio-de-cliente.com` con la URL donde vas a desplegar tu cliente.

### Ejemplo de URLs comunes:
- Si usas Vercel: `https://tu-app.vercel.app`
- Si usas Netlify: `https://tu-app.netlify.app`
- Si usas tu propio dominio: `https://tu-dominio.com`

## 🚀 Cómo Usar

### Desarrollo Local
```bash
cd client
npm run dev
```
- El cliente usará el proxy para conectarse a `localhost:5000`
- No necesitas cambiar nada

### Producción
```bash
cd client
npm run build
```
- El cliente se conectará directamente a `https://juegoaspirantesback.onrender.com`
- Asegúrate de configurar `CLIENT_URL` en Render

## 🧪 Pruebas Realizadas

✅ **Backend funcionando**: Confirmado que responde correctamente
✅ **Build exitoso**: El cliente se compila sin errores
✅ **Configuración CORS**: Detectado que necesita actualización en Render

## 📋 Próximos Pasos

1. **Desplegar el cliente** en tu plataforma preferida (Vercel, Netlify, etc.)
2. **Configurar CLIENT_URL** en Render con la URL de tu cliente desplegado
3. **Probar la conexión** entre cliente y backend

## 🔍 Verificación

Para verificar que todo funciona:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Realiza una acción que haga una petición API
4. Verifica que las peticiones van a `https://juegoaspirantesback.onrender.com`

## 🆘 Solución de Problemas

### Error de CORS
Si ves errores de CORS, verifica que:
- La variable `CLIENT_URL` esté configurada correctamente en Render
- La URL coincida exactamente con donde está desplegado tu cliente

### Error de Conexión
Si no se puede conectar al backend:
- Verifica que el backend esté funcionando en Render
- Revisa los logs de Render para errores del servidor

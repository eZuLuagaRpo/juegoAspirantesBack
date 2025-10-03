# 🚀 Guía de Despliegue - Juego Educativo USB Medellín

## 📋 Resumen de la Configuración

Tu proyecto está configurado para desplegarse en **3 servicios separados**:

1. **Frontend (React)**: Vercel (gratis)
2. **Backend (Node.js)**: Railway o Render (gratis)
3. **Base de datos**: Neon PostgreSQL (ya configurada ✅)

## 🗄️ Configuración de Base de Datos Neon

### ✅ Ya completado:
- Tu base de datos Neon está configurada
- Cadena de conexión: `postgresql://neondb_owner:npg_d2Dgu6kWwKjt@ep-calm-silence-adl81cjk.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### 📝 Pasos para inicializar la base de datos:

```bash
# 1. Ir al directorio del servidor
cd server

# 2. Instalar dependencias
npm install

# 3. Inicializar la base de datos con las tablas
node init-neon-db.js

# 4. Probar la conexión
node test-neon-connection.js
```

## 🎯 Paso a Paso de Despliegue

### 1. 📦 Frontend en Vercel (GRATIS)

#### Opción A: Desde GitHub (Recomendado)
1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu cuenta de GitHub
4. Importa el proyecto
5. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Opción B: Desde archivos locales
1. Ve a [vercel.com](https://vercel.com)
2. Clic en "New Project"
3. Arrastra la carpeta `client/dist` (ya compilada)
4. Despliega

### 2. ⚙️ Backend en Railway (GRATIS)

1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Clic en "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Configura:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Variables de entorno en Railway:
```
DATABASE_URL=postgresql://neondb_owner:npg_d2Dgu6kWwKjt@ep-calm-silence-adl81cjk.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
CLIENT_URL=https://tu-frontend-url.vercel.app
CORS_ORIGIN=https://tu-frontend-url.vercel.app
EMAIL_USER=recompensausbmed@gmail.com
EMAIL_PASS=hquv siuy rtnz fdnh
USE_POSTGRESQL=true
```

### 3. 🔗 Configurar URLs

Una vez desplegado:

1. **Actualiza el frontend** para apuntar al backend:
   - En Vercel, agrega variable de entorno:
   - `VITE_API_URL=https://tu-backend-url.railway.app`

2. **Actualiza el backend** con la URL del frontend:
   - En Railway, actualiza:
   - `CLIENT_URL=https://tu-frontend-url.vercel.app`
   - `CORS_ORIGIN=https://tu-frontend-url.vercel.app`

## 🔧 Archivos de Configuración Creados

### `server/neon-config.env`
Archivo con la configuración para Neon (copia este contenido a las variables de entorno de Railway).

### `server/init-neon-db.js`
Script para inicializar las tablas en Neon.

### `server/test-neon-connection.js`
Script para probar la conexión con Neon.

## 🚀 Comandos de Despliegue Rápido

```bash
# 1. Compilar frontend (ya hecho ✅)
cd client
npm run build

# 2. Preparar servidor para producción
cd ../server
cp neon-config.env .env

# 3. Inicializar base de datos
node init-neon-db.js

# 4. Probar conexión
node test-neon-connection.js

# 5. Subir a GitHub
git add .
git commit -m "Preparado para despliegue"
git push origin main
```

## 🌐 URLs Finales

Después del despliegue tendrás:
- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://tu-proyecto.railway.app`
- **Base de datos**: Neon (ya configurada)

## ⚠️ Importante

1. **Cambia el JWT_SECRET** en producción por uno más seguro
2. **Actualiza las URLs** una vez tengas los enlaces reales
3. **Monitorea** el uso de los servicios gratuitos
4. **Backup** regular de la base de datos

## 🆘 Solución de Problemas

### Error de CORS
- Verifica que `CLIENT_URL` y `CORS_ORIGIN` estén configurados correctamente
- Asegúrate de usar HTTPS en producción

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que SSL esté habilitado

### Error de compilación del frontend
- Verifica que todas las dependencias estén instaladas
- Revisa los warnings de Vite

## 📊 Límites de Servicios Gratuitos

### Vercel
- 100GB bandwidth/mes
- 6000 segundos de función/mes
- Perfecto para frontends React

### Railway
- $5 de crédito/mes (suficiente para apps pequeñas)
- 500 horas de ejecución/mes
- Auto-sleep después de inactividad

### Neon
- 0.5GB de almacenamiento
- 3 horas de compute/mes
- Perfecto para desarrollo y apps pequeñas

---

**¡Tu proyecto está listo para producción! 🎉**

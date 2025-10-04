import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  
  // Usar backend de Render si no hay uno local
  const backendUrl = process.env.VITE_BACKEND_URL || 'https://juegoaspirantesback.onrender.com';
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      // Only use proxy in development mode
      ...(isDevelopment && {
        proxy: {
          '/api': {
            target: backendUrl,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path
          }
        }
      })
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        external: []
      }
    },
    publicDir: 'public',
    // Define environment variables
    define: {
      __API_BASE_URL__: JSON.stringify(
        isDevelopment 
          ? '' // Empty for relative URLs in development (uses proxy)
          : 'https://juegoaspirantesback.onrender.com' // Render backend in production
      )
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      // Only use proxy in development mode
      ...(isDevelopment && {
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false
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

// API Configuration
const API_CONFIG = {
  // Production backend URL
  PRODUCTION_URL: 'https://juegoaspirantesback.onrender.com',
  
  // Development backend URL (for local development)
  DEVELOPMENT_URL: 'http://localhost:5000',
  
  // Determine if we're in development mode
  isDevelopment: import.meta.env.DEV,
  
  // Get the appropriate base URL
  getBaseURL: () => {
    // In development, use the proxy (localhost:5000)
    // In production, use the Render backend
    return API_CONFIG.isDevelopment 
      ? '' // Empty string for relative URLs (uses Vite proxy)
      : API_CONFIG.PRODUCTION_URL;
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      verify: '/api/auth/verify',
      logout: '/api/auth/logout'
    },
    game: {
      levels: '/api/game/levels',
      progress: '/api/game/progress',
      updateProgress: '/api/game/progress'
    },
    rewards: {
      getRewards: '/api/rewards',
      claimReward: '/api/rewards/claim'
    }
  }
};

export default API_CONFIG;

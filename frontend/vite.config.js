import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================
// BACKEND DEVELOPER: UPDATE API CONFIGURATION HERE
// ============================================
// Change this URL to point to your backend server
// Development: http://localhost:5000
// Production: https://your-backend-domain.com
// ============================================

const API_PROXY_TARGET = 'http://localhost:5000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/metrics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/status': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/reset': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

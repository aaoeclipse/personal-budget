import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8001',
      '/budgets': 'http://localhost:8001',
      '/categories': 'http://localhost:8001',
      '/expenses': 'http://localhost:8001',
      '/dashboard': 'http://localhost:8001',
      '/health': 'http://localhost:8001',
    },
  },
})

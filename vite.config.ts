import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],

          // If you add charts/libs later, keep them splitable:
          // charts: ['recharts'],
        },
      },
    },
  },
})

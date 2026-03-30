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

          // B2B & Heavy Analytics Tooling (Protege rutas B2C)
          charts: ['chart.js', 'react-chartjs-2'],
          excel: ['xlsx'],
          data: ['csv-parse', 'csv-parser']
        },
      },
    },
  },
})

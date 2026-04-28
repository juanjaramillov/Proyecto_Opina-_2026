import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
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

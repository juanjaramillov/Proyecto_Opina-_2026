import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'src/**/*.test.{ts,tsx}'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
    // F-11 — Coverage threshold en CI (Drimo/CTO).
    // Estrategia: thresholds escritos pero CI arranca con `|| true` durante el
    // primer sprint para medir baseline sin bloquear. Cuando estabilice, quitar
    // el `|| true` del workflow y ajustar a baseline real.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/supabase/database.types.ts',
        'src/main.tsx',
        'src/index.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});

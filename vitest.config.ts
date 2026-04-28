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
    // Estrategia (2026-04-28): thresholds bajados a baseline real + margen
    // mínimo para activar hard-gate honesto en CI (`|| true` removido del
    // workflow). El propósito ahora es PREVENIR DEGRADACIÓN: si alguien rompe
    // tests existentes o agrega volumen de código sin tests, los porcentajes
    // caen por debajo del threshold y CI rompe. Subir estos thresholds hacia
    // 70/60 requiere un sprint dedicado a tests (deuda documentada como
    // mayor — el grueso del codebase, especialmente componentes UI, pages B2B
    // y services admin, está sin tests).
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
        // Capturados al 2026-04-28 post Sprint Coverage Tanda 2 (signalStore
        // 17% -> 100%). Baseline real: 11.95 / 8.73 / 8.35 / 11.3.
        // Threshold = baseline redondeado abajo. Anti-drift: si una próxima
        // tanda sube alguno, ajustar acá en el mismo PR.
        lines: 11,
        functions: 8,
        branches: 8,
        statements: 11,
      },
    },
  },
});

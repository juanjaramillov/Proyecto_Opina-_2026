import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    timeout: 10000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Tomar screenshot siempre que falle un test para ayudar en debug */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Desactivamos Firefox y Webkit para acotar la Fase 3 a validación B2C rápida
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /**
   * Dev server automático para Playwright.
   *
   * `reuseExistingServer: !CI` hace que en local: si ya tenés `npm run dev`
   * corriendo en otra pestaña, Playwright lo reutiliza (rápido, mismo HMR
   * que al desarrollar). En CI, como no hay server previo, lo arranca él.
   *
   * Timeout amplio (120s) para que `vite` tenga tiempo de bootear en la
   * primera instalación de deps sin que el CI falle por falso negativo.
   */
  webServer: {
    // Para e2e desactivamos el access gate vía la variable oficial
    // (VITE_ACCESS_GATE_ENABLED=false) en lugar de usar un bypass client-side.
    // Esto solo afecta al dev-server levantado por Playwright; `npm run dev`
    // manual y el build de producción mantienen el gate activo.
    command: 'VITE_ACCESS_GATE_ENABLED=false npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: process.env.CI ? 'pipe' : 'ignore',
    stderr: 'pipe',
  },
});

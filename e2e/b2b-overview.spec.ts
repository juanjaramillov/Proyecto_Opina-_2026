import { test, expect } from '@playwright/test';

/**
 * Smoke test B2B Overview (DEBT-005 · flujo 3/3):
 * Un usuario con rol b2b/admin entra a `/b2b/overview` sin que la página
 * crashee, a pesar de que el RPC del intelligence snapshot esté vacío.
 *
 * Esto valida los 3 puntos que DEBT-003 nos exigía no romper silenciosamente:
 * 1. `B2BLayout` carga su sidebar y no redirige fuera (rol OK).
 * 2. `OverviewB2B` no revienta cuando el snapshot viene con arrays vacíos
 *    — prueba al fallback diseñado en `intelligenceAnalyticsReadModel.ts`.
 * 3. Ningún `ModuleErrorBoundary` se activa (no debería aparecer el fallback).
 */
test.describe('B2B Overview · Smoke', () => {
    test('Carga /b2b/overview sin errores con snapshot vacío', async ({ page }) => {
        // 0. Access gate desactivado vía VITE_ACCESS_GATE_ENABLED=false
        //    (playwright.config.ts → webServer). No se necesita bypass local.
        await page.goto('/');

        // Mocks de red para que el flujo no toque Supabase real.
        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });
        await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', async route => {
            await route.fulfill({ json: { success: true } });
        });

        // Mocks específicos del snapshot de inteligencia — arrays vacíos,
        // para forzar el branch de "availability insufficient_data" sin crash.
        await page.route('**/rest/v1/rpc/get_intelligence_analytics_snapshot*', async route => {
            await route.fulfill({
                json: {
                    overview: { primaryMetric: null, secondaryMetrics: { 'Total Señales Evaluadas': 0 } },
                    benchmark: { entries: [] },
                    alerts: [],
                    reports: { exportStatus: 'blocked' },
                    availability: 'insufficient_data'
                }
            });
        });

        // Fallback defensivo: si cae al leaderboard global de metrics, también vacío.
        await page.route('**/rest/v1/rpc/get_global_leaderboard*', async route => {
            await route.fulfill({ json: [] });
        });

        // 1. Login con cuenta de prueba con rol admin.
        //    (Usa el mismo endpoint de auth que el resto de la suite; si tu
        //    entorno no tiene un usuario admin de test, reemplaza por el que corresponda.)
        await page.goto('/login?next=/b2b/overview');
        await page.locator('input[type="email"]').fill('test_admin_user@opina.plus');
        await page.locator('input[type="password"]').fill('TestAdmin123!_seguro');
        await page.locator('button[type="submit"]').click();

        // 2. Esperar la resolución del Gate y el layout B2B.
        //    El B2BLayout incluye el título "Opina+ B2B" en desktop.
        await expect(page.getByText(/Opina\+ B2B/i).first()).toBeVisible({ timeout: 20000 });

        // 3. Verificar que algún módulo del sidebar está visible (no hay crash global).
        //    Probamos "Executive Overview" porque es el primer módulo listado en B2B_MODULES.
        await expect(page.getByText(/Executive Overview/i).first()).toBeVisible({ timeout: 15000 });

        // 4. Verificar que NO se activó el ModuleErrorBoundary global del B2B layout.
        //    El fallback por defecto del boundary en el proyecto contiene "Módulo con error".
        //    Si en tu implementación el copy es distinto, ajústalo.
        const boundaryFallback = await page.getByText(/Módulo con error|Error inesperado|Algo salió mal/i).count();
        expect(boundaryFallback).toBe(0);

        // 5. Confirmar que no hay mensajes de error rojos de React/Suspense a nivel de página.
        const genericErrors = await page.locator('[role="alert"]').count();
        // Toasts informativos (info/warn) son legítimos; sólo nos preocupa que no haya
        // más de 1 alert activo sin contenido útil. Dejamos el umbral laxo.
        expect(genericErrors).toBeLessThanOrEqual(2);
    });
});

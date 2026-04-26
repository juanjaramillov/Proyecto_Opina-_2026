import { test, expect } from '@playwright/test';

/**
 * Visual regression scaffold para el Hub Bento Grid (Fase 4.1 · DEBT-005).
 *
 * Estrategia:
 * - Playwright `toHaveScreenshot()` compara el render actual contra un
 *   baseline PNG versionado en `__screenshots__/`.
 * - La suite está **gated por `E2E_VISUAL=1`** porque:
 *     (a) Requiere baselines generados primero con `--update-snapshots`.
 *     (b) El rendering de fuentes / antialiasing varía entre macOS/Linux —
 *         la baseline debe generarse en el mismo entorno que la corre (CI).
 *     (c) No queremos que un PR cualquiera falle CI sólo porque alguien
 *         reordenó un icono en el Hub sin actualizar el snapshot a propósito.
 *
 * Bootstrap (una vez por proyecto):
 *   1. Levantar `npm run dev` o confiar en `webServer` de playwright.config.
 *   2. `E2E_VISUAL=1 npx playwright test e2e/hub-visual.spec.ts --update-snapshots`
 *   3. Commitear `e2e/hub-visual.spec.ts-snapshots/`.
 *   4. Activar `E2E_VISUAL=1` en el step de Playwright del CI cuando se
 *      quiera que la suite guarde contra regresiones visuales.
 *
 * Mantenimiento:
 *   - Al redesign voluntario: `--update-snapshots` y se commitea el nuevo
 *     baseline junto al PR que cambia el diseño.
 *   - `maxDiffPixelRatio` tolera 1% de drift sub-pixel (AA/fonts).
 */
const VISUAL_ENABLED = process.env.E2E_VISUAL === '1';

test.describe('Hub Bento Grid · Visual regression', () => {
    test.skip(!VISUAL_ENABLED, 'Set E2E_VISUAL=1 to run visual regression suite');

    test('Hub render matches committed baseline', async ({ page }) => {
        // Access gate desactivado vía VITE_ACCESS_GATE_ENABLED=false
        // (playwright.config.ts → webServer). No se necesita bypass local.
        await page.goto('/');

        // Mocks mínimos para que SignalsHub cargue determinísticamente.
        await page.route('**/rest/v1/rpc/validate_invitation*', r =>
            r.fulfill({ json: [{ is_valid: true }] })
        );
        await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', r =>
            r.fulfill({ json: { success: true } })
        );
        await page.route('**/rest/v1/rpc/get_active_battles*', r =>
            r.fulfill({
                json: [{
                    id: 'visual-b1', slug: 'visual-b1', title: 'Visual Battle',
                    category: 'test', industry: 'test',
                    options: [{ id: 'opt1', label: 'A' }, { id: 'opt2', label: 'B' }]
                }]
            })
        );

        await page.goto('/signals');

        // Esperamos estabilidad visual: animaciones Framer terminadas.
        await page.waitForLoadState('networkidle');
        // Extra margen para que las animaciones enter del Bento Grid terminen.
        await page.waitForTimeout(1500);

        // El snapshot se compara contra `hub-bento-grid.png`. `animations: 'disabled'`
        // fuerza a Playwright a congelar CSS animations antes de capturar.
        await expect(page).toHaveScreenshot('hub-bento-grid.png', {
            fullPage: false,
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        });
    });
});

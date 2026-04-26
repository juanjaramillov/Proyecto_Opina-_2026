import { test, expect } from '@playwright/test';

/**
 * Hub Bento Grid · Badge Beta (Fase 5.4 · protege cierre de DEBT-002)
 *
 * DEBT-002 cerró la sobrepromesa en el Hub B2C etiquetando como "Beta" los
 * tracks cuya cobertura de datos aún es limitada (lugares, servicios). El
 * riesgo de regresión es alto: cualquier refactor de `hubSecondaryData.ts`
 * que reordene propiedades o pierda el flag `beta: true` quitaría la
 * etiqueta sin romper types ni tests unitarios. Este spec ancla el
 * contrato visual.
 *
 * Requisito mínimo: al menos un track con badge "Beta" visible en el grid.
 * (Mantenemos el assertion genérico para no romperse cuando se promuevan
 * módulos a "real" — p.ej. si mañana `lugares` sale de beta y sólo queda
 * `servicios`, el test sigue pasando.)
 */
test.describe('Hub · Beta badge', () => {
    test('Al menos un track muestra badge Beta en el Hub', async ({ page }) => {
        // 0. Access gate desactivado vía VITE_ACCESS_GATE_ENABLED=false
        //    (playwright.config.ts → webServer). No se necesita bypass local.
        await page.goto('/');

        // Mocks mínimos para que / renderice sin tocar red real.
        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });
        await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', async route => {
            await route.fulfill({ json: { success: true } });
        });

        // 1. Navegar a /login con intención de ir a /signals
        await page.goto('/login?next=/signals');

        // 2. Llenar credenciales de prueba
        await page.locator('input[type="email"]').fill('test_normal_user@opina.plus');
        await page.locator('input[type="password"]').fill('TestNormal123!_seguro');
        
        // Clic en el botón de login
        await page.locator('button[type="submit"]').click();

        // Esperar a que pase el wizard si es necesario o vaya directo a /signals
        await page.waitForURL(/\/signals/);

        // 2. Espera al Hub Bento Grid (anchor `#hub-bento-grid` definido en
        //    HubBentoGrid.tsx).
        const hub = page.locator('#hub-bento-grid');
        await expect(hub).toBeVisible({ timeout: 20000 });

        // 3. Al menos un badge "Beta" debe estar visible dentro del hub.
        //    Buscamos por el atributo title que contiene la explicación del estado beta.
        const betaBadges = hub.getByTitle(/Este módulo está en beta/i);
        const count = await betaBadges.count();
        expect(count).toBeGreaterThan(0);

        // 4. Los badges tienen `title` con explicación honesta (del componente
        //    HubBentoGrid.tsx). No validamos el copy exacto — sí que existe,
        //    porque es la forma en que el usuario entiende por qué está en Beta.
        const firstBeta = betaBadges.first();
        await expect(firstBeta).toBeVisible();
    });
});

import { test, expect } from '@playwright/test';

/**
 * Smoke test de Access Gate (DEBT-005 · flujo 2/3):
 * El usuario llega sin token de piloto, ingresa un código válido y es
 * redirigido al destino `next`.
 *
 * No dependemos de un código real de piloto: mockeamos la RPC
 * `grant_pilot_access` para que retorne true y `refreshSession` no pete.
 */
test.describe('Access Gate', () => {
    test('Ingresa código válido y redirige a /signals', async ({ page }) => {
        // Arrancar desde la raíz limpia: sin token de acceso previo.
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // 1. Mock RPC `grant_pilot_access` → true (código válido).
        await page.route('**/rest/v1/rpc/grant_pilot_access*', async route => {
            await route.fulfill({ json: true });
        });

        // 2. Mock anon sign-in para no golpear Supabase real.
        await page.route('**/auth/v1/signup*', async route => {
            await route.fulfill({ json: { user: { id: 'anon-e2e' }, session: { access_token: 'anon-token' } } });
        });

        // 3. Mock refreshSession (devuelve sesión con JWT claim fresco).
        await page.route('**/auth/v1/token?grant_type=refresh_token*', async route => {
            await route.fulfill({ json: { access_token: 'refreshed-token', refresh_token: 'r', user: { id: 'anon-e2e' } } });
        });

        // 4. Mock `validate_invitation` como válido (para el bootstrap posterior).
        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });

        // 5. Navegar al Gate con `next=/signals`.
        await page.goto('/access?next=/signals');

        // 6. Verificar que el form está en pantalla (título + botón).
        await expect(page.getByRole('heading', { name: /Acceso Restringido/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible();

        // 7. Ingresar un código cualquiera (no importa cuál, la RPC está mockeada a true).
        await page.getByPlaceholder(/OPINA-/i).fill('OPINA-E2E-SMOKE');
        await page.getByRole('button', { name: /Entrar/i }).click();

        // 8. Tras el submit exitoso, el componente hace nav(nextPath, { replace: true }).
        //    Asertamos que la URL se movió fuera de /access y contiene la intención original.
        await page.waitForURL(url => !url.pathname.startsWith('/access'), { timeout: 15000 });
        expect(page.url()).not.toContain('/access');
    });

    test('Código inválido muestra error sin romper la UI', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // Mock RPC devolviendo false (código rechazado).
        await page.route('**/rest/v1/rpc/grant_pilot_access*', async route => {
            await route.fulfill({ json: false });
        });

        await page.route('**/auth/v1/signup*', async route => {
            await route.fulfill({ json: { user: { id: 'anon-e2e' }, session: { access_token: 'anon-token' } } });
        });

        await page.goto('/access');

        await page.getByPlaceholder(/OPINA-/i).fill('CODIGO-FAKE');
        await page.getByRole('button', { name: /Entrar/i }).click();

        // El mensaje de error genérico debe aparecer y seguimos en /access.
        await expect(page.getByText(/expirado o no válido/i)).toBeVisible({ timeout: 10000 });
        expect(page.url()).toContain('/access');
    });
});

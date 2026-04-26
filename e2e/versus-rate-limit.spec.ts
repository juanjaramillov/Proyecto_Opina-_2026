import { test, expect } from '@playwright/test';

/**
 * Rate-limit UX E2E (Fase 4.1 · DEBT-005):
 * Verifica que cuando el backend responde `RATE_LIMITED` al guardar una
 * señal Versus, el usuario ve el toast esperado ("Vas muy rápido...") y
 * no una cadena de error cruda ni un crash.
 *
 * Esto cubre el contrato de UI establecido en
 * `VersusView.handleVote` + `signalOutbox.isNonRetriableSignalErrorMessage`:
 * el RPC falla → el error se mapea a un toast informativo → el mensaje
 * no se reintenta (el outbox lo clasifica como non-retriable).
 *
 * No dependemos del rate-limiter cliente (timing frágil en E2E); en vez
 * de forzar 41 clics rápidos mockeamos la RPC del backend con
 * `insert_signal_event → { error: { message: 'RATE_LIMITED ...' } }`.
 */
test.describe('Versus · Rate limit UX', () => {
    test('Muestra toast "Vas muy rápido" cuando backend devuelve RATE_LIMITED', async ({ page }) => {
        // 0. Access gate desactivado vía VITE_ACCESS_GATE_ENABLED=false
        //    (playwright.config.ts → webServer). No se necesita bypass local.
        await page.goto('/');

        // 1. Mocks comunes para poder aterrizar en /signals.
        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });
        await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', async route => {
            await route.fulfill({ json: { success: true } });
        });

        // 2. Catálogo mínimo de batallas: dos opciones, una batalla activa.
        await page.route('**/rest/v1/rpc/get_active_battles*', async route => {
            const mockBattles = [
                {
                    id: 'rate-limit-battle-uuid', slug: 'limit-b1', title: 'Battle rate limit', category: 'test', industry: 'test', options: [{ id: 'opt1', label: 'A' }, { id: 'opt2', label: 'B' }]
                }
            ];
            await route.fulfill({ json: mockBattles });
        });

        // 3. CRUX: insert_signal_event responde RATE_LIMITED
        await page.route('**/rest/v1/rpc/insert_signal_event*', async route => {
            console.log('>>> INTERCEPTOR HIT: insert_signal_event');
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: "RATE_LIMITED",
                    code: "P0001",
                    details: "You are going too fast",
                    hint: null
                })
            });
        });



        // MOCK daily limits explicitly by intercepting the session or profile endpoints
        // Actually, we can just intercept `**/rest/v1/user_loyalty_stats*` or `**/rest/v1/app_sessions*`
        // But since we just want to bypass the daily limit in VersusView, it uses `useSignalStore(s => s.getSignalsToday())`.

        // 4. Login con cuenta de prueba.
        await page.goto('/login?next=/signals');
        
        await page.evaluate(() => {
            // Force reset the daily signals in localStorage signal-storage
            const stored = localStorage.getItem('signal-storage');
            if (stored) {
                const data = JSON.parse(stored);
                data.state.signals = []; // clear all signals locally
                localStorage.setItem('signal-storage', JSON.stringify(data));
            }
        });

        await page.locator('input[type="email"]').fill('test_normal_user@opina.plus');
        await page.locator('input[type="password"]').fill('TestNormal123!_seguro');
        await page.locator('button[type="submit"]').click();


        // 5. Saltamos toda la lógica de wizard — asumimos que el usuario de
        //    prueba tiene perfil completo. Si no, caería al wizard y el
        //    test debería fallar con timeout, que es la señal correcta.
        const firstOption = page.getByTestId('versus-option-opt1').first();
        await expect(firstOption).toBeVisible({ timeout: 20000 });
        await expect(firstOption).toBeEnabled();

        // 6. Click que dispara el voto → RPC mockeado falla con RATE_LIMITED.
        await firstOption.click();

        // 7. Esperamos que el UI capture específicamente el 400 y lo traduzca
        //    usando el mapeo de formatKnownError o lógica local.
        await expect(
            page.getByText(/vas muy rápido/i).first()
        ).toBeVisible({ timeout: 10000 });

        // 8. Negative check: NO debe filtrarse un "Error DB: RATE_LIMITED"
        //    genérico — el mapeo específico lo reemplaza antes de llegar a
        //    ese fallback.
        const rawErrorCount = await page.getByText(/Error DB: RATE_LIMITED/i).count();
        expect(rawErrorCount).toBe(0);
    });
});

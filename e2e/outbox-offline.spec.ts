import { test, expect } from '@playwright/test';

/**
 * Signal Outbox · persistencia offline (Fase 5.4 · protege DEBT-007)
 *
 * DEBT-007 cerró con el `signalOutbox` en `localStorage` con contrato
 * documentado: si una señal falla por un error reintentable (p.ej. 500
 * transitorio, red caída), el job queda persistido y se retomará al volver
 * online. Este spec valida la primera mitad del contrato — que el job se
 * persiste — desde el browser real, no desde un test unitario del módulo.
 *
 * Flush al reconectar y dedupe por `client_event_id` están cubiertos en
 * `signalOutbox.test.ts` (14 casos). Este spec complementa verificando que
 * el wiring de UI hasta localStorage funciona end-to-end.
 */
test.describe('Signal Outbox · persistencia offline', () => {
    test('Señal con RPC fallando queda en localStorage como job pendiente', async ({ page }) => {
        // 0. Access gate desactivado vía VITE_ACCESS_GATE_ENABLED=false
        //    (playwright.config.ts → webServer). No se necesita bypass local.
        await page.goto('/');
        await page.evaluate(() => {
            // Limpieza preventiva — empezamos con outbox vacío.
            localStorage.removeItem('opina_signal_outbox_v1');
        });

        // 1. Mocks de auth y catálogo.
        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });
        await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', async route => {
            await route.fulfill({ json: { success: true } });
        });
        await page.route('**/rest/v1/rpc/get_active_battles*', async route => {
            await route.fulfill({
                json: [
                    {
                        id: 'b-outbox-uuid', slug: 'b-outbox', title: 'Battle outbox',
                        category: 'test', industry: 'test',
                        options: [{ id: 'opt1', label: 'A' }, { id: 'opt2', label: 'B' }]
                    }
                ]
            });
        });

        // 2. CRUX: insert_signal_event responde 500. El contrato del outbox
        //    dice: error no tipificado → reintentable → queda persistido.
        //    Usamos status 500 para garantizar que NO es clasificado como
        //    non-retriable (esos son 400 + códigos específicos).
        await page.route('**/rest/v1/rpc/insert_signal_event*', async route => {
            await route.fulfill({
                status: 500,
                json: { code: '500', message: 'simulated network outage' }
            });
        });

        // 3. Login y navegación a /signals.
        await page.goto('/login?next=/signals');
        await page.locator('input[type="email"]').fill('test_normal_user@opina.plus');
        await page.locator('input[type="password"]').fill('TestNormal123!_seguro');
        await page.locator('button[type="submit"]').click();

        const firstOption = page.getByTestId('versus-option-opt1').first();
        await expect(firstOption).toBeVisible({ timeout: 20000 });

        // 4. Emitir señal → RPC falla → outbox debe encolar el job.
        await firstOption.click();

        // 5. Dar tiempo al flush sincrónico del outbox para persistir.
        //    El outbox usa localStorage (síncrono), así que 500ms es holgado.
        await page.waitForTimeout(800);

        const outboxRaw = await page.evaluate(() =>
            localStorage.getItem('opina_signal_outbox_v1')
        );

        expect(outboxRaw, 'outbox debe tener al menos un job persistido').not.toBeNull();
        const jobs = JSON.parse(outboxRaw!);
        expect(Array.isArray(jobs), 'outbox serializado debe ser un array').toBe(true);
        expect(jobs.length).toBeGreaterThan(0);

        // 6. El job debe tener la forma documentada en signalOutbox.ts:
        //    `{ id, rpc, args, createdAt, attempts, nextAttemptAt }`.
        const firstJob = jobs[0];
        expect(firstJob.rpc).toBe('insert_signal_event');
        expect(typeof firstJob.id).toBe('string');
        expect(firstJob.id.length).toBeGreaterThan(0);
        expect(typeof firstJob.createdAt).toBe('number');
        expect(typeof firstJob.attempts).toBe('number');
        // Tras un intento fallido los attempts deben haber subido a >=1 o
        // seguir en 0 si el flush posterior aún no corrió — ambos aceptables
        // para este contrato (lo crítico es que el job persistió).
        expect(firstJob.attempts).toBeGreaterThanOrEqual(0);
    });
});

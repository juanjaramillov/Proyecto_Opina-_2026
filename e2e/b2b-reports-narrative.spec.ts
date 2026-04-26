import { test, expect } from '@playwright/test';

/**
 * B2B Reports · Narrativa real (Fase 5.4 · protege DEBT-003 cierre)
 *
 * Fase 4.4 retiró el `BetaDisclaimerBanner` del tope de `ReportsB2B` porque
 * el motor narrativo pasó de ser "string interpolation ad-hoc" a un
 * clasificador determinístico real (`narrativeEngine.ts` · 8 categorías ·
 * confianza derivada de Wilson CI). Este spec ancla dos cosas:
 *
 *   1. Cuando el snapshot tiene `availability !== 'insufficient_data'`, la
 *      página renderiza el documento (summary + findings + alerta + CTA)
 *      y NO el card `insufficient_data`.
 *   2. El banner Beta que habíamos inyectado en Fase 3.2 ya no está: la
 *      narrativa es real, no plantilla.
 *
 * Si alguien vuelve a meter el banner o rompe el wiring del provider
 * (Fase 5.1), este test falla.
 */
test.describe('B2B Reports · Narrativa real (no-beta)', () => {
    test('Con snapshot válido, muestra Brief Ejecutivo sin banner Beta', async ({ page }) => {
        // 0. Access gate desactivado vía VITE_ACCESS_GATE_ENABLED=false
        //    (playwright.config.ts → webServer). No se necesita bypass local.
        await page.goto('/');

        await page.route('**/rest/v1/rpc/validate_invitation*', async route => {
            await route.fulfill({ json: [{ is_valid: true }] });
        });
        await page.route('**/rest/v1/rpc/bootstrap_user_after_signup_v2*', async route => {
            await route.fulfill({ json: { success: true } });
        });

        // 1. Snapshot **válido** con una entrada clara de líder dominador.
        //    `availability: 'sufficient'` + `reports.exportStatus: 'ready'`
        //    debe hacer `isReportAvailable(snapshot) === true`.
        await page.route('**/rest/v1/rpc/get_intelligence_analytics_snapshot*', async route => {
            await route.fulfill({
                json: {
                    overview: {
                        primaryMetric: { value: 1250, label: 'Total Señales' },
                        secondaryMetrics: { 'Total Señales Evaluadas': 1250 }
                    },
                    benchmark: {
                        entries: [
                            {
                                entityId: 'ent_leader', entityName: 'Alpha Corp',
                                leaderRank: 1,
                                weightedPreferenceShare: 0.48,
                                weightedWinRate: 0.72,
                                marginVsSecond: 0.22, // claramente dominador
                                nEff: 420,
                                wilsonLowerBound: 0.69,
                                wilsonUpperBound: 0.75,
                                entropyNormalized: 0.35,
                                stabilityLabel: 'estable',
                                commercialEligibilityLabel: 'premium_export_ready'
                            },
                            {
                                entityId: 'ent_2', entityName: 'Beta Inc',
                                leaderRank: 2,
                                weightedPreferenceShare: 0.26,
                                weightedWinRate: 0.50,
                                marginVsSecond: 0.05,
                                nEff: 380,
                                wilsonLowerBound: 0.46,
                                wilsonUpperBound: 0.54,
                                entropyNormalized: 0.55,
                                stabilityLabel: 'estable',
                                commercialEligibilityLabel: 'premium_export_ready'
                            }
                        ]
                    },
                    alerts: [],
                    reports: { exportStatus: 'ready' },
                    availability: 'sufficient'
                }
            });
        });

        // 2. Login con cuenta con rol admin (requisito de la ruta B2B).
        await page.goto('/login?next=/b2b/reports');
        await page.locator('input[type="email"]').fill('test_admin_user@opina.plus');
        await page.locator('input[type="password"]').fill('TestAdmin123!_seguro');
        await page.locator('button[type="submit"]').click();

        // 3. Esperar el documento B2B. El layout incluye "Opina+ B2B".
        await expect(page.getByText(/Opina\+ B2B/i).first()).toBeVisible({ timeout: 20000 });

        // 4. Reports B2B — título del documento generado por `buildReportContent`:
        //    "Brief Ejecutivo: Dinámica Competitiva B2B"
        await expect(
            page.getByText(/Brief Ejecutivo.*Dinámica Competitiva/i).first()
        ).toBeVisible({ timeout: 20000 });

        // 5. NO debe haber banner Beta en esta página — Fase 4.4 lo retiró
        //    explícitamente. El copy del banner histórico incluía "plantilla"
        //    o "no por un modelo de IA". Si reaparece, falla el test.
        const betaTemplateCopy = page.getByText(/plantilla sobre tus métricas|no por un modelo de IA/i);
        expect(await betaTemplateCopy.count()).toBe(0);

        // 6. El card de `insufficient_data` NO debe aparecer — el snapshot es
        //    suficiente.
        const insufficientCard = page.getByText(
            /Se requiere mayor actividad global para desbloquear la generación/i
        );
        expect(await insufficientCard.count()).toBe(0);
    });
});

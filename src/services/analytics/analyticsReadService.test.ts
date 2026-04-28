import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseFromSequence } from '../../test/helpers/supabaseMock';

// === Mocks de servicios delegados ===
vi.mock('../../features/results/services/resultsCommunityService', () => ({
    resultsCommunityService: {
        getResultsCommunitySnapshot: vi.fn(),
    },
}));
vi.mock('../../features/b2b/services/intelligenceAnalyticsService', () => ({
    intelligenceAnalyticsService: {
        getIntelligenceAnalyticsSnapshot: vi.fn(),
    },
}));

// === Mock de supabase client ===
vi.mock('../../supabase/client', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

import { analyticsReadService } from './analyticsReadService';
import { supabase } from '../../supabase/client';
import { resultsCommunityService } from '../../features/results/services/resultsCommunityService';
import { intelligenceAnalyticsService } from '../../features/b2b/services/intelligenceAnalyticsService';

describe('analyticsReadService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getResultsCommunitySnapshot — delegación pura', () => {
        it('delega al resultsCommunityService con la query recibida', async () => {
            const fakeSnapshot = { calculatedAt: '2026-04-28', mode: 'real' };
            vi.mocked(resultsCommunityService.getResultsCommunitySnapshot).mockResolvedValue(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fakeSnapshot as any
            );
            const query = { period: '30D', module: 'VERSUS' } as const;
            const result = await analyticsReadService.getResultsCommunitySnapshot(query);
            expect(resultsCommunityService.getResultsCommunitySnapshot).toHaveBeenCalledWith(query);
            expect(result).toBe(fakeSnapshot);
        });
    });

    describe('getIntelligenceAnalyticsSnapshot — delegación pura', () => {
        it('delega al intelligenceAnalyticsService con la query recibida', async () => {
            const fakeSnapshot = { entityName: 'Demo', metrics: {} };
            vi.mocked(intelligenceAnalyticsService.getIntelligenceAnalyticsSnapshot).mockResolvedValue(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fakeSnapshot as any
            );
            const query = { period: '7D', categorySlug: 'banca' } as const;
            const result = await analyticsReadService.getIntelligenceAnalyticsSnapshot(query);
            expect(intelligenceAnalyticsService.getIntelligenceAnalyticsSnapshot).toHaveBeenCalledWith(query);
            expect(result).toBe(fakeSnapshot);
        });
    });

    describe('getAdminAnalyticsSnapshot', () => {
        it('arma snapshot con counts y ultima fecha de rollup cuando hay datos', async () => {
            mockSupabaseFromSequence(supabase, [
                // signal_events count
                { data: null, error: null, count: 1500 },
                // entities count
                { data: null, error: null, count: 80 },
                // executive_reports.maybeSingle()
                { data: { generated_at: '2026-04-27T10:00:00Z' }, error: null },
            ]);

            const result = await analyticsReadService.getAdminAnalyticsSnapshot();

            expect(result.lastRollupDate).toBe('2026-04-27T10:00:00Z');
            expect(result.freshnessStatus).toBe('ok');
            expect(result.totalSignalsProcessed).toBe(1500);
            expect(result.activeEntities).toBe(80);
            expect(result.currentMode).toBe('real');
            expect(result.activeMetrics).toContain('preference_share');
        });

        it('marca freshnessStatus="stale" cuando NO hay reporte ejecutivo', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null, count: 0 },
                { data: null, error: null, count: 0 },
                { data: null, error: null }, // ningún reporte
            ]);
            const result = await analyticsReadService.getAdminAnalyticsSnapshot();
            expect(result.freshnessStatus).toBe('stale');
            expect(result.totalSignalsProcessed).toBe(0);
            expect(result.activeEntities).toBe(0);
            // lastRollupDate cae al `new Date().toISOString()` cuando no hay rep.
            expect(() => new Date(result.lastRollupDate).toISOString()).not.toThrow();
        });
    });

    describe('getAllMetricOverrides', () => {
        it('retorna array de overrides cuando supabase responde con data', async () => {
            const overrides = [
                { metric_id: 'a', is_enabled: true },
                { metric_id: 'b', is_enabled: false },
            ];
            mockSupabaseFromSequence(supabase, [
                { data: overrides, error: null },
            ]);
            const result = await analyticsReadService.getAllMetricOverrides();
            expect(result).toEqual(overrides);
        });

        it('retorna array vacío cuando supabase devuelve null', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null },
            ]);
            const result = await analyticsReadService.getAllMetricOverrides();
            expect(result).toEqual([]);
        });
    });

    describe('saveMetricOverride', () => {
        it('retorna true cuando upsert no devuelve error', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null },
            ]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await analyticsReadService.saveMetricOverride({ metric_id: 'x', is_enabled: true } as any);
            expect(result).toBe(true);
        });

        it('retorna false y loggea cuando upsert devuelve error', async () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            mockSupabaseFromSequence(supabase, [
                { data: null, error: { message: 'unique violation' } },
            ]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await analyticsReadService.saveMetricOverride({ metric_id: 'x', is_enabled: true } as any);
            expect(result).toBe(false);
            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });
    });

    describe('getAdminResultsPublisherSnapshot', () => {
        it('arma snapshot con valores reales cuando hay publication state previa', async () => {
            mockSupabaseFromSequence(supabase, [
                // results_publication_state.maybeSingle()
                {
                    data: {
                        mode: 'real',
                        hero_payload: { title: 'Hola' },
                        blocks_visibility_payload: { versus: false, news: true },
                    },
                    error: null,
                },
                // analytics_surface_metric_config (array directo)
                { data: [{ surface_id: 'results_hero', metric_id: 'm1' }], error: null },
                // analytics_surface_presets (array directo)
                { data: [{ surface_id: 'results_hero', preset_name: 'default' }], error: null },
            ]);
            const result = await analyticsReadService.getAdminResultsPublisherSnapshot();
            expect(result.heroTitle).toBe('Hola');
            expect(result.blocksVisibility).toEqual({ versus: false, news: true });
            expect(result.mode).toBe('real');
            expect(result.surfaceConfigs).toHaveLength(1);
            expect(result.presets).toHaveLength(1);
        });

        it('aplica defaults cuando no hay publication state previa', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null },
                { data: null, error: null },
                { data: null, error: null },
            ]);
            const result = await analyticsReadService.getAdminResultsPublisherSnapshot();
            expect(result.heroTitle).toBe('Radiografía de la Opinión');
            expect(result.mode).toBe('curated');
            expect(result.blocksVisibility.versus).toBe(true);
            expect(result.surfaceConfigs).toEqual([]);
            expect(result.presets).toEqual([]);
        });
    });

    describe('publishResultsConfiguration', () => {
        it('inserta publication state y retorna true cuando todo pasa sin errores', async () => {
            mockSupabaseFromSequence(supabase, [
                // results_publication_state.insert
                { data: null, error: null },
            ]);
            const result = await analyticsReadService.publishResultsConfiguration({
                mode: 'real',
                heroTitle: 'Test',
                blocksVisibility: { versus: true, news: false } as Record<string, boolean>,
            });
            expect(result).toBe(true);
        });

        it('upserta surfaceConfigs cuando vienen en el payload', async () => {
            mockSupabaseFromSequence(supabase, [
                // results_publication_state.insert
                { data: null, error: null },
                // analytics_surface_metric_config.upsert
                { data: null, error: null },
            ]);
            const result = await analyticsReadService.publishResultsConfiguration({
                mode: 'real',
                surfaceConfigs: [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { surface_id: 'results_hero', metric_id: 'm1', enabled: true } as any,
                ],
            });
            expect(result).toBe(true);
        });

        it('retorna false si el upsert de surfaceConfigs falla', async () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null }, // insert state OK
                { data: null, error: { message: 'configs broken' } }, // upsert configs falla
            ]);
            const result = await analyticsReadService.publishResultsConfiguration({
                surfaceConfigs: [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { surface_id: 'x' } as any,
                ],
            });
            expect(result).toBe(false);
            errorSpy.mockRestore();
        });

        it('aplica defaults razonables cuando recibe payload casi vacío', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null },
            ]);
            const result = await analyticsReadService.publishResultsConfiguration({});
            expect(result).toBe(true);
        });

        it('loguea pero NO retorna false cuando solo falla el insert de state (sin surfaceConfigs)', async () => {
            // El código actual loguea el error de insert state pero solo falla
            // explícitamente cuando el upsert de configs explota. Cubrimos la rama.
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            mockSupabaseFromSequence(supabase, [
                { data: null, error: { message: 'insert broken' } },
            ]);
            const result = await analyticsReadService.publishResultsConfiguration({});
            expect(result).toBe(true);
            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });
    });

    describe('refreshAnalyticsRollups', () => {
        it('retorna true (mock explícito según código actual)', async () => {
            const result = await analyticsReadService.refreshAnalyticsRollups();
            expect(result).toBe(true);
        });
    });
});

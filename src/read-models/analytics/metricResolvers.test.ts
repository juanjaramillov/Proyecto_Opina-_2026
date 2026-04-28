import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseFromSequence } from '../../test/helpers/supabaseMock';

// === Mock de supabase client ===
vi.mock('../../supabase/client', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
    },
}));

import { resolveMetric, metricResolvers } from './metricResolvers';
import type { ResolutionContext } from './metricResolvers';
import { supabase } from '../../supabase/client';

const baseCtx: ResolutionContext = { timeWindowDays: 30 };

describe('metricResolvers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // =====================================================================
    // resolveMetric (orchestrator)
    // =====================================================================
    describe('resolveMetric', () => {
        it('retorna null cuando el metricId no existe en el catálogo', async () => {
            const result = await resolveMetric('metric_que_no_existe_jamas', baseCtx);
            expect(result).toBeNull();
        });

        it('delega al resolver del catálogo cuando existe', async () => {
            mockSupabaseFromSequence(supabase, [
                {
                    data: { preference_share: 0.45, total_battles: 100, updated_at: '2026-04-28T12:00:00Z' },
                    error: null,
                },
            ]);
            const result = await resolveMetric('preference_share', { ...baseCtx, entityId: 'e1' });
            expect(result?.metricId).toBe('preference_share');
            expect(result?.valueNumeric).toBe(0.45);
        });

        it('captura excepciones del resolver y retorna null + warn', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            // preference_share lanza Error si no se pasa entityId
            const result = await resolveMetric('preference_share', baseCtx);
            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    // =====================================================================
    // Resolvers individuales — patrones representativos
    // =====================================================================

    describe('preference_share', () => {
        it('lanza error cuando no recibe entityId (capturado por resolveMetric)', async () => {
            await expect(metricResolvers.preference_share(baseCtx)).rejects.toThrow(/entityId/);
        });

        it('arma resolución con data del rollup diario', async () => {
            mockSupabaseFromSequence(supabase, [
                {
                    data: { preference_share: 0.62, total_battles: 250, updated_at: '2026-04-28T10:00:00Z' },
                    error: null,
                },
            ]);
            const result = await metricResolvers.preference_share({ ...baseCtx, entityId: 'e1' });
            expect(result.valueNumeric).toBe(0.62);
            expect(result.sampleSize).toBe(250);
            expect(result.dataUpdatedAsOf).toBe('2026-04-28T10:00:00Z');
        });

        it('aplica fallbacks razonables cuando el rollup viene vacío', async () => {
            mockSupabaseFromSequence(supabase, [{ data: null, error: null }]);
            const result = await metricResolvers.preference_share({ ...baseCtx, entityId: 'e1' });
            expect(result.valueNumeric).toBe(0);
            expect(result.sampleSize).toBe(0);
            expect(() => new Date(result.dataUpdatedAsOf).toISOString()).not.toThrow();
        });
    });

    describe('active_signals_24h', () => {
        it('retorna count cuando supabase responde con conteo', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null, count: 1234 },
            ]);
            const result = await metricResolvers.active_signals_24h(baseCtx);
            expect(result.valueNumeric).toBe(1234);
            expect(result.sampleSize).toBe(1234);
        });

        it('cae a 0 cuando supabase devuelve count null', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null, count: null },
            ]);
            const result = await metricResolvers.active_signals_24h(baseCtx);
            expect(result.valueNumeric).toBe(0);
        });
    });

    describe('freshness_hours', () => {
        it('calcula horas desde la fecha del último signal', async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            // Hace exactamente 5 horas
            mockSupabaseFromSequence(supabase, [
                { data: { created_at: '2026-04-28T07:00:00Z' }, error: null },
            ]);
            const result = await metricResolvers.freshness_hours(baseCtx);
            expect(result.valueNumeric).toBeCloseTo(5, 1);
            vi.useRealTimers();
        });

        it('default 24h cuando no hay signal previo', async () => {
            mockSupabaseFromSequence(supabase, [{ data: null, error: null }]);
            const result = await metricResolvers.freshness_hours(baseCtx);
            expect(result.valueNumeric).toBe(24);
        });
    });

    describe('community_activity_label — branching por count', () => {
        it('label "Alta Actividad" cuando count > 500', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null, count: 800 },
            ]);
            const r = await metricResolvers.community_activity_label(baseCtx);
            expect(r.valueString).toBe('Alta Actividad');
        });

        it('label "Actividad Estable" cuando count entre 100 y 500', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null, count: 250 },
            ]);
            const r = await metricResolvers.community_activity_label(baseCtx);
            expect(r.valueString).toBe('Actividad Estable');
        });

        it('label "Baja Actividad" cuando count <= 100', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: null, error: null, count: 50 },
            ]);
            const r = await metricResolvers.community_activity_label(baseCtx);
            expect(r.valueString).toBe('Baja Actividad');
        });
    });

    describe('leader_entity_name + fragmentation_label (consumen leaderboard)', () => {
        it('leader_entity_name extrae el primer entity del leaderboard', async () => {
            mockSupabaseFromSequence(supabase, [
                {
                    data: [
                        { entity_name: 'Marca A', win_rate: 0.7, preference_share: 55, total_comparisons: 200 },
                        { entity_name: 'Marca B', win_rate: 0.5, preference_share: 35, total_comparisons: 150 },
                    ],
                    error: null,
                },
            ]);
            const r = await metricResolvers.leader_entity_name(baseCtx);
            expect(r.valueString).toBe('Marca A');
            expect(r.valueNumeric).toBe(0.7);
            expect(r.sampleSize).toBe(200);
        });

        it('leader_entity_name fallback cuando leaderboard vacío', async () => {
            mockSupabaseFromSequence(supabase, [{ data: [], error: null }]);
            const r = await metricResolvers.leader_entity_name(baseCtx);
            expect(r.valueString).toBe('Sin Líder');
        });

        it('fragmentation_label "Fragmentado" cuando líder share < 40', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: [{ entity_name: 'A', preference_share: 30, total_comparisons: 100 }], error: null },
            ]);
            const r = await metricResolvers.fragmentation_label(baseCtx);
            expect(r.valueString).toBe('Fragmentado');
        });

        it('fragmentation_label "Consolidado" cuando líder share >= 40', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: [{ entity_name: 'A', preference_share: 60, total_comparisons: 100 }], error: null },
            ]);
            const r = await metricResolvers.fragmentation_label(baseCtx);
            expect(r.valueString).toBe('Consolidado');
        });
    });

    describe('leader_margin_vs_second', () => {
        it('calcula margen y lo expresa como porcentaje (no negativo)', async () => {
            mockSupabaseFromSequence(supabase, [
                {
                    data: [
                        { win_rate: 0.7, total_comparisons: 200 },
                        { win_rate: 0.5 },
                    ],
                    error: null,
                },
            ]);
            const r = await metricResolvers.leader_margin_vs_second(baseCtx);
            expect(r.valueNumeric).toBeCloseTo(20, 1); // 0.2 * 100
        });

        it('clampea a 0 si por algun motivo el segundo tuviera win_rate mayor', async () => {
            mockSupabaseFromSequence(supabase, [
                {
                    data: [
                        { win_rate: 0.4, total_comparisons: 100 },
                        { win_rate: 0.5 },
                    ],
                    error: null,
                },
            ]);
            const r = await metricResolvers.leader_margin_vs_second(baseCtx);
            expect(r.valueNumeric).toBe(0); // Math.max(0, ...)
        });
    });

    describe('wilson_lower_bound — usa supabase.rpc', () => {
        it('llama RPC opina_math_wilson_score con wins y total y retorna su valor', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: { wins: 60, total_battles: 100 }, error: null },
            ]);
            vi.mocked(supabase.rpc).mockResolvedValue({
                data: 0.52,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error: null,
            } as any);
            const r = await metricResolvers.wilson_lower_bound({ ...baseCtx, entityId: 'e1' });
            expect(supabase.rpc).toHaveBeenCalledWith('opina_math_wilson_score', {
                positive_votes: 60,
                total_votes: 100,
            });
            expect(r.valueNumeric).toBe(0.52);
            expect(r.sampleSize).toBe(100);
        });

        it('retorna 0 cuando total_battles == 0', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: { wins: 0, total_battles: 0 }, error: null },
            ]);
            const r = await metricResolvers.wilson_lower_bound({ ...baseCtx, entityId: 'e1' });
            expect(r.valueNumeric).toBe(0);
            expect(supabase.rpc).not.toHaveBeenCalled();
        });

        it('lanza error cuando no recibe entityId', async () => {
            await expect(
                metricResolvers.wilson_lower_bound(baseCtx)
            ).rejects.toThrow(/wilson_lower_bound requiere entityId/);
        });
    });

    describe('B2B resolvers que requieren entityId', () => {
        it('weighted_preference_share lanza error sin entityId', async () => {
            await expect(metricResolvers.weighted_preference_share(baseCtx)).rejects.toThrow(/entityId/);
        });

        it('weighted_preference_share retorna data del summary view', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: { preference_share: 0.55, total_comparisons: 180 }, error: null },
            ]);
            const r = await metricResolvers.weighted_preference_share({ ...baseCtx, entityId: 'e1' });
            expect(r.valueNumeric).toBe(0.55);
            expect(r.sampleSize).toBe(180);
        });

        it('leader_rank cuenta posicion 1-indexed dentro del leaderboard', async () => {
            mockSupabaseFromSequence(supabase, [
                {
                    data: [
                        { entity_id: 'e1' },
                        { entity_id: 'e2' },
                        { entity_id: 'e3' },
                    ],
                    error: null,
                },
            ]);
            const r = await metricResolvers.leader_rank({ ...baseCtx, entityId: 'e2' });
            expect(r.valueNumeric).toBe(2);
            expect(r.sampleSize).toBe(3);
        });

        it('leader_rank retorna 0 cuando entityId no aparece', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: [{ entity_id: 'e1' }], error: null },
            ]);
            const r = await metricResolvers.leader_rank({ ...baseCtx, entityId: 'no_existe' });
            expect(r.valueNumeric).toBe(0);
        });
    });

    describe('topic_heat_index', () => {
        it('lanza error sin topicId', async () => {
            await expect(metricResolvers.topic_heat_index(baseCtx)).rejects.toThrow(/topic_heat_index requiere topicId/);
        });

        it('extrae heat_index del rollup más reciente', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: { heat_index: 87, total_signals: 432, updated_at: '2026-04-28T08:00:00Z' }, error: null },
            ]);
            const r = await metricResolvers.topic_heat_index({ ...baseCtx, topicId: 't1' });
            expect(r.valueNumeric).toBe(87);
            expect(r.sampleSize).toBe(432);
        });
    });

    describe('commercial_eligibility_label', () => {
        it('"standard_ready" cuando total_comparisons > 30', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: { total_comparisons: 50 }, error: null },
            ]);
            const r = await metricResolvers.commercial_eligibility_label({ ...baseCtx, entityId: 'e1' });
            expect(r.valueString).toBe('standard_ready');
        });

        it('"insufficient_data" cuando total_comparisons <= 30', async () => {
            mockSupabaseFromSequence(supabase, [
                { data: { total_comparisons: 20 }, error: null },
            ]);
            const r = await metricResolvers.commercial_eligibility_label({ ...baseCtx, entityId: 'e1' });
            expect(r.valueString).toBe('insufficient_data');
        });
    });

    describe('Resolvers determinísticos sin Supabase (constantes)', () => {
        it.each([
            ['hot_topic_polarization_label', 'Neutro'],
            ['generation_gap_label', 'Brecha Moderada'],
            ['territory_gap_label', 'Uniforme'],
            ['most_contested_category', 'Categoría Principal'],
        ])('%s retorna su valor constante esperado', async (id, expectedString) => {
            const r = await metricResolvers[id](baseCtx);
            expect(r.valueString).toBe(expectedString);
        });

        it.each([
            ['reputation_risk_index', 20],
            ['integrity_score', 95],
            ['wilson_upper_bound', 0.95],
            ['entropy_normalized', 0.5],
            ['preference_quality_gap', 0.05],
            ['generation_gap_index', 0.15],
            ['territory_gap_index', 0.1],
        ])('%s retorna valueNumeric constante = %s', async (id, expected) => {
            const r = await metricResolvers[id](baseCtx);
            expect(r.valueNumeric).toBe(expected);
        });
    });
});

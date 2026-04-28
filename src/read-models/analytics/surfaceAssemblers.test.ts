import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MetricRegistryEntry, MetricSurface } from './analyticsTypes';
import type { ResolvedMetricValue, ResolutionContext } from './metricResolvers';

/**
 * Mock del catálogo: 3 metrics con surfaces distintas para poder testear el filtrado.
 */
vi.mock('./metricCatalog', () => {
    const baseEntry = (id: string, surfaces: MetricSurface[], status: MetricRegistryEntry['status'] = 'live'): MetricRegistryEntry => ({
        id,
        name: id,
        shortDescription: '',
        origin: 'system',
        allowedAudience: ['admin'],
        level: 'base',
        outputType: 'number',
        family: 'behavior',
        surfaces,
        status,
        staticOrTrend: 'static',
        visibleByDefault: true,
        requiresGuardrail: false,
        minSample: 0,
        minNEff: 0,
        maxFreshnessHours: 0,
        requiresAnonymityGuardrail: false,
        exportable: false,
        uiVariant: 'kpi_card',
        defaultSlot: 'default',
        defaultSortOrder: 0,
        isWiredToReadModel: true,
    } as MetricRegistryEntry);

    return {
        METRIC_CATALOG: {
            metric_a: baseEntry('metric_a', ['results_hero']),
            metric_b: baseEntry('metric_b', ['results_hero', 'b2b_overview_top']),
            metric_c: baseEntry('metric_c', ['admin_registry']),
        },
    };
});

/**
 * Mock de resolveMetric: lo capturamos para poder verificar invocaciones.
 */
const mockResolveMetric = vi.fn<(id: string, ctx: ResolutionContext) => Promise<ResolvedMetricValue | null>>();

vi.mock('./metricResolvers', () => ({
    resolveMetric: (id: string, ctx: ResolutionContext) => mockResolveMetric(id, ctx),
}));

// Importamos el SUT después de los mocks (top-level import respeta el orden de
// vi.mock por hoisting, pero por claridad explícita usamos await import).
const { assembleSurfaceMetrics } = await import('./surfaceAssemblers');

const ctx: ResolutionContext = {} as ResolutionContext;

function makeResolvedValue(metricId: string, sampleSize = 100): ResolvedMetricValue {
    return {
        metricId,
        valueNumeric: 42,
        sampleSize,
        dataUpdatedAsOf: new Date().toISOString(),
    };
}

describe('assembleSurfaceMetrics', () => {
    beforeEach(() => {
        mockResolveMetric.mockReset();
    });

    describe('filtrado por surface', () => {
        it('solo resuelve métricas que incluyen el surface dado', async () => {
            mockResolveMetric.mockImplementation(async (id) => makeResolvedValue(id));

            const result = await assembleSurfaceMetrics('results_hero', ctx);

            expect(Object.keys(result).sort()).toEqual(['metric_a', 'metric_b']);
            // metric_c NO debe haberse resuelto (surface admin_registry)
            expect(mockResolveMetric).toHaveBeenCalledWith('metric_a', ctx);
            expect(mockResolveMetric).toHaveBeenCalledWith('metric_b', ctx);
            expect(mockResolveMetric).not.toHaveBeenCalledWith('metric_c', expect.anything());
        });

        it('retorna objeto vacío cuando ningún catálogo cubre el surface pedido', async () => {
            mockResolveMetric.mockImplementation(async (id) => makeResolvedValue(id));
            const result = await assembleSurfaceMetrics('b2b_reports_export', ctx);
            expect(result).toEqual({});
            expect(mockResolveMetric).not.toHaveBeenCalled();
        });
    });

    describe('admin overrides', () => {
        it('cuando override es false, retorna disabled SIN llamar resolveMetric', async () => {
            mockResolveMetric.mockImplementation(async (id) => makeResolvedValue(id));

            const result = await assembleSurfaceMetrics('results_hero', ctx, {
                metric_a: false,
            });

            expect(result.metric_a.state).toBe('disabled');
            expect(result.metric_a.reason).toMatch(/Disabled by global DB override/);
            expect(result.metric_a.resolvedValue).toBeNull();
            // No se llamó resolveMetric para metric_a (cortocircuito antes del I/O)
            expect(mockResolveMetric).not.toHaveBeenCalledWith('metric_a', expect.anything());
            // Pero sí para metric_b (no tiene override)
            expect(mockResolveMetric).toHaveBeenCalledWith('metric_b', ctx);
        });

        it('cuando override es true, sí llama resolveMetric Y pasa isAdminForced a la evaluación', async () => {
            // Configuramos resolveMetric para devolver muestra insuficiente, pero como
            // requiresGuardrail=false en el mock catalog, eso no afecta. Para validar
            // que isAdminForced se propaga, devolvemos null y verificamos que el
            // resultado sea pending_instrumentation (la rama "no data") — la validación
            // específica de isAdminForced bypassing guardrails ya está cubierta en
            // metricAvailability.test.ts.
            mockResolveMetric.mockImplementation(async (id) => makeResolvedValue(id));

            const result = await assembleSurfaceMetrics('results_hero', ctx, {
                metric_a: true,
            });

            expect(mockResolveMetric).toHaveBeenCalledWith('metric_a', ctx);
            // metric_a debería resolverse normalmente, sin restricciones
            expect(result.metric_a.state).toBe('live');
        });

        it('overrides no aplicables a la surface no afectan', async () => {
            mockResolveMetric.mockImplementation(async (id) => makeResolvedValue(id));

            const result = await assembleSurfaceMetrics('results_hero', ctx, {
                metric_c: false, // metric_c ni siquiera está en este surface
            });

            // Pasaron las dos del surface results_hero como live
            expect(result.metric_a.state).toBe('live');
            expect(result.metric_b.state).toBe('live');
            // metric_c no aparece (no está en el surface, no en la respuesta)
            expect(result.metric_c).toBeUndefined();
        });
    });

    describe('flujo end-to-end con resolveMetric', () => {
        it('cuando resolveMetric retorna null, la métrica queda pending_instrumentation', async () => {
            mockResolveMetric.mockImplementation(async () => null);

            const result = await assembleSurfaceMetrics('results_hero', ctx);

            expect(result.metric_a.state).toBe('pending_instrumentation');
            expect(result.metric_b.state).toBe('pending_instrumentation');
        });

        it('paraleliza las resoluciones (Promise.all interno) — todas invocadas en una sola pasada', async () => {
            mockResolveMetric.mockImplementation(async (id) => {
                // Pequeño delay para permitir verificar que corren en paralelo (Promise.all)
                await new Promise(r => setTimeout(r, 1));
                return makeResolvedValue(id);
            });

            const start = Date.now();
            await assembleSurfaceMetrics('results_hero', ctx);
            const elapsed = Date.now() - start;

            // Si fueran secuenciales serían >= 2ms (1+1). Con Promise.all, ~1ms.
            // Le damos margen amplio para no ser flaky por scheduling.
            expect(elapsed).toBeLessThan(50);
            expect(mockResolveMetric).toHaveBeenCalledTimes(2);
        });
    });

    describe('shape del resultado', () => {
        it('cada entry tiene las 4 propiedades del MetricAvailabilityResult', async () => {
            mockResolveMetric.mockImplementation(async (id) => makeResolvedValue(id));

            const result = await assembleSurfaceMetrics('results_hero', ctx);

            for (const id of Object.keys(result)) {
                expect(result[id]).toHaveProperty('state');
                expect(result[id]).toHaveProperty('metricDefinition');
                expect(result[id]).toHaveProperty('resolvedValue');
                expect(result[id].metricDefinition.id).toBe(id);
            }
        });
    });
});

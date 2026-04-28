import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateMetricAvailability } from './metricAvailability';
import type { MetricRegistryEntry } from './analyticsTypes';
import type { ResolvedMetricValue } from './metricResolvers';

/**
 * Helper para construir un MetricRegistryEntry mínimo con overrides parciales.
 * Los campos no relevantes para la lógica testeada quedan en valores neutros
 * que cumplen el shape sin sesgar el resultado.
 */
function makeEntry(overrides: Partial<MetricRegistryEntry> = {}): MetricRegistryEntry {
    return {
        id: 'test_metric',
        name: 'Test Metric',
        shortDescription: '',
        origin: 'system',
        allowedAudience: ['admin'],
        level: 'base',
        outputType: 'number',
        family: 'integrity',
        surfaces: [],
        status: 'live',
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
        ...overrides,
    } as MetricRegistryEntry;
}

function makeValue(overrides: Partial<ResolvedMetricValue> = {}): ResolvedMetricValue {
    return {
        metricId: 'test_metric',
        valueNumeric: 0,
        sampleSize: 100,
        dataUpdatedAsOf: new Date().toISOString(),
        ...overrides,
    };
}

describe('evaluateMetricAvailability', () => {
    describe('canonical status checks', () => {
        it('returns "disabled" when entry status is disabled, even with data', () => {
            const entry = makeEntry({ status: 'disabled' });
            const result = evaluateMetricAvailability(entry, makeValue());
            expect(result.state).toBe('disabled');
            expect(result.reason).toMatch(/deshabilitada/i);
            expect(result.resolvedValue).toBeNull();
        });

        it('returns "pending_instrumentation" when entry status is pending and no data', () => {
            const entry = makeEntry({ status: 'pending_instrumentation' });
            const result = evaluateMetricAvailability(entry, null);
            expect(result.state).toBe('pending_instrumentation');
            expect(result.reason).toMatch(/no implementado/i);
        });

        it('returns "pending_instrumentation" when no resolved data even if status is live', () => {
            const entry = makeEntry({ status: 'live' });
            const result = evaluateMetricAvailability(entry, null);
            expect(result.state).toBe('pending_instrumentation');
            expect(result.reason).toMatch(/sin datos/i);
        });
    });

    describe('guardrail evaluation', () => {
        it('returns "insufficient_sample" when sampleSize < minSample and no admin force', () => {
            const entry = makeEntry({
                requiresGuardrail: true,
                minSample: 100,
            });
            const value = makeValue({ sampleSize: 50 });
            const result = evaluateMetricAvailability(entry, value, false);
            expect(result.state).toBe('insufficient_sample');
            expect(result.reason).toMatch(/N=100/);
            expect(result.reason).toMatch(/N=50/);
        });

        it('bypasses sample guardrail when isAdminForced is true', () => {
            const entry = makeEntry({
                requiresGuardrail: true,
                minSample: 100,
            });
            const value = makeValue({ sampleSize: 50 });
            const result = evaluateMetricAvailability(entry, value, true);
            expect(result.state).toBe('live');
        });

        it('returns "stale" when data is older than maxFreshnessHours and no admin force', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            // 30h atrás
            const dataDate = new Date('2026-04-27T06:00:00Z').toISOString();
            const entry = makeEntry({
                requiresGuardrail: true,
                maxFreshnessHours: 24,
            });
            const value = makeValue({ dataUpdatedAsOf: dataDate });
            const result = evaluateMetricAvailability(entry, value, false);
            expect(result.state).toBe('stale');
            expect(result.reason).toMatch(/24h/);
            vi.useRealTimers();
        });

        it('bypasses freshness guardrail when isAdminForced is true', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            const dataDate = new Date('2026-04-27T06:00:00Z').toISOString();
            const entry = makeEntry({
                requiresGuardrail: true,
                maxFreshnessHours: 24,
            });
            const value = makeValue({ dataUpdatedAsOf: dataDate });
            const result = evaluateMetricAvailability(entry, value, true);
            expect(result.state).toBe('live');
            vi.useRealTimers();
        });

        it('does NOT evaluate guardrails when requiresGuardrail is false', () => {
            const entry = makeEntry({
                requiresGuardrail: false,
                minSample: 1000, // alto, pero como no requiere guardrail no debe disparar
            });
            const value = makeValue({ sampleSize: 5 });
            const result = evaluateMetricAvailability(entry, value);
            expect(result.state).toBe('live');
        });

        it('returns "live" when guardrails are configured and data passes them', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-04-28T12:00:00Z'));
            const recentDate = new Date('2026-04-28T10:00:00Z').toISOString();
            const entry = makeEntry({
                requiresGuardrail: true,
                minSample: 50,
                maxFreshnessHours: 24,
            });
            const value = makeValue({ sampleSize: 200, dataUpdatedAsOf: recentDate });
            const result = evaluateMetricAvailability(entry, value);
            expect(result.state).toBe('live');
            vi.useRealTimers();
        });
    });

    describe('experimental fallback', () => {
        it('returns "degraded" with reason when status is experimental and data exists', () => {
            const entry = makeEntry({ status: 'experimental' });
            const result = evaluateMetricAvailability(entry, makeValue());
            expect(result.state).toBe('degraded');
            expect(result.reason).toMatch(/experimental/i);
        });
    });

    describe('happy path', () => {
        it('returns "live" with no reason when entry is live + data present + no guardrails', () => {
            const entry = makeEntry({ status: 'live' });
            const result = evaluateMetricAvailability(entry, makeValue());
            expect(result.state).toBe('live');
            expect(result.reason).toBeUndefined();
            expect(result.resolvedValue).not.toBeNull();
        });
    });

    describe('result object integrity', () => {
        it('always returns metricDefinition reference equal to input entry', () => {
            const entry = makeEntry({ id: 'unique_id', status: 'live' });
            const result = evaluateMetricAvailability(entry, makeValue());
            expect(result.metricDefinition).toBe(entry);
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        // Aseguramos que cada test arranque sin timers congelados de un test previo.
        vi.useRealTimers();
    });
});

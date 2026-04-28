import { describe, it, expect } from 'vitest';
import { generateAlertsFromMetrics } from './metricAlerts';
import type { ResolvedMetricValue } from './metricResolvers';

/**
 * Helper para construir un ResolvedMetricValue mínimo.
 */
function metric(overrides: Partial<ResolvedMetricValue> & { metricId: string }): ResolvedMetricValue {
    return {
        valueNumeric: 0,
        sampleSize: 100,
        dataUpdatedAsOf: new Date().toISOString(),
        ...overrides,
    };
}

describe('generateAlertsFromMetrics', () => {
    describe('empty / no triggers', () => {
        it('returns empty array when metrics record is empty', () => {
            expect(generateAlertsFromMetrics({})).toEqual([]);
        });

        it('returns empty array when no metrics cross alert thresholds', () => {
            const metrics = {
                freshness_hours: metric({ metricId: 'freshness_hours', valueNumeric: 1 }),
                fragmentation_label: metric({ metricId: 'fragmentation_label', valueString: 'concentrated' }),
                reputation_risk_index: metric({ metricId: 'reputation_risk_index', valueNumeric: 30 }),
            };
            expect(generateAlertsFromMetrics(metrics)).toEqual([]);
        });
    });

    describe('freshness_hours alert', () => {
        it('triggers a critical systemic alert when freshness_hours > 24', () => {
            const metrics = {
                freshness_hours: metric({ metricId: 'freshness_hours', valueNumeric: 26 }),
            };
            const alerts = generateAlertsFromMetrics(metrics);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('systemic');
            expect(alerts[0].severity).toBe('critical');
            expect(alerts[0].title).toMatch(/Motor Canónico/i);
            expect(alerts[0].description).toMatch(/26h/);
        });

        it('does NOT trigger when freshness_hours is exactly 24 (uses strict >)', () => {
            const metrics = {
                freshness_hours: metric({ metricId: 'freshness_hours', valueNumeric: 24 }),
            };
            expect(generateAlertsFromMetrics(metrics)).toHaveLength(0);
        });
    });

    describe('fragmentation_label alert', () => {
        it('triggers a medium volatility alert when label is "highly_fragmented"', () => {
            const metrics = {
                fragmentation_label: metric({
                    metricId: 'fragmentation_label',
                    valueString: 'highly_fragmented',
                }),
            };
            const alerts = generateAlertsFromMetrics(metrics);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('volatility');
            expect(alerts[0].severity).toBe('medium');
            expect(alerts[0].title).toMatch(/Volatilidad/i);
        });

        it('does NOT trigger when fragmentation_label has a different value', () => {
            const metrics = {
                fragmentation_label: metric({
                    metricId: 'fragmentation_label',
                    valueString: 'concentrated',
                }),
            };
            expect(generateAlertsFromMetrics(metrics)).toHaveLength(0);
        });
    });

    describe('reputation_risk_index alert', () => {
        it('triggers a high risk alert when reputation_risk_index > 80', () => {
            const metrics = {
                reputation_risk_index: metric({
                    metricId: 'reputation_risk_index',
                    valueNumeric: 95,
                }),
            };
            const alerts = generateAlertsFromMetrics(metrics);
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('risk');
            expect(alerts[0].severity).toBe('high');
            expect(alerts[0].title).toMatch(/Reputacional/i);
        });

        it('does NOT trigger when reputation_risk_index is exactly 80 (uses strict >)', () => {
            const metrics = {
                reputation_risk_index: metric({
                    metricId: 'reputation_risk_index',
                    valueNumeric: 80,
                }),
            };
            expect(generateAlertsFromMetrics(metrics)).toHaveLength(0);
        });
    });

    describe('multiple alerts at once', () => {
        it('returns all 3 alerts when all 3 thresholds are crossed', () => {
            const metrics = {
                freshness_hours: metric({ metricId: 'freshness_hours', valueNumeric: 48 }),
                fragmentation_label: metric({
                    metricId: 'fragmentation_label',
                    valueString: 'highly_fragmented',
                }),
                reputation_risk_index: metric({
                    metricId: 'reputation_risk_index',
                    valueNumeric: 90,
                }),
            };
            const alerts = generateAlertsFromMetrics(metrics);
            expect(alerts).toHaveLength(3);
            const types = alerts.map(a => a.type).sort();
            expect(types).toEqual(['risk', 'systemic', 'volatility']);
        });
    });

    describe('alert object integrity', () => {
        it('every alert has stable required fields (id, triggeredAt, title, description)', () => {
            const metrics = {
                freshness_hours: metric({ metricId: 'freshness_hours', valueNumeric: 100 }),
            };
            const [alert] = generateAlertsFromMetrics(metrics);
            expect(alert.id).toBeTruthy();
            expect(alert.triggeredAt).toBeTruthy();
            expect(alert.title).toBeTruthy();
            expect(alert.description).toBeTruthy();
            // triggeredAt debe ser un ISO date parseable
            expect(() => new Date(alert.triggeredAt).toISOString()).not.toThrow();
        });
    });
});

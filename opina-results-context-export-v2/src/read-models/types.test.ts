import { describe, it, expect } from 'vitest';
import { isCanonicalModuleType, normalizeModuleType } from './types';

describe('Module Type Normalization', () => {
    describe('isCanonicalModuleType', () => {
        it('returns true for valid canonical modules', () => {
            expect(isCanonicalModuleType('versus')).toBe(true);
            expect(isCanonicalModuleType('torneo')).toBe(true);
            expect(isCanonicalModuleType('actualidad')).toBe(true);
            expect(isCanonicalModuleType('profundidad')).toBe(true);
        });

        it('returns false for legacy or invalid strings', () => {
            expect(isCanonicalModuleType('tournament')).toBe(false);
            expect(isCanonicalModuleType('experience')).toBe(false);
            expect(isCanonicalModuleType('invalid_module')).toBe(false);
            expect(isCanonicalModuleType('')).toBe(false);
        });
    });

    describe('normalizeModuleType', () => {
        it('returns identically for already canonical modules', () => {
            expect(normalizeModuleType('versus')).toBe('versus');
            expect(normalizeModuleType('torneo')).toBe('torneo');
            expect(normalizeModuleType('actualidad')).toBe('actualidad');
            expect(normalizeModuleType('profundidad')).toBe('profundidad');
        });

        it('maps legacy "tournament" to "torneo"', () => {
            expect(normalizeModuleType('tournament')).toBe('torneo');
            expect(normalizeModuleType('TOURNAMENT')).toBe('torneo'); // case insensitive
        });

        it('maps legacy "experience"/"signals" to "versus"', () => {
            expect(normalizeModuleType('experience')).toBe('versus');
            expect(normalizeModuleType('signals')).toBe('versus');
        });

        it('throws an error for unrecognized modules', () => {
            expect(() => normalizeModuleType('dead_feature')).toThrow('Invalid module type: dead_feature does not match any CanonicalModuleType');
        });
    });
});

import { describe, it, expect } from 'vitest';
import { computeDeterministicDeviceHash, __testing } from './deviceFingerprint';

/**
 * Tests para device fingerprint determinístico — #9 Media Drimo.
 * Lo crítico: el hash debe ser el MISMO para los mismos inputs.
 * Si esto se rompe, todo el sistema de detección multi-cuenta falla.
 */

describe('deviceFingerprint · determinismo', () => {
    it('mismo navegador → mismo hash en N invocaciones consecutivas', async () => {
        const a = await computeDeterministicDeviceHash();
        const b = await computeDeterministicDeviceHash();
        const c = await computeDeterministicDeviceHash();
        expect(a).toBe(b);
        expect(b).toBe(c);
    });

    it('hash tiene exactamente 32 chars hex', async () => {
        const h = await computeDeterministicDeviceHash();
        expect(h).toMatch(/^[0-9a-f]{32}$/);
    });

    it('inputs distintos → hashes distintos', async () => {
        const h1 = await __testing.sha256Hex('mac|chrome|es|1920|1080');
        const h2 = await __testing.sha256Hex('mac|chrome|en|1920|1080');
        expect(h1).not.toBe(h2);
    });

    it('mismos inputs → mismo hash (sha256Hex puro)', async () => {
        const x = await __testing.sha256Hex('foo|bar');
        const y = await __testing.sha256Hex('foo|bar');
        expect(x).toBe(y);
    });

    it('collectFingerprintInputs incluye separador "|" entre fields', () => {
        const raw = __testing.collectFingerprintInputs();
        expect(raw).toContain('|');
        // mínimo 7 separadores → 8 campos
        expect(raw.split('|').length).toBeGreaterThanOrEqual(8);
    });

    it('NO contiene PII obvia (email, name, password)', () => {
        const raw = __testing.collectFingerprintInputs().toLowerCase();
        expect(raw).not.toContain('@');       // emails
        expect(raw).not.toContain('password');
    });
});

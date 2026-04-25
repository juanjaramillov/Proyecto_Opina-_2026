/**
 * Device fingerprint determinístico — #9 Media de la auditoría Drimo.
 *
 * Genera un hash SHA-256 estable que identifica un dispositivo a partir
 * de señales del navegador. La clave es que es **determinístico**: la
 * misma combinación de navegador/SO/pantalla/timezone produce siempre el
 * mismo hash, aún si el usuario:
 *   - Borra localStorage o cookies
 *   - Entra en modo incógnito
 *   - Cierra sesión y vuelve a entrar con otro user
 *
 * Esto contrasta con el hash legacy en `signalWriteService.ts` que mete
 * `crypto.randomUUID()` y por lo tanto es **aleatorio** — y se evade
 * trivialmente borrando localStorage. Ese hash legacy queda para los
 * signals existentes (no se toca acá para no invalidar bans previos).
 *
 * El nuevo hash determinístico se usa solo en `user_sessions` (al
 * registrarse una sesión). Su finalidad: detectar abuso multi-cuenta
 * cruzando "device → N usuarios distintos" desde el panel admin.
 *
 * Privacidad: el hash NO contiene PII. Es un digest opaco de 32 chars hex.
 * Solo sirve para comparar "este device == ese device, sí/no".
 *
 * @module lib/deviceFingerprint
 */

const SUBTLE_AVAILABLE = typeof globalThis !== 'undefined'
    && typeof globalThis.crypto !== 'undefined'
    && typeof globalThis.crypto.subtle !== 'undefined';

/**
 * Recolecta señales estables del navegador. Usa solo señales que el
 * usuario NO cambia con frecuencia (versión del SO, resolución, idioma).
 * Si un campo no está disponible, usa el placeholder `'unknown'` para
 * mantener determinismo en SSR/tests.
 */
function collectFingerprintInputs(): string {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const scr = typeof screen !== 'undefined' ? screen : null;

    const userAgent = nav?.userAgent ?? 'unknown';
    const platform = nav?.platform ?? 'unknown';
    const language = nav?.language ?? 'unknown';
    const hardwareConcurrency = nav?.hardwareConcurrency ?? 0;
    const screenWidth = scr?.width ?? 0;
    const screenHeight = scr?.height ?? 0;
    const colorDepth = scr?.colorDepth ?? 0;
    const tzOffset = (() => {
        try {
            return new Date().getTimezoneOffset();
        } catch {
            return 0;
        }
    })();

    return [
        userAgent,
        platform,
        language,
        String(hardwareConcurrency),
        String(screenWidth),
        String(screenHeight),
        String(colorDepth),
        String(tzOffset),
    ].join('|');
}

/**
 * Hash SHA-256 → hex truncado a 32 chars (16 bytes = 128 bits de entropía).
 * Suficiente para uso anti-fraude (no es criptografía sensible).
 */
async function sha256Hex(input: string): Promise<string> {
    if (!SUBTLE_AVAILABLE) {
        // Fallback determinístico best-effort (entornos sin Web Crypto, ej. tests Node viejos).
        // No es criptográfico pero mantiene determinismo. Producción siempre tiene subtle.
        let h = 0;
        for (let i = 0; i < input.length; i++) {
            h = ((h << 5) - h + input.charCodeAt(i)) | 0;
        }
        return ('00000000' + (h >>> 0).toString(16)).slice(-8).repeat(4);
    }

    const enc = new TextEncoder();
    const buf = await globalThis.crypto.subtle.digest('SHA-256', enc.encode(input));
    const bytes = new Uint8Array(buf);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex.slice(0, 32);
}

/**
 * Calcula el device fingerprint determinístico del navegador actual.
 *
 * @returns Promesa con un string hex de 32 chars. Nunca lanza — si todo
 *          falla, retorna un hash de inputs vacíos (compatible y opaco).
 */
export async function computeDeterministicDeviceHash(): Promise<string> {
    try {
        const raw = collectFingerprintInputs();
        return await sha256Hex(raw);
    } catch {
        // Defensa total: si crashea por algo inesperado, devolvemos un
        // hash de fallback en vez de romper el login.
        return await sha256Hex('fingerprint_error');
    }
}

/**
 * Versión sincrónica usada solo por tests que no quieren await.
 * Expone los inputs crudos para verificar determinismo. NO usar en prod
 * (no aplica el hash, son los inputs en claro).
 */
export const __testing = {
    collectFingerprintInputs,
    sha256Hex,
};

/**
 * Simple client-side rate limiting helper using localStorage.
 *
 * F-10 (auditoría 2026-04-26) reviewed: localStorage acceptable here.
 * Es un anti-spam best-effort para UX (evita doble-submit del mismo botón).
 * NO es un control de seguridad — el rate limit real vive server-side
 * (signal_rate_limiter, edge functions). Un atacante que limpie localStorage
 * solo se ve a sí mismo bypasseando el delay del cliente; el servidor sigue
 * aplicando los límites.
 */
export const rateLimit = {
    /**
     * Checks if a signal with the given key has already been sent.
     */
    hasSent: (key: string): boolean => {
        const value = localStorage.getItem(key);
        if (!value) return false;

        // If it's a daily limit, check if it's still same day
        if (key.includes(':daily:')) {
            const today = new Date().toISOString().split('T')[0];
            return value === today;
        }

        return true;
    },

    /**
     * Marks a signal as sent.
     * For daily limits, use a key containing ':daily:'.
     */
    markSent: (key: string): void => {
        if (key.includes(':daily:')) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(key, today);
        } else {
            localStorage.setItem(key, 'true');
        }
    }
};

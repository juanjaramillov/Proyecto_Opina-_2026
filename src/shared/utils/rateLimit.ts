/**
 * Simple client-side rate limiting helper using localStorage.
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

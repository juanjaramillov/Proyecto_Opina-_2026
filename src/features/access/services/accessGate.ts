const STORAGE_KEY = 'opina_access_gate_v1';

type GateState = {
    tokenId: string;
    grantedAt: number;
    expiresAt: number;
};

function safeParse(raw: string | null): GateState | null {
    if (!raw) return null;
    try { return JSON.parse(raw) as GateState; } catch { return null; }
}

export const accessGate = {
    isEnabled(): boolean {
        // default ON (si no existe)
        return import.meta.env.VITE_ACCESS_GATE_ENABLED !== 'false';
    },

    getState(): GateState | null {
        return safeParse(localStorage.getItem(STORAGE_KEY));
    },

    hasAccess(): boolean {
        const st = this.getState();
        if (!st) return false;
        return Date.now() < st.expiresAt;
    },

    getTokenId(): string | null {
        const st = this.getState();
        if (!st) return null;
        return Date.now() < st.expiresAt ? st.tokenId : null;
    },

    grant(tokenId: string, daysValid = 30) {
        const now = Date.now();
        const expiresAt = now + daysValid * 24 * 60 * 60 * 1000;
        const st: GateState = { tokenId, grantedAt: now, expiresAt };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    },

    revoke() {
        localStorage.removeItem(STORAGE_KEY);
    }
};

export const ACCESS_GATE_STORAGE_KEY = STORAGE_KEY;

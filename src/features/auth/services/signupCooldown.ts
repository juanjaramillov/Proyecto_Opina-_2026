const KEY = "opina_signup_cooldown_v1";

type CooldownState = { until: number };

function read(): CooldownState | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as CooldownState; } catch { return null; }
}

export const signupCooldown = {
    isActive(): boolean {
        const st = read();
        return Boolean(st && Date.now() < st.until);
    },

    secondsLeft(): number {
        const st = read();
        if (!st) return 0;
        const ms = st.until - Date.now();
        return ms > 0 ? Math.ceil(ms / 1000) : 0;
    },

    start(seconds = 30) {
        const until = Date.now() + seconds * 1000;
        localStorage.setItem(KEY, JSON.stringify({ until }));
    },

    clear() {
        localStorage.removeItem(KEY);
    }
};

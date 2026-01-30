// Removed dependency on deleted file
export interface Trend {
    id: string;
    label: string;
    score: number;
    delta24h: number;
    category: string;
}

const INITIAL_TRENDS: Trend[] = [];

const STORAGE_KEY = "opina_trend_state_v1";

export function loadTrends(): Trend[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return INITIAL_TRENDS;
        }
        const parsed = JSON.parse(raw) as Trend[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return INITIAL_TRENDS;
        }
        return parsed.sort((a, b) => b.score - a.score);
    } catch {
        return INITIAL_TRENDS;
    }
}

export function saveTrends(trends: Trend[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trends));
        // Dispatch event for reactive updates (similar to signalStore)
        window.dispatchEvent(new Event("opina:trend_update"));
    } catch {
        // ignore
    }
}

export function bumpTrend(trendId: string, amount: number) {
    const trends = loadTrends();
    const index = trends.findIndex(t => t.id === trendId);

    if (index !== -1) {
        trends[index].score += amount;
        trends[index].delta24h += (amount > 0 ? 0.1 : 0); // Mock delta increase
        // Re-sort
        trends.sort((a, b) => b.score - a.score);
        saveTrends(trends);
        return trends[index];
    }
    return null;
}

export function getTopTrends(limit = 3) {
    const trends = loadTrends();
    return trends.slice(0, limit);
}

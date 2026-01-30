/**
 * Simula métricas “vivas” usando localStorage.
 * No backend. Cero riesgo.
 */

const KEY = "opina_demo_metrics_v1";

type Metrics = {
    sessions: number;
    votes: number;
    lastVisit: string;
};

function base(): Metrics {
    return {
        sessions: 1,
        votes: Math.floor(120 + Math.random() * 80),
        lastVisit: new Date().toISOString(),
    };
}

export function getDemoMetrics(): Metrics {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) {
            const m = base();
            localStorage.setItem(KEY, JSON.stringify(m));
            return m;
        }

        const m = JSON.parse(raw) as Metrics;
        m.sessions += Math.random() > 0.7 ? 1 : 0;
        m.lastVisit = new Date().toISOString();

        localStorage.setItem(KEY, JSON.stringify(m));
        return m;
    } catch {
        const m = base();
        localStorage.setItem(KEY, JSON.stringify(m));
        return m;
    }
}

export function incrementDemoVotes(n = 1) {
    const m = getDemoMetrics();
    m.votes += n;
    localStorage.setItem(KEY, JSON.stringify(m));
}

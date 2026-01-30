import { useMemo } from "react";

type Props = {
    streak: number;
    level: number;
    xp: number;
    xpToNext: number;
    totalSignals: number;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export default function SignalHUD({ streak, level, xp, xpToNext, totalSignals }: Props) {
    const pct = useMemo(() => {
        if (xpToNext <= 0) return 0;
        return clamp(Math.round((xp / xpToNext) * 100), 0, 100);
    }, [xp, xpToNext]);

    const title = streak >= 7 ? "Modo leyenda" : streak >= 3 ? "Vas bien" : "Partiendo";

    return (
        <div className="card card-pad mb-8 fade-up">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="badge-primary">HUD</span>
                        <span className="text-sm font-semibold text-text-secondary">
                            {title} · Tu señal pesa más de lo que crees ⚡
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="badge">🔥 Racha: <b>{streak}</b></span>
                        <span className="badge">🧠 Nivel: <b>{level}</b></span>
                        <span className="badge">📡 Señales: <b>{totalSignals}</b></span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="text-text-secondary">Próximo nivel</span>
                        <span className="grad-text">{pct}%</span>
                    </div>

                    <div className="mt-2 h-3 rounded-full bg-surface2 overflow-hidden">
                        <div className="h-3 bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="mt-2 text-xs text-text-muted">
                        {xp} / {xpToNext} XP · Subes por participar, no por “tener la razón”.
                    </div>
                </div>
            </div>
        </div>
    );
}

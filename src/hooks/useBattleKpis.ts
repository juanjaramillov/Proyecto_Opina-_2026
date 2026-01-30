import { useEffect, useMemo, useState } from "react";
import { kpiService, type KpiQualityRow, type KpiShareRow, type KpiVelocityRow } from "../services/kpiService";

export type RangePreset = "24h" | "7d" | "30d";


function buildRange(preset: RangePreset) {
    const end = new Date();
    const start = new Date(end.getTime());

    if (preset === "24h") start.setHours(start.getHours() - 24);
    if (preset === "7d") start.setDate(start.getDate() - 7);
    if (preset === "30d") start.setDate(start.getDate() - 30);

    return { start, end };
}

export function useBattleKpis(
    battleId: string | null,
    preset: RangePreset = "7d",

    refreshKey: number = 0
) {
    const range = useMemo(() => buildRange(preset), [preset]);

    const [share, setShare] = useState<KpiShareRow[]>([]);
    const [trend, setTrend] = useState<KpiVelocityRow[]>([]);
    const [quality, setQuality] = useState<KpiQualityRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!battleId) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const [s, t, q] = await Promise.all([
                    kpiService.shareOfPreference(battleId, range),
                    kpiService.trendVelocity(battleId),
                    kpiService.engagementQuality(battleId, range),
                ]);

                if (cancelled) return;
                setShare(s);
                setTrend(t);
                setQuality(q);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Error cargando KPIs");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [battleId, range, refreshKey]);

    return { share, trend, quality, loading, error, range };
}

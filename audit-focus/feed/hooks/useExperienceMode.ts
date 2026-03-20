import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { signalService } from "../../signals/services/signalService";

export type ExperienceMode = "menu" | "versus" | "torneo" | "profundidad" | "actualidad" | "lugares";

export function useExperienceMode() {
    const location = useLocation();
    
    const requestedMode = location.state?.mode as ExperienceMode | undefined;
    const requestedBatch = (location.state as { nextBatch?: number })?.nextBatch;
    
    // Priority:
    // 1. Explicit mode requested via state
    // 2. Legacy batch parameter => implies versus
    // 3. Fallback => menu
    const initialMode: ExperienceMode = requestedMode 
        ? requestedMode 
        : (typeof requestedBatch === "number" ? "versus" : "menu");
    
    const [mode, setMode] = useState<ExperienceMode>(initialMode);
    
    const resetToMenu = () => setMode("menu");

    return {
        mode,
        setMode,
        requestedBatch,
        resetToMenu
    };
}

export function useExperienceStats() {
    const [hubTopNow, setHubTopNow] = useState<{
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_tournament: { slug: string; title: string; signals_24h: number } | null;
    } | null>(null);

    const [hubStats, setHubStats] = useState<{
        active_users_24h: number;
        signals_24h: number;
        depth_answers_24h: number;
        active_battles: number;
        entities_elo: number;
    } | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [top, stats] = await Promise.all([
                signalService.getHubTopNow24h().then(data => {
                    if (!data) return null;
                    const rawData = data as any;
                    return {
                        top_versus: rawData.top_versus || null,
                        top_tournament: rawData.top_torneo || rawData.top_tournament || null,
                    };
                }),
                signalService.getHubLiveStats24h(),
            ]);
            if (mounted) {
                setHubTopNow(top);
                setHubStats(stats);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return { hubTopNow, hubStats };
}

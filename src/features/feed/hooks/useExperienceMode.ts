import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { signalService } from "../../signals/services/signalService";

export type ExperienceMode = "menu" | "versus" | "torneo" | "profundidad" | "actualidad";

export function useExperienceMode() {
    const location = useLocation();
    
    // Parse location state for initial batch mode requests
    const requestedBatch = (location.state as { nextBatch?: number })?.nextBatch;
    const initialMode: ExperienceMode = typeof requestedBatch === "number" ? "versus" : "menu";
    
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
                signalService.getHubTopNow24h(),
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

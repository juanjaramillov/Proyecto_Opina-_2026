import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
    
    // Sync mode when navigating via state while component is already mounted
    useEffect(() => {
        if (requestedMode && requestedMode !== mode) {
            setMode(requestedMode);
        }
    }, [requestedMode, mode]);

    const resetToMenu = () => setMode("menu");

    return {
        mode,
        setMode,
        requestedBatch,
        resetToMenu
    };
}


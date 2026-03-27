import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { behaviorService } from "../../analytics/services/behaviorService";

export type ExperienceMode = "menu" | "versus" | "torneo" | "profundidad" | "actualidad" | "lugares" | "servicios";

export function useExperienceMode() {
    const location = useLocation();
    
    const requestedMode = location.state?.mode as ExperienceMode | undefined;
    const requestedBatch = (location.state as { nextBatch?: number })?.nextBatch;
    
    const initialMode: ExperienceMode = requestedMode 
        ? requestedMode 
        : (typeof requestedBatch === "number" ? "versus" : "menu");
    
    const [mode, setModeState] = useState<ExperienceMode>(initialMode);
    const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

    const setMode = (newMode: ExperienceMode) => {
        if (newMode !== mode && newMode !== "menu") {
            const moduleMap: Record<string, string> = {
                'versus': 'versus',
                'torneo': 'progressive',
                'profundidad': 'depth',
                'actualidad': 'news',
                'lugares': 'pulse',
                'servicios': 'services'
            };
            
            behaviorService.trackEvent({
                event_type: 'module_open',
                module_type: (moduleMap[newMode] || 'home') as any,
                screen_name: `hub_${newMode}`,
                status: 'completed'
            });
        }
        setIsManualOverride(true);
        setModeState(newMode);
    };
    
    useEffect(() => {
        if (requestedMode && requestedMode !== mode && !isManualOverride) {
            setModeState(requestedMode);
        }
    }, [requestedMode, mode, isManualOverride]);

    const resetToMenu = () => {
        setIsManualOverride(true);
        setModeState("menu");
    };

    return {
        mode,
        setMode,
        requestedBatch,
        resetToMenu
    };
}


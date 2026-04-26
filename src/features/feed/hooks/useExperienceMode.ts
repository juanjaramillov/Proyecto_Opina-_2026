import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyticsService, type BehaviorModuleType } from "../../analytics/services/analyticsService";

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
            // Nota: 'servicios' no tiene un `BehaviorModuleType` propio aún; se colapsa a 'home'
            // hasta que se agregue en el enum de analytics (ver DEBT_REGISTER).
            const moduleMap: Partial<Record<ExperienceMode, BehaviorModuleType>> = {
                'versus': 'versus',
                'torneo': 'progressive',
                'profundidad': 'depth',
                'actualidad': 'news',
                'lugares': 'pulse'
            };

            analyticsService.trackBehavior({
                event_type: 'module_open',
                module_type: moduleMap[newMode] ?? 'home',
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


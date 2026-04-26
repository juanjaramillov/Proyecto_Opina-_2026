import { useMemo } from 'react';
import { useSignalStore } from '../../../store/signalStore';

export type Archetype = "Espectador" | "Explorador" | "Analista" | "Visionario" | "Oráculo" | "Leyenda";

export interface PowerStats {
    accuracy: number; // Porcentaje de predicciones acertadas respecto a la mayoría
    streakDays: number; // Racha de días seguidos usando la app
    tribalWeight: number; // Peso algorítmico del voto
}

export interface IdentityProfile {
    level: number;
    archetype: Archetype;
    currentTotalSignals: number;
    nextLevelSignals: number;
    progressPercentage: number;
    powerStats: PowerStats;
    visuals: {
        icon: string;
        colorClass: string;
        bgClass: string;
    };
}

const LEVEL_THRESHOLDS = [
    { level: 1, name: "Espectador", max: 50, icon: "visibility", colorClass: "text-slate-500", bgClass: "bg-slate-100" },
    { level: 2, name: "Explorador", max: 250, icon: "explore", colorClass: "text-brand-500", bgClass: "bg-brand-50" },
    { level: 3, name: "Analista", max: 1000, icon: "query_stats", colorClass: "text-brand-500", bgClass: "bg-brand-50" },
    { level: 4, name: "Visionario", max: 5000, icon: "diamond", colorClass: "text-accent", bgClass: "bg-accent/10" },
    { level: 5, name: "Oráculo", max: 25000, icon: "psychology", colorClass: "text-warning-500", bgClass: "bg-warning-50" },
    { level: 6, name: "Leyenda", max: Infinity, icon: "local_fire_department", colorClass: "text-danger-500", bgClass: "bg-danger-50" }
];

export function useIdentityEngine(): IdentityProfile {
    const { signals } = useSignalStore();

    // Stats Mocks (The backend should provide accuracy and streak later, 
    // but the level calculation is real based on 'signals' sum).
    const accuracy = 0.76; 
    const streakDays = 4;
    
    // Algoritmo de "Peso ELO / Tribal Weight" (A más nivel y aciertos, el voto pesa más)
    const baseWeight = 1.0;
    const accuracyBonus = accuracy > 0.6 ? (accuracy - 0.6) * 2 : 0; // +0.32 max
    
    const identity = useMemo(() => {
        let l = 1;
        let pName = "Espectador" as Archetype;
        let nxtLimit = 50;
        let prevLimit = 0;
        let icon = "visibility";
        let colorClass = "text-slate-500";
        let bgClass = "bg-slate-100";

        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (signals <= LEVEL_THRESHOLDS[i].max) {
                l = LEVEL_THRESHOLDS[i].level;
                pName = LEVEL_THRESHOLDS[i].name as Archetype;
                nxtLimit = LEVEL_THRESHOLDS[i].max;
                prevLimit = i > 0 ? LEVEL_THRESHOLDS[i - 1].max : 0;
                icon = LEVEL_THRESHOLDS[i].icon;
                colorClass = LEVEL_THRESHOLDS[i].colorClass;
                bgClass = LEVEL_THRESHOLDS[i].bgClass;
                break;
            }
        }

        // Calcula el progreso EXACTO solo del escalón en el que está
        const signalsInCurrentLevel = Math.max(0, signals - prevLimit);
        const levelRange = nxtLimit - prevLimit;
        const progressPercentage = l === 6 ? 100 : Math.min(100, Math.max(0, (signalsInCurrentLevel / levelRange) * 100));

        const tribalWeight = Number((baseWeight + accuracyBonus + (l * 0.1)).toFixed(2));

        return {
            level: l,
            archetype: pName,
            currentTotalSignals: signals,
            nextLevelSignals: nxtLimit,
            progressPercentage,
            powerStats: {
                accuracy,
                streakDays,
                tribalWeight
            },
            visuals: {
                icon,
                colorClass,
                bgClass
            }
        };
    }, [signals, accuracy, streakDays, accuracyBonus]);

    return identity;
}

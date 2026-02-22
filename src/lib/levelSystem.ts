
export interface LevelDefinition {
    level: number;
    minSignals: number;
    weight: number;
}

export const LEVELS: LevelDefinition[] = [
    { level: 1, minSignals: 0, weight: 1.0 },
    { level: 2, minSignals: 10, weight: 1.2 },
    { level: 3, minSignals: 25, weight: 1.5 },
    { level: 4, minSignals: 50, weight: 2.0 },
];

export function getUserLevel(totalSignals: number): LevelDefinition {
    return [...LEVELS]
        .reverse()
        .find(l => totalSignals >= l.minSignals) || LEVELS[0];
}

export function getNextLevel(totalSignals: number): LevelDefinition | null {
    return LEVELS.find(l => totalSignals < l.minSignals) || null;
}

import { useEffect, useState } from 'react';
import { useSignalStore } from '../../../store/signalStore';

export type HubState = 'ACTIVE' | 'COOLDOWN';

export function useHubSession() {
    const { sessionSignals, sessionLimit, cooldownUntil, checkCooldown, consumeSessionSignal } = useSignalStore();
    const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

    useEffect(() => {
        // Enforce cooldown checks strictly periodically
        const interval = setInterval(() => {
            checkCooldown();
            
            if (cooldownUntil) {
                const remaining = cooldownUntil - Date.now();
                if (remaining > 0) {
                    setTimeLeftMs(remaining);
                } else {
                    setTimeLeftMs(null);
                }
            } else {
                setTimeLeftMs(null);
            }
        }, 1000);

        // Run once immediately
        checkCooldown();
        if (cooldownUntil) {
            const remaining = cooldownUntil - Date.now();
            if (remaining > 0) setTimeLeftMs(remaining);
        }

        return () => clearInterval(interval);
    }, [cooldownUntil, checkCooldown]);

    // Format the time left for display (e.g. 02:59:10)
    const formattedTimeLeft = () => {
        if (!timeLeftMs) return null;
        const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage (0 to 100)
    const sessionProgressPercentage = Math.min(100, (sessionSignals / sessionLimit) * 100);

    // Lógica Dinámica: 
    // Opción B (Fase Lanzamiento V15): Acceso ilimitado para captura de señales.
    // Ignoramos el daily limit del perfil y el cooldown interno.
    const isUnlimited = true; 
    
    const currentState: HubState = 'ACTIVE';

    return {
        currentState,
        sessionSignals,
        sessionLimit,
        sessionProgressPercentage,
        cooldownUntil,
        timeLeftMs,
        formattedTimeLeft: formattedTimeLeft(),
        isUnlimited,
        consumeSessionSignal
    };
}

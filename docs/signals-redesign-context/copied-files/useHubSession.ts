// Original path: src/features/feed/hooks/useHubSession.ts

import { useEffect, useState } from 'react';
import { useSignalStore } from '../../../store/signalStore';
import { useAuth } from '../../auth';

export type HubState = 'ACTIVE' | 'COOLDOWN';

export function useHubSession() {
    const { sessionSignals, sessionLimit, cooldownUntil, checkCooldown, consumeSessionSignal } = useSignalStore();
    const { profile } = useAuth();
    
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

    // Dynamic Logic: 
    // If admin or unlimited user, always active
    const isUnlimited = profile?.role === 'admin' || profile?.signalsDailyLimit === -1;
    
    let currentState: HubState = 'ACTIVE';
    if (!isUnlimited && cooldownUntil && Date.now() < cooldownUntil) {
        currentState = 'COOLDOWN';
    }

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

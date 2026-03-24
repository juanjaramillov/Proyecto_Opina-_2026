// Original path: src/hooks/useActiveBattles.ts

import { useState, useEffect } from 'react';
import { ActiveBattle, signalService } from '../features/signals/services/signalService';
import { logger } from '../lib/logger';

export function useActiveBattles() {
    const [battles, setBattles] = useState<ActiveBattle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchBattles = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch real data from Supabase
                const data = await signalService.getActiveBattles();

                if (mounted) {
                    if (data && data.length > 0) {
                        setBattles(data);
                    } else {
                        logger.warn("No active battles found in DB.");
                        setBattles([]);
                    }
                }
            } catch (err: unknown) {
                logger.error("Failed to load battles:", err);
                if (mounted) setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchBattles();

        return () => { mounted = false; };
    }, []);

    return { battles, loading, error };
}

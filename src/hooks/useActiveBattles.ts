import { useState, useEffect } from 'react';
import { ActiveBattle, signalService } from '../features/signals/services/signalService';
import { logger } from '../lib/logger';

export function useActiveBattles() {
    const [battles, setBattles] = useState<ActiveBattle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchBattles = async () => {
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
            } catch (err) {
                logger.error("Failed to load battles:", err);
                if (mounted) setBattles([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchBattles();

        return () => { mounted = false; };
    }, []);

    return { battles, loading };
}

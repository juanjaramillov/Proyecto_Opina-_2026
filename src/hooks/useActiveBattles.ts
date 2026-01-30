import { useState, useEffect } from 'react';
import { signalService, type ActiveBattle } from '../services/signalService';

export function useActiveBattles() {
    const [battles, setBattles] = useState<ActiveBattle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await signalService.getActiveBattles();
                if (mounted) {
                    setBattles(data);
                    setLoading(false);
                }
            } catch (err: any) {
                if (mounted) {
                    console.error("Error loading active battles:", err);
                    setError(err.message ?? "Error loading battles");
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return { battles, loading, error };
}

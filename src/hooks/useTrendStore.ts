import { useState, useEffect } from 'react';
import { loadTrends, Trend, getTopTrends } from '../state/trendStore';

export function useTrendStore() {
    const [trends, setTrends] = useState<Trend[]>(loadTrends());
    const [topTrends, setTopTrends] = useState<Trend[]>(getTopTrends());

    useEffect(() => {
        const handleUpdate = () => {
            const all = loadTrends();
            setTrends(all);
            setTopTrends(all.slice(0, 3));
        };

        window.addEventListener('opina:trend_update', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('opina:trend_update', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    return { trends, topTrends };
}

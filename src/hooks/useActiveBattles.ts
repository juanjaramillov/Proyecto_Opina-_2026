import { useQuery } from '@tanstack/react-query';
import { ActiveBattle, signalService } from '../features/signals/services/signalService';
import { logger } from '../lib/logger';

/**
 * FASE 2 React Query — primer hook migrado (2026-04-26).
 *
 * Antes: useState + useEffect + setLoading + setError (37 líneas).
 * Ahora: useQuery con cache compartido. La firma pública
 * `{ battles, loading, error }` se mantiene idéntica para no tocar
 * `SignalsHub.tsx` ni futuros consumidores.
 *
 * Defaults heredados de `queryClient`: staleTime 5min, gcTime 10min,
 * retry 1, refetchOnWindowFocus false. Volver al Hub dentro de la
 * ventana de 5min ya no dispara fetch — viene del cache.
 */
export function useActiveBattles() {
    const { data, isLoading, error } = useQuery<ActiveBattle[], Error>({
        queryKey: ['signals', 'active-battles'],
        queryFn: async () => {
            const list = await signalService.getActiveBattles();
            if (!list || list.length === 0) {
                logger.warn('No active battles found in DB.');
                return [];
            }
            return list;
        },
    });

    return {
        battles: data ?? [],
        loading: isLoading,
        error: error ?? null,
    };
}

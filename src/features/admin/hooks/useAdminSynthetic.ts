import { useMemo, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    adminSyntheticService,
    SyntheticBatchSummary,
} from '../services/adminSyntheticService';

/**
 * Hook para el panel admin de datos sintéticos.
 *
 * Mismo patrón que useAdminInvites:
 *   - useQuery para la lista de batches.
 *   - Mutations imperativas que invocan el service y luego invalidan la query.
 *
 * Las RPCs son admin-only por sí mismas (validan via is_admin_user en el server),
 * así que el hook no replica esa validación — confía en el server.
 */

const QUERY_KEY = ['admin', 'synthetic', 'batches'] as const;

export function useAdminSynthetic() {
    const qc = useQueryClient();

    const [mutationLoading, setMutationLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const batchesQuery = useQuery<SyntheticBatchSummary[], Error>({
        queryKey: QUERY_KEY,
        queryFn: () => adminSyntheticService.listBatches(),
    });

    const batches: SyntheticBatchSummary[] = batchesQuery.data ?? [];

    const loading = batchesQuery.isLoading || mutationLoading;

    // Stats agregadas para los KPIs de la página
    const stats = useMemo(() => {
        const live = batches.filter((b) => !b.is_deleted);
        const totalUsersAlive = live.reduce((acc, b) => acc + (b.user_count_alive ?? 0), 0);
        const totalSignalsAlive = live.reduce((acc, b) => acc + (b.signal_count_alive ?? 0), 0);
        const totalBatchesAlive = live.length;
        const totalBatchesAll = batches.length;

        return {
            totalUsersAlive,
            totalSignalsAlive,
            totalBatchesAlive,
            totalBatchesAll,
        };
    }, [batches]);

    const refetch = useCallback(async () => {
        setErrorMsg(null);
        await batchesQuery.refetch();
    }, [batchesQuery]);

    const handleCreateBatch = useCallback(
        async (label: string, userCount: number, notes?: string | null): Promise<boolean> => {
            setErrorMsg(null);
            setMutationLoading(true);
            try {
                await adminSyntheticService.createBatch(label, userCount, notes);
                await qc.invalidateQueries({ queryKey: QUERY_KEY });
                toast.success(`Batch "${label}" creado con ${userCount} usuarios.`);
                return true;
            } catch (err: unknown) {
                const msg = (err as Error)?.message || 'Error creando batch sintético';
                setErrorMsg(msg);
                toast.error(`No se pudo crear el batch: ${msg}`);
                return false;
            } finally {
                setMutationLoading(false);
            }
        },
        [qc]
    );

    const handleDeleteBatch = useCallback(
        async (label: string): Promise<boolean> => {
            setErrorMsg(null);
            setMutationLoading(true);
            try {
                const res = await adminSyntheticService.deleteBatch(label);
                await qc.invalidateQueries({ queryKey: QUERY_KEY });
                toast.success(
                    `Batch "${label}" eliminado: ${res.users_deleted} usuarios y ${res.signals_deleted} señales borrados.`
                );
                return true;
            } catch (err: unknown) {
                const msg = (err as Error)?.message || 'Error eliminando batch';
                setErrorMsg(msg);
                toast.error(`No se pudo eliminar el batch: ${msg}`);
                return false;
            } finally {
                setMutationLoading(false);
            }
        },
        [qc]
    );

    const handleDeleteAllSynthetic = useCallback(async (): Promise<boolean> => {
        setErrorMsg(null);
        setMutationLoading(true);
        try {
            const res = await adminSyntheticService.deleteAllSynthetic();
            await qc.invalidateQueries({ queryKey: QUERY_KEY });
            toast.success(
                `Limpieza total: ${res.users_deleted} usuarios, ${res.signals_deleted} señales, ${res.batches_marked} batches archivados.`
            );
            return true;
        } catch (err: unknown) {
            const msg = (err as Error)?.message || 'Error en limpieza total';
            setErrorMsg(msg);
            toast.error(`No se pudo ejecutar limpieza total: ${msg}`);
            return false;
        } finally {
            setMutationLoading(false);
        }
    }, [qc]);

    return {
        batches,
        loading,
        errorMsg,
        stats,
        refetch,
        handleCreateBatch,
        handleDeleteBatch,
        handleDeleteAllSynthetic,
    };
}

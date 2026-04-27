import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAntifraudService, AntifraudFlagRow, DeviceSummary } from '../services/adminAntifraudService';
import MultiAccountDevicesPanel from '../components/MultiAccountDevicesPanel';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import PromptDialog from '../../../components/ui/PromptDialog';

/**
 * FASE 3D React Query (2026-04-26): listado de flags como useQuery; el summary
 * de cada device se cachea con queryKey ['admin','antifraud','device-summary',hash]
 * y solo arranca cuando el row está expandido (`enabled: !!expandedDeviceHash`),
 * así no metemos la fetch a un useEffect imperativo.
 */
const AdminAntifraud: React.FC = () => {
    const qc = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [expandedDeviceHash, setExpandedDeviceHash] = useState<string | null>(null);
    const [pendingBan, setPendingBan] = useState<{ deviceHash: string } | null>(null);
    const [pendingUnban, setPendingUnban] = useState<{ deviceHash: string } | null>(null);
    const [mutationLoading, setMutationLoading] = useState(false);

    const flagsQuery = useQuery<AntifraudFlagRow[], Error>({
        queryKey: ['admin', 'antifraud', 'flags'],
        queryFn: () => adminAntifraudService.listFlags(),
    });

    const flags = flagsQuery.data ?? [];
    const loading = flagsQuery.isLoading || mutationLoading;

    // Sync error visible con el de la query (consumidores leen `error` plano).
    useEffect(() => {
        const err = flagsQuery.error?.message;
        if (err) setError(err);
    }, [flagsQuery.error]);

    // Summary del device expandido — la query arranca solo cuando hay hash.
    const summaryQuery = useQuery<DeviceSummary, Error>({
        queryKey: ['admin', 'antifraud', 'device-summary', expandedDeviceHash],
        queryFn: () => adminAntifraudService.getDeviceSummary(expandedDeviceHash as string),
        enabled: !!expandedDeviceHash,
    });

    // Map device-hash → summary, alimentado desde la cache.
    const summaries: Record<string, DeviceSummary> = expandedDeviceHash && summaryQuery.data
        ? { [expandedDeviceHash]: summaryQuery.data }
        : {};
    const loadingSummary: Record<string, boolean> = expandedDeviceHash
        ? { [expandedDeviceHash]: summaryQuery.isLoading }
        : {};

    const fetchFlags = async () => {
        setError(null);
        await flagsQuery.refetch();
    };

    const handleBanToggle = (deviceHash: string, currentBanned: boolean) => {
        if (currentBanned) {
            // Unban → ConfirmDialog
            setPendingUnban({ deviceHash });
        } else {
            // Ban → PromptDialog (motivo opcional)
            setPendingBan({ deviceHash });
        }
    };

    const executeBan = async (reason: string) => {
        if (!pendingBan) return;
        const { deviceHash } = pendingBan;
        setPendingBan(null);
        await applyBan(deviceHash, true, reason);
    };

    const executeUnban = async () => {
        if (!pendingUnban) return;
        const { deviceHash } = pendingUnban;
        setPendingUnban(null);
        await applyBan(deviceHash, false, '');
    };

    const applyBan = async (deviceHash: string, isBanning: boolean, reason: string) => {
        try {
            setMutationLoading(true);
            setError(null);
            const result = await adminAntifraudService.setBan(deviceHash, isBanning, reason);

            if (!result.ok) {
                throw new Error(result.error || 'Error al actualizar el ban');
            }

            toast.success(isBanning ? 'Dispositivo baneado' : 'Ban removido');
            await qc.invalidateQueries({ queryKey: ['admin', 'antifraud', 'flags'] });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setMutationLoading(false);
        }
    };

    const toggleExpand = async (id: string, deviceHash: string) => {
        if (expandedRowId === id) {
            setExpandedRowId(null);
            setExpandedDeviceHash(null);
            return;
        }

        setExpandedRowId(id);
        // Setear el hash dispara la query del summary (enabled).
        setExpandedDeviceHash(deviceHash);
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger-100 text-danger-800">Critical</span>;
            case 'warn':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/20 text-warning">Warn</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">{severity}</span>;
        }
    };

    const getStatusBadge = (active: boolean, banned: boolean) => {
        if (banned) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger-100 text-danger-800">Banned</span>;
        }
        if (active) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-100 text-accent-800">Active Warning</span>;
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Inactive</span>;
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Control Antifraude</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Detección de comportamiento anómalo y control de bans por device hash.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={fetchFlags}
                        disabled={loading}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-xl shadow-sm text-white bg-brand hover:bg-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/50 disabled:opacity-50 transition w-full sm:w-auto"
                    >
                        {loading ? 'Refrescando...' : 'Refrescar Lista'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-danger-50 border-l-4 border-danger-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="material-symbols-outlined text-danger-400">error</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-danger-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device Hash</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Flag Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Updated</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {flags.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                        No se encontraron registros de comportamiento anómalo.
                                    </td>
                                </tr>
                            )}
                            {flags.map((flag) => (
                                <React.Fragment key={flag.id}>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 truncate max-w-[150px]" title={flag.device_hash}>
                                            {flag.device_hash.substring(0, 12)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {flag.flag_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getSeverityBadge(flag.severity)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(flag.is_active, flag.banned)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" title={flag.updated_at}>
                                            {new Date(flag.updated_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => toggleExpand(flag.id, flag.device_hash)}
                                                    className="text-brand hover:text-brand transition-colors bg-brand/10 hover:bg-brand/20 px-2.5 py-1 rounded-md"
                                                >
                                                    {expandedRowId === flag.id ? 'Ocultar' : 'Detalles'}
                                                </button>
                                                <button
                                                    onClick={() => handleBanToggle(flag.device_hash, flag.banned)}
                                                    disabled={loading}
                                                    className={`px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${flag.banned
                                                        ? 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500'
                                                        : 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500'
                                                        }`}
                                                >
                                                    {flag.banned ? 'Unban' : 'Ban'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Row for Details */}
                                    <AnimatePresence>
                                        {expandedRowId === flag.id && (
                                            <motion.tr
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td colSpan={6} className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* RAW Details */}
                                                        <div className="text-sm text-slate-800 space-y-2">
                                                            <h4 className="font-semibold text-slate-900">Detalles de Detección</h4>
                                                            <pre className="bg-slate-800 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs font-mono shadow-inner">
                                                                {JSON.stringify(flag.details, null, 2)}
                                                            </pre>
                                                            {flag.banned && flag.banned_reason && (
                                                                <div className="mt-2 text-danger-700 bg-danger-50 p-2 rounded border border-danger-100">
                                                                    <span className="font-semibold">Motivo del Ban:</span> {flag.banned_reason}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-slate-500 mt-2">
                                                                Full Device Hash: <code className="bg-slate-200 px-1 py-0.5 rounded selectable">{flag.device_hash}</code>
                                                            </div>
                                                        </div>

                                                        {/* Device Activity Summary */}
                                                        <div className="text-sm text-slate-800 space-y-2">
                                                            <h4 className="font-semibold text-slate-900">Actividad del Dispositivo</h4>

                                                            {loadingSummary[flag.device_hash] ? (
                                                                <div className="p-4 flex items-center justify-center text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                    Cargando métricas...
                                                                </div>
                                                            ) : summaries[flag.device_hash] ? (
                                                                summaries[flag.device_hash].ok ? (
                                                                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-2">
                                                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                                            <span className="text-slate-500">Última Señal:</span>
                                                                            <span className="font-medium">{summaries[flag.device_hash].last_signal_at ? new Date(summaries[flag.device_hash].last_signal_at as string).toLocaleString() : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                                            <span className="text-slate-500">Señales (últimas 24h):</span>
                                                                            <span className="font-medium text-brand">{summaries[flag.device_hash].signals_24h}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                                            <span className="text-slate-500">Señales vel. (últimos 10m):</span>
                                                                            <span className={`font-medium ${summaries[flag.device_hash].signals_10m! > 20 ? 'text-danger-600' : 'text-slate-700'}`}>{summaries[flag.device_hash].signals_10m}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                                            <span className="text-slate-500">Usuarios Distintos (24h):</span>
                                                                            <span className={`font-medium ${summaries[flag.device_hash].distinct_users_24h! > 2 ? 'text-brand-600' : 'text-slate-700'}`}>{summaries[flag.device_hash].distinct_users_24h}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1">
                                                                            <span className="text-slate-500">Batallas Participadas (24h):</span>
                                                                            <span className="font-medium">{summaries[flag.device_hash].distinct_battles_24h}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-3 bg-danger-50 text-danger-600 text-xs rounded border border-danger-100">
                                                                        No se pudo cargar: {summaries[flag.device_hash].error}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="p-3 text-slate-400 text-xs">Sin información de métricas</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* #9 Media Drimo — multi-cuenta detectado en user_sessions */}
            <MultiAccountDevicesPanel />

            <PromptDialog
                open={!!pendingBan}
                title="Banear dispositivo"
                message="Vas a banear este device hash. Esto bloquea futuras señales del dispositivo. Podés dejar un motivo opcional para auditoría."
                inputLabel="Motivo (opcional)"
                placeholder="Ej: Multi-cuenta detectado, abuso de captcha, etc."
                confirmLabel="Banear"
                cancelLabel="Cancelar"
                danger
                onConfirm={executeBan}
                onCancel={() => setPendingBan(null)}
            />

            <ConfirmDialog
                open={!!pendingUnban}
                title="Quitar ban del dispositivo"
                message="¿Confirmás quitar el ban a este dispositivo? Volverá a poder enviar señales normalmente."
                confirmLabel="Quitar ban"
                cancelLabel="Cancelar"
                onConfirm={executeUnban}
                onCancel={() => setPendingUnban(null)}
            />
        </div>
    );
};

export default AdminAntifraud;

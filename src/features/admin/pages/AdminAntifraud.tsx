import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAntifraudService, AntifraudFlagRow, DeviceSummary } from '../services/adminAntifraudService';

const AdminAntifraud: React.FC = () => {
    const [flags, setFlags] = useState<AntifraudFlagRow[]>([]);
    const [summaries, setSummaries] = useState<Record<string, DeviceSummary>>({});
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const fetchFlags = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminAntifraudService.listFlags();
            setFlags(data);
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const handleBanToggle = async (deviceHash: string, currentBanned: boolean) => {
        const isBanning = !currentBanned;
        let reason = '';

        if (isBanning) {
            const input = window.prompt("Motivo del ban (opcional):");
            if (input === null) return; // Cancelled
            reason = input.trim();
        } else {
            const confirmUnban = window.confirm("¿Estás seguro de quitar el ban a este dispositivo?");
            if (!confirmUnban) return; // Cancelled
        }

        try {
            setLoading(true);
            setError(null);
            const result = await adminAntifraudService.setBan(deviceHash, isBanning, reason);

            if (!result.ok) {
                throw new Error(result.error || 'Error al actualizar el ban');
            }

            await fetchFlags(); // Refresh list to get updated row from DB
        } catch (err: any) {
            setError(err.message || String(err));
            setLoading(false); // only set to false on error, fetchFlags handles success
        }
    };

    const toggleExpand = async (id: string, deviceHash: string) => {
        if (expandedRowId === id) {
            setExpandedRowId(null);
            return;
        }

        setExpandedRowId(id);

        // Fetch summary si no se tiene
        if (!summaries[deviceHash]) {
            try {
                setLoadingSummary(prev => ({ ...prev, [deviceHash]: true }));
                const summary = await adminAntifraudService.getDeviceSummary(deviceHash);
                setSummaries(prev => ({ ...prev, [deviceHash]: summary }));
            } catch (err: any) {
                console.error("Failed to fetch summary", err);
            } finally {
                setLoadingSummary(prev => ({ ...prev, [deviceHash]: false }));
            }
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Critical</span>;
            case 'warn':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Warn</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{severity}</span>;
        }
    };

    const getStatusBadge = (active: boolean, banned: boolean) => {
        if (banned) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Banned</span>;
        }
        if (active) {
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active Warning</span>;
        }
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
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
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition w-full sm:w-auto"
                    >
                        {loading ? 'Refrescando...' : 'Refrescar Lista'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="material-symbols-outlined text-red-400">error</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
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
                                                    className="text-primary-600 hover:text-primary-900 transition-colors bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-md"
                                                >
                                                    {expandedRowId === flag.id ? 'Ocultar' : 'Detalles'}
                                                </button>
                                                <button
                                                    onClick={() => handleBanToggle(flag.device_hash, flag.banned)}
                                                    disabled={loading}
                                                    className={`px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${flag.banned
                                                        ? 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500'
                                                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
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
                                                                <div className="mt-2 text-red-700 bg-red-50 p-2 rounded border border-red-100">
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
                                                                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
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
                                                                            <span className="font-medium text-primary-600">{summaries[flag.device_hash].signals_24h}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                                            <span className="text-slate-500">Señales vel. (últimos 10m):</span>
                                                                            <span className={`font-medium ${summaries[flag.device_hash].signals_10m! > 20 ? 'text-red-600' : 'text-slate-700'}`}>{summaries[flag.device_hash].signals_10m}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                                                                            <span className="text-slate-500">Usuarios Distintos (24h):</span>
                                                                            <span className={`font-medium ${summaries[flag.device_hash].distinct_users_24h! > 2 ? 'text-amber-600' : 'text-slate-700'}`}>{summaries[flag.device_hash].distinct_users_24h}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center py-1">
                                                                            <span className="text-slate-500">Batallas Votadas (24h):</span>
                                                                            <span className="font-medium">{summaries[flag.device_hash].distinct_battles_24h}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
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
        </div>
    );
};

export default AdminAntifraud;

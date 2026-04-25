import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    adminAntifraudService,
    MultiAccountDeviceRow,
    DeviceUserRow,
} from '../services/adminAntifraudService';
import { logger } from '../../../lib/logger';

/**
 * Panel "Multi-cuenta" — #9 Media Drimo.
 *
 * Lista los device_hashes (de user_sessions) con N+ usuarios distintos
 * en los últimos N días → señal de abuso multi-cuenta.
 *
 * Clickeás un row y expande con la lista de los usuarios asociados.
 *
 * Se diferencia del panel de "Antifraud Flags" existente en que ESTE
 * cruza login (user_sessions) y aquel cruza voto (signal_events).
 * Los dos hashes pueden ser distintos en transición (signals usa el
 * legacy con randomUUID, sessions usa el determinístico nuevo).
 */
const MultiAccountDevicesPanel: React.FC = () => {
    const [rows, setRows] = useState<MultiAccountDeviceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedHash, setExpandedHash] = useState<string | null>(null);
    const [users, setUsers] = useState<Record<string, DeviceUserRow[]>>({});
    const [loadingUsers, setLoadingUsers] = useState<Record<string, boolean>>({});
    const [minUsers, setMinUsers] = useState<number>(3);
    const [sinceDays, setSinceDays] = useState<number>(30);

    const fetchRows = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminAntifraudService.findMultiAccountDevices(minUsers, sinceDays);
            setRows(data);
            // Cerrar expansión si el hash ya no está en la lista nueva
            if (expandedHash && !data.find(r => r.device_hash === expandedHash)) {
                setExpandedHash(null);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleExpand = async (deviceHash: string) => {
        if (expandedHash === deviceHash) {
            setExpandedHash(null);
            return;
        }
        setExpandedHash(deviceHash);

        if (!users[deviceHash]) {
            try {
                setLoadingUsers(prev => ({ ...prev, [deviceHash]: true }));
                const data = await adminAntifraudService.listDeviceUsers(deviceHash, sinceDays);
                setUsers(prev => ({ ...prev, [deviceHash]: data }));
            } catch (err: unknown) {
                logger.error('listDeviceUsers falló', {
                    domain: 'admin_actions', origin: 'MultiAccountDevicesPanel', action: 'list_users'
                }, err);
            } finally {
                setLoadingUsers(prev => ({ ...prev, [deviceHash]: false }));
            }
        }
    };

    return (
        <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900">Devices con multi-cuenta (login)</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Devices desde los que se loguearon N+ usuarios distintos. Basado en
                        <code className="mx-1 px-1 py-0.5 rounded bg-slate-100 text-[11px]">user_sessions.device_hash</code>
                        — capa de #9 Media (Drimo).
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                    <label className="text-xs text-slate-600 flex flex-col gap-1">
                        Min. usuarios
                        <input
                            type="number"
                            min={2}
                            max={50}
                            value={minUsers}
                            onChange={e => setMinUsers(Math.max(2, Number(e.target.value) || 2))}
                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                        />
                    </label>
                    <label className="text-xs text-slate-600 flex flex-col gap-1">
                        Últimos N días
                        <input
                            type="number"
                            min={1}
                            max={365}
                            value={sinceDays}
                            onChange={e => setSinceDays(Math.max(1, Number(e.target.value) || 1))}
                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                        />
                    </label>
                    <button
                        onClick={fetchRows}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-md bg-brand text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Buscando...' : 'Aplicar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-6 py-3 bg-danger-50 border-l-4 border-danger-400 text-sm text-danger-700">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device Hash</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuarios distintos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sesiones</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Última actividad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {rows.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                    Sin devices con multi-cuenta detectada en este rango.
                                </td>
                            </tr>
                        )}
                        {rows.map(row => (
                            <React.Fragment key={row.device_hash}>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 truncate max-w-[160px]" title={row.device_hash}>
                                        {row.device_hash.substring(0, 12)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-bold ${row.distinct_users >= 5 ? 'text-danger-600' : 'text-brand-600'}`}>
                                            {row.distinct_users}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        {row.total_sessions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(row.last_seen_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {row.has_active ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-100 text-accent-800">Activa ahora</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Sin sesión activa</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => toggleExpand(row.device_hash)}
                                            className="text-brand bg-brand/10 hover:bg-brand/20 px-2.5 py-1 rounded-md font-medium"
                                        >
                                            {expandedHash === row.device_hash ? 'Ocultar' : 'Ver usuarios'}
                                        </button>
                                    </td>
                                </tr>

                                <AnimatePresence>
                                    {expandedHash === row.device_hash && (
                                        <motion.tr
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <td colSpan={6} className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                                <div className="text-xs text-slate-500 mb-2">
                                                    Hash completo: <code className="bg-slate-200 px-1 py-0.5 rounded selectable">{row.device_hash}</code>
                                                </div>
                                                {loadingUsers[row.device_hash] ? (
                                                    <div className="p-4 text-slate-500 flex items-center gap-2">
                                                        <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                                                        Cargando usuarios...
                                                    </div>
                                                ) : users[row.device_hash]?.length ? (
                                                    <table className="min-w-full text-xs">
                                                        <thead className="text-slate-500 uppercase tracking-wider">
                                                            <tr>
                                                                <th className="py-2 text-left">Email</th>
                                                                <th className="py-2 text-left">User ID</th>
                                                                <th className="py-2 text-left">Sesiones</th>
                                                                <th className="py-2 text-left">Primera</th>
                                                                <th className="py-2 text-left">Última</th>
                                                                <th className="py-2 text-left">Activa</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-200">
                                                            {users[row.device_hash].map(u => (
                                                                <tr key={u.user_id}>
                                                                    <td className="py-2 pr-3 text-slate-800">{u.user_email ?? '-'}</td>
                                                                    <td className="py-2 pr-3 font-mono text-slate-500">{u.user_id.substring(0, 8)}...</td>
                                                                    <td className="py-2 pr-3 text-slate-700">{u.sessions_count}</td>
                                                                    <td className="py-2 pr-3 text-slate-500">{new Date(u.first_seen_at).toLocaleString()}</td>
                                                                    <td className="py-2 pr-3 text-slate-500">{new Date(u.last_seen_at).toLocaleString()}</td>
                                                                    <td className="py-2 pr-3">
                                                                        {u.has_active ? (
                                                                            <span className="text-accent-700">Sí</span>
                                                                        ) : (
                                                                            <span className="text-slate-400">No</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-3 text-slate-400 text-xs">Sin datos.</div>
                                                )}
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
    );
};

export default MultiAccountDevicesPanel;

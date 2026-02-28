import { useState, useEffect } from 'react';
import { adminHealthService, HealthCheckResult } from '../services/adminHealthService';
import { adminConfigService } from '../services/adminConfigService';
import { supabase } from '../../../supabase/client';

type TestItem = {
    id: string;
    label: string;
    action: () => Promise<HealthCheckResult>;
};

export default function AdminHealth() {
    const [running, setRunning] = useState(false);
    const [dryRunSignal, setDryRunSignal] = useState(true);
    const [results, setResults] = useState<Record<string, HealthCheckResult | 'pending' | 'running'>>({});

    // Config State
    const [analyticsMode, setAnalyticsMode] = useState<'all' | 'clean' | null>(null);
    const [updatingMode, setUpdatingMode] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);

    const tests: TestItem[] = [
        { id: 'session', label: '1. Auth Session Activa', action: adminHealthService.checkSession },
        { id: 'admin_invites', label: '2. RPC: admin_list_invites', action: adminHealthService.checkListInvites },
        { id: 'admin_redemptions', label: '3. RPC: admin_list_invite_redemptions', action: adminHealthService.checkListRedemptions },
        { id: 'admin_events', label: '4. RPC: admin_list_app_events', action: adminHealthService.checkListAppEvents },
        { id: 'signal_smoke', label: '5. RPC: insert_signal_event (Smoke)', action: () => adminHealthService.checkSignalSmoke(dryRunSignal) },
    ];

    const handleRunChecks = async () => {
        setRunning(true);
        // Marcamos todo como running de forma inicial
        const initialStates = tests.reduce((acc, test) => {
            acc[test.id] = 'running';
            return acc;
        }, {} as typeof results);
        setResults(initialStates);

        // Ejecutar paralelizado
        try {
            await Promise.all(
                tests.map(async (test) => {
                    const result = await test.action();
                    setResults((prev) => ({ ...prev, [test.id]: result }));
                })
            );
        } catch (error) {
            console.error(error);
        } finally {
            setRunning(false);
        }
    };

    // Load Initial Config
    useEffect(() => {
        let mounted = true;
        const loadConfig = async () => {
            try {
                const mode = await adminConfigService.getAnalyticsMode();
                if (mounted) setAnalyticsMode(mode);
            } catch (err: any) {
                if (mounted) setConfigError('Error cargando configuración: ' + (err.message || String(err)));
            }
        };
        loadConfig();
        return () => { mounted = false; };
    }, []);

    const handleSetMode = async (mode: 'all' | 'clean') => {
        try {
            setUpdatingMode(true);
            setConfigError(null);

            const res = await adminConfigService.setAnalyticsMode(mode);
            if (!res.ok) throw new Error(res.error || 'Error desconocido');

            setAnalyticsMode(res.mode!);

            // Opcional: Refrescar snapshots ahora
            try {
                await supabase.rpc('refresh_public_rank_snapshots_3h' as any);
                // Podrías agregar un toast success aquí
            } catch (refreshErr) {
                console.warn("Snapshots no pudieron refrescarse inmediatamente", refreshErr);
                // Fallo silencioso, el cron lo hará luego
            }

        } catch (err: any) {
            setConfigError(err.message || String(err));
        } finally {
            setUpdatingMode(false);
        }
    };

    return (
        <div className="container-ws section-y space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-6 bg-slate-800 rounded-3xl shadow-xl text-white">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-emerald-400">monitor_heart</span>
                        Health Checks
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Diagnóstico de servicios core y RPCs (B2B Admin).</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!dryRunSignal}
                            onChange={(e) => setDryRunSignal(!e.target.checked)}
                            disabled={running}
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500 ${!dryRunSignal ? 'bg-rose-500' : 'bg-slate-200 group-hover:bg-slate-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${!dryRunSignal ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Emitir señal real de prueba</span>
                        <span className="text-xs text-slate-500 font-medium">Testeará el write pipeline si está encendido. Default Dry-Run (solo validez).</span>
                    </div>
                </label>

                <button
                    onClick={handleRunChecks}
                    disabled={running}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
                >
                    {running ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined">play_arrow</span>
                    )}
                    Correr Checks
                </button>
            </div>

            {/* Config & Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Analytics Mode Card */}
                <div className="p-5 rounded-2xl border bg-white border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-500 text-lg">data_usage</span>
                            Modo de analítica
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Alterna entre el cálculo "all" (histórico omitiendo baneos hard) y "clean" (omitiendo también bots en bandera soft).
                        </p>

                        {configError && (
                            <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded">
                                {configError}
                            </div>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">Modo actual:</span>
                            {analyticsMode === null ? (
                                <span className="text-sm text-slate-400 italic">Cargando...</span>
                            ) : (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${analyticsMode === 'clean' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {analyticsMode}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => handleSetMode('all')}
                            disabled={updatingMode || analyticsMode === 'all'}
                            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-slate-400"
                        >
                            Set ALL
                        </button>
                        <button
                            onClick={() => handleSetMode('clean')}
                            disabled={updatingMode || analyticsMode === 'clean'}
                            className="flex-1 py-1.5 px-3 bg-primary-50 hover:bg-primary-100 disabled:opacity-50 text-primary-700 text-xs font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-primary-400"
                        >
                            Set CLEAN
                        </button>
                    </div>
                </div>
                <div className="hidden md:block"></div>
            </div>

            {/* Resultados Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map(test => {
                    const status = results[test.id];
                    let icon = 'sync';
                    let iconColor = 'text-slate-400';
                    let boxColors = 'bg-white border-slate-100';

                    if (status === 'running') {
                        icon = 'progress_activity';
                        iconColor = 'text-primary-400 animate-spin';
                        boxColors = 'bg-primary-50/50 border-primary-100';
                    } else if (status && status !== 'pending') {
                        if ((status as HealthCheckResult).ok) {
                            icon = 'check_circle';
                            iconColor = 'text-emerald-500';
                            boxColors = 'bg-emerald-50 border-emerald-100';
                        } else {
                            icon = 'error';
                            iconColor = 'text-rose-500';
                            boxColors = 'bg-rose-50 border-rose-200 shadow-rose-100/50';
                        }
                    }

                    return (
                        <div key={test.id} className={`p-5 rounded-2xl border flex items-start gap-4 transition-colors ${boxColors}`}>
                            <span className={`material-symbols-outlined mt-0.5 ${iconColor}`}>{icon}</span>
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-800 text-sm">{test.label}</h3>
                                {status && status !== 'pending' && status !== 'running' ? (
                                    <p className="text-xs mt-1 font-mono text-slate-600 bg-slate-100/50 p-2 rounded-lg break-all">
                                        {(status as HealthCheckResult).detail || ((status as HealthCheckResult).ok ? 'OK' : 'Error Desconocido')}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400 mt-1 italic">
                                        {status === 'running' ? 'Evaluando constraint base...' : 'Esperando ejecución'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

        </div>
    );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import PageShell from '../../../components/layout/PageShell';
import { b2bAnalyticsService, SnapshotRow } from '../services/b2bAnalyticsService';
import { InsightsView } from '../components/InsightsView';

export default function B2BDashboard() {
    const nav = useNavigate();
    const [loadingAccess, setLoadingAccess] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [accessErr, setAccessErr] = useState<string | null>(null);

    // States from original dashboard
    const [loadingData, setLoadingData] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);
    const [rows, setRows] = useState<SnapshotRow[]>([]);
    const [bucket, setBucket] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'data' | 'insights'>('data');
    const [moduleType, setModuleType] = useState<'versus' | 'progressive'>('versus');
    const [segmentHash, setSegmentHash] = useState<string>('global');
    const [limit, setLimit] = useState<number>(100);

    useEffect(() => {
        let alive = true;

        const run = async () => {
            setLoadingAccess(true);
            setAccessErr(null);

            try {
                const { data: s } = await supabase.auth.getSession();
                const session = s?.session;

                // Si no hay sesión, no debería entrar a B2B
                if (!session) {
                    if (!alive) return;
                    setAllowed(false);
                    setLoadingAccess(false);
                    return;
                }

                const { data, error } = await (supabase as any).rpc("is_b2b_user");
                if (error) throw error;

                if (!alive) return;
                setAllowed(Boolean(data));
                setLoadingAccess(false);
            } catch (e: any) {
                if (!alive) return;
                setAccessErr(e?.message ?? "No se pudo validar acceso B2B.");
                setAllowed(false);
                setLoadingAccess(false);
            }
        };

        run();
        return () => {
            alive = false;
        };
    }, []);

    const loadData = async () => {
        if (!allowed) return;
        setLoadingData(true);
        setDataError(null);
        try {
            const res = await b2bAnalyticsService.listRankings({
                moduleType,
                segmentHash,
                limit
            });
            setRows(res.rows);
            setBucket(res.bucket);
        } catch (err: any) {
            setDataError(err.message || 'Error desconocido.');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (allowed) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowed]);

    const handleExportCSV = () => {
        if (rows.length === 0) return;

        const headers = ['snapshot_bucket', 'module_type', 'battle_id', 'battle_title', 'option_id', 'option_label', 'score', 'signals_count', 'segment_hash'];
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of rows) {
            const values = headers.map(header => {
                const val = (row as any)[header] ?? '';
                const escaped = String(val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const safeSegment = segmentHash.replace(/[^a-z0-9]/gi, '_');
        const safeBucket = bucket ? new Date(bucket).toISOString().split('T')[0] : 'latest';
        const filename = `rankings_${moduleType}_${safeSegment}_${safeBucket}.csv`;

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loadingAccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-slate-500 font-bold">Cargando...</div>
            </div>
        );
    }

    // Acceso restringido
    if (!allowed) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h1 className="text-xl font-black text-slate-900">Acceso restringido</h1>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                        Este módulo es solo para cuentas B2B/autorizadas.
                    </p>

                    {accessErr && (
                        <p className="text-sm text-rose-600 font-medium mt-3">{accessErr}</p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => nav("/", { replace: true })}
                            className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black transition-all"
                        >
                            Volver al inicio
                        </button>
                        <button
                            onClick={() => nav("/login", { replace: true })}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PageShell>
            <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-primary-50 border border-primary-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-primary-700">
                        Portal B2B
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                        B2B — Rankings
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Extrae inteligencia agregada de public_rank_snapshots.</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end mb-8">
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Módulo</label>
                        <select
                            value={moduleType}
                            onChange={e => setModuleType(e.target.value as 'versus' | 'progressive')}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="versus">Versus</option>
                            <option value="progressive">Progresivo</option>
                        </select>
                    </div>

                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Segment Preset</label>
                        <select
                            value={segmentHash}
                            onChange={e => setSegmentHash(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="global">Global</option>
                            <option value="gender:male">Hombres</option>
                            <option value="gender:female">Mujeres</option>
                            <option value="region:RM">Región Metropolitana</option>
                            <option value="gender:male|region:RM">Hombres RM</option>
                        </select>
                    </div>

                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Manual Hash</label>
                        <input
                            type="text"
                            value={segmentHash}
                            onChange={e => setSegmentHash(e.target.value)}
                            placeholder="ej. gender:other"
                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-mono text-sm text-slate-800 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="w-full md:w-auto w-24">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Top N</label>
                        <input
                            type="number"
                            min={10} max={500}
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-semibold text-slate-800 text-center focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loadingData}
                        className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        {loadingData ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Cargar'}
                    </button>
                </div>

                {dataError && (
                    <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl font-medium mb-6 flex gap-3 items-center">
                        <span className="material-symbols-outlined">warning</span>
                        {dataError}
                    </div>
                )}

                {/* Data View */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Resultados del Reporte</h2>
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                                Snapshot: {bucket ? new Date(bucket).toLocaleString() : 'N/A'}
                            </p>
                        </div>

                        <div className="flex w-full sm:w-auto mt-2 sm:mt-0 items-center justify-between sm:justify-end gap-3 flex-wrap">
                            {/* TABS */}
                            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'data' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">table_rows</span>
                                    Datos
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">insights</span>
                                    Insights
                                </button>
                            </div>

                            <button
                                onClick={handleExportCSV}
                                disabled={rows.length === 0}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    {activeTab === 'insights' ? (
                        <div className="bg-slate-50 p-6">
                            <InsightsView data={rows} />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                                        <th className="p-4 rounded-tl-xl whitespace-nowrap">Battle</th>
                                        <th className="p-4 whitespace-nowrap">Option</th>
                                        <th className="p-4">Score</th>
                                        <th className="p-4 whitespace-nowrap">Signals</th>
                                        <th className="p-4 whitespace-nowrap">Segment</th>
                                        <th className="p-4 whitespace-nowrap hidden md:table-cell">Battle ID</th>
                                        <th className="p-4 whitespace-nowrap hidden md:table-cell">Option ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingData && rows.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 italic font-medium">Cargando inteligencia...</td>
                                        </tr>
                                    )}
                                    {!loadingData && rows.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                                                No hay resultados para esta mezcla de módulo y segmento.
                                            </td>
                                        </tr>
                                    )}
                                    {rows.map((row, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-sm font-medium text-slate-700">
                                            <td className="p-4 font-bold text-slate-800">{row.battle_title || row.battle_id}</td>
                                            <td className="p-4">{row.option_label || row.option_id}</td>
                                            <td className="p-4 font-bold text-primary-600">{Number(row.score).toFixed(2)}</td>
                                            <td className="p-4">{row.signals_count}</td>
                                            <td className="p-4">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">{row.segment_hash}</span>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-slate-400 truncate max-w-[120px] hidden md:table-cell" title={row.battle_id}>{row.battle_id}</td>
                                            <td className="p-4 font-mono text-xs text-slate-400 truncate max-w-[120px] hidden md:table-cell" title={row.option_id}>{row.option_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </PageShell>
    );
}

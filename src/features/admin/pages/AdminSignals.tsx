import { useState, useEffect, useCallback } from "react";
import { Search, Database, Power, PowerOff, Activity, ImageIcon, Edit2 } from "lucide-react";
import { adminSignalsService, AdminSignalRow } from "../services/adminSignalsService";

export default function AdminSignals() {
    const [signals, setSignals] = useState<AdminSignalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    // Pagination
    const [page, setPage] = useState(0);
    const limit = 50;
    const [hasMore, setHasMore] = useState(true);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchSignals = useCallback(async (reset: boolean = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 0 : page;
            const data = await adminSignalsService.searchSignals(debouncedSearch, statusFilter, limit, currentPage * limit);
            
            if (reset) {
                setSignals(data);
            } else {
                setSignals(prev => [...prev, ...data]);
            }
            
            setHasMore(data.length === limit);
            if (reset) setPage(0);
        } catch (error) {
            console.error("Error fetching signals", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter, page]);

    // Initial load and filter change
    useEffect(() => {
        fetchSignals(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusFilter]);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const res = await adminSignalsService.updateStatus(id, newStatus);
        if (res.success) {
            setSignals(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        } else {
            alert(res.error || "Error al actualizar la señal");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Database className="w-8 h-8 text-primary-600" />
                        Catálogo Maestro
                    </h1>
                    <p className="text-slate-500 mt-1">Gestión centralizada de todas las batallas y señales.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Buscar por título o descripción..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex gap-3">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                        <option value="archived">Archivadas</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Señal</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Métricas</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {signals.map((signal) => (
                                <tr key={signal.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 text-sm max-w-sm truncate">{signal.title}</div>
                                        {signal.description && (
                                            <div className="text-[11px] text-slate-500 mt-1 max-w-sm truncate">{signal.description}</div>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                            {signal.options.slice(0, 2).map((opt) => (
                                                <div key={opt.id} className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                                    {opt.image_url ? <ImageIcon className="w-3 h-3 text-slate-400" /> : null}
                                                    <span className="truncate max-w-[80px]">{opt.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                            {signal.category_name || 'Sin Categoría'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                            signal.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            signal.status === 'archived' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                            'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                            {signal.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                            {signal.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            <span className="font-bold">{signal.total_votes.toLocaleString()}</span> votos
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleToggleStatus(signal.id, signal.status)}
                                                className={`p-2 rounded-xl transition-colors ${
                                                    signal.status === 'active' 
                                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                                title={signal.status === 'active' ? 'Pausar Señal' : 'Activar Señal'}
                                            >
                                                {signal.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                            <button className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" title="Ver Detalles (Próximamente)">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                                        Cargando catálogo...
                                    </td>
                                </tr>
                            )}
                            {!loading && signals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">
                                        No se encontraron señales. Intenta ajustar tu búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination footer */}
                {hasMore && !loading && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
                        <button 
                            onClick={() => { setPage(p => p + 1); fetchSignals(false); }}
                            className="bg-white border border-slate-200 text-slate-700 font-bold py-2 px-6 rounded-xl text-sm hover:bg-slate-50 hover:shadow-sm transition-all"
                        >
                            Cargar Más Señales
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { Bell, Activity, Search } from "lucide-react";
import { analyticsService } from "../../../features/analytics/services/analyticsService";
import { useOverviewB2BState } from "../hooks/useOverviewB2BState";

export default function AlertsB2B() {
    const { loading, snapshot } = useOverviewB2BState();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

    useEffect(() => {
        analyticsService.trackSystem('b2b_opened_alerts', 'info');
    }, []);

    const alerts = snapshot?.alerts || [];

    const filteredAlerts = alerts.filter(alert => {
        const matchesEntity = alert.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSeverity = filterSeverity === "ALL" || alert.severity.toUpperCase() === filterSeverity;
        return matchesEntity && matchesSeverity;
    });

    const refreshData = () => {
       // El hook useOverviewB2BState ya expone data reactiva, 
       // pero podemos forzar un re-mount o recarga manual de ser necesario en el master state.
       window.location.reload();
    };

    return (
        <div className="p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Bell className="w-8 h-8 text-indigo-600" />
                        <span className="text-gradient-brand">Early Warnings</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        ¿Dónde cambió algo importante? Detección automática de riesgos e incrementos de preferencia traccionados por el consumidor B2C.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={refreshData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Refrescar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filtrar entidad..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 focus:ring-indigo-500"
                            value={filterSeverity}
                            onChange={(e) => setFilterSeverity(e.target.value)}
                        >
                            <option value="ALL">Todas las severidades</option>
                            <option value="HIGH">Críticas</option>
                            <option value="MEDIUM">Advertencias</option>
                            <option value="LOW">Informativas</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
                            ))
                        ) : filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert) => (
                                <div key={alert.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                                alert.severity === 'high' ? 'bg-rose-500 animate-pulse' :
                                                alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                            <p className="text-xs font-black text-slate-900 tracking-wide uppercase">{alert.category}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">
                                        {alert.entityName || alert.headline}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                        {alert.message}
                                    </p>
                                    <div className="pt-3 mt-auto border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        <span>Origen: {alert.metricId || 'Global Signal'}</span>
                                        <span>{Math.floor((Date.now() - new Date(alert.timestamp).getTime()) / 60000)} min atrás</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Mercado sin sorpresas</h3>
                                <p className="text-xs text-slate-500">No se registran alertas con esos parámetros o aún no hay datos suficientes de mercado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

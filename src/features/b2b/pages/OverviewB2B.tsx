import { useEffect, useState, useCallback } from "react";
import { metricsService } from "../../metrics/services/metricsService";
import { LeaderboardEntry, TrendSummary } from "../../metrics/services/metricsService";
import { logger } from "../../../lib/logger";
import { useAuthContext } from "../../../features/auth/context/AuthContext";
import { Building2, Search, TrendingUp, TrendingDown, Target, Bell, Zap, ChevronRight, Activity, X } from "lucide-react";

// Stub for SystemAlert
interface SystemAlert {
    id: string;
    entityName: string;
    severity: string;
    category: string;
    message: string;
    metadata?: any;
    createdAt: string;
}

// Stub for SystemNarrative
interface SystemNarrative {
    intelligenceText: string;
    confidence: string;
    category: string;
    backingMetrics?: {
        deltaPercentage?: number;
    }
}

export default function OverviewB2B() {
    const { accessState } = useAuthContext();
    const role = accessState.role;
    const isB2B = role === 'b2b' || role === 'admin'; // Admin also has access
    
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [trendSummary, setTrendSummary] = useState<TrendSummary | null>(null);
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    
    // Deep dive state
    const [selectedEntity, setSelectedEntity] = useState<LeaderboardEntry | null>(null);
    const [entityNarrative, setEntityNarrative] = useState<SystemNarrative | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [board, trends] = await Promise.all([
                metricsService.getGlobalLeaderboard(),
                metricsService.getTrendSummary()
            ]);
            
            // Get Active Market Alerts directly from Alert Engine
            // const activeAlerts = await alertEngine.getActiveAlerts();
            const activeAlerts: SystemAlert[] = [];

            setLeaderboard(board);
            setTrendSummary(trends);
            setAlerts(activeAlerts);
        } catch (err) {
            logger.error("[OverviewB2B] Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isB2B) {
            loadData();
        }
    }, [isB2B, loadData]);

    const handleSelectEntity = async (entity: LeaderboardEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        setEntityNarrative(null);
        
        try {
            // const narrative = await narrativeEngine.generateEntityNarrative(entity.entity_id);
            setEntityNarrative(null);
        } catch (error) {
            logger.error("[OverviewB2B] Error fetching narrative:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (!isB2B) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
                    <h2 className="text-xl font-bold text-slate-800">Acceso Restringido</h2>
                    <p className="text-slate-500">No tienes permisos de analista corporativo.</p>
                </div>
            </div>
        );
    }

    const filteredRankings = leaderboard.filter(item => 
        item.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        <span className="text-gradient-brand">Inteligencia de Mercado</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Monitor comparativo de entidades, variaciones de tendencia y alertas automáticas B2B.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={loadData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Actualizar Dataset
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Entidades Activas</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                {((trendSummary?.trendingUp.length || 0) + (trendSummary?.trendingDown.length || 0) + (trendSummary?.stable.length || 0))}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acelerando</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                {trendSummary?.trendingUp.length || 0} entidades
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-rose-50 rounded-2xl">
                            <TrendingDown className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bajando</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                {trendSummary?.trendingDown.length || 0} entidades
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rankings Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Ranking Competitivo
                            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{leaderboard.length}</span>
                        </h2>
                        
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar entidad..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Entidad</th>
                                    <th className="px-6 py-4 text-center">Win Rate</th>
                                    <th className="px-6 py-4 text-center">Volumen</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4 h-16 bg-slate-50/30"></td>
                                        </tr>
                                    ))
                                ) : filteredRankings.length > 0 ? (
                                    filteredRankings.map((entity, index) => (
                                        <tr 
                                            key={entity.entity_id} 
                                            onClick={() => handleSelectEntity(entity)}
                                            className={`hover:bg-slate-50/50 transition cursor-pointer group ${selectedEntity?.entity_id === entity.entity_id ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{entity.entity_name}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">Rank #{index + 1} • General</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-bold text-slate-700">{(entity.win_rate * 100).toFixed(1)}%</div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${entity.win_rate * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-bold text-slate-700">{entity.total_comparisons}</div>
                                                <div className="text-[10px] text-slate-400">batallas</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-300 group-hover:text-indigo-500 transition">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                                            Sin resultados encontrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Alerts */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            Alertas de Mercado
                            {alerts.length > 0 && (
                                <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">
                                    {alerts.length}
                                </span>
                            )}
                        </h3>

                        <div className="space-y-4">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-2 h-2 rounded-full ${
                                                alert.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' :
                                                alert.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                            <p className="text-xs font-bold text-slate-900">{alert.category}</p>
                                        </div>
                                        <p className="text-[11px] text-slate-600 font-medium">
                                            {alert.entityName}
                                        </p>
                                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                                            <span>Origen: {(alert.metadata?.baseMetric as string) || 'Sistema'}</span>
                                            <span>Hace {Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / 60000)} min</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[11px] font-bold text-slate-400">Mercado estable, sin alertas relevantes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Deep Dive Modal/Drawer for Narrative */}
            {selectedEntity && (
                <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform border-l border-slate-100 flex flex-col">
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedEntity.entity_name}</h3>
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Deep Dive B2B</div>
                            </div>
                            <button 
                                onClick={() => setSelectedEntity(null)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                        {loadingDetails ? (
                            <div className="space-y-6 animate-pulse">
                                <div className="h-40 bg-white rounded-3xl border border-slate-100"></div>
                                <div className="h-32 bg-white rounded-3xl border border-slate-100"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Narrative Card */}
                                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Zap className="w-24 h-24 text-white" />
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                                <Zap className="w-4 h-4 text-indigo-300" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Narrativa Ejecutiva</span>
                                        </div>
                                        
                                        {entityNarrative ? (
                                            <div className="space-y-4">
                                                <p className="text-sm font-medium text-white leading-relaxed">
                                                    {entityNarrative.intelligenceText}
                                                </p>
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-indigo-500/30">
                                                    <span className="text-[10px] text-indigo-300 font-mono">
                                                        Confianza: {entityNarrative.confidence}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                                                        {entityNarrative.category}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-indigo-200/60 italic">
                                                No hay datos suficientes o alertas activas para generar una narrativa concluyente sobre el momentum de esta entidad en las últimas horas.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Hard Metrics Card */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Métricas Duras</h4>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-bold text-slate-700">Win Rate Relativo</span>
                                                <span className="text-lg font-black text-slate-900">{(selectedEntity.win_rate * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${selectedEntity.win_rate * 100}%` }}></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-bold text-slate-700">Batallas Consignadas</span>
                                                <span className="text-lg font-black text-slate-900">{selectedEntity.total_comparisons} batallas</span>
                                            </div>
                                        </div>
                                        
                                        {entityNarrative?.backingMetrics?.deltaPercentage !== undefined && (
                                            <div>
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-sm font-bold text-slate-700">Variación Temporal (WoW)</span>
                                                    <span className={`text-lg font-black ${(entityNarrative.backingMetrics?.deltaPercentage ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {(entityNarrative.backingMetrics?.deltaPercentage ?? 0) > 0 ? '+' : ''}
                                                        {Number(entityNarrative.backingMetrics?.deltaPercentage ?? 0).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

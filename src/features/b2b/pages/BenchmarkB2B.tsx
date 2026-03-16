import { useEffect, useState, useCallback } from "react";
import { metricsService } from "../../metrics/services/metricsService";
import { LeaderboardEntry } from "../../metrics/services/metricsService";
import { logger } from "../../../lib/logger";
import { TrendingUp, Search, Activity, ChevronRight, X, Zap } from "lucide-react";
import { PremiumGate } from "../../../components/ui/PremiumGate";

interface SystemNarrative {
    intelligenceText: string;
    confidence: string;
    category: string;
    backingMetrics?: {
        deltaPercentage?: number;
    }
}


// The Benchmark Component handles the giant comparative Ranking Table and the Entity Deep Dive Panel
export default function BenchmarkB2B() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<LeaderboardEntry | null>(null);
    const [entityNarrative, setEntityNarrative] = useState<SystemNarrative | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const board = await metricsService.getGlobalLeaderboard();
            setLeaderboard(board);
        } catch (err) {
            logger.error("[BenchmarkB2B] Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectEntity = async (entity: LeaderboardEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        setEntityNarrative(null);
        
        try {
            // const narrative = await narrativeEngine.generateEntityNarrative(entity.entity_id);
            setEntityNarrative(null);
        } catch (error) {
            logger.error("[BenchmarkB2B] Error fetching narrative:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredRankings = leaderboard.filter(item => 
        item.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                        <span className="text-gradient-brand">Market Benchmark</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        ¿Quién gana la atención del consumidor? Comparativa de retención, volumen y preferencias frente a competidores.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={loadData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Refrescar
                    </button>
                </div>
            </div>

            {/* Rankings Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Ranking Competitivo Completo
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

                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Entidad</th>
                                <th className="px-6 py-4 text-center">Win Rate</th>
                                <th className="px-6 py-4 text-center">Volumen de Batallas</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
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
                                        <td className="px-6 py-4 w-1/3">
                                            <div className="font-semibold text-slate-900">{entity.entity_name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">Rank #{index + 1} • Global</div>
                                        </td>
                                        <td className="px-6 py-4 text-center w-1/3">
                                            <div className="flex flex-col items-center">
                                                <div className="text-sm font-bold text-slate-700">{(entity.win_rate * 100).toFixed(1)}%</div>
                                                <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-2">
                                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${entity.win_rate * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm font-bold text-slate-700">{entity.total_comparisons}</div>
                                            <div className="text-[10px] text-slate-400">interacciones</div>
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

            {/* Deep Dive Modal/Drawer for Entity Narrative */}
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
                                <PremiumGate featureName="Análisis Narrativo Ejecutivo" isLocked={true}>
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
                                </PremiumGate>
                                
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

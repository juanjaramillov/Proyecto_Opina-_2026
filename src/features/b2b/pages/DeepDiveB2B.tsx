import { useEffect, useState, useCallback } from "react";
import { metricsService } from "../../metrics/services/metricsService";
import { LeaderboardEntry } from "../../metrics/services/metricsService";
import { logger } from "../../../lib/logger";
import { Search, Activity, Zap, Building2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PremiumGate } from "../../../components/ui/PremiumGate";

interface SystemNarrative {
    intelligenceText: string;
    confidence: string;
    category: string;
    backingMetrics?: {
        deltaPercentage?: number;
    }
}

export default function DeepDiveB2B() {
    const [entities, setEntities] = useState<LeaderboardEntry[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<LeaderboardEntry | null>(null);
    const [entityNarrative, setEntityNarrative] = useState<SystemNarrative | null>(null);
    
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loadEntities = useCallback(async () => {
        setLoadingList(true);
        try {
            const board = await metricsService.getGlobalLeaderboard();
            setEntities(board);
            // Auto-select first entity if available
            if (board.length > 0 && !selectedEntity) {
                handleSelectEntity(board[0]);
            }
        } catch (err) {
            logger.error("[DeepDiveB2B] Error loading entities:", err);
        } finally {
            setLoadingList(false);
        }
    }, [selectedEntity]);

    useEffect(() => {
        loadEntities();
    }, [loadEntities]);

    const handleSelectEntity = async (entity: LeaderboardEntry) => {
        setSelectedEntity(entity);
        setLoadingDetails(true);
        setEntityNarrative(null);
        
        try {
            // const narrative = await narrativeEngine.generateEntityNarrative(entity.entity_id);
            setEntityNarrative(null);
        } catch (error) {
            logger.error("[DeepDiveB2B] Error fetching narrative:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredEntities = entities.filter(item => 
        item.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ZoomInIcon className="w-8 h-8 text-indigo-600" />
                        <span className="text-gradient-brand">Entity Deep Dive</span>
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Análisis focalizado, performance histórico y narrativas específicas por marca o entidad.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={loadEntities}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Refrescar
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Left Sidebar - Entity List */}
                <div className="w-full lg:w-80 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm shrink-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar entidad..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingList ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-slate-50 rounded-xl mb-2 animate-pulse mx-2"></div>
                            ))
                        ) : filteredEntities.length > 0 ? (
                            <div className="space-y-1">
                                {filteredEntities.map((entity) => (
                                    <button
                                        key={entity.entity_id}
                                        onClick={() => handleSelectEntity(entity)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                                            selectedEntity?.entity_id === entity.entity_id 
                                                ? 'bg-indigo-50 border-indigo-100/50 shadow-sm' 
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${selectedEntity?.entity_id === entity.entity_id ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                {entity.entity_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                                {entity.total_comparisons} señales
                                            </span>
                                        </div>
                                        <div className={`text-xs font-bold ${selectedEntity?.entity_id === entity.entity_id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            {(entity.win_rate * 100).toFixed(1)}%
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                No se encontraron entidades
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Entity Details */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                    {selectedEntity ? (
                        <>
                            <div className="p-8 border-b border-slate-100 shrink-0 bg-slate-50/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                                            <Building2 className="w-8 h-8 text-indigo-300" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedEntity.entity_name}</h2>
                                            <div className="flex items-center gap-3 mt-2 text-sm">
                                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs ring-1 ring-inset ring-indigo-500/10">
                                                    ID: {selectedEntity.entity_id.split('-')[0].toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Win Rate Global</div>
                                        <div className="text-3xl font-black text-slate-900">{(selectedEntity.win_rate * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                                {loadingDetails ? (
                                    <div className="space-y-6 animate-pulse">
                                        <div className="h-48 bg-slate-50 rounded-3xl"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="h-32 bg-slate-50 rounded-3xl"></div>
                                            <div className="h-32 bg-slate-50 rounded-3xl"></div>
                                            <div className="h-32 bg-slate-50 rounded-3xl"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 max-w-5xl mx-auto">
                                        
                                        {/* Executive Narrative */}
                                        <PremiumGate featureName="Análisis Narrativo Ejecutivo" isLocked={true}>
                                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                                    <Zap className="w-48 h-48 text-white -rotate-12 transform" />
                                                </div>
                                                
                                                <div className="relative z-10 max-w-3xl">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-sm">
                                                            <Zap className="w-5 h-5 text-indigo-300" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Inteligencia Ejecutiva</span>
                                                    </div>
                                                    
                                                    {entityNarrative ? (
                                                        <div className="space-y-6">
                                                            <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                                                                "{entityNarrative.intelligenceText}"
                                                            </p>
                                                            <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                                                                <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-mono font-bold tracking-wide border border-white/5">
                                                                    Confidence: {entityNarrative.confidence}
                                                                </span>
                                                                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                                                                    {entityNarrative.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-base text-indigo-200/60 leading-relaxed italic">
                                                            Pendiente de análisis. No hay variaciones bruscas suficientes en la ventana de tiempo actual para generar un reporte automatizado.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </PremiumGate>
                                        
                                        {/* Hard Metrics Grid */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-indigo-500" />
                                                Métricas de Soporte
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Volumen Total</p>
                                                    <div className="flex items-end gap-2">
                                                        <h4 className="text-3xl font-black text-slate-900">{selectedEntity.total_comparisons}</h4>
                                                        <span className="text-sm font-medium text-slate-500 mb-1">interacciones</span>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Posición Relativa</p>
                                                    <div className="flex items-end gap-2">
                                                        <h4 className="text-3xl font-black text-slate-900">
                                                            {((selectedEntity.win_rate) * 100).toFixed(0)}
                                                        </h4>
                                                        <span className="text-sm font-medium text-slate-500 mb-1">Puntos Base</span>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Variación Reciente</p>
                                                    <div className="flex items-center gap-2 h-[42px]">
                                                        {entityNarrative?.backingMetrics?.deltaPercentage !== undefined ? (
                                                            <>
                                                                {entityNarrative.backingMetrics.deltaPercentage > 0 ? (
                                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                                        <TrendingUp className="w-8 h-8" />
                                                                        <h4 className="text-3xl font-black">+{entityNarrative.backingMetrics.deltaPercentage.toFixed(1)}%</h4>
                                                                    </div>
                                                                ) : entityNarrative.backingMetrics.deltaPercentage < 0 ? (
                                                                    <div className="flex items-center gap-2 text-rose-600">
                                                                        <TrendingDown className="w-8 h-8" />
                                                                        <h4 className="text-3xl font-black">{entityNarrative.backingMetrics.deltaPercentage.toFixed(1)}%</h4>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-slate-400">
                                                                        <Minus className="w-8 h-8" />
                                                                        <h4 className="text-3xl font-black">0.0%</h4>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-slate-300">
                                                                <Minus className="w-8 h-8" />
                                                                <h4 className="text-3xl font-black text-slate-300">N/A</h4>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
                            <div className="text-center max-w-sm">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                    <ZoomInIcon className="w-10 h-10 text-slate-300 mx-auto" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Selecciona una entidad</h3>
                                <p className="text-slate-500 text-sm">
                                    Elige una marca o proyecto del listado izquierdo para iniciar la inmersión de inteligencia artificial en sus métricas y narrativas.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Simple internal icon definition if lucide doesn't export ZoomIn directly in some contexts
function ZoomInIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
            <line x1="11" x2="11" y1="8" y2="14" />
            <line x1="8" x2="14" y1="11" y2="11" />
        </svg>
    )
}

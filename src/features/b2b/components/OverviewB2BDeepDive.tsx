import { Zap, X } from "lucide-react";
import { LeaderboardEntry } from "../../../read-models/types";
import { SystemNarrative } from "../hooks/useOverviewB2BState";

interface OverviewB2BDeepDiveProps {
  selectedEntity: LeaderboardEntry | null;
  entityNarrative: SystemNarrative | null;
  loadingDetails: boolean;
  onClose: () => void;
}

export function OverviewB2BDeepDive({
  selectedEntity,
  entityNarrative,
  loadingDetails,
  onClose
}: OverviewB2BDeepDiveProps) {
  if (!selectedEntity) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform border-l border-slate-100 flex flex-col">
      <div className="p-8 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedEntity.entityName}</h3>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Deep Dive B2B</div>
          </div>
          <button 
            onClick={onClose}
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
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                Rigor Estadístico & Métricas Duras
              </h4>
              <div className="space-y-6">
                
                {/* Win Rate Principal y Wilson Score */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-slate-700">Preferencia Base (P)</span>
                    <span className="text-lg font-black text-slate-900">{(selectedEntity.winRate * 100).toFixed(1)}%</span>
                  </div>
                  
                  {/* Barra con Intervalo de Confianza */}
                  <div className="relative w-full bg-slate-100 rounded-full h-3 mt-3 mb-2">
                    {selectedEntity.wilsonScore && (
                      <div 
                        className="absolute h-3 bg-indigo-200 rounded-full" 
                        style={{ 
                          left: `${selectedEntity.wilsonScore.lowerBound * 100}%`, 
                          width: `${(selectedEntity.wilsonScore.upperBound - selectedEntity.wilsonScore.lowerBound) * 100}%` 
                        }}
                      />
                    )}
                    <div className="absolute top-0 bottom-0 bg-indigo-600 w-1 shadow-sm" style={{ left: `${selectedEntity.winRate * 100}%` }}></div>
                  </div>
                  
                  {selectedEntity.wilsonScore && (
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      <span>Suelo: {(selectedEntity.wilsonScore.lowerBound * 100).toFixed(1)}%</span>
                      <span>Techo: {(selectedEntity.wilsonScore.upperBound * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2 italic flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Intervalo de Confianza (Wilson 95%). Muestra el rango real de preferencia proyectado al universo total.
                  </p>
                </div>
                
                <hr className="border-slate-100" />

                {/* Grid de KPIs Secundarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Volumen Muestral</span>
                    <span className="text-xl font-black text-slate-900">{selectedEntity.totalComparisons}</span>
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">batallas</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Volatilidad (Var)</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${(selectedEntity.volatilityIndex ?? 0) > 0.1 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <span className="text-xl font-black text-slate-900">{((selectedEntity.volatilityIndex ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Momentum Score</span>
                    <span className="text-xs font-semibold text-slate-500">Decaimiento temporal aplicado (WoW)</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-base flex justify-center items-center gap-1 ${(selectedEntity.momentumScore ?? 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    <span className="material-symbols-outlined text-[16px]">
                        {(selectedEntity.momentumScore ?? 0) >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    {(selectedEntity.momentumScore ?? 0) > 0 ? '+' : ''}{(selectedEntity.momentumScore ?? 0).toFixed(1)}
                  </div>
                </div>

                {entityNarrative?.backingMetrics?.deltaPercentage !== undefined && (
                  <div className="border-l-2 border-slate-200 pl-3 pt-2">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Aceleración (WoW)</span>
                      <span className={`text-sm font-black ${(entityNarrative.backingMetrics.deltaPercentage) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {(entityNarrative.backingMetrics.deltaPercentage) > 0 ? '+' : ''}
                        {Number(entityNarrative.backingMetrics.deltaPercentage).toFixed(1)}%
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
  );
}

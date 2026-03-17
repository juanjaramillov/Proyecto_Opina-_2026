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
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Métricas Duras</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-slate-700">Win Rate Relativo</span>
                    <span className="text-lg font-black text-slate-900">{(selectedEntity.winRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${selectedEntity.winRate * 100}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-slate-700">Batallas Consignadas</span>
                    <span className="text-lg font-black text-slate-900">{selectedEntity.totalComparisons} batallas</span>
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
  );
}

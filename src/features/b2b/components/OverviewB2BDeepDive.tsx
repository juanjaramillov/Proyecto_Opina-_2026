import { Zap, X } from "lucide-react";
import { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

interface OverviewB2BDeepDiveProps {
  selectedEntity: IntelligenceBenchmarkEntry | null;
  loadingDetails: boolean;
  onClose: () => void;
}

export function OverviewB2BDeepDive({
  selectedEntity,
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
            <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mt-1">Deep Dive B2B</div>
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
            <div className="bg-gradient-to-br from-white via-brand-50/30 to-accent-50/20 p-6 rounded-3xl shadow-sm border border-brand-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Zap className="w-24 h-24 text-brand" />
              </div>

              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-brand-50 border border-brand-100 rounded-lg">
                        <Zap className="w-4 h-4 text-brand" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand">Resumen Estadístico</span>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-ink leading-relaxed">
                    La entidad {selectedEntity.entityName} presenta una preferencia del {(selectedEntity.weightedPreferenceShare * 100).toFixed(1)}% con un nivel de estabilidad catalogado como "{selectedEntity.stabilityLabel.replace('_', ' ')}", basado en {selectedEntity.nEff.toFixed(0)} interacciones reales.
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-brand-100">
                    <span className="text-[10px] text-brand font-mono">
                      Elegibilidad Comercial:
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100 uppercase">
                      {selectedEntity.commercialEligibilityLabel.replace('_', ' ')}
                    </span>
                  </div>
                </div>
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
                    <span className="text-lg font-black text-slate-900">{(selectedEntity.weightedPreferenceShare * 100).toFixed(1)}%</span>
                  </div>
                  
                  {/* Barra con Intervalo de Confianza */}
                  <div className="relative w-full bg-slate-100 rounded-full h-3 mt-3 mb-2">
                    <div 
                      className="absolute h-3 bg-brand-200 rounded-full" 
                      style={{ 
                        left: `${selectedEntity.wilsonLowerBound * 100}%`, 
                        width: `${(selectedEntity.wilsonUpperBound - selectedEntity.wilsonLowerBound) * 100}%` 
                      }}
                    />
                    <div className="absolute top-0 bottom-0 bg-brand-600 w-1 shadow-sm" style={{ left: `${selectedEntity.weightedPreferenceShare * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    <span>Suelo: {(selectedEntity.wilsonLowerBound * 100).toFixed(1)}%</span>
                    <span>Techo: {(selectedEntity.wilsonUpperBound * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 italic flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Intervalo de Confianza (Wilson 95%). Muestra el rango real proyectado.
                  </p>
                </div>
                
                <hr className="border-slate-100" />

                {/* Grid de KPIs Secundarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Muestra Efectiva (n_eff)</span>
                    <span className="text-xl font-black text-slate-900">{selectedEntity.nEff.toFixed(0)}</span>
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">batallas</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estabilidad</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                          selectedEntity.stabilityLabel === 'volátil' ? 'bg-warning-500 animate-pulse' : 
                          selectedEntity.stabilityLabel === 'estable' ? 'bg-accent' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-sm font-black capitalize text-slate-900">
                        {selectedEntity.stabilityLabel.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Win Rate Ponderado</span>
                    <span className="text-xs font-semibold text-slate-500">Relación de victoria frente al pool total</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl font-bold bg-brand-100 text-brand-700">
                     {(selectedEntity.weightedWinRate * 100).toFixed(1)}%
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

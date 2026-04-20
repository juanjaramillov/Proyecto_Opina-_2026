import { Minus, Info } from "lucide-react";
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";

interface Props {
  pulseData: ResultsCommunitySnapshot["pulse"];
}

export function ResultsLivePulse({ pulseData }: Props) {
  const { availability, metrics } = pulseData;

  // Si está deshabilitado u oculto, no renderiza
  if (availability === "disabled") return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6">
      <div className="bg-white rounded-2xl border border-stroke shadow-sm p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        {/* Left: Title & Items */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-ink uppercase tracking-widest flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)] ${availability === "success" ? "bg-primary animate-pulse" : "bg-stroke"}`} />
              Señales en vivo
            </h3>
            <span className="text-[10px] font-medium text-text-muted">
               {availability === "success" ? "Qué está pasando ahora" : "Recabando señales"}
            </span>
          </div>

          <div className="w-px h-8 bg-stroke hidden md:block" />

          <div className="flex flex-wrap items-center gap-6 gap-y-4">
            
            {/* Fastest Riser */}
            {metrics.fastestRiserEntity && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Minus className="w-3 h-3 text-secondary rotate-45" /> Sube
                </div>
                <div className="text-sm font-black text-ink leading-tight">{metrics.fastestRiserEntity}</div>
                <div className="text-[10px] text-text-muted font-medium truncate max-w-[150px]">Tendencia al alza</div>
              </div>
            )}

            {/* Hot Topic */}
            {metrics.hotTopicTitle && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Minus className="w-3 h-3 text-primary" /> Explota
                </div>
                <div className="text-sm font-black text-ink flex items-center gap-1.5 leading-tight">
                  <span className="truncate max-w-[200px]">{metrics.hotTopicTitle}</span>
                  <span className="px-1.5 py-0.5 bg-primary text-white rounded-[4px] text-[8px] uppercase tracking-widest font-black shrink-0">Hot</span>
                </div>
                <div className="text-[10px] text-text-muted font-medium opacity-0">.</div>
              </div>
            )}

            {/* Fastest Faller */}
            {metrics.fastestFallerEntity && (
              <div className="hidden sm:flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Minus className="w-3 h-3 text-primary -rotate-45" /> Cae
                </div>
                <div className="text-sm font-black text-ink leading-tight">{metrics.fastestFallerEntity}</div>
                <div className="text-[10px] text-text-muted font-medium truncate max-w-[150px]">Perdiendo terreno</div>
              </div>
            )}
            
            {/* Fallback si no hay data suficiente de tendencias */}
            {!metrics.fastestRiserEntity && !metrics.hotTopicTitle && (
              <div className="text-xs font-medium text-text-muted italic">
                Suficientes señales procesándose para marcar tendencias en breve.
              </div>
            )}

          </div>
        </div>

        {/* Right: Generational Insight Pill */}
        {metrics.generationGapLabel && (
          <div className="shrink-0 bg-surface2 border border-stroke rounded-xl px-4 py-3 flex items-start sm:items-center gap-3">
             <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
               <Info className="w-4 h-4" />
             </div>
             <p className="text-xs font-bold text-ink leading-snug max-w-[200px]">
               {metrics.generationGapLabel}
             </p>
          </div>
        )}

      </div>
    </div>
  );
}

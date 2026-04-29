import { Minus, Info } from "lucide-react";
import { ResultsCommunitySnapshot } from "../../../read-models/b2c/resultsCommunityTypes";
import { SignalNode } from "../../../components/ui/foundation";

interface Props {
  pulseData: ResultsCommunitySnapshot["pulse"];
}

/** Mini sparkline SVG para mostrar evolución 7d junto al nombre de la entidad. */
function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (!values || values.length < 2) return null;
  const w = 56;
  const h = 18;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fmtDelta(delta: number | null): string | null {
  if (delta == null) return null;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${Math.round(delta)}%`;
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
            <h3 className="text-xs font-black text-ink uppercase tracking-widest flex items-center gap-2">
              {/* V17 · live dot con shadow brand reemplazado por SignalNode */}
              {availability === "success" ? (
                <SignalNode state="validated" size="sm" pulse />
              ) : (
                <SignalNode state="insufficient" size="sm" />
              )}
              Señales en vivo
            </h3>
            <span className="text-[10px] font-medium text-slate-500">
               {availability === "success" ? "Qué está pasando ahora" : "Recabando señales"}
            </span>
          </div>

          <div className="w-px h-8 bg-stroke hidden md:block" />

          <div className="flex flex-wrap items-center gap-6 gap-y-4">
            
            {/* Fastest Riser */}
            {metrics.fastestRiserEntity && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Minus className="w-3 h-3 text-accent rotate-45" /> Sube
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-ink leading-tight">{metrics.fastestRiserEntity}</span>
                  {metrics.fastestRiserSparkline && metrics.fastestRiserSparkline.length > 1 && (
                    <MiniSparkline values={metrics.fastestRiserSparkline} color="#10B981" />
                  )}
                  {fmtDelta(metrics.fastestRiserDeltaPct) && (
                    <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded-full">
                      {fmtDelta(metrics.fastestRiserDeltaPct)} 7d
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">Tendencia al alza</div>
              </div>
            )}

            {/* Hot Topic */}
            {metrics.hotTopicTitle && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Minus className="w-3 h-3 text-brand" /> Explota
                </div>
                <div className="text-sm font-black text-ink flex items-center gap-1.5 leading-tight">
                  <span className="truncate max-w-[200px]">{metrics.hotTopicTitle}</span>
                  <span className="px-1.5 py-0.5 bg-brand text-white rounded text-[8px] uppercase tracking-widest font-black shrink-0">Hot</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium opacity-0">.</div>
              </div>
            )}

            {/* Fastest Faller */}
            {metrics.fastestFallerEntity && (
              <div className="hidden sm:flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Minus className="w-3 h-3 text-brand -rotate-45" /> Cae
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-ink leading-tight">{metrics.fastestFallerEntity}</span>
                  {metrics.fastestFallerSparkline && metrics.fastestFallerSparkline.length > 1 && (
                    <MiniSparkline values={metrics.fastestFallerSparkline} color="#EF4444" />
                  )}
                  {fmtDelta(metrics.fastestFallerDeltaPct) && (
                    <span className="text-[10px] font-bold text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded-full">
                      {fmtDelta(metrics.fastestFallerDeltaPct)} 7d
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">Perdiendo terreno</div>
              </div>
            )}
            
            {/* Fallback si no hay data suficiente de tendencias */}
            {!metrics.fastestRiserEntity && !metrics.hotTopicTitle && (
              <div className="text-xs font-medium text-slate-500 italic">
                Suficientes señales procesándose para marcar tendencias en breve.
              </div>
            )}

          </div>
        </div>

        {/* Right: Generational Insight Pill */}
        {metrics.generationGapLabel && (
          <div className="shrink-0 bg-surface2 border border-stroke rounded-xl px-4 py-3 flex items-start sm:items-center gap-3">
             <div className="p-1.5 bg-brand/10 text-brand rounded-lg shrink-0">
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

import { Topic } from '../../signals/types/actualidad';
import { Zap } from 'lucide-react';

interface Props {
  data: Partial<Topic>;
}

export function ActualidadPreview({ data }: Props) {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col relative w-full h-[700px]">
      
      {/* Simulation of App Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/90 backdrop-blur-md z-10">
        <span className="text-white text-[10px] font-black tracking-widest uppercase">Vista Previa App</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar scroll-smooth relative">
        {/* Topic Image Cover */}
        {(() => {
          // Extraemos la URL de imagen usando los mismos fallbacks que el frontend principal
          const rawData = data as Record<string, unknown>;
          const rawMetadata = (data.metadata || {}) as Record<string, unknown>;
          const rawAiPayload = (rawMetadata.raw_ai_payload || {}) as Record<string, unknown>;
          
          const imgUrl = rawData.image_url || rawMetadata.image_url || rawMetadata.image || rawAiPayload.image_url || rawData.cover_image;
          
          if (imgUrl) {
            return (
              <div className="w-full h-48 relative shrink-0">
                <img src={imgUrl as string} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              </div>
            );
          }
          return null;
        })()}

        <div className="p-6 pt-4 flex flex-col flex-1">
          {/* Topic Card Content */}
          <div className="flex flex-wrap gap-2 mb-5">
            {data.category && (
               <span className="px-3 py-1 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg text-xs font-black tracking-widest uppercase">
                 {data.category}
               </span>
            )}
            {data.intensity && data.intensity > 1 ? (
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-black tracking-widest uppercase flex items-center gap-1">
                <Zap className="w-3 h-3" /> INT {data.intensity}
              </span>
            ) : null}
          </div>
          
          <h2 className="text-3xl font-black text-white leading-tight mb-5 tracking-tight">
            {data.title || 'El título corto del tema editorial'}
          </h2>
          
          {data.impact_phrase && (
             <blockquote className="border-l-4 border-primary-500 pl-4 py-1 mb-5 text-slate-300 italic text-[15px] font-medium leading-relaxed bg-gradient-to-r from-primary-500/10 to-transparent">
               "{data.impact_phrase}"
             </blockquote>
          )}

          <p className="text-slate-400 text-[15px] leading-relaxed mb-8 font-medium">
            {data.summary || 'El resumen neutral y objetivo se mostrará en este bloque, entregando el contexto fundamental a los usuarios antes de que respondan las preguntas en el embudo evaluativo.'}
          </p>

          {/* Simulated Questions */}
          <div className="mt-auto pt-6 border-t border-slate-800/60">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-4">Flujo de Preguntas (Simulado)</p>
             <div className="space-y-3">
               {[1, 2, 3].map((num) => (
                  <div key={num} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">{num}</div>
                    <div className="h-2 bg-slate-700/50 rounded-full flex-1"></div>
                  </div>
               ))}
             </div>
             
             <button className="w-full mt-6 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-lg shadow-primary-500/25">
               Opinar sobre Tema
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Minus, Info } from "lucide-react";

export function ResultsLivePulse() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        {/* Left: Title & Items */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
              Señales en vivo
            </h3>
            <span className="text-[10px] font-medium text-slate-500">Qué está pasando ahora</span>
          </div>

          <div className="w-px h-8 bg-slate-200 hidden md:block" />

          <div className="flex flex-wrap items-center gap-6 gap-y-4">
            {/* Sube */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Minus className="w-3 h-3 text-emerald-500 rotate-45" /> Sube
              </div>
              <div className="text-sm font-black text-slate-900 leading-tight">Marcas de Ahorro y Precio</div>
              <div className="text-[10px] text-slate-500 font-medium">Consumo Diario</div>
            </div>

            {/* Explota */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Minus className="w-3 h-3 text-rose-500" /> Explota
              </div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                Torneo de Supermercados
                <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-[4px] text-[8px] uppercase tracking-widest font-black">En vivo</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium opacity-0">.</div>
            </div>

            {/* Cae */}
            <div className="hidden sm:flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Minus className="w-3 h-3 text-indigo-400 -rotate-45" /> Cae
              </div>
              <div className="text-sm font-black text-slate-900 leading-tight">Fidelidad en Telecom</div>
              <div className="text-[10px] text-slate-500 font-medium">Servicios</div>
            </div>

            {/* Se estabiliza */}
            <div className="hidden lg:flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Minus className="w-3 h-3 text-slate-400" /> Se estabiliza
              </div>
              <div className="text-sm font-black text-slate-900 leading-tight">Bebidas y Gaseosas</div>
              <div className="text-[10px] text-slate-500 font-medium">Consumo Masivo</div>
            </div>
          </div>
        </div>

        {/* Right: Generational Insight Pill */}
        <div className="shrink-0 bg-amber-50 border border-amber-200/50 rounded-xl px-4 py-3 flex items-start sm:items-center gap-3">
           <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0">
             <Info className="w-4 h-4" />
           </div>
           <p className="text-xs font-bold text-amber-900 leading-snug max-w-[200px]">
             Tu generación está empujando el cambio en Ahorro y Precio
           </p>
        </div>

      </div>
    </div>
  );
}

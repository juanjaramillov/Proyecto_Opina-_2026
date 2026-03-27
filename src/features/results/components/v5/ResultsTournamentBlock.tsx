import { Layers, ChevronRight, Trophy, ArrowRight, Activity, TrendingUp } from "lucide-react";

export function ResultsTournamentBlock() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-8">
      <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex relative">
      
      {/* Decorative Left Border */}
      <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0 bottom-0" />
      
      {/* Top Left Icon Container */}
      <div className="absolute left-6 top-6 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
        <Layers className="w-5 h-5 text-amber-500" />
      </div>

      <div className="w-full p-6 md:p-8 md:pl-[5.5rem] pl-20 relative flex flex-col">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full border-b border-slate-100 pb-6 mb-6">
           <div>
             <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">
               CÓMO CAMBIAN SUS HÁBITOS
             </div>
             <div className="flex flex-wrap items-center gap-3 mb-2">
               <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
                 La gente compara más antes de comprar
               </h2>
               <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                 Subiendo Rápido
               </span>
               <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                 <TrendingUp className="w-4 h-4 text-emerald-500" /> +15% más que el mes pasado
               </span>
             </div>
             <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed">
               Así es como las personas están cambiando su forma de gastar este trimestre, dejando atrás compras impulsivas.
             </p>
           </div>
           
           <button className="shrink-0 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
             Ver árbol de evolución <ChevronRight className="w-4 h-4" />
           </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Col 1: Líder actual ( spans 3 ) */}
          <div className="lg:col-span-3 flex flex-col">
             <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">Comportamiento Principal</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">Lo que más hacen hoy</p>
             </div>
             
             <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[160px] shadow-sm overflow-hidden group">
               <div className="absolute inset-0 bg-white/40 blur-xl group-hover:bg-white/60 transition-colors" />
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                   <Trophy className="w-6 h-6 text-amber-500" />
                 </div>
                 <div className="font-black text-xl text-slate-900 flex flex-col items-center justify-center gap-1 mb-1 leading-tight">
                   Comparar precios online
                   <span className="px-1.5 py-0.5 mt-1 bg-emerald-100 text-emerald-700 rounded text-[9px] uppercase tracking-widest font-black flex items-center gap-1">
                     <TrendingUp className="w-3 h-3" /> Fuerte Alza
                   </span>
                 </div>
                 <div className="text-[10px] font-bold text-amber-700 mt-2">La clase media lo lidera</div>
               </div>
             </div>
          </div>

          {/* Col 2: Ruta de avance ( spans 6 ) */}
          <div className="lg:col-span-6 flex flex-col">
             <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">Cómo ha crecido</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">La historia reciente de este hábito</p>
             </div>
             
             {/* Mini bracket horizontal */}
             <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-center justify-between h-full min-h-[160px] relative">
               
               {/* Step 1 */}
               <div className="flex flex-col items-center text-center w-1/3 relative z-10">
                 <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm w-full mb-2">
                   <div className="text-[11px] font-black text-slate-900 mb-0.5 leading-tight">Miran reviews <span className="text-[8px] flex items-center justify-center gap-0.5 text-emerald-500"><TrendingUp className="w-2 h-2"/> +5%</span></div>
                   <div className="text-[9px] text-slate-400 font-medium border-t border-slate-100 pt-0.5 mt-0.5">Le ganan a comprar a ciegas</div>
                 </div>
                 <div className="text-[10px] font-bold text-emerald-600">Paso 1: Empezaron a revisar</div>
               </div>

               <ArrowRight className="w-4 h-4 text-slate-300 relative z-10 shrink-0 mx-1" />

               {/* Step 2 (Current) */}
               <div className="flex flex-col items-center text-center w-1/3 relative z-10">
                 <div className="bg-white px-3 py-2 rounded-xl border-2 border-amber-300 shadow-md shadow-amber-100 w-full mb-2 relative transform scale-105">
                   <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full animate-ping opacity-50" />
                   <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
                   <div className="text-[11px] font-black text-slate-900 mb-0.5 leading-tight">Solo con cupón <span className="text-[8px] flex items-center justify-center gap-0.5 text-emerald-500"><TrendingUp className="w-2 h-2"/> +8%</span></div>
                   <div className="text-[9px] text-slate-500 font-medium border-t border-slate-100 pt-0.5 mt-0.5">Le ganan a comprar por comprar</div>
                 </div>
                 <div className="text-[10px] font-bold text-amber-600">Paso 2: Se vuelve la regla</div>
               </div>

               <ArrowRight className="w-4 h-4 text-slate-300 relative z-10 shrink-0 mx-1" />

               {/* Step 3 (Next) */}
               <div className="flex flex-col items-center text-center w-1/3 relative z-10 opacity-60">
                 <div className="bg-slate-100/50 px-3 py-2 rounded-xl border border-slate-200 border-dashed w-full mb-2">
                   <div className="text-[11px] font-black text-slate-600 mb-0.5">Solo lo barato</div>
                   <div className="text-[9px] text-slate-400 font-medium border-t border-slate-200 pt-0.5 mt-0.5">Le ganaría a pagar marca pura</div>
                 </div>
                 <div className="text-[10px] font-bold text-slate-400">Pronto pasará</div>
               </div>

               {/* Connecting background line */}
               <div className="absolute top-1/2 left-10 right-10 h-px bg-slate-200/50 -translate-y-4 z-0" />

             </div>
          </div>

          {/* Col 3: Impacto Demográfico ( spans 3 ) */}
          <div className="lg:col-span-3 flex flex-col">
             <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900">Quiénes lo hacen más</h3>
             </div>
             
             <div className="flex flex-col gap-3 justify-center h-full">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 leading-tight">+14% de aceleración</div>
                    <div className="text-[10px] font-medium text-slate-600">En jóvenes de 25 a 35 años</div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                  <div className="p-1.5 bg-slate-200 text-slate-500 rounded shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 leading-tight">En todos lados</div>
                    <div className="text-[10px] font-medium text-slate-600">Lo hacen en todos los niveles de ingreso</div>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
    </section>
  );
}

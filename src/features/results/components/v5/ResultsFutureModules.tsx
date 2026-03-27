import { Sparkles, Building2, Radio } from "lucide-react";

export function ResultsFutureModules() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-8 pb-8">
      <div className="w-full">
      <div className="flex items-center gap-2 mb-6 px-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Próximas dimensiones</h3>
        <div className="h-px bg-slate-200 flex-1 ml-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Module 1 */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 md:p-8 hover:border-indigo-200 transition-colors cursor-not-allowed">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
             <Building2 className="w-32 h-32" />
           </div>
           <div className="relative z-10">
             <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
               Próximamente
             </div>
             <h4 className="text-xl md:text-2xl font-black text-slate-400 mb-2">
               Políticos y Partidos
             </h4>
             <p className="text-sm font-medium text-slate-400/80 max-w-[80%]">
               El impacto de la contingencia política evaluado en tiempo real.
             </p>
           </div>
        </div>

        {/* Module 2 */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 md:p-8 hover:border-pink-200 transition-colors cursor-not-allowed">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
             <Radio className="w-32 h-32" />
           </div>
           <div className="relative z-10">
             <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
               Próximamente
             </div>
             <h4 className="text-xl md:text-2xl font-black text-slate-400 mb-2">
               Medios y Voceros
             </h4>
             <p className="text-sm font-medium text-slate-400/80 max-w-[80%]">
               Credibilidad e influencia de los comunicadores de hoy.
             </p>
           </div>
        </div>

      </div>
    </div>
    </section>
  );
}

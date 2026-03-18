import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';

interface ResultsEcosystemProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsEcosystem({ snapshot }: ResultsEcosystemProps) {
  return (
    <div className="w-full bg-slate-50 py-20 md:py-32 relative overflow-hidden">
       {/* Section Header */}
       <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">Ecosistema de Señales</div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] text-ink">
             Explora las<br/>Dimensiones del Debate.
          </h2>
       </div>

       {/* Bento Grid Premium */}
       <div className="max-w-[1400px] mx-auto px-6 md:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
              
              {/* Versus Panel (Active, Hero Card) */}
              <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-slate-900 rounded-[2rem] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900/10 pointer-events-none"></div>
                 
                 <div className="relative z-20 flex justify-between items-start">
                    <div className="flex flex-col">
                       <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Versus</h3>
                       <p className="text-xs md:text-sm font-medium text-slate-400 mt-2 max-w-sm">Decisiones binarias de alto contraste. Observa la fricción directa entre dos posturas absolutas.</p>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-full backdrop-blur-md">
                       Activo
                    </div>
                 </div>

                 {/* Visualization Hint */}
                 <div className="relative z-10 flex items-end gap-2 h-32 mt-8 opacity-80 group-hover:opacity-100 transition-opacity">
                     {[20, 60, 40, 80, 50, 90, 30].map((val, i) => (
                        <div key={i} className={`flex-1 rounded-t-lg transition-all duration-700 ${i%2===0 ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ height: `${val}%`}}></div>
                     ))}
                 </div>
              </div>

              {/* Torneos Panel (Active, Standard Card) */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                       <h3 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Torneos</h3>
                       <p className="text-xs font-medium text-slate-500 mt-2">Batallas eliminatorias para encontrar el concepto supremo.</p>
                    </div>
                 </div>
                 <div className="mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">1</div>
                       <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">2</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 py-2 px-4 rounded-full">
                       {snapshot.overview?.totalSignals || 3} Activos
                    </div>
                 </div>
              </div>

              {/* Profundidad (Locked Card) */}
              <div className="bg-slate-100/50 border border-slate-200 border-dashed rounded-[2rem] p-8 flex flex-col justify-between opacity-70 cursor-not-allowed">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                       <h3 className="text-2xl md:text-3xl font-black text-slate-400 tracking-tight">Profundidad</h3>
                       <p className="text-xs font-medium text-slate-400 mt-2">Análisis de arquetipos y motivaciones subyacentes.</p>
                    </div>
                 </div>
                 <div className="mt-8 flex justify-end">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200/50 py-2 px-4 rounded-full">
                       Nivel {'>'} 5
                    </div>
                 </div>
              </div>

              {/* Actualidad (Locked Card) */}
              <div className="bg-slate-100/50 border border-slate-200 border-dashed rounded-[2rem] p-8 flex-col justify-between opacity-70 cursor-not-allowed hidden lg:flex">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                       <h3 className="text-2xl md:text-3xl font-black text-slate-400 tracking-tight">Actualidad</h3>
                       <p className="text-xs font-medium text-slate-400 mt-2">Señales efímeras basadas en el ciclo de noticias 24h.</p>
                    </div>
                 </div>
                 <div className="mt-8 flex justify-end">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200/50 py-2 px-4 rounded-full">
                       Próximamente
                    </div>
                 </div>
              </div>

           </div>
       </div>
    </div>
  );
}

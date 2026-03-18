import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';

interface ResultsEcosystemProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsEcosystem({ snapshot }: ResultsEcosystemProps) {
  return (
    <div className="w-full mt-0 bg-white py-24 md:py-32 relative overflow-hidden">
       {/* Section Header */}
       <div className="px-6 md:px-12 mb-16 md:mb-24">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">- Ecosistema de Señales</div>
          <h2 className="text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] text-ink max-w-[90vw]">
             Dashboard<br/>Multidimensional.
          </h2>
       </div>

       {/* Bento Grid */}
       <div className="w-full px-4 md:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
              
              {/* Versus Panel (Active, Giant) */}
              <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-slate-950 flex flex-col relative overflow-hidden group cursor-crosshair rounded-[2rem] md:rounded-[3rem]">
                 <div className="p-8 md:p-12 relative z-20 flex justify-between items-start">
                    <div className="flex flex-col">
                       <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">Versus</h3>
                       <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-slate-500 mt-2">Choques Directos</p>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 py-2 px-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30 rounded-full">
                       Activo
                    </div>
                 </div>

                 {/* Visualization Data Overlay */}
                 <div className="absolute inset-0 z-10 flex flex-col justify-end pt-[20%] opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex w-full h-[70%] items-end gap-1 md:gap-2 px-8 pb-12">
                          {[40, 80, 20, 100, 60, 45, 90, 30, 70, 50, 85, 25, 90, 35, 65, 80, 50].map((val, i) => (
                             <div key={i} className={`flex-1 ${i%2===0 ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'} rounded-t-sm transition-all duration-700 group-hover:brightness-125`} style={{ height: `${val}%`}}></div>
                          ))}
                      </div>
                 </div>
              </div>

              {/* Torneos Panel (Active, Slim) */}
              <div className="md:col-span-1 lg:col-span-2 row-span-1 bg-slate-100 flex flex-col relative overflow-hidden group cursor-crosshair rounded-[2rem] md:rounded-[3rem]">
                 <div className="p-8 md:p-12 relative z-20 flex justify-between items-start">
                    <div className="flex flex-col">
                       <h3 className="text-3xl md:text-5xl font-black text-ink uppercase tracking-tighter">Batallas</h3>
                       <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-slate-500 mt-2">Eliminatorias</p>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 py-2 px-4 border border-indigo-500/30 rounded-full">
                       {snapshot.overview?.totalSignals || 3} Torneos
                    </div>
                 </div>
                 {/* Visualization */}
                 <div className="absolute inset-0 z-10 flex flex-col justify-end opacity-40 group-hover:opacity-80 transition-opacity px-8 pb-8">
                     <div className="w-full flex flex-col items-center">
                        <div className="w-[10%] h-12 border-t-[3px] border-l-[3px] border-r-[3px] border-ink rounded-t-lg"></div>
                        <div className="w-[60%] flex justify-between h-12">
                            <div className="w-1/2 border-t-[3px] border-l-[3px] border-ink rounded-tl-lg"></div>
                            <div className="w-1/2 border-t-[3px] border-r-[3px] border-ink rounded-tr-lg"></div>
                        </div>
                     </div>
                 </div>
              </div>

              {/* Profundidad (Inactive) */}
              <div className="md:col-span-1 lg:col-span-1 row-span-1 border border-ink/10 flex flex-col relative overflow-hidden p-8 opacity-60 rounded-[2rem] md:rounded-[3rem]">
                 <h3 className="text-2xl md:text-3xl font-black text-ink uppercase tracking-tighter">Prof.</h3>
                 <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-slate-400 mt-2">Bloqueado</p>
                 <div className="absolute -right-8 -bottom-8 w-40 h-40 border-[2px] border-ink border-dashed rounded-full opacity-20 hover:scale-110 transition-transform duration-700"></div>
                 <div className="absolute -right-4 -bottom-4 w-28 h-28 border-[1px] border-ink border-dashed rounded-full opacity-20"></div>
              </div>

              {/* Actualidad (Inactive) */}
              <div className="md:col-span-1 lg:col-span-1 row-span-1 border border-ink/10 flex flex-col relative overflow-hidden p-8 opacity-60 rounded-[2rem] md:rounded-[3rem]">
                 <h3 className="text-2xl md:text-3xl font-black text-ink uppercase tracking-tighter">Act.</h3>
                 <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-slate-400 mt-2">Waitlist</p>
                 <div className="absolute inset-x-0 bottom-12 h-[2px] bg-ink/20 hover:bg-ink/40 transition-colors"></div>
                 <div className="absolute inset-x-0 bottom-20 h-[1px] bg-ink/20"></div>
                 <div className="absolute inset-x-0 bottom-28 h-[1px] bg-ink/10"></div>
              </div>
           </div>
       </div>
    </div>
  );
}

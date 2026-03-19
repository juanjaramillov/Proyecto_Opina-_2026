import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Swords, Trophy, Target, Globe } from 'lucide-react';

interface ResultsEcosystemProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsEcosystem({ snapshot: _snapshot }: ResultsEcosystemProps) {
  return (
    <div className="w-full bg-slate-50 py-24 md:py-32 relative overflow-hidden">
       {/* Section Header */}
       <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
          <div className="flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dónde nacen las señales</div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 max-w-3xl">
             El Ecosistema <br className="hidden md:block"/>de Opinión.
          </h2>
       </div>

       {/* Bento Grid */}
       <div className="max-w-[1400px] mx-auto px-6 md:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
              
              {/* 1. Versus Panel */}
              <div className="md:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1)_0%,transparent_60%)] pointer-events-none"></div>
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                       <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                           <Swords className="w-7 h-7 text-white" />
                       </div>
                       <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/50 border border-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">Versus • 12k Señales</span>
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] max-w-xl text-balance">
                        Apple vs Android se encuentra en empate técnico 50/50 hoy.
                    </h3>
                 </div>
              </div>

              {/* 2. Torneos Panel */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/30 cursor-pointer text-balance">
                 <div className="flex flex-col h-full justify-between">
                    <div>
                       <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-8 group-hover:bg-orange-500 transition-colors duration-500">
                           <Trophy className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-500" />
                       </div>
                       <span className="inline-block px-3 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 rounded-full mb-4">Torneo • Final</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                        "Cultura" domina frente a "Salario".
                    </h3>
                 </div>
              </div>

              {/* 3. Profundidad (Locked/Info Card) */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-slate-300 cursor-pointer text-balance">
                 <div className="flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                           <Target className="w-7 h-7 text-slate-500" />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 py-1.5 px-3 rounded-full">
                           Nivel {'>'} 5
                        </div>
                    </div>
                    
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Profundidad</span>
                       <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-[1.1]">
                           Descubre los arquetipos detrás de tu opinión.
                       </h3>
                    </div>
                 </div>
              </div>

              {/* 4. Actualidad */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-900/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.05)_0%,transparent_50%)] pointer-events-none"></div>
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors duration-500">
                            <Globe className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            En Vivo
                        </div>
                    </div>
                    
                    <div>
                        <span className="inline-block px-3 py-1 bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 rounded-full mb-4">Actualidad • 54k Señales</span>
                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] max-w-xl text-balance">
                            La regulación de redes concentra el 80% de la participación hoy.
                        </h3>
                    </div>
                 </div>
              </div>

           </div>
       </div>
    </div>
  );
}

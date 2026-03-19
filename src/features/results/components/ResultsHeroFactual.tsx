import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';
import { Target, SplitSquareHorizontal, Users, ArrowRight } from 'lucide-react';

interface ResultsHeroFactualProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsHeroFactual({}: ResultsHeroFactualProps) {
  return (
    <div className="w-full bg-slate-50 pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col gap-12">
        
        {/* Encabezado Opcional / Sutil */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Estado de la Comunidad</span>
        </div>

        {/* 3 Insights Criticos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* 1. Consenso Fuerte */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
               <div className="flex flex-col gap-4 mb-12">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <Users className="w-6 h-6" />
                   </div>
                   <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                       El 89% prefiere Trabajo Remoto
                   </h2>
                   <p className="text-base font-medium text-slate-500">Consenso absoluto detectado hoy.</p>
               </div>
               
               <div className="mt-auto flex flex-col gap-3">
                   <div className="flex justify-between items-end">
                       <span className="text-5xl font-black text-emerald-500 tracking-tighter">89%</span>
                   </div>
                   <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                       <div className="h-full bg-emerald-500 rounded-full shadow-sm" style={{ width: `89%` }}></div>
                   </div>
               </div>
            </div>

            {/* 2. Polarización */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
               <div className="flex flex-col gap-4 mb-12">
                   <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                       <SplitSquareHorizontal className="w-6 h-6" />
                   </div>
                   <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                       Empate técnico: IA vs Privacidad
                   </h2>
                   <p className="text-base font-medium text-slate-500">La comunidad está totalmente dividida.</p>
               </div>
               
               <div className="mt-auto flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <span className="text-3xl font-black text-indigo-600">52%</span>
                        <span className="text-3xl font-black text-rose-500">48%</span>
                    </div>
                    <div className="flex h-4 w-full bg-slate-100 rounded-full overflow-hidden gap-1 p-1">
                        <div className="h-full bg-indigo-500 rounded-l-full shadow-sm" style={{ width: `52%` }}></div>
                        <div className="h-full bg-rose-500 rounded-r-full shadow-sm" style={{ width: `48%` }}></div>
                    </div>
               </div>
            </div>

            {/* 3. Enganche Usuario (Personal) */}
            <div className="bg-indigo-600 p-8 md:p-10 rounded-[2rem] border border-indigo-500 shadow-lg flex flex-col group hover:-translate-y-1 hover:shadow-indigo-500/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
               <div className="flex flex-col gap-4 mb-12 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                       <Target className="w-6 h-6" />
                   </div>
                   <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                       Tu postura <br/>es clave.
                   </h2>
                   <p className="text-base md:text-lg font-medium text-indigo-200">En 3 decisiones recientes votaste en tu propio camino.</p>
               </div>
               
               <div className="mt-auto flex items-center justify-between relative z-10">
                   <span className="text-xl font-bold text-white">Mira tu perfil transversal</span>
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors shadow-lg">
                       <ArrowRight className="w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                   </div>
               </div>
            </div>

        </div>

      </div>
    </div>
  );
}

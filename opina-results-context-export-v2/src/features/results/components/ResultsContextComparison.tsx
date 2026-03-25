import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';

interface Props {
  snapshot: MasterHubSnapshot;
}

export function ResultsContextComparison({ snapshot: _snapshot }: Props) {
  return (
    <section className="w-full bg-white py-12 md:py-20 border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
           
           <div className="md:w-[40%]">
             <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] mb-4">
               Contexto
             </div>
             <h2 className="text-3xl font-black tracking-tight text-slate-950 mb-3">
               Tu micro-universo
             </h2>
             <p className="text-slate-600 text-lg">
               Comparamos tus decisiones no solo con el universo total de Opina+, sino con perfiles demográficos similares al tuyo.
             </p>
           </div>

           <div className="md:w-[60%] bg-slate-50 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row gap-8 w-full border border-slate-100 overflow-hidden relative">
              
              {/* Bloque 1 - Group */}
              <div className="flex-1 flex flex-col justify-center relative z-10">
                 <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">En tu grupo</h4>
                 <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">Altamente<br/>alineado</h3>
                 <p className="text-sm text-slate-600 mb-6">Con hombres de 25-34 años.</p>
                 
                 <div className="flex items-center gap-3">
                   <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                         <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray="283" strokeDashoffset="42" strokeLinecap="round" />
                      </svg>
                   </div>
                   <span className="text-xl font-black text-indigo-600">85%</span>
                 </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-auto bg-slate-200"></div>
              <div className="md:hidden h-px w-full bg-slate-200"></div>

              {/* Bloque 2 - Total */}
              <div className="flex-1 flex flex-col justify-center relative z-10">
                 <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Comunidad</h4>
                 <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">Ligeramente<br/>distante</h3>
                 <p className="text-sm text-slate-600 mb-6">Comparado al total de Opina+.</p>
                 
                 <div className="flex items-center gap-3">
                   <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                         <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="283" strokeDashoffset="113" strokeLinecap="round" />
                      </svg>
                   </div>
                   <span className="text-xl font-black text-emerald-600">60%</span>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </section>
  );
}

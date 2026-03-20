import { MasterHubSnapshot } from '../../../read-models/b2c/hub-types';

interface Props {
  snapshot: MasterHubSnapshot;
}

export function ResultsAlignment({ snapshot: _snapshot }: Props) {
  // Mock data for B2C display until actual logic is mapped perfectly:
  const consensusTopics = [
    { label: 'Hábitos alimenticios', percentage: 84 },
    { label: 'Uso de redes sociales', percentage: 76 }
  ];
  
  const divergenceTopics = [
    { label: 'Inversiones crypto', percentage: 12 },
    { label: 'Rutina matutina', percentage: 21 }
  ];

  return (
    <section className="w-full bg-slate-50 py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950">
            Dónde conectas y dónde divides
          </h2>
          <p className="mt-2 text-slate-600 text-lg">
            Tu nivel de sintonía con el grupo en áreas clave.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Consenso */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50 z-0 pointer-events-none"></div>
             
             <div className="relative z-10 flex-1">
               <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">diversity_3</span>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-900">Coincides con la mayoría</h3>
                   <p className="text-sm text-slate-500 font-medium">Temas donde eres parte del consenso</p>
                 </div>
               </div>
               
               <div className="space-y-5">
                 {consensusTopics.map((t, idx) => (
                   <div key={idx} className="flex flex-col gap-2">
                     <div className="flex justify-between items-end">
                       <span className="text-base font-bold text-slate-800">{t.label}</span>
                       <span className="text-emerald-600 font-black text-lg">{t.percentage}%</span>
                     </div>
                     <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${t.percentage}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Card: Divergencia */}
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 z-0 pointer-events-none"></div>
             
             <div className="relative z-10 flex-1">
               <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">offline_bolt</span>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-white">Rompes el patrón</h3>
                   <p className="text-sm text-slate-400 font-medium">Temas donde piensas muy diferente</p>
                 </div>
               </div>
               
               <div className="space-y-5">
                 {divergenceTopics.map((t, idx) => (
                   <div key={idx} className="flex flex-col gap-2">
                     <div className="flex justify-between items-end">
                       <span className="text-base font-bold text-slate-200">{t.label}</span>
                       <span className="text-indigo-400 font-black text-lg">{t.percentage}%</span>
                     </div>
                     <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${t.percentage}%` }}></div>
                     </div>
                     <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">Sólo el {t.percentage}% eligió lo mismo que tú</p>
                   </div>
                 ))}
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

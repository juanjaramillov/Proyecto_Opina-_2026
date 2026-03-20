import { MasterHubSnapshot } from '../../../../read-models/b2c/hub-types';

interface TransversalComparatorProps {
  snapshot: MasterHubSnapshot;
  loading?: boolean;
}

export function TransversalComparator({ snapshot: _snapshot, loading }: TransversalComparatorProps) {
  if (loading) return null;
  
  // Data mock para demostración de arquitectura V4
  const userScore = 82; // Score de alineación global
  
  return (
    <div className="w-full bg-slate-950 py-24 md:py-32 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none"></div>

        <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
            
            {/* Título Principal (Conclusión Primero) */}
            <span className="inline-block px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                Tú vs La Comunidad
            </span>
            
            <h2 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white leading-[0.9] tracking-tighter mb-8 text-balance">
                Coincides con <br className="hidden md:block"/> la corriente principal.
            </h2>
            
            <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mb-24 text-balance">
                En el 82% de las fricciones recientes, tu perfil ha reflejado exactamente el consenso global de Opina+.
            </p>

            {/* Visualización Simple (Justificación) */}
            <div className="relative flex items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-full aspect-square w-72 md:w-96 shadow-[0_0_80px_rgba(99,102,241,0.15)] group hover:scale-[1.02] transition-transform duration-700">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-900" />
                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" 
                        className="text-indigo-500 transition-all duration-1000 ease-out" 
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * userScore) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="flex flex-col items-center justify-center text-white relative z-10">
                    <span className="text-7xl md:text-[120px] font-black tracking-tighter leading-none mb-2">{userScore}%</span>
                    <span className="text-xs md:text-sm font-bold text-indigo-400 uppercase tracking-[0.3em]">Afinidad</span>
                </div>
            </div>

        </div>
    </div>
  );
}

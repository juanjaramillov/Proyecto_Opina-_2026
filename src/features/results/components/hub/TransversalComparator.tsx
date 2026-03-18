import { MasterHubSnapshot } from '../../../../read-models/b2c/hub-types';
import { ArrowRight } from 'lucide-react';

interface TransversalComparatorProps {
  snapshot: MasterHubSnapshot;
  loading?: boolean;
}

export function TransversalComparator({ snapshot: _snapshot, loading }: TransversalComparatorProps) {
  if (loading) return null;
  
  // Data mock para demostración de arquitectura V3
  const userScore = 82; // Score de alineación global
  const items = [
    { label: 'Marcas Tecnológicas', userAf: 90, commAf: 75 },
    { label: 'Sustentabilidad', userAf: 45, commAf: 80 },
    { label: 'Cultura de Trabajo', userAf: 85, commAf: 82 },
  ];

  return (
    <div className="w-full bg-slate-950 py-24 md:py-32 relative overflow-hidden border-b border-slate-900">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
            
            {/* Título Principal */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
                    Análisis Transversal
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                    Tu Espejo frente a <br className="hidden md:block"/> la Comunidad.
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                
                {/* Score Panel */}
                <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                        Veredicto Global de Alineación
                    </p>
                    
                    <div className="relative mb-8">
                        <svg className="w-48 h-48 md:w-64 md:h-64 -rotate-90 transform drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className="text-indigo-500 transition-all duration-1000 ease-out" 
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * userScore) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <span className="text-6xl md:text-7xl font-black tracking-tighter leading-none">{userScore}%</span>
                            <span className="text-sm font-bold text-indigo-400 mt-2 hover:text-indigo-300">Afinidad</span>
                        </div>
                    </div>

                    <p className="text-lg text-slate-300 font-medium">
                        Tu postura representa a la corriente principal en la mayoría de los tópicos evaluados.
                    </p>
                </div>

                {/* Detail Bars Panel */}
                <div className="lg:col-span-7 flex flex-col justify-center gap-8">
                    
                    {/* Header de Leyenda */}
                    <div className="flex items-center justify-end gap-6 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Tú</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Comunidad</span>
                        </div>
                    </div>

                    {/* Barras de Datos */}
                    {items.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-3 group cursor-pointer">
                            <div className="flex justify-between items-end">
                                <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{item.label}</h4>
                                <span className="text-xl font-black text-slate-500">{Math.abs(item.userAf - item.commAf)}% Brecha</span>
                            </div>
                            
                            <div className="relative h-14 bg-white/5 rounded-2xl p-2 flex flex-col justify-center gap-1.5 border border-white/5 group-hover:border-white/10 transition-colors">
                                <div className="h-2.5 bg-indigo-500 rounded-full transition-all duration-1000 relative" style={{ width: `${item.userAf}%` }}>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full transition-all duration-1000 relative" style={{ width: `${item.commAf}%` }}></div>
                            </div>
                        </div>
                    ))}

                    <button className="flex items-center gap-2 group text-indigo-400 hover:text-white font-bold text-lg mt-6 w-max transition-colors">
                        Explorar mi sesgo a detalle
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                </div>
            </div>

        </div>
    </div>
  );
}

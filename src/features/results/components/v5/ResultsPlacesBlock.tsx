import { MapPin, Navigation, TrendingUp, TrendingDown, Compass } from 'lucide-react';

export const ResultsPlacesBlock = () => {
  const regions = [
    { name: 'Área Metropolitana', value: 85, trend: '+5% este mes', status: 'dominant' },
    { name: 'Región Norte', value: 72, trend: '+2% este mes', status: 'stable' },
    { name: 'Zona Sur', value: 45, trend: '-3% están yéndose', status: 'opportunity' },
  ];

  const drivers = [
    { label: 'Buscan precios bajos todo el tiempo', impact: 'Pasa Mucho' },
    { label: 'Solo compran cerca a sus casas', impact: 'Pasa Mucho' },
    { label: 'Cambian tienda si es más amigable', impact: 'Pasa Poco' }
  ];

  return (
    <section className="w-full py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
               </pattern>
               <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
               </radialGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dot-grid)" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#map-glow)" />
         </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="inline-block mb-4 border border-slate-700 text-slate-300 rounded-full px-4 py-1 uppercase tracking-widest text-xs font-semibold bg-slate-800/50 backdrop-blur-sm">
                DÓNDE PASA ESTO
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-6">
                El mapa de <br/> las personas
              </h2>
              <p className="text-lg text-slate-400 max-w-md">
                En qué ciudades o regiones la gente está cambiando más rápido sus hábitos diarios.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
               {drivers.map((d, i) => (
                 <div key={i} className={`p-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-sm ${i === 0 ? 'col-span-2' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                       <Compass className="w-4 h-4 text-brand-primary" />
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lo más buscado {i+1}</span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                       <span className="font-semibold text-white">{d.label}</span>
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white transition-colors uppercase tracking-widest">{d.impact}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="lg:col-span-7">
             <div className="flex flex-col gap-4">
                {regions.map((region, idx) => (
                   <div 
                      key={idx} 
                      className={`relative p-6 rounded-3xl border backdrop-blur-xl overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${
                        idx === 0 
                          ? 'bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border-brand-primary/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                   >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                               idx === 0 ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white/10 text-slate-300'
                            }`}>
                               <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="text-xl font-bold text-white">{region.name}</h3>
                               <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                  <Navigation className="w-3 h-3" />
                                  Cambio de Hábito
                               </p>
                            </div>
                         </div>
                         
                         <div className="flex items-end sm:items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                            <div className="text-right">
                               <div className="text-sm font-bold text-slate-400 mb-1">Personas</div>
                               <div className="text-3xl font-black text-white">{region.value}<span className="text-lg text-slate-500">%</span></div>
                            </div>
                            <div className={`flex flex-col items-end gap-1 font-bold px-3 py-1.5 rounded-xl border text-sm ${
                               region.trend.includes('+') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                               <div className="flex items-center gap-1">
                                 {region.trend.includes('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                 {region.trend}
                               </div>
                            </div>
                         </div>
                      </div>

                      {idx === 0 && (
                         <div className="mt-6 w-full h-1.5 bg-brand-primary/20 rounded-full overflow-hidden relative">
                            <div className="h-full bg-brand-primary rounded-full relative w-[85%]">
                               <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                            </div>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

import { Flame, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function ResultsPulse() {
  // Datos Falsos Factuales para propósitos UI
  const insights = [
    {
      id: 1,
      type: 'hot',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      title: "Tema más debatido",
      metric: "52/48",
      entityName: "Inteligencia Artificial en Educación",
      subtitle: "Extrema polarización detectada en las últimas 24hs."
    },
    {
      id: 2,
      type: 'growing',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      title: "Consenso Creciente",
      metric: "89%",
      entityName: "Regulación de Redes Sociales",
      subtitle: "+15% de adopción en el último mes."
    },
    {
      id: 3,
      type: 'falling',
      icon: <TrendingDown className="w-5 h-5 text-amber-500" />,
      title: "Pérdida de Interés",
      metric: "-22%",
      entityName: "Formatos de Video Corto",
      subtitle: "Caída de participación generalizada."
    }
  ];
  return (
    <div className="w-full mt-8 lg:mt-16 mb-24 relative">
       {/* Sección Header Minimalista */}
       <div className="flex flex-col md:w-1/3 mb-12 lg:mb-20 px-4 md:px-0">
          <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-ink" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-ink">Pulso del Momento</h2>
          </div>
          <p className="text-3xl font-black text-ink leading-tight tracking-tight">Qué está dictando la agenda de la red.</p>
       </div>

       {/* Lista Brutalista Edge-to-Edge */}
       <div className="w-full flex justify-center bg-white border-t-2 border-ink">
          <div className="w-full max-w-[1200px] flex flex-col">
              {insights.map((item) => {
                 const bgHoverColor = item.type === 'hot' 
                    ? 'bg-rose-50' 
                    : item.type === 'growing' 
                        ? 'bg-emerald-50' 
                        : 'bg-amber-50';
                 
                 const textColorClass = item.type === 'hot' 
                    ? 'group-hover:text-rose-600' 
                    : item.type === 'growing' 
                        ? 'group-hover:text-emerald-600' 
                        : 'group-hover:text-amber-600';

                 return (
                 <div 
                     key={item.id} 
                     className="group flex flex-col md:flex-row md:items-center justify-between py-12 md:py-16 px-4 md:px-8 border-b border-stroke relative overflow-hidden transition-colors duration-500 hover:bg-surface2/50 cursor-default"
                 >
                     {/* Fondo Reactivo */}
                     <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none -z-10 ${bgHoverColor}`}></div>
                     
                     {/* Metadata Lateral */}
                     <div className="flex flex-col md:w-1/4 mb-6 md:mb-0 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${item.type === 'hot' ? 'border-rose-200 text-rose-500 bg-white' : item.type === 'growing' ? 'border-emerald-200 text-emerald-500 bg-white' : 'border-amber-200 text-amber-500 bg-white'}`}>
                               {item.icon}
                           </div>
                           <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-text-secondary">{item.title}</span>
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-text-muted max-w-[200px]">{item.subtitle}</p>
                     </div>
                     
                     {/* Titular Masivo Brutalista */}
                     <div className="md:w-1/2 relative z-10 flex">
                        <h3 className={`text-5xl md:text-6xl lg:text-[80px] font-black text-ink leading-[0.9] tracking-tighter uppercase transition-colors duration-500 ${textColorClass}`}>
                           {item.entityName}
                        </h3>
                     </div>

                     {/* Métrica / Impacto Lateral Derecho */}
                     <div className="flex flex-col md:w-1/4 items-start md:items-end mt-8 md:mt-0 relative z-10">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary mb-2 hidden md:block">Impacto</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-ink">{item.metric}</span>
                        </div>
                     </div>
                 </div>
                 );
              })}
          </div>
       </div>
    </div>
  );
}

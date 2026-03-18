export function ResultsPulse() {
  const insights = [
    {
      id: 1,
      type: 'hot',
      title: "Tema más debatido",
      metric: "52/48",
      entityName: "Inteligencia Artificial",
      subtitle: "Extrema polarización",
      colorClass: "hover:bg-rose-600"
    },
    {
      id: 2,
      type: 'growing',
      title: "Consenso Creciente",
      metric: "89%",
      entityName: "Regulación Redes",
      subtitle: "+15% adopción mensual",
      colorClass: "hover:bg-emerald-600"
    },
    {
      id: 3,
      type: 'falling',
      title: "Pérdida de Interés",
      metric: "-22%",
      entityName: "Formatos Cortos",
      subtitle: "Caída de participación",
      colorClass: "hover:bg-amber-600"
    }
  ];

  return (
    <div className="w-full relative mt-0 mb-0 bg-white flex flex-col pt-24 pb-32">
       {/* Sección Header */}
       <div className="w-full px-6 md:px-12 mb-16">
          <div className="flex items-center gap-3 mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">- Pulso del Momento</div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-[70px] font-black tracking-tighter leading-[0.9] text-ink max-w-[90vw]">
             Agenda en<br/>Tiempo Real.
          </h2>
       </div>

       {/* Lista Brutalista Edge-to-Edge */}
       <div className="w-full flex flex-col border-t border-ink">
          {insights.map((item) => (
             <div 
                 key={item.id} 
                 className={`group w-full flex flex-col xl:flex-row xl:items-center justify-between py-12 md:py-16 px-6 md:px-12 border-b border-ink transition-colors duration-500 cursor-crosshair text-ink hover:text-white ${item.colorClass}`}
             >
                {/* Entidad Titular Masivo */}
                <h3 className="text-[12vw] md:text-[8vw] lg:text-[100px] font-black uppercase tracking-tighter leading-[0.8] w-full xl:w-auto break-words transition-colors">
                   {item.entityName}
                </h3>
                
                {/* Meta details right */}
                <div className="flex flex-col items-start xl:items-end mt-12 xl:mt-0 transition-opacity">
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-50 xl:group-hover:opacity-80">
                      {item.title}
                   </div>
                   <div className="text-6xl lg:text-[100px] font-black tracking-tighter leading-[0.8] mb-4">
                       {item.metric}
                   </div>
                   <div className="text-xs uppercase tracking-[0.2em] font-bold opacity-80">
                       {item.subtitle}
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}

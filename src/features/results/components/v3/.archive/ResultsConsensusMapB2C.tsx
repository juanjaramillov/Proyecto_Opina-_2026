const BUBBLE_DATA = [
  {
    id: "sostenibilidad",
    label: "Sostenibilidad",
    value: "92%",
    status: "CONSENSO TOTAL",
    icon: "eco",
    color: "emerald",
    top: "10%",
    left: "20%",
    size: 180,
    tension: false,
  },
  {
    id: "consumo",
    label: "Consumo",
    value: "78%",
    status: "ALTO FLUJO",
    icon: "shopping_bag",
    color: "blue",
    bottom: "20%",
    right: "15%",
    size: 150,
    tension: false,
  },
  {
    id: "politica",
    label: "Política",
    value: "50/50",
    status: "MÁXIMA POLARIDAD",
    icon: "policy",
    color: "orange",
    top: "35%",
    right: "30%",
    size: 120,
    tension: true,
  },
  {
    id: "educacion",
    label: "Educación",
    value: "65%",
    status: "ESTABLE",
    color: "slate",
    bottom: "10%",
    left: "30%",
    size: 100,
    tension: false,
  },
];

type BubbleColorVariant = {
  border: string;
  bgFade: string;
  textIcon: string;
  textVal: string;
};

export function ResultsConsensusMapB2C() {
  return (
    <section className="mb-16 md:mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Campo de Fuerzas del Ecosistema</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Visualiza cómo gravitan las opiniones sobre los temas que definen nuestra época. El tamaño indica el volumen de señal.</p>
      </div>
      <div className="relative w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden p-8 flex items-center justify-center border border-slate-200 shadow-sm">
        {/* Static Background Grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <div className="w-[80%] h-[80%] border border-slate-200 rounded-full"></div>
          <div className="w-[60%] h-[60%] border border-slate-200 rounded-full absolute"></div>
          <div className="w-[40%] h-[40%] border border-slate-200 rounded-full absolute"></div>
        </div>
        
        {/* Bubble Map Layout */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {BUBBLE_DATA.map((bubble) => {
            const hasIcon = !!bubble.icon;
            
            const colorMap: Record<string, BubbleColorVariant> = {
              emerald: { border: 'border-emerald-200', bgFade: 'bg-emerald-50', textIcon: 'text-emerald-600', textVal: 'text-emerald-600' },
              blue: { border: 'border-primary/20', bgFade: 'bg-primary/5', textIcon: 'text-primary', textVal: 'text-primary' },
              orange: { border: 'border-orange-200', bgFade: 'bg-orange-50', textIcon: 'text-orange-500', textVal: 'text-orange-500' },
              slate: { border: 'border-slate-200', bgFade: 'bg-slate-50', textIcon: 'text-slate-500', textVal: 'text-slate-500' },
            };
            
            const variant = colorMap[bubble.color] || colorMap.slate;

            return (
              <div 
                key={bubble.id}
                className={`absolute rounded-full bg-white border ${variant.border} flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:scale-105 hover:z-20 transition-all duration-300 cursor-pointer group/bubble`}
                style={{
                  top: bubble.top,
                  bottom: bubble.bottom,
                  left: bubble.left,
                  right: bubble.right,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                }}
              >
                <div className={`absolute inset-0 rounded-full opacity-50 ${variant.bgFade}`}></div>
                <div className="relative flex flex-col items-center p-2 text-center">
                  {hasIcon && (
                    <span className={`material-symbols-outlined ${variant.textIcon} mb-1`} style={{ fontVariationSettings: "'FILL' 1", fontSize: bubble.size > 120 ? '2rem' : '1.5rem' }}>
                      {bubble.icon}
                    </span>
                  )}
                  <span className={`text-slate-900 font-bold ${bubble.size > 140 ? 'text-xl' : bubble.size > 110 ? 'text-lg' : 'text-sm'}`}>
                    {bubble.label}
                  </span>
                  <span className={`font-black ${variant.textVal} ${bubble.size > 140 ? 'text-xl' : bubble.size > 110 ? 'text-lg' : 'text-xs'}`}>
                    {bubble.value}
                  </span>
                  <span className={`text-[10px] text-slate-500 font-bold tracking-widest mt-1 leading-tight`}>
                    {bubble.status}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Consenso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tensión</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

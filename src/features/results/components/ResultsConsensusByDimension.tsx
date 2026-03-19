import { ShoppingBag, Heart, LineChart, Landmark, Package } from "lucide-react";

export function ResultsConsensusByDimension() {
  const dimensions = [
    {
      id: "consumo",
      name: "Consumo",
      icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
      consensus: 82,
      description: "Alta alineación en hábitos de compra sustentables y locales.",
      color: "emerald"
    },
    {
      id: "preferencias",
      name: "Preferencias",
      icon: <Heart className="w-5 h-5 text-indigo-500" />,
      consensus: 68,
      description: "Acuerdo moderado en estilos de vida y entretenimiento.",
      color: "indigo"
    },
    {
      id: "economia",
      name: "Economía",
      icon: <LineChart className="w-5 h-5 text-amber-500" />,
      consensus: 55,
      description: "Debate abierto sobre inversión y expectativas futuras.",
      color: "amber"
    },
    {
      id: "politica",
      name: "Política",
      icon: <Landmark className="w-5 h-5 text-rose-500" />,
      consensus: 41,
      description: "Máxima polarización. Comunidad fragmentada en este eje.",
      color: "rose"
    },
    {
      id: "productos",
      name: "Productos",
      icon: <Package className="w-5 h-5 text-cyan-500" />,
      consensus: 75,
      description: "Fuerte tendencia hacia la adopción de nuevas tecnologías.",
      color: "cyan"
    }
  ];

  const getColorClass = (color: string) => {
    switch(color) {
      case "emerald": return "bg-emerald-500";
      case "indigo": return "bg-indigo-500";
      case "amber": return "bg-amber-500";
      case "rose": return "bg-rose-500";
      case "cyan": return "bg-cyan-500";
      default: return "bg-slate-500";
    }
  };

  const getBgClass = (color: string) => {
    switch(color) {
      case "emerald": return "bg-emerald-50";
      case "indigo": return "bg-indigo-50";
      case "amber": return "bg-amber-50";
      case "rose": return "bg-rose-50";
      case "cyan": return "bg-cyan-50";
      default: return "bg-slate-50";
    }
  };

  return (
    <section className="w-full bg-white py-12 md:py-16 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col gap-8 md:gap-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Profundidad por dimensión
            </h2>
            <p className="mt-2 text-lg text-slate-500 font-medium max-w-2xl">
              Nivel de acuerdo de la comunidad desglosado por ejes temáticos. 
              Mide rápidamente dónde hay consenso y dónde debate.
            </p>
          </div>
        </div>

        {/* Lista de Dimensiones */}
        <div className="flex flex-col gap-4">
          {dimensions.map((dim) => (
            <div 
              key={dim.id}
              className="group flex flex-col lg:flex-row lg:items-center gap-6 p-6 rounded-[1.5rem] border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300 relative overflow-hidden"
            >
              {/* Info y descripción */}
              <div className="flex items-start gap-4 lg:w-[400px] shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getBgClass(dim.color)}`}>
                  {dim.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {dim.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-tight mt-1">
                    {dim.description}
                  </p>
                </div>
              </div>

              {/* Visualización de la métrica */}
              <div className="flex-1 flex flex-col gap-2 mt-4 lg:mt-0 relative z-10 w-full">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Alineación
                  </span>
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {dim.consensus}%
                  </span>
                </div>
                
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${getColorClass(dim.color)}`} 
                    style={{ width: `${dim.consensus}%` }}
                  >
                     <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 truncate"></div>
                  </div>
                </div>
                
                {/* Labels de los extremos */}
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  <span>Polarizado</span>
                  <span>Consenso total</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

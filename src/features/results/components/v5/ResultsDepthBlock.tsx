
import { TrendingUp, TrendingDown, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ResultsDepthBlock = () => {
  const attributes = [
    { name: 'Precio Bajo', value: 92, color: 'text-brand-primary' },
    { name: 'Rapidez', value: 78, color: 'text-slate-700' },
    { name: 'Fácil de usar web', value: 65, color: 'text-slate-700' },
    { name: 'Ayuda al planeta', value: 45, color: 'text-slate-700' },
    { name: 'Cosas nuevas', value: 30, color: 'text-slate-700' },
  ];

  const strengths = [
    { label: 'Es barato y bueno', score: 94, trend: '+5 pts' },
    { label: 'Siempre hay descuentos', score: 88, trend: '+3 pts' },
    { label: 'Encuentras de todo', score: 82, trend: '+1 pts' },
  ];

  const weaknesses = [
    { label: 'No traen nada novedoso', score: 45, trend: '-2 pts' },
    { label: 'Usan mucho plástico', score: 38, trend: '-6 pts' },
  ];

  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (Math.PI * 2) / attributes.length;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getPolygonPoints = (data: {value: number}[]) => {
    return data.map((d, i) => {
      const p = getPoint(d.value, i);
      return `${p.x},${p.y}`;
    }).join(' ');
  };

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 rounded-l-[100px] opacity-50 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div>
            <span className="inline-block mb-4 border border-slate-200 text-slate-500 rounded-full px-4 py-1 uppercase tracking-widest text-xs font-semibold">
               El por qué
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
              Por qué eligen supermercados baratos
            </h2>
            <p className="text-xl text-slate-500 max-w-xl">
              Las razones clave por las que el formato de descuento atrae a comprar a más personas cada día frente a otros competidores.
            </p>
          </div>
          <button className="flex items-center justify-center mt-6 md:mt-0 rounded-full font-semibold px-6 py-2 border border-slate-200 hover:bg-slate-50 transition-colors">
            Ver Detalles <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border border-slate-100 relative">
            <div className="absolute top-6 left-6 z-10">
               <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lugar Favorito</span>
                 <span className="text-lg font-black text-brand-primary">Formatos Económicos</span>
               </div>
            </div>

            <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-xl">
               <defs>
                 <linearGradient id="spider-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
                 </linearGradient>
                 <linearGradient id="spider-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
                 </linearGradient>
               </defs>
               
               {[20, 40, 60, 80, 100].map((level) => (
                 <polygon
                    key={level}
                    points={getPolygonPoints(attributes.map(() => ({value: level})))}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={level === 100 ? "0" : "4 4"}
                 />
               ))}

               {attributes.map((_, i) => {
                 const p = getPoint(100, i);
                 return (
                   <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#f1f5f9" strokeWidth="2" />
                 )
               })}

               <polygon
                  points={getPolygonPoints(attributes)}
                  fill="url(#spider-fill)"
                  stroke="url(#spider-gradient)"
                  strokeWidth="3"
                  strokeLinejoin="round"
               />

               {attributes.map((attr, i) => {
                 const p = getPoint(attr.value, i);
                 const labelP = getPoint(125, i);
                 
                 let textAnchor = "middle";
                 if (labelP.x > center + 10) textAnchor = "start";
                 if (labelP.x < center - 10) textAnchor = "end";

                 return (
                   <g key={i}>
                     <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="url(#spider-gradient)" strokeWidth="2" />
                     <text 
                        x={labelP.x} 
                        y={labelP.y} 
                        textAnchor={textAnchor as "start" | "end" | "middle"}
                        alignmentBaseline="middle"
                        className={`text-xs font-bold ${attr.name === 'Precio Bajo' ? 'fill-brand-primary text-sm' : 'fill-slate-500'}`}
                     >
                       {attr.name}
                     </text>
                     <text
                        x={labelP.x}
                        y={labelP.y + 14}
                        textAnchor={textAnchor as "start" | "end" | "middle"}
                        className="text-[10px] font-semibold fill-slate-400"
                     >
                       {attr.value} % sienten esto
                     </text>
                   </g>
                 )
               })}
            </svg>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
             <div className="border-0 shadow-lg shadow-emerald-900/5 bg-white overflow-hidden rounded-3xl relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-500" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Lo que la gente ama</h3>
                      <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">Por qué vuelven a comprar</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {strengths.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-slate-700">{item.label}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><TrendingUp className="w-3 h-3"/> {item.trend}</span>
                             <span className="text-xs font-black text-emerald-600">{item.score}</span>
                           </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="border-0 shadow-lg shadow-amber-900/5 bg-white overflow-hidden rounded-3xl relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Lo que la gente critica</h3>
                      <p className="text-sm font-medium text-amber-600 flex items-center gap-1">Por qué algunos se van</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {weaknesses.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-slate-700">{item.label}</span>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><TrendingDown className="w-3 h-3"/> {item.trend}</span>
                             <span className="text-xs font-black text-amber-600">{item.score}</span>
                           </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

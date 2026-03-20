import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

export function ResultsMapV2() {
  const nodes = [
    { id: 'habitos', label: 'Hábitos', type: 'consensus', color: 'bg-emerald-500', x: '50%', y: '50%', size: 'w-32 h-32 md:w-48 md:h-48', delay: 0 },
    { id: 'estilo', label: 'Estilo de Vida', type: 'consensus', color: 'bg-emerald-400', x: '35%', y: '65%', size: 'w-24 h-24 md:w-32 md:h-32', delay: 0.2 },
    { id: 'tech', label: 'Tecnología', type: 'neutral', color: 'bg-blue-500', x: '75%', y: '30%', size: 'w-20 h-20 md:w-28 md:h-28', delay: 0.4 },
    { id: 'politica', label: 'Política', type: 'divergent', color: 'bg-rose-500', x: '85%', y: '75%', size: 'w-28 h-28 md:w-40 md:h-40', delay: 0.1 },
    { id: 'finanzas', label: 'Finanzas', type: 'divergent', color: 'bg-rose-400', x: '15%', y: '25%', size: 'w-24 h-24 md:w-36 md:h-36', delay: 0.3 },
    { id: 'entretenimiento', label: 'Ocio', type: 'neutral', color: 'bg-blue-400', x: '30%', y: '35%', size: 'w-16 h-16 md:w-24 md:h-24', delay: 0.5 },
  ];

  return (
    <section className="w-full bg-ink text-white py-24 md:py-36 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-900 to-transparent opacity-80 pointer-events-none z-10" />
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(16,185,129,0.15)_0%,_transparent_60%)] blur-3xl" />
        <div className="absolute top-10 right-10 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(244,63,94,0.1)_0%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(37,99,235,0.15)_0%,_transparent_70%)] blur-3xl" />
      </div>

      <div className="container-ws relative z-20">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-sm px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
              <Compass className="w-4 h-4 text-emerald-400" />
              Cartografía Social
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-6">
              Donde orbita<br/>la comunidad hoy.
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 font-medium leading-snug">
              Las categorías centrales concentran el consenso. Las periféricas representan fricción y debate activo en tiempo real.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-4">
              <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" /> Consenso Total
            </div>
            <div className="flex items-center gap-4">
              <span className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]" /> Zona Neutra
            </div>
            <div className="flex items-center gap-4">
              <span className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" /> Fricción Máxima
            </div>
          </div>
        </div>

        {/* Full Bleed Interactive Canvas */}
        <div className="w-full h-[600px] md:h-[800px] relative rounded-[3rem] border border-slate-800/50 bg-slate-900/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
          
          {/* Subtle Ambient Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <motion.div 
              className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border-2 border-slate-600"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full border border-slate-500 border-dashed"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
            />
            <div className="absolute w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] rounded-full border border-slate-700/50" />
          </div>

          {/* Connective Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <defs>
              <linearGradient id="mapGradient1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <linearGradient id="mapGradient2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
              <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <motion.path 
              d="M 50% 50% Q 65% 65% 85% 75%" 
              fill="none" 
              stroke="url(#mapGradient1)" 
              strokeWidth="3"
            />
            <motion.circle r="4" fill="#f43f5e" filter="url(#mapGlow)">
              <animateMotion dur="4s" repeatCount="indefinite" path="M 50% 50% Q 65% 65% 85% 75%" />
            </motion.circle>
            
            <motion.path 
              d="M 50% 50% Q 30% 30% 15% 25%" 
              fill="none" 
              stroke="url(#mapGradient2)" 
              strokeWidth="2"
            />
            <motion.circle r="4" fill="#fb7185" filter="url(#mapGlow)">
              <animateMotion dur="5.5s" repeatCount="indefinite" path="M 50% 50% Q 30% 30% 15% 25%" />
            </motion.circle>
          </svg>

          {/* Floating Nodes */}
          {nodes.map((node, i) => (
            <div key={node.id} className="absolute z-10" style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}>
              
              {/* Radial Pulse */}
              <motion.div
                className={`absolute inset-0 rounded-full ${node.color} opacity-20`}
                animate={{ scale: [1, node.type === "divergent" ? 1.6 : 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: node.type === "divergent" ? 2.5 : 4, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
              />
              
              {/* Main Node Bubble */}
              <motion.div
                className={`relative ${node.size} ${node.color} rounded-full flex flex-col items-center justify-center shadow-2xl cursor-pointer group transition-all duration-300 hover:scale-110`}
                animate={{
                  y: [0, -20, 0],
                  x: [0, (i % 2 === 0 ? 15 : -15), 0]
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: node.delay
                }}
              >
                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-[2px] shadow-[inset_0_2px_20px_rgba(255,255,255,0.2)] group-hover:bg-white/20 transition-colors" />
                
                <span className="relative z-10 text-sm md:text-lg font-black whitespace-nowrap text-white drop-shadow-lg px-2 text-center leading-tight tracking-tight">
                  {node.label}
                </span>

                {/* Hotspot Indicator for Divergent */}
                {node.type === "divergent" && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,1)]"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ResultsWowClosing() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-ink text-white py-16 md:py-32 relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] mt-4 md:mt-8">
      {/* Dynamic Background Constellation Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
        
        {/* SVG Node Network reflecting Signal Flow */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="1" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Constellation Grid */}
          <g className="stroke-[#818CF8]/20" strokeWidth="1" fill="none">
            <motion.path 
              d="M0,200 Q400,300 800,100 T1600,400" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1, d: ["M0,200 Q400,300 800,100 T1600,400", "M0,300 Q500,100 900,200 T1600,200", "M0,200 Q400,300 800,100 T1600,400"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path 
              d="M0,600 Q200,500 600,700 T1600,600" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1, d: ["M0,600 Q200,500 600,700 T1600,600", "M0,500 Q400,600 700,500 T1600,700", "M0,600 Q200,500 600,700 T1600,600"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Connecting lines between signals */}
            <motion.line x1="20%" y1="30%" x2="40%" y2="60%" stroke="url(#lineGrad)" strokeWidth="2" 
              animate={{ opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.line x1="60%" y1="70%" x2="80%" y2="20%" stroke="url(#lineGrad)" strokeWidth="2" 
              animate={{ opacity: [0, 1, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.line x1="40%" y1="60%" x2="80%" y2="20%" stroke="url(#lineGrad)" strokeWidth="2" 
              animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />
          </g>

          {/* Active Nodes / Signals */}
          <g>
            {[ 
              { x: "20%", y: "30%", s: 1 }, { x: "40%", y: "60%", s: 1.5 }, 
              { x: "60%", y: "70%", s: 1.2 }, { x: "80%", y: "20%", s: 2 },
              { x: "10%", y: "80%", s: 0.8 }, { x: "90%", y: "60%", s: 1.3 }
            ].map((node, i) => (
              <motion.circle
                key={`node-${i}`}
                cx={node.x}
                cy={node.y}
                r={4 * node.s}
                fill="#fff"
                animate={{ r: [3 * node.s, 6 * node.s, 3 * node.s], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
            
            {/* Glowing active points */}
            {[ 
              { x: "40%", y: "60%" }, { x: "80%", y: "20%" }
            ].map((node, i) => (
              <motion.circle
                key={`glow-${i}`}
                cx={node.x}
                cy={node.y}
                r="30"
                fill="url(#nodeGlow)"
                animate={{ scale: [1, 2, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i }}
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="container-ws relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 mb-6 md:mb-8">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              El Ecosistema Sigue Vivo
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-[1.1] text-white">
            Cada señal reescribe<br />el mapa de inteligencia.
          </h2>
          
          <p className="text-lg md:text-2xl text-slate-400 font-medium mb-10 md:mb-16 max-w-2xl mx-auto px-4 md:px-0">
            Únete al pulso activo. Aporta tu perspectiva y observa cómo tu influencia mueve el consenso en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate("/signals")}
              className="w-full sm:w-auto px-8 py-5 bg-white text-ink rounded-full font-black text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
            >
              <Compass className="w-6 h-6 text-indigo-600" />
              Generar Nuevas Señales
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

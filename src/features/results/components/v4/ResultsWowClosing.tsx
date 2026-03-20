import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ResultsWowClosing() {
  const navigate = useNavigate();

  // Generate a random stable set of nodes for the network
  const nodes = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  // Create connections between close nodes
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 20) { // arbitrary connection distance
        connections.push({ source: nodes[i], target: nodes[j], id: `${i}-${j}`, distance });
      }
    }
  }

  // Pick some active paths to animate
  const activePaths = connections.sort(() => 0.5 - Math.random()).slice(0, 15);

  return (
    <div className="w-full bg-slate-950 text-white py-24 md:py-40 relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] mt-8 md:mt-16 group">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950 opacity-80" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      {/* Abstract Node Network */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen overflow-hidden pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="activeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Static thin connections */}
          {connections.map(conn => (
            <line 
              key={`conn-${conn.id}`}
              x1={`${conn.source.x}%`} y1={`${conn.source.y}%`}
              x2={`${conn.target.x}%`} y2={`${conn.target.y}%`}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Active moving signals along paths */}
          {activePaths.map((path, i) => (
            <motion.line
              key={`active-${path.id}`}
              x1={`${path.source.x}%`} y1={`${path.source.y}%`}
              x2={`${path.target.x}%`} y2={`${path.target.y}%`}
              stroke="url(#activeLineGrad)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.8, 0], strokeDasharray: ["0, 100", "100, 0", "100, 0"] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <motion.circle
              key={`node-${node.id}`}
              cx={`${node.x}%`} cy={`${node.y}%`}
              r={node.size}
              fill={node.size > 3 ? "#818CF8" : "rgba(255,255,255,0.4)"}
              animate={{ 
                r: [node.size, node.size * 1.5, node.size],
                opacity: [0.4, 1, 0.4],
                filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
              }}
              transition={{ duration: node.duration, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </div>

      <div className="container-ws relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="w-24 h-24 rounded-full border border-indigo-500/30 flex items-center justify-center mb-10 relative"
        >
           <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s' }} />
           <Sparkles className="w-10 h-10 text-indigo-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              El Ecosistema Sigue Vivo
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 leading-[1.05] text-white">
            Cada señal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">reescribe</span><br />el mapa de inteligencia.
          </h2>
          
          <p className="text-lg md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto px-4 md:px-0 leading-relaxed">
            La verdad no es estática. Aporta tu perspectiva y observa cómo tu influencia directa desvía el consenso en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate("/signals")}
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg md:text-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 group"
            >
              <Compass className="w-6 h-6 text-indigo-600" />
              Generar Nuevas Señales
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ResultsWowClosing() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-ink text-white py-32 relative overflow-hidden">
      {/* Dynamic Background Constellation Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
        
        {/* Simple mock particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, Math.random() * -30 - 10],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container-ws relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 mb-8">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              El Ecosistema Sigue Vivo
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] text-white">
            Cada señal reescribe<br />el mapa de inteligencia.
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto">
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

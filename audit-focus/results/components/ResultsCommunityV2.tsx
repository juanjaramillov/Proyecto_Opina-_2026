import { motion } from 'framer-motion';

export function ResultsCommunityV2() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section className="w-full bg-white py-16 md:py-24 border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Lo que dice la comunidad</h2>
          <p className="mt-2 text-slate-500 font-medium">El latido actual de Opina+ en tres frentes.</p>
        </div>

        <motion.div 
          variants={containerVars} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Insight 1: Consenso */}
          <motion.div variants={itemVars} className="bg-slate-50 rounded-[2rem] p-8 flex flex-col items-start border border-slate-100 group">
            <motion.div 
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="w-12 h-12 rounded-full mb-6 flex items-center justify-center relative bg-emerald-100/50"
            >
              {/* Abstracción circular/convergente */}
              <div className="w-4 h-4 rounded-full border-2 border-emerald-500 absolute" />
              <div className="w-8 h-8 rounded-full border border-emerald-400/50 absolute" />
            </motion.div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Fuerte Consenso</h3>
            <p className="text-slate-600 font-medium">El 87% de los usuarios prioriza el ahorro energético sobre el diseño estético de los dispositivos.</p>
          </motion.div>

          {/* Insight 2: Polarización */}
          <motion.div variants={itemVars} className="bg-slate-50 rounded-[2rem] p-8 flex flex-col items-start border border-slate-100 group">
            <motion.div 
              whileHover={{ scale: 1.1, gap: "12px" }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="w-12 h-12 rounded-full mb-6 flex flex-row items-center justify-center gap-[4px] relative bg-rose-100/50"
            >
              {/* Abstracción polarizada (dos mitades que se separan sutilmente en hover) */}
              <div className="w-3 h-5 bg-rose-500 rounded-l-full" />
              <div className="w-3 h-5 bg-rose-500 rounded-r-full" />
            </motion.div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Polarización Máxima</h3>
            <p className="text-slate-600 font-medium">Mitad a favor, mitad en contra sobre la regulación gubernamental de la Inteligencia Artificial.</p>
          </motion.div>

          {/* Insight 3: Demográfico */}
          <motion.div variants={itemVars} className="bg-slate-50 rounded-[2rem] p-8 flex flex-col items-start border border-slate-100 group">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="w-12 h-12 rounded-full mb-6 flex items-end pb-2 justify-center gap-1 relative bg-indigo-100/50 overflow-hidden"
            >
              {/* Abstracción de barras orgánicas */}
              <motion.div className="w-1.5 h-3 bg-indigo-500 rounded-full" animate={{ height: [12, 16, 12] }} transition={{ repeat: Infinity, duration: 2 }} />
              <motion.div className="w-1.5 h-5 bg-indigo-500 rounded-full" animate={{ height: [20, 24, 20] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3 }} />
              <motion.div className="w-1.5 h-2 bg-indigo-500 rounded-full" animate={{ height: [8, 12, 8] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }} />
            </motion.div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Corte Demográfico</h3>
            <p className="text-slate-600 font-medium">Los Gen-Z son 3x más propensos a abandonar una app si la animación de carga supera 1 segundo.</p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

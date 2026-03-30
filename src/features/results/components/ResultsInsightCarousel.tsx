import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const insights = [
    { text: "Te pareces más al promedio en tus hábitos de consumo diario.", type: "consensus" },
    { text: "Donde más te diferencias de tu grupo es en tecnología e innovación.", type: "divergence" },
    { text: "Tus señales muestran decisiones bastante consistentes a lo largo del tiempo.", type: "polarization" },
    { text: "Tu perfil de inversor está mucho más definido que el del promedio general.", type: "divergence" }
];

export function ResultsInsightCarousel() {

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const length = insights.length;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-white py-16 md:py-24 relative border-t border-slate-100 min-h-[500px] flex items-center">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
        <div className="text-indigo-500 text-[11px] font-black uppercase tracking-[0.2em] mb-12">
          Hallazgos Destacados
        </div>

        {/* Capa de Ilustración Abstracta */}
        <div className="w-full h-40 flex items-center justify-center mb-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute flex items-center justify-center w-full h-full pointer-events-none"
            >
              {insights[current].type === "consensus" && (
                <div className="relative w-24 h-24 flex items-center justify-center">
                   <motion.div className="absolute w-8 h-8 rounded-full bg-emerald-400 mix-blend-multiply" animate={{ x: [-20, 0, -20] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
                   <motion.div className="absolute w-8 h-8 rounded-full bg-emerald-300 mix-blend-multiply" animate={{ x: [20, 0, 20] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
                   <motion.div className="w-4 h-4 rounded-full bg-emerald-600 z-10" />
                </div>
              )}
              {insights[current].type === "divergence" && (
                <div className="relative w-24 h-24 flex items-center justify-center">
                   <div className="w-6 h-6 rounded-full bg-slate-200" />
                   <motion.div className="absolute w-6 h-6 rounded-full bg-indigo-500" animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
                </div>
              )}
              {insights[current].type === "polarization" && (
                <div className="relative w-24 h-24 flex items-center justify-center box-border pt-4">
                   <motion.div className="w-8 h-12 bg-rose-400 rounded-l-full origin-right" animate={{ rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
                   <div className="w-1 h-12 bg-transparent" />
                   <motion.div className="w-8 h-12 bg-amber-400 rounded-r-full origin-left" animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Texto Dinámico */}
        <div className="h-32 md:h-24 flex items-center justify-center w-full px-4">
          <AnimatePresence mode="wait">
            <motion.h3
              key={current}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl"
            >
              “{insights[current].text}”
            </motion.h3>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mt-12">
          {insights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === current ? 'w-8 bg-indigo-500' : 'bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

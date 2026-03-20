import { motion } from 'framer-motion';
import { TrendingUp, Activity, Zap } from 'lucide-react';

export function ResultsCommunityV2() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="w-full bg-white text-ink border-b border-ink/10 relative overflow-hidden">
      
      {/* Decorative Top Border */}
      <div className="absolute top-0 inset-x-0 h-1 bg-ink" />

      <div className="container-ws py-20 md:py-32">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24 border-b-2 border-ink pb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-ink text-[12px] font-black uppercase tracking-[0.2em] mb-4">
              <Activity className="w-4 h-4" />
              El Pulso de la Comunidad
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85]">
              Lo que dice<br/>la comunidad.
            </h2>
          </div>
          <p className="text-xl text-slate-500 font-medium max-w-sm leading-snug">
            Un destilado en tiempo real de las corrientes de opinión más fuertes y las fricciones emergentes.
          </p>
        </div>

        {/* 3-Column Newspaper Layout */}
        <motion.div 
          variants={containerVars} 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:divide-x lg:divide-ink/10"
        >
          {/* Column 1: Consenso */}
          <motion.div variants={itemVars} className="flex flex-col relative group">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-emerald-600 transition-colors">
              Fuerte Consenso en Hábitos
            </h3>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
              Una abrumadora mayoría del <span className="text-ink font-bold bg-emerald-100 px-1">87%</span> de los usuarios prioriza el ahorro energético sobre el diseño estético de los dispositivos.
            </p>
            <div className="mt-auto pt-6 border-t border-ink/10 text-sm font-bold uppercase tracking-widest text-slate-400">
              Tendencia Principal
            </div>
          </motion.div>

          {/* Column 2: Polarización */}
          <motion.div variants={itemVars} className="flex flex-col relative lg:pl-16 group">
            <div className="w-8 h-8 flex items-center justify-center mb-6">
              <div className="w-4 h-4 bg-rose-500 rounded-l-full" />
              <div className="w-4 h-4 bg-ink rounded-r-full ml-1" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-rose-600 transition-colors">
              Polarización Máxima
            </h3>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
              La comunidad está <span className="font-bold text-ink italic">fracturada exactamente por la mitad</span> respecto a la regulación gubernamental de la Inteligencia Artificial. No hay terreno medio.
            </p>
            <div className="mt-auto pt-6 border-t border-ink/10 text-sm font-bold uppercase tracking-widest text-slate-400">
              Fricción Crítica
            </div>
          </motion.div>

          {/* Column 3: Demográfico */}
          <motion.div variants={itemVars} className="flex flex-col relative lg:pl-16 group">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-blue-600 transition-colors">
              Corte Demográfico
            </h3>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
              Atención: Los usuarios <span className="text-ink font-bold underline decoration-blue-500 decoration-2 underline-offset-4">Gen-Z son 3x más propensos</span> a abandonar la aplicación si cualquier animación de carga supera 1 segundo de duración.
            </p>
            <div className="mt-auto pt-6 border-t border-ink/10 text-sm font-bold uppercase tracking-widest text-slate-400">
              Alerta de Comportamiento
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

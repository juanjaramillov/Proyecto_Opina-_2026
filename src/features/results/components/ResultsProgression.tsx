import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import { LockOpen, Sparkles, Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsProgressionProps {
  snapshot: MasterHubSnapshot;
}

export function ResultsProgression({
  snapshot,
}: ResultsProgressionProps) {
  const totalSignals = snapshot.overview.totalSignals || 142;
  const nextGoal = 500;
  const remaining = Math.max(nextGoal - totalSignals, 0);
  const progress = Math.min((totalSignals / nextGoal) * 100, 100);

  return (
    <section className="w-full bg-white text-ink py-24 md:py-32 border-b-8 border-ink">
      <div className="container-ws">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text and Motivation */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 text-blue-600 text-[12px] font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4" />
              Impacto y Recompensas
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-8">
              Tu opinión<br/>desbloquea<br/>la verdad.
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-snug w-full max-w-lg mb-12">
              Alcanza {nextGoal} señales para acceder a filtros por comuna, género y estratificación social. <strong className="text-ink bg-blue-100 px-1">Conoce a tus vecinos.</strong>
            </p>

            {/* Brutalist Progress Bar */}
            <div className="w-full max-w-xl">
              <div className="flex items-end justify-between mb-4">
                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Progreso de Nivel</span>
                <div className="text-5xl font-black tracking-tighter flex items-baseline gap-1">
                  {totalSignals}<span className="text-xl text-slate-400">/{nextGoal}</span>
                </div>
              </div>
              
              <div className="h-4 w-full bg-slate-100 border border-ink/20 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  className="absolute top-0 left-0 h-full bg-blue-600"
                />
              </div>
              
              <p className="mt-4 text-sm font-bold text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" /> Faltan {remaining} señales para el siguiente rango.
              </p>
            </div>
          </div>

          {/* Reward Ticket / Badge */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div 
              whileHover={{ rotate: 2, scale: 1.02 }}
              className="relative w-full max-w-sm"
            >
              {/* Decorative Offset Shadow */}
              <div className="absolute inset-0 bg-blue-600 translate-x-4 translate-y-4 rounded-3xl" />
              
              <div className="relative bg-ink text-white p-10 rounded-3xl border-2 border-ink flex flex-col justify-between h-full min-h-[400px]">
                
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                    <LockOpen className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 border border-slate-600 px-3 py-1 rounded-full">
                    Activo
                  </span>
                </div>

                <div>
                  <h3 className="text-3xl font-black tracking-tight mb-4 leading-none">
                    Desbloqueo<br/>Premium
                  </h3>
                  <p className="text-slate-400 font-medium text-lg leading-snug mb-8">
                    Acceso garantizado a las comparativas demográficas profundas al completar tu cuota.
                  </p>
                </div>

                <button className="group w-full bg-white text-ink font-black uppercase tracking-widest py-4 flex items-center justify-center gap-3 hover:bg-blue-50 transition-colors">
                  Generar Impacto 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

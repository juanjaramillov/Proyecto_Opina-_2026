import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, Zap, TrendingUp } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface VersusInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function VersusInsightBlock({ generation, snapshot }: VersusInsightBlockProps) {
  if (snapshot.cohortState.privacyState === 'insufficient_cohort') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 md:p-12 bg-slate-50 border border-slate-100 rounded-[2rem] text-center my-8">
        <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
        <h4 className="text-xl font-bold text-slate-700 mb-2">Muestra Insuficiente</h4>
        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
          No hay suficientes señales ({snapshot.cohortState.cohortSize} activas) en la generación seleccionada ({generation}) para garantizar estadísticamente la privacidad en este nivel de granularidad.
        </p>
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          Explorar otras variables
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 mb-4">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Análisis Versus</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-4">
          La Fractura y el Consenso
        </h3>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
          Los debates bicotómicos exponen las verdaderas grietas del ecosistema. Mientras algunos temas dividen en mitades exactas, otros encuentran acuerdos sorpresivos.
        </p>
      </div>

      {/* Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Choque del Día (Más Polarizado) - COLUMNA GRANDE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 border border-rose-200 bg-white rounded-3xl p-8 md:p-10 relative overflow-hidden group shadow-[0_10px_40px_-15px_rgba(244,63,94,0.15)]"
        >
          {/* Fondo radial sutil polarización */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-50 via-white to-white opacity-50 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1 mb-8 self-start">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">El Choque del Día (Alta Tensión)</span>
            </div>

            <h4 className="text-3xl md:text-4xl font-black leading-tight text-ink mb-2">
              Privacidad Total vs Personalización IA
            </h4>
            <p className="text-sm text-slate-500 font-medium mb-12 max-w-md">
              La comunidad no logra resolver el trade-off entre conveniencia sistémica y control de datos personales.
            </p>

            <div className="mt-auto">
              <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-rose-600 leading-none">49<span className="text-lg text-rose-400">%</span></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Privacidad Absoluta</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-black text-blue-600 leading-none">51<span className="text-lg text-blue-400">%</span></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Personalización</span>
                </div>
              </div>
              
              {/* Barra de Tensión Central */}
              <div className="h-4 w-full rounded-full flex overflow-hidden bg-slate-100 shadow-inner relative p-0.5 gap-0.5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "49%" }} 
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="h-full bg-rose-500 rounded-l-full relative overflow-hidden" 
                >
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-white/20 w-1/2 skew-x-12" />
                </motion.div>
                <div className="w-1 bg-white z-10" />
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "51%" }} 
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="h-full bg-blue-500 rounded-r-full relative overflow-hidden" 
                >
                  <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="absolute inset-0 bg-white/20 w-1/2 skew-x-12" />
                </motion.div>
              </div>
              
              <div className="flex justify-center mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                  Empate Estadístico
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Consenso Fuerte - COLUMNA CHICA APILADA */}
        <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 border border-emerald-100 bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-emerald-300 transition-colors"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-100 transition-colors" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 mb-4 self-start border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">El Gran Acuerdo</span>
              </div>

              <h4 className="text-xl font-black leading-tight text-ink mb-1">
                Trabajo Híbrido al Trono
              </h4>
              <p className="text-xs text-slate-500 font-medium mb-6 flex-1">
                El modelo remoto cae drásticamente ante la necesidad de conexión social (82% vs 18%).
              </p>

              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-black text-emerald-600 leading-none">82%</span>
                </div>
                <div className="h-2 w-full rounded-full flex overflow-hidden bg-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} transition={{ duration: 1 }} className="h-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden text-white"
          >
             <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-700 opacity-50" />
             <div className="relative z-10">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                 Micro-lectura
               </div>
               <h4 className="text-lg font-black leading-tight mb-2">
                 La polarización detiene la innovación
               </h4>
               <p className="text-sm text-slate-300 leading-relaxed">
                 Allí donde hay choques equitativos, la comunidad demanda pausas. Donde hay consensos, exigen aceleración inmediata.
               </p>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

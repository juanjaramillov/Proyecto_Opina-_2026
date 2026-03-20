import { motion } from "framer-motion";
import { Layers, ShieldAlert, CheckCircle2, Flame } from "lucide-react";
import { MasterHubSnapshot } from "../../../../../read-models/b2c/hub-types";
import { ResultsGeneration } from "../../../hooks/useResultsExperience";

interface ProfundidadInsightBlockProps {
  generation: ResultsGeneration;
  snapshot: MasterHubSnapshot;
}

export function ProfundidadInsightBlock({ generation, snapshot }: ProfundidadInsightBlockProps) {
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

  const topAttribute = { name: "Innovación Tecnológica", score: 92, color: "bg-indigo-500", desc: "El atributo cardinal. El ecosistema penaliza fuertemente las soluciones conservadoras." };
  
  const attributes = [
    { name: "Sostenibilidad a largo plazo", score: 85, color: "bg-emerald-500" },
    { name: "Rentabilidad Financiera", score: 78, color: "bg-amber-500" },
    { name: "Impacto y Bienestar Social", score: 65, color: "bg-cyan-500" },
    { name: "Accesibilidad Base", score: 45, color: "bg-rose-500", isWeak: true },
  ];

  return (
    <div className="w-full">
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 mb-4">
          <Layers className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Análisis Profundidad</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-ink tracking-tight mb-4">
          La Anatomía del Valor
        </h3>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl leading-relaxed">
          Disección multicapa de atributos. Identifica exactamente qué dimensiones sostienen la propuesta de valor y cuáles actúan como cuellos de botella.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Pilar Dominante */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 bg-indigo-950 rounded-3xl p-8 relative overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 blur-3xl rounded-full" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-700 bg-indigo-900/50 text-indigo-300 px-3 py-1 mb-8 self-start">
                 <CheckCircle2 className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Pilar Core</span>
              </div>
              
              <h4 className="text-3xl font-black mb-3 leading-tight">{topAttribute.name}</h4>
              <p className="text-indigo-200 text-sm font-medium mb-10">{topAttribute.desc}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-5xl font-black text-indigo-400 leading-none">{topAttribute.score}<span className="text-2xl">%</span></span>
                </div>
                <div className="h-2 w-full bg-indigo-900 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${topAttribute.score}%` }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-indigo-400" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desglose de Atributos */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
             <Layers className="w-5 h-5 text-slate-400" />
             <h4 className="text-xl font-black text-ink">Matriz de Atributos</h4>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {attributes.map((attr, index) => (
              <motion.div 
                key={attr.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{attr.name}</span>
                    {attr.isWeak && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">Debilidad Detectada</span>}
                  </div>
                  <span className="text-sm font-black text-slate-600">{attr.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${attr.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-full ${attr.color} rounded-full relative`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
               <Flame className="w-4 h-4 text-slate-400" />
             </div>
             <p className="text-xs text-slate-500 leading-relaxed font-medium">
               El ecosistema muestra una brecha significativa entre innovación y accesibilidad de mercado, un patrón clásico en ciclos de adopción temprana ("early adopters gap").
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

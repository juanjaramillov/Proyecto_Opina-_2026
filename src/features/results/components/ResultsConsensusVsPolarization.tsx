import { motion } from "framer-motion";
import { ResultsModule, ResultsPeriod } from "./hub/FilterBar";
import { ArrowUpRight } from "lucide-react";

const consensus = [
  { label: "Marcas locales", value: 82, extra: "Preferencia de Consumo" },
  { label: "Trabajo remoto", value: 78, extra: "Estilo de Vida" },
  { label: "Sustentabilidad", value: 74, extra: "Decisión de Compra" },
];

const polarization = [
  { label: "IA vs Regulación", left: 50, right: 50, extra: "Debate Tecnológico" },
  { label: "Coca-Cola vs Pepsi", left: 52, right: 48, extra: "Clásico Versus" },
  { label: "Privacidad vs Algoritmos", left: 49, right: 51, extra: "Huella Digital" },
];

interface ResultsConsensusVsPolarizationProps {
  activeModule?: ResultsModule;
  activePeriod?: ResultsPeriod;
}

export function ResultsConsensusVsPolarization(_props: ResultsConsensusVsPolarizationProps) {
  
  return (
    <section className="w-full relative z-10">
      <div className="container-ws">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Consensus Column */}
          <div>
            <div className="border-b-2 border-ink pb-4 mb-8">
              <h3 className="text-3xl md:text-4xl font-black text-ink tracking-tighter uppercase">
                Acuerdos
              </h3>
            </div>
            
            <div className="flex flex-col gap-8">
              {consensus.map((item, idx) => (
                <div key={idx} className="group relative border-b border-slate-200 pb-8 hover:border-emerald-500 transition-colors duration-300">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.extra}</p>
                      <h4 className="text-2xl md:text-3xl font-black text-ink tracking-tight group-hover:text-emerald-600 transition-colors">
                        {item.label}
                      </h4>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-4xl md:text-5xl font-black text-emerald-500 tracking-tighter">{item.value}</span>
                      <span className="text-xl font-bold text-emerald-500/50">%</span>
                    </div>
                  </div>
                  
                  {/* Minimalist Progress Line */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Polarization Column */}
          <div>
            <div className="border-b-2 border-ink pb-4 mb-8">
              <h3 className="text-3xl md:text-4xl font-black text-ink tracking-tighter uppercase">
                Fricciones
              </h3>
            </div>
            
            <div className="flex flex-col gap-8">
              {polarization.map((item, idx) => (
                <div key={idx} className="group relative border-b border-slate-200 pb-8 hover:border-rose-500 transition-colors duration-300">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.extra}</p>
                      <h4 className="text-2xl md:text-3xl font-black text-ink tracking-tight group-hover:text-rose-600 transition-colors flex items-center gap-2">
                        {item.label}
                        <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
                      </h4>
                    </div>
                  </div>
                  
                  {/* Minimalist Split Line */}
                  <div className="relative">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                      <span className="text-indigo-600">{item.left}%</span>
                      <span className="text-rose-600">{item.right}%</span>
                    </div>
                    <div className="h-1.5 w-full flex gap-1 rounded-full overflow-hidden bg-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.left}%` }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                        className="h-full bg-indigo-500 rounded-r-full"
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.right}%` }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                        className="h-full bg-rose-500 rounded-l-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

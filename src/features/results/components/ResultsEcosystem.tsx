import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import { ArrowUpRight, Flame, Layers, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsEcosystemProps {
  snapshot?: MasterHubSnapshot;
}

export function ResultsEcosystem({ snapshot: _snapshot }: ResultsEcosystemProps) {
  return (
    <section className="w-full bg-slate-50 py-24 md:py-32 border-b border-slate-200">
      <div className="container-ws">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-500 text-[12px] font-black uppercase tracking-[0.2em] mb-4">
              <Flame className="w-4 h-4" />
              Tiempo Real
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-ink">
              Ecosistema<br/>en ebullición.
            </h2>
          </div>
          <p className="text-xl text-slate-500 font-medium max-w-sm leading-snug">
            Los debates que están acaparando la atención y moviendo la aguja de la opinión ahora mismo.
          </p>
        </div>

        {/* Brutalist Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 md:h-[600px]">
          
          {/* Main Hero Bento (Spans 2x2) */}
          <motion.article 
            whileHover={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="md:col-span-2 md:row-span-2 rounded-[2rem] bg-ink text-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            
            <div className="relative z-10">
              <span className="inline-block bg-white text-ink px-3 py-1 text-xs font-black uppercase tracking-widest mb-6">
                El Gran Duelo
              </span>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-6">
                Pepsi gana leve ventaja sobre Coca-Cola.
              </h3>
              <p className="text-lg text-slate-300 font-medium max-w-md">
                El duelo más seguido de la década revierte su tendencia histórica. La batalla de percepciones está en su punto crítico.
              </p>
            </div>
            
            <div className="relative z-10 mt-12 md:mt-0 flex items-center justify-between border-t border-white/20 pt-6">
              <div className="flex gap-8">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pepsi</div>
                  <div className="text-4xl font-black text-rose-400">52%</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Coca-Cola</div>
                  <div className="text-4xl font-black text-white">48%</div>
                </div>
              </div>
              <ArrowUpRight className="w-10 h-10 text-rose-400 group-hover:rotate-45 transition-transform" />
            </div>
          </motion.article>

          {/* Secondary Bento 1 */}
          <motion.article 
            whileHover={{ y: -5 }}
            className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-emerald-500 text-ink p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-ink text-emerald-500 flex items-center justify-center mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black tracking-tight leading-tight mb-2">
                Arquitectura de Software.
              </h4>
              <p className="text-emerald-900 font-medium line-clamp-2">
                Monolitos vs Microservicios: El debate se recrudece entre CTOs.
              </p>
            </div>
            <div className="relative z-10 mt-6 text-sm font-black uppercase tracking-widest text-emerald-900 flex justify-between items-center border-t border-ink/20 pt-4">
              <span>Top Trend</span>
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </motion.article>

          {/* Secondary Bento 2 */}
          <motion.article 
            whileHover={{ y: -5 }}
            className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-indigo-50 border border-slate-200 p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
             <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mb-6">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black tracking-tight text-ink leading-tight mb-2">
                IA Generativa.
              </h4>
              <p className="text-slate-600 font-medium line-clamp-2">
                Alcanza el récord del tema con mayor velocidad de respuestas.
              </p>
            </div>
            <div className="relative z-10 mt-6 text-sm font-black uppercase tracking-widest text-blue-600 flex justify-between items-center border-t border-blue-200 pt-4">
              <span>Viral</span>
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </motion.article>

          {/* Wide Horizontal Bento */}
          <motion.article 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 md:row-span-1 rounded-[2rem] bg-white border border-slate-200 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group cursor-pointer"
          >
            <div>
              <span className="inline-block bg-slate-100 text-slate-500 px-3 py-1 text-xs font-black uppercase tracking-widest mb-4">
                Análisis Profundo
              </span>
              <h4 className="text-3xl font-black tracking-tight text-ink leading-tight">
                "Celular" aplasta a "Sobrio" visualmente.
              </h4>
              <p className="mt-2 text-slate-500 font-medium max-w-sm">
                Un análisis de percepción visual demuestra una clara preferencia por estéticas tecnológicas.
              </p>
            </div>
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-colors">
              <ArrowUpRight className="w-8 h-8" />
            </div>
          </motion.article>

        </div>

      </div>
    </section>
  );
}

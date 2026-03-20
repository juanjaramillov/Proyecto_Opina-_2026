import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Zap, Target } from "lucide-react";
import { ResultsModule, ResultsGeneration } from "../../hooks/useResultsExperience";

interface ResultsContextualWallProps {
  activeModule: ResultsModule;
  activeGeneration: ResultsGeneration;
}

export function ResultsContextualWall({ activeModule, activeGeneration }: ResultsContextualWallProps) {
  const allInsights = [
    {
      id: 1,
      type: "highlight",
      text: "La generación Z marca una clara preferencia por el retorno híbrido (3 días) frente a los millennials (1 día).",
      author: "Comunidad Tech",
      module: "SURVEY", // Placeholder for actual module if needed, using general data here
      color: "bg-indigo-50 border-indigo-100 text-indigo-900"
    },
    {
      id: 2,
      type: "tension",
      text: "Choque frontal sobre subsidios energéticos.",
      author: "Ecosistema Emprendedor",
      module: "VERSUS",
      color: "bg-rose-50 border-rose-100 text-rose-900"
    },
    {
      id: 3,
      type: "consensus",
      text: "9 de cada 10 usuarios coinciden en que la infraestructura ciclista es prioritaria para 2027.",
      author: "Habitantes Zona Céntrica",
      module: "LUGARES",
      color: "bg-emerald-50 border-emerald-100 text-emerald-900"
    },
    {
      id: 4,
      type: "trend",
      text: "Las menciones a 'Aceleración Cuántica' subieron un 400% tras el último anuncio.",
      author: "Nodos de Innovación",
      module: "ACTUALIDAD",
      color: "bg-amber-50 border-amber-100 text-amber-900"
    },
    {
      id: 5,
      type: "depth",
      text: "La rentabilidad ya no es el atributo más valorado en Startups; es la Sostenibilidad a 5 años.",
      author: "Inversores Activos",
      module: "PROFUNDIDAD",
      color: "bg-slate-50 border-slate-200 text-slate-800"
    },
    {
      id: 6,
      type: "competition",
      text: "Android vs iOS vuelve al empate técnico en adopción de la última generación.",
      author: "Consumidores Tech",
      module: "TORNEO", // Assuming Torneo here
      color: "bg-slate-50 border-slate-200 text-slate-800"
    }
  ];

  // Filter insights based on active module. If ALL, show a mix.
  const displayInsights = activeModule === "ALL" 
    ? allInsights 
    : allInsights.filter(i => i.module === activeModule || i.module === "VERSUS" /* Just to show something if mock is lacking */).slice(0, 4);

  // Fallback if filtering leaves us empty
  const safeInsights = displayInsights.length > 0 ? displayInsights : allInsights.slice(0, 3);

  const generationLabels: Record<string, string> = {
    "ALL": "Todas las gen.",
    "BOOMERS": "Boomers",
    "GEN_X": "Gen X",
    "MILLENNIALS": "Millennials",
    "GEN_Z": "Gen Z"
  };

  const moduleLabels: Record<string, string> = {
    "ALL": "General",
    "VERSUS": "Enfrentamientos",
    "TOURNAMENT": "Torneos",
    "PROFUNDIDAD": "Estudios",
    "ACTUALIDAD": "Agenda",
    "LUGARES": "Geo"
  };

  return (
    <div className="container-ws py-12 md:py-20 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-xl">
          <h3 className="text-2xl md:text-3xl font-black text-ink tracking-tight mb-2">
            Muro de Percepciones {activeModule !== "ALL" && "- Enfoque Directo"}
          </h3>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            Las señales más crudas y determinantes derivadas del nodo de interacción.
          </p>
        </div>
        <button className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors group">
          Explorar radar completo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Premium Layout: 1 Protagonist + 2 Secondary (Carousel on Mobile) */}
      <div className="flex lg:grid lg:grid-cols-12 gap-4 lg:gap-6 pb-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
        
        {/* Protagonist Card */}
        {safeInsights[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-[85vw] lg:w-auto shrink-0 snap-center col-span-1 lg:col-span-8 border rounded-[2rem] p-6 md:p-10 relative group hover:shadow-xl transition-all cursor-pointer ${safeInsights[0].color} overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
            
            {/* Big quote mark decoration */}
            <div className="absolute top-4 left-6 text-[120px] font-serif font-black opacity-10 leading-none pointer-events-none select-none">"</div>
            <div className="absolute bottom-8 right-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              {safeInsights[0].type === "tension" ? <Zap className="w-24 h-24" /> : 
               safeInsights[0].type === "consensus" ? <Target className="w-24 h-24" /> : 
               <MessageCircle className="w-24 h-24" />}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6 relative z-10">
               <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 text-[11px] font-bold uppercase tracking-widest">
                 {moduleLabels[safeInsights[0].module] || safeInsights[0].module}
               </span>
               <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 text-[11px] font-bold uppercase tracking-widest">
                 {generationLabels[activeGeneration] || activeGeneration}
               </span>
            </div>

            <h4 className="text-2xl md:text-3xl lg:text-4xl font-black leading-[1.1] mb-8 mt-6 relative z-10 tracking-tight max-w-2xl">
              {safeInsights[0].text}
            </h4>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/60 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-sm font-black opacity-70">
                    {safeInsights[0].author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Nodo de Origen</div>
                  <div className="text-sm font-bold opacity-80">
                    {safeInsights[0].author}
                  </div>
                </div>
              </div>

              <div className="w-12 h-12 rounded-full border-2 border-current opacity-20 group-hover:opacity-100 group-hover:bg-current transition-all flex items-center justify-center">
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </div>
          </motion.div>
        )}

        {/* 2 Secondary Cards */}
        <div className="flex lg:flex-col gap-4 lg:gap-6 col-span-1 lg:col-span-4 shrink-0">
          {safeInsights.slice(1, 3).map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + (index * 0.1) }}
              className={`w-[85vw] lg:w-auto shrink-0 snap-center flex-1 border rounded-[2rem] p-6 lg:p-8 relative group hover:shadow-lg transition-all cursor-pointer ${insight.color} flex flex-col justify-between`}
            >
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-30 transition-opacity">
                {insight.type === "tension" ? <Zap className="w-8 h-8" /> : 
                 insight.type === "consensus" ? <Target className="w-8 h-8" /> : 
                 <MessageCircle className="w-8 h-8" />}
              </div>

              <div>
                <div className="inline-block px-2 py-1 bg-white/50 backdrop-blur-sm rounded border border-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {moduleLabels[insight.module] || insight.module}
                </div>
                <p className="text-lg md:text-xl font-bold leading-tight relative z-10 tracking-tight mb-6">
                  "{insight.text}"
                </p>
              </div>
              
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md border border-white/60 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black opacity-70">
                    {insight.author.charAt(0)}
                  </span>
                </div>
                <div className="text-xs font-bold opacity-70 truncate">
                  {insight.author}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Carousel Indicators (Visual cue only) */}
      <div className="flex md:hidden justify-center gap-2 mt-4 mb-2">
        <div className="w-2 h-2 rounded-full bg-slate-800" />
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <div className="w-2 h-2 rounded-full bg-slate-300" />
      </div>

      <button className="md:hidden mt-4 w-full py-4 bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
        Explorar radar completo <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowRight, ArrowLeft, Zap, Target, Activity } from "lucide-react";
import { useState, useEffect } from "react";
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
      module: "SURVEY",
      color: "bg-indigo-950 text-white border-indigo-900", // Dark mode protagonist
      accent: "text-indigo-400",
      context: "Relevancia Alta"
    },
    {
      id: 2,
      type: "tension",
      text: "Choque frontal sobre subsidios energéticos. Se dividen las opiniones exactas 50/50.",
      author: "Ecosistema Emprendedor",
      module: "VERSUS",
      color: "bg-rose-50 border-rose-100 text-rose-950",
      accent: "text-rose-600",
      context: "Tensión Crítica"
    },
    {
      id: 3,
      type: "consensus",
      text: "9 de cada 10 usuarios coinciden en que la infraestructura ciclista es prioritaria para 2027.",
      author: "Habitantes Zona Céntrica",
      module: "LUGARES",
      color: "bg-emerald-50 border-emerald-100 text-emerald-950",
      accent: "text-emerald-600",
      context: "Consenso Absoluto"
    },
    {
      id: 4,
      type: "trend",
      text: "Las menciones a 'Aceleración Cuántica' subieron un 400% tras el último anuncio.",
      author: "Nodos de Innovación",
      module: "ACTUALIDAD",
      color: "bg-amber-50 border-amber-100 text-amber-950",
      accent: "text-amber-600",
      context: "Alerta de Tendencia"
    },
    {
      id: 5,
      type: "depth",
      text: "La rentabilidad ya no es el atributo más valorado en Startups; es la Sostenibilidad a 5 años.",
      author: "Inversores Activos",
      module: "PROFUNDIDAD",
      color: "bg-slate-900 border-slate-800 text-white", // Dark mode alternative
      accent: "text-slate-400",
      context: "Cambio de Paradigma"
    },
    {
      id: 6,
      type: "competition",
      text: "Android vs iOS vuelve al empate técnico en adopción de la última generación.",
      author: "Consumidores Tech",
      module: "TORNEO",
      color: "bg-blue-50 border-blue-100 text-blue-950",
      accent: "text-blue-600",
      context: "Empate Técnico"
    }
  ];

  const displayInsights = activeModule === "ALL" 
    ? allInsights 
    : allInsights.filter(i => i.module === activeModule || i.module === "VERSUS" /* Fallback */);

  const safeInsights = displayInsights.length >= 3 ? displayInsights : allInsights;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeInsights.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [safeInsights.length]);

  const handleNext = () => setActiveIndex((current) => (current + 1) % safeInsights.length);
  const handlePrev = () => setActiveIndex((current) => (current - 1 + safeInsights.length) % safeInsights.length);

  const protagonist = safeInsights[activeIndex];
  // In a real app we'd ensure these don't overlap if length is exactly 3, but this math is fine for carousel
  const secondary1 = safeInsights[(activeIndex + 1) % safeInsights.length];
  const secondary2 = safeInsights[(activeIndex + 2) % safeInsights.length];

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
    <div className="container-ws py-16 md:py-24 border-t border-slate-100 relative">
      {/* Abstract background for the section */}
      <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
           <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white text-slate-600 px-3 py-1 mb-4">
             <MessageCircle className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Señales Cualitativas</span>
           </div>
          <h3 className="text-4xl md:text-5xl font-black text-ink tracking-tight mb-4">
            Muro de Percepciones
          </h3>
          <p className="text-slate-500 text-lg leading-relaxed">
            La voz del ecosistema sin filtros. Lecturas profundas extraídas directamente de las fricciones y consensos más importantes.
          </p>
        </div>

        <div className="hidden md:flex gap-3">
          <button onClick={handlePrev} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={handleNext} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex lg:grid lg:grid-cols-12 gap-6 pb-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
        
        {/* Protagonist Card - EDITORIAL STYLE */}
        {protagonist && (
          <AnimatePresence mode="wait">
            <motion.div
              key={protagonist.id}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`w-[85vw] lg:w-auto shrink-0 snap-center col-span-1 lg:col-span-8 border rounded-3xl p-8 md:p-14 relative group hover:shadow-2xl transition-all cursor-pointer overflow-hidden ${protagonist.color}`}
            >
              {/* Animated noise overlay for premium texture */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              
              {/* Dynamic colored flares based on active card */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] mix-blend-screen"
                />
              </div>
              
              {/* Magazine style quote mark */}
              <div className="absolute top-6 left-6 md:top-10 md:left-10 text-[180px] font-serif font-black opacity-10 leading-none pointer-events-none select-none z-0 -translate-y-12">"</div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-wrap items-center gap-2 mb-10">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest text-inherit">
                    {moduleLabels[protagonist.module] || protagonist.module}
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest text-inherit">
                    {generationLabels[activeGeneration] || activeGeneration}
                  </span>
                  <span className={`px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${protagonist.accent}`}>
                    <Activity className="w-3 h-3" /> {protagonist.context}
                  </span>
                </div>

                <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-[1.2] mb-12 relative z-10 tracking-tight text-inherit">
                  {protagonist.text}
                </blockquote>
                
                <div className="flex items-center justify-between relative z-10 mt-auto pt-8 border-t border-inherit/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-sm text-inherit">
                      <span className="text-lg font-black font-serif italic">
                        {protagonist.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Nodo Declarativo</div>
                      <cite className="text-base font-bold text-inherit not-italic">
                        {protagonist.author}
                      </cite>
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-full border border-inherit/20 group-hover:bg-white group-hover:text-black transition-all flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 transition-transform -translate-x-1 group-hover:translate-x-0" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* 2 Secondary Cards */}
        <div className="flex lg:flex-col gap-6 col-span-1 lg:col-span-4 shrink-0">
          <AnimatePresence mode="popLayout">
            {[secondary1, secondary2].map((insight, index) => (
              <motion.div
                key={`${insight.id}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`w-[85vw] lg:w-auto shrink-0 snap-center flex-1 border rounded-3xl p-8 relative group hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between ${insight.color}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full rounded-tr-3xl" />
                
                <div className={`absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity group-hover:scale-110 duration-500 scale-95 ${insight.accent}`}>
                  {insight.type === "tension" ? <Zap className="w-10 h-10" /> : 
                   insight.type === "consensus" ? <Target className="w-10 h-10" /> : 
                   <MessageCircle className="w-10 h-10" />}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-2 py-1 bg-white/60 backdrop-blur-sm border border-slate-900/10 rounded uppercase tracking-widest font-bold text-[9px] text-inherit">
                      {moduleLabels[insight.module] || insight.module}
                    </span>
                    <span className={`px-2 py-1 bg-white/60 backdrop-blur-sm border border-slate-900/10 rounded uppercase tracking-widest font-bold text-[9px] flex items-center gap-1 ${insight.accent}`}>
                       {insight.context}
                    </span>
                  </div>
                  
                  <p className="text-xl md:text-2xl font-serif font-medium leading-[1.3] relative z-10 tracking-tight mb-8">
                    "{insight.text}"
                  </p>
                  
                  <div className="flex items-center gap-3 relative z-10 mt-auto pt-6 border-t border-inherit/10">
                    <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-md border border-inherit/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black italic font-serif">
                        {insight.author.charAt(0)}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate">
                      {insight.author}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden flex flex-col gap-4 mt-6">
        <div className="flex justify-center gap-2">
          {safeInsights.map((_, i) => (
            <button 
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? 'bg-indigo-600 scale-125' : 'bg-slate-300'}`} 
              aria-label={`Go to insight ${i + 1}`}
            />
          ))}
        </div>
        <button className="w-full py-4 bg-white text-slate-800 font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
          Explorar radar completo <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

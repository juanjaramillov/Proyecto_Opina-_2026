import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Zap, Target } from "lucide-react";
import { ResultsModule } from "../../hooks/useResultsExperience";

interface ResultsContextualWallProps {
  activeModule: ResultsModule;
}

export function ResultsContextualWall({ activeModule }: ResultsContextualWallProps) {
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

  return (
    <div className="container-ws py-24 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-xl">
          <h3 className="text-3xl font-black text-ink tracking-tight mb-2">
            Muro de Percepciones {activeModule !== "ALL" && "- Enfoque Directo"}
          </h3>
          <p className="text-slate-500 text-lg">
            Fragmentos crudos de inteligencia derivados directamente de los nodos de mayor interacción.
          </p>
        </div>
        <button className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors group">
          Explorar todas las señales 
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {safeInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`break-inside-avoid border rounded-[2rem] p-8 relative group hover:shadow-lg transition-all cursor-pointer \${insight.color}`}
          >
            {/* Contextual Icon based on type */}
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
              {insight.type === "tension" ? <Zap className="w-8 h-8" /> : 
               insight.type === "consensus" ? <Target className="w-8 h-8" /> : 
               <MessageCircle className="w-8 h-8" />}
            </div>

            <p className="text-xl md:text-2xl font-black leading-tight mb-8 relative z-10">
              "{insight.text}"
            </p>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm border border-white/40 flex items-center justify-center shrink-0">
                <span className="text-xs font-black opacity-60">
                  {insight.author.charAt(0)}
                </span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-60">
                {insight.author}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="md:hidden mt-10 w-full py-4 bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
        Explorar todas las señales <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

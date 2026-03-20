import { motion } from 'framer-motion';
import { Clock, Users, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react';
import { ActualidadTopic } from "../../../signals/services/actualidadService";
import { getRelativeTime } from "../../hooks/useActualidadHome";

interface ActualidadTopicsGridProps {
  gridTopics: ActualidadTopic[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectTopic: (topic: ActualidadTopic) => void;
}

export function ActualidadTopicsGrid({ 
  gridTopics, 
  selectedCategory, 
  setSelectedCategory, 
  onSelectTopic 
}: ActualidadTopicsGridProps) {

  if (gridTopics.length === 0) {
    return (
      <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border text-center border-stroke rounded-3xl p-12 flex flex-col items-center justify-center shadow-sm"
      >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-brand opacity-10 blur-xl"></div>
              <AlertCircle className="w-10 h-10 text-[var(--accent-primary)] relative z-10" />
          </div>
          <h3 className="text-xl font-black text-ink mb-2">Sin temas en {selectedCategory}</h3>
          <p className="text-text-secondary max-w-sm mb-6">
              No hay temas activos clasificados bajo esta categoría actualmente.
          </p>
          <button onClick={() => setSelectedCategory("Todos")} className="text-[var(--accent-primary)] font-bold text-sm bg-blue-50 px-6 py-2.5 rounded-xl hover:bg-[var(--accent-primary)] hover:text-white transition-colors">
              Explorar otras categorías
          </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gridTopics.map((topic, i) => (
            <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => onSelectTopic(topic)}
                className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-6 sm:p-8 hover:border-blue-200 hover:shadow-[0_8px_30px_-12px_rgba(37,99,235,0.15)] hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
                {topic.has_answered && (
                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-sm">
                        Participaste
                    </div>
                )}
                {/* Fondo interactivo más sutil y elegante */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500 pointer-events-none z-0"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                            {topic.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {getRelativeTime(topic.published_at)}
                        </span>
                    </div>

                    {topic.impact_quote ? (
                        <div className="mb-4">
                            <h3 className="text-xl md:text-2xl font-black text-ink leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                                <span className="text-emerald-500 mr-1 opacity-70 font-serif">"</span>
                                {topic.impact_quote}
                                <span className="text-emerald-500 ml-1 opacity-70 font-serif">"</span>
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide truncate">
                                Debate: {topic.title}
                            </p>
                        </div>
                    ) : (
                        <h3 className="text-xl md:text-2xl font-black text-ink leading-snug mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {topic.title}
                        </h3>
                    )}

                    <p className="text-sm md:text-base text-slate-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                        {topic.short_summary}
                    </p>
                </div>

                <div className="relative z-10 mt-auto flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-500 text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-emerald-500" /> {topic.stats?.total_participants || 0}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href={(topic.metadata?.source_url as string) || `https://news.google.com/search?q=${encodeURIComponent(topic.title)}&hl=es-419&gl=CL&ceid=CL%3Aes-419`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 hover:underline transition-colors"
                            title="Leer noticia original"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Leer
                        </a>
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Opinar <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><ChevronRight className="w-4 h-4" /></div>
                        </div>
                    </div>
                </div>
            </motion.div>
        ))}
    </div>
  );
}

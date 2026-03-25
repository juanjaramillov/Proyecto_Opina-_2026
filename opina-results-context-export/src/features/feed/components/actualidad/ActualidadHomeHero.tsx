import { motion } from 'framer-motion';
import { Clock, Users, ChevronRight, Activity, PieChart, ExternalLink } from 'lucide-react';
import { ActualidadTopic } from "../../../signals/services/actualidadService";
import { MetricAvailabilityCard } from "../../../../components/ui/MetricAvailabilityCard";
import { getRelativeTime } from "../../hooks/useActualidadHome";

interface ActualidadHomeHeroProps {
  currentHeroTopic: ActualidadTopic;
  topHeroTopics: ActualidadTopic[];
  heroIndex: number;
  setHeroIndex: (idx: number) => void;
  onSelectTopic: (topic: ActualidadTopic) => void;
}

export function ActualidadHomeHero({
  currentHeroTopic,
  topHeroTopics,
  heroIndex,
  setHeroIndex,
  onSelectTopic
}: ActualidadHomeHeroProps) {
  const currentParticipants = currentHeroTopic.stats?.total_participants || 0;

  return (
    <motion.div
        key={currentHeroTopic.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 overflow-hidden shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] group cursor-pointer hover:shadow-[0_8px_32px_-8px_rgba(37,99,235,0.15)] hover:border-blue-200 transition-all duration-300 relative flex flex-col mb-4 mt-2"
        onClick={() => onSelectTopic(currentHeroTopic)}
    >
        {currentHeroTopic.has_answered && (
            <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-sm">
                Participaste
            </div>
        )}
        <div className="p-1.5 md:p-2 bg-white/50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-blue-50/90 via-white/95 to-slate-50/90 rounded-xl md:rounded-[1.5rem] p-6 md:p-10 lg:p-12 flex flex-col relative overflow-hidden h-[450px] md:h-[500px] shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] border border-white/60">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent pointer-events-none z-0"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400 rounded-full blur-[100px] opacity-20 pointer-events-none z-0"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-400 rounded-full blur-[100px] opacity-15 pointer-events-none z-0"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="badge bg-blue-50 text-blue-700 border-blue-100 backdrop-blur-md hover:bg-blue-100 transition-colors uppercase font-bold tracking-widest text-[10px] px-3 py-1">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 shadow-[0_0_8px_#3B82F6]"></span>
                                    Noticia Más Opinada
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {currentHeroTopic.category}
                                </span>
                            </div>
                            
                            {topHeroTopics.length > 1 && (
                                <div className="flex gap-1.5">
                                    {topHeroTopics.map((_, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={(e) => { e.stopPropagation(); setHeroIndex(idx); }}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === heroIndex ? 'bg-blue-500 w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                                            aria-label={`Slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1">
                            <div className="flex-1 flex flex-col justify-center">
                                {currentHeroTopic.impact_quote ? (
                                    <div className="mb-4">
                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-ink leading-[1.15] tracking-tight mb-2 group-hover:text-blue-900 transition-colors flex">
                                        <span className="text-blue-500 mr-2 opacity-70 font-serif">"</span>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-ink to-blue-900">{currentHeroTopic.impact_quote}</span>
                                        <span className="text-blue-500 ml-2 opacity-70 font-serif self-end">"</span>
                                        </h2>
                                        <p className="text-blue-600 font-medium text-lg mt-4 flex items-center gap-2">
                                            Debate principal: <span className="text-ink font-bold">{currentHeroTopic.title}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-ink leading-[1.1] tracking-tight mb-6 group-hover:text-blue-800 transition-colors">
                                        {currentHeroTopic.title}
                                    </h2>
                                )}
                                
                                <p className="text-slate-600 font-medium text-base line-clamp-2 md:line-clamp-3 max-w-2xl leading-relaxed mt-2 hidden md:block">
                                    {currentHeroTopic.short_summary}
                                </p>
                            </div>

                            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] relative overflow-hidden group-hover:bg-white/80 transition-colors">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400 rounded-full blur-2xl opacity-10"></div>
                                
                                {currentParticipants >= 20 ? (
                                    <MetricAvailabilityCard 
                                        label="Conclusión Opina+" 
                                        status="available" 
                                        value={`${currentParticipants} Actores`} 
                                        helperText="Tendiendo a un consenso positivo."
                                        icon={PieChart}
                                    />
                                ) : (
                                    <MetricAvailabilityCard 
                                        label="Métricas de Debate" 
                                        status="pending" 
                                        helperText="Aportando señales operativas al sistema de conclusiones en breve."
                                        icon={Activity}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-200 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
                            <Users className="w-4 h-4 text-blue-500" />
                            {currentHeroTopic.stats?.total_participants || 0} Interacciones
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-slate-500" />
                            {getRelativeTime(currentHeroTopic.published_at)}
                        </div>
                        
                        <div className="ml-auto w-full md:w-auto mt-4 md:mt-0 flex gap-3">
                            <a 
                                href={(currentHeroTopic.metadata?.source_url as string) || `https://news.google.com/search?q=${encodeURIComponent(currentHeroTopic.title)}&hl=es-419&gl=CL&ceid=CL%3Aes-419`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-2 bg-white text-slate-700 font-bold text-sm md:text-base px-6 py-3 md:py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 w-full md:w-auto shadow-sm"
                            >
                                <ExternalLink className="w-4 h-4" /> Leer noticia
                            </a>
                            <div className="flex items-center justify-center gap-3 bg-gradient-brand text-white font-black text-sm md:text-base px-6 py-3 md:py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] transition-all active:scale-95 w-full md:w-auto">
                                Explorar Datos <ChevronRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );
}

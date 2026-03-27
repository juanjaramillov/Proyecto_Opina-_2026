import { motion } from 'framer-motion';
import { ArrowUpRight, MessageSquare, Activity, Users, BarChart3 } from 'lucide-react';
import { ActualidadTopic } from '../../../signals/services/actualidadService';
import { getDeterministicImage, getSourceName } from './actualidadHelpers';

interface ActualidadGridCardProps {
  topic: ActualidadTopic;
  index: number;
  onSelectTopic: (topic: ActualidadTopic) => void;
}

export function ActualidadGridCard({
  topic,
  index,
  onSelectTopic
}: ActualidadGridCardProps) {
  const imageUrl = getDeterministicImage(topic);
  const sourceName = getSourceName(topic);
  
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 * index, duration: 0.5, ease: "easeOut" }}
        onClick={() => onSelectTopic(topic)}
        className="bg-white rounded-[2rem] overflow-hidden group cursor-pointer relative flex flex-col h-auto hover:-translate-y-1.5 transition-transform duration-500 shadow-md hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.15)] border border-slate-200"
    >
        {/* TOP HALF: Media & Primary Quote */}
        <div className="relative h-48 sm:h-56 overflow-hidden flex flex-col p-6 items-center text-center">
            <div className="absolute inset-0 z-0 bg-white">
                <img 
                    src={imageUrl} 
                    alt={topic.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2000ms]"
                />
                {/* 3D / Graphic Overlays WOW */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] group-hover:bg-white/10 transition-colors duration-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[50px] rounded-full mix-blend-multiply pointer-events-none group-hover:-translate-x-8 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 blur-[50px] rounded-full mix-blend-multiply pointer-events-none group-hover:translate-x-8 transition-transform duration-1000"></div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10 flex w-full justify-between items-start mb-auto">
                <div className="flex flex-col gap-2 items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/20 shadow-sm">
                        {topic.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-200">
                        Fuente: <span className="text-slate-900">{sourceName}</span>
                    </span>
                </div>
                {topic.has_answered && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                        <span className="text-emerald-500 font-bold text-xs">✓</span>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex w-full justify-center items-end mt-4">
                {topic.impact_quote ? (
                    <h3 className="text-lg md:text-xl font-black text-ink leading-tight drop-shadow-sm line-clamp-3 text-center text-balance">
                        <span className="text-primary mr-1 font-serif text-2xl leading-[0.5]">"</span>
                        {topic.impact_quote}
                        <span className="text-primary ml-1 font-serif text-2xl leading-[0.5]">"</span>
                    </h3>
                ) : (
                    <h3 className="text-lg md:text-xl font-black text-ink leading-tight drop-shadow-sm line-clamp-3 text-center text-balance">
                        {topic.title}
                    </h3>
                )}
            </div>
        </div>

        {/* BOTTOM HALF: Dense Data & Direct Interaction (HYBRID VERTICAL/HORIZONTAL COMPRESSED) */}
        <div className="flex-1 bg-white backdrop-blur-md p-4 flex flex-col border-t border-slate-100 relative overflow-hidden group-hover:border-primary/20 transition-colors duration-500">
            {/* Background mesh in KPI panel */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700"></div>

            <div className="flex flex-col h-full z-10 relative">
                {/* Title & Summary */}
                <div className="mb-4 text-center">
                    <h4 className="text-base md:text-lg font-bold text-ink leading-tight mb-2 line-clamp-2 text-balance">
                        {topic.title}
                    </h4>
                    <p className="text-slate-600 text-[12px] md:text-[13px] font-medium leading-snug line-clamp-2 text-balance mx-auto max-w-[90%]">
                        {topic.short_summary}
                    </p>
                </div>

                {/* Hybrid Layout: KPIs (Left) + Action (Right) */}
                <div className="flex flex-row gap-3 mb-3">
                    {/* Data Density (Left - 1/3) */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex flex-col justify-center h-full shadow-sm">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 overflow-hidden">
                                <Activity className="w-3 h-3 shrink-0" /> Fricción
                            </span>
                            <span className="text-[12px] md:text-[13px] font-black text-rose-500 mt-0.5">Alta</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex flex-col justify-center h-full shadow-sm">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 overflow-hidden">
                                <Users className="w-3 h-3 shrink-0" /> <span className="truncate">Censal</span>
                            </span>
                            <span className="text-[12px] md:text-[13px] font-black text-slate-800 mt-0.5">{topic.stats?.total_participants || 142}</span>
                        </div>
                    </div>

                    {/* Action Hub (Right - 2/3) */}
                    <div className="w-2/3 flex flex-col justify-between items-center text-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1 mb-1.5 line-clamp-1 w-full relative">
                            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-100 z-0"></div>
                            <span className="bg-white px-2 relative z-10 flex items-center gap-1 backdrop-blur-sm rounded-full">
                                <BarChart3 className="w-3 h-3 text-accent shrink-0" />
                                {topic.has_answered ? 'Tu opinión' : 'Postura Directa'}
                            </span>
                        </span>

                        {!topic.has_answered ? (
                            <div className="flex flex-col gap-1.5 justify-center flex-1 w-full">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onSelectTopic(topic); }}
                                    className="bg-white hover:bg-slate-50 hover:border-secondary/30 border border-slate-200 text-slate-700 hover:text-secondary font-bold py-1.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] text-center"
                                >
                                    <span className="text-[11px] md:text-xs">Apruebo</span> <ArrowUpRight className="w-3 h-3 opacity-50 block transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onSelectTopic(topic); }}
                                    className="bg-white hover:bg-slate-50 hover:border-rose-500/30 border border-slate-200 text-slate-700 hover:text-rose-500 font-bold py-1.5 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] text-center"
                                >
                                    <span className="text-[11px] md:text-xs">Rechazo</span> <ArrowUpRight className="w-3 h-3 opacity-50 block transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 justify-center flex-1 pt-1">
                                <div>
                                    <div className="flex justify-between text-[8px] md:text-[9px] font-mono text-slate-600 mb-1">
                                        <span>A Favor</span><span className="text-emerald-500 font-bold">68%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10B981]" style={{ width: `68%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[8px] md:text-[9px] font-mono text-slate-600 mb-1">
                                        <span>En Contra</span><span className="text-rose-500 font-bold">32%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 shadow-[0_0_10px_#F43F5E]" style={{ width: `32%` }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main CTA */}
                <div className="mt-auto pt-2 border-t border-slate-100 relative">
                    {/* Inner Button Glow */}
                    <div className="absolute inset-x-4 top-4 h-full bg-primary/40 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); onSelectTopic(topic); }}
                        className="w-full relative z-10 bg-brand-gradient hover:opacity-90 text-white font-black py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-premium hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] text-[11px] md:text-xs uppercase tracking-wider group/cta overflow-hidden border border-white/10"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/cta:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 group-hover/cta:scale-110 transition-transform relative z-10" />
                        <span className="truncate relative z-10">{topic.has_answered ? 'Ver Informe Detallado' : 'Contestar sobre este tema'}</span>
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
  );
}

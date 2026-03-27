import { motion } from 'framer-motion';
import { Users, BarChart3, Zap, Activity, MessageSquare, ArrowUpRight } from 'lucide-react';
import { ActualidadTopic } from "../../../signals/services/actualidadService";

interface ActualidadHomeHeroProps {
  currentHeroTopic: ActualidadTopic;
  topHeroTopics: ActualidadTopic[];
  heroIndex: number;
  setHeroIndex: (idx: number) => void;
  onSelectTopic: (topic: ActualidadTopic) => void;
}

import { getDeterministicImage, getSourceName } from './actualidadHelpers';

export function ActualidadHomeHero({
  currentHeroTopic,
  topHeroTopics,
  heroIndex,
  setHeroIndex,
  onSelectTopic
}: ActualidadHomeHeroProps) {

  const imageUrl = getDeterministicImage(currentHeroTopic);
  const sourceName = getSourceName(currentHeroTopic);

  return (
    <div className="relative mb-12 mt-4">
        {/* Glow ambient background WOW */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-[3rem] -z-10 pointer-events-none"></div>
        
        <motion.div
            key={currentHeroTopic.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col lg:flex-row bg-white rounded-[2rem] overflow-hidden shadow-premium hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.15)] transition-shadow duration-700 border border-slate-200 min-h-[500px] group/hero"
        >
            {/* LEFT PANE: Immersive Media & Quote */}
            <div className="relative w-full lg:w-7/12 flex flex-col justify-between p-8 md:p-12 min-h-[400px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-slate-200 cursor-pointer group" onClick={() => onSelectTopic(currentHeroTopic)}>
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0 bg-white">
                    <img 
                        src={imageUrl} 
                        alt={currentHeroTopic.title} 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                    />
                    {/* WOW Overlays Claros */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] group-hover:bg-white/20 transition-colors duration-1000"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay overflow-hidden"></div>
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full mix-blend-multiply pointer-events-none group-hover/hero:translate-x-12 transition-transform duration-1000"></div>
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 blur-[100px] rounded-full mix-blend-multiply pointer-events-none group-hover/hero:-translate-x-12 transition-transform duration-1000"></div>
                    
                    {/* Gradientes Claros para asegurar lectura */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent"></div>
                </div>

                {/* Top Labels */}
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="flex items-center gap-2 bg-primary/10 backdrop-blur-md border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm">
                            <Zap className="w-3.5 h-3.5 fill-current text-primary" />
                            {currentHeroTopic.category}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md text-slate-600 text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                            Fuente: <span className="text-slate-900">{sourceName}</span>
                        </span>
                    </div>
                    
                    {/* Navigation Dots */}
                    {topHeroTopics.length > 1 && (
                        <div className="flex gap-2 items-center bg-white/50 backdrop-blur-md shadow-sm px-3 py-2 rounded-full border border-slate-200">
                            {topHeroTopics.map((_, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={(e) => { e.stopPropagation(); setHeroIndex(idx); }}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'bg-primary w-6 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-300 w-1.5 hover:bg-slate-400'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Quote Area */}
                <div className="relative z-10 mt-auto pt-16">
                    {currentHeroTopic.impact_quote ? (
                        <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-black text-ink leading-[1.1] tracking-tight text-balance text-left">
                            <span className="text-primary font-serif italic text-5xl mr-2 drop-shadow-sm">"</span>
                            {currentHeroTopic.impact_quote}
                        </h2>
                    ) : (
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-[1.05] tracking-tight text-balance text-left">
                            {currentHeroTopic.title}
                        </h2>
                    )}
                </div>
            </div>

            {/* RIGHT PANE: Dense Data & Direct Interaction */}
            <div className="relative w-full lg:w-5/12 bg-white/80 backdrop-blur-3xl p-8 md:p-10 flex flex-col border-l border-slate-100">
                {/* Background ambient mesh */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover/hero:bg-primary/10 transition-all duration-1000"></div>

                <div className="flex flex-col h-full z-10 relative">
                    {/* Information Cluster */}
                    <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_12px_rgba(14,165,233,0.3)]"></div>
                            <h3 className="text-lg md:text-xl font-bold text-ink leading-tight">
                                {currentHeroTopic.title}
                            </h3>
                        </div>
                        
                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed mb-6">
                            {currentHeroTopic.short_summary}
                        </p>

                        {/* Data Density Row */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5" /> Fricción
                                </span>
                                <span className="text-lg font-black text-rose-500">Alta</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> Demografía
                                </span>
                                <span className="text-lg font-black text-slate-800">{currentHeroTopic.stats?.total_participants || 142}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub (Frictionless Simulation) */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-accent" />
                                {currentHeroTopic.has_answered ? 'Tu opinión registrada' : 'Postura Directa'}
                            </span>
                        </div>

                        {!currentHeroTopic.has_answered ? (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onSelectTopic(currentHeroTopic); }}
                                    className="bg-white hover:bg-slate-50 hover:border-secondary/30 border border-slate-200 text-slate-600 hover:text-secondary font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm group/btn shadow-sm"
                                >
                                    Apruebo <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onSelectTopic(currentHeroTopic); }}
                                    className="bg-white hover:bg-slate-50 hover:border-rose-500/30 border border-slate-200 text-slate-600 hover:text-rose-500 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm group/btn shadow-sm"
                                >
                                    Rechazo <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mb-6">
                                <div>
                                    <div className="flex justify-between text-xs font-mono text-slate-600 mb-1.5">
                                        <span>Tendencia a Favor</span>
                                        <span className="text-emerald-500 font-bold">68%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10B981]" style={{ width: `68%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-mono text-slate-600 mb-1.5">
                                        <span>Tendencia en Contra</span>
                                        <span className="text-rose-500 font-bold">32%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 shadow-[0_0_10px_#F43F5E]" style={{ width: `32%` }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="relative mt-2">
                            {/* Inner Button Glow */}
                            <div className="absolute inset-x-4 top-4 h-full bg-primary/40 blur-2xl rounded-full opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); onSelectTopic(currentHeroTopic); }}
                                className="w-full relative z-10 bg-brand-gradient hover:opacity-90 text-white font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 group/cta overflow-hidden border border-white/10"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/cta:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                                <MessageSquare className="w-5 h-5 relative z-10 group-hover/cta:scale-110 transition-transform" />
                                <span className="relative z-10">{currentHeroTopic.has_answered ? 'Ver Informe Detallado' : 'Contestar sobre este tema'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
}


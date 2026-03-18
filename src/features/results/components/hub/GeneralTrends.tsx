import { useState, useEffect } from "react";
import { platformService } from "../../../signals/services/platformService";
import { TrendingItem } from "../../../../types/trending";
import { Activity } from "lucide-react";

export function GeneralTrends() {
    const [loading, setLoading] = useState(true);
    const [trendingFeed, setTrendingFeed] = useState<TrendingItem[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            // "all" segments retrieves general platform trends
            const data = await platformService.getSegmentedTrending("all", "all", "all");
            if (!mounted) return;
            setTrendingFeed(data || []);
            setLoading(false);
        };
        fetchStats();
        return () => { mounted = false; };
    }, []);

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center border border-stroke shadow-sm">
                    <Activity className="w-5 h-5 text-ink" />
                </div>
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-ink tracking-tight">El Pulso <span className="text-primary">Global</span></h2>
                    <p className="text-text-secondary text-sm font-medium">Lo que está moviendo la aguja en toda la plataforma hoy.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                
                {/* 1. Insight Dinámico Automático (Dark AI Mode) */}
                <div className="col-span-1 lg:col-span-5 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-center relative overflow-hidden group isolation-auto min-h-[300px]">
                    {/* Partículas de fondo estilo Radar / Data */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/30 blur-[80px] rounded-full group-hover:bg-primary/40 group-hover:scale-110 transition-all duration-1000 ease-out" />
                    
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 flex items-center gap-2 z-10 bg-slate-800/60 w-max px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-md shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Señal Omnisciente
                    </span>
                    
                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <p className="text-2xl md:text-3xl lg:text-[2rem] font-black text-white leading-[1.15] text-balance">
                            {loading 
                                ? <span className="text-slate-500 animate-pulse">Sintetizando el ruido de la plataforma...</span>
                                : trendingFeed.length > 0 
                                    ? <>"<span className="text-primary bg-primary/10 px-1 rounded-md">{trendingFeed[0]?.title}</span>" está dominando la polaridad de la red en tiempo real.</> 
                                    : "La comunidad está calibrando nuevas preferencias."
                            }
                        </p>
                    </div>

                    {/* Escáner decorativo */}
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-50 group-hover:animate-[ping_3s_ease-in-out_infinite]" />
                </div>

                {/* 2. Top Tendencias (Grilla Premium Glassmorphism) */}
                <div className="col-span-1 lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-[160px] bg-surface2/50 rounded-[2rem] animate-pulse border border-stroke/50"></div>
                            ))
                        ) : trendingFeed.slice(0, 4).map((item, idx) => (
                            <div key={item.id} className="relative p-6 md:p-8 rounded-[2rem] border border-stroke shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-500 flex flex-col min-h-[160px] isolation-auto">
                                {/* Base inmersiva al hacer hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.direction === 'up' ? 'from-secondary/5' : item.direction === 'down' ? 'from-danger/5' : 'from-slate-100/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <span className="text-4xl font-black text-slate-100 tracking-tighter group-hover:text-surface transition-colors duration-500 select-none">0{idx + 1}</span>
                                    {item.direction === 'up' && <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm backdrop-blur-sm"><span className="material-symbols-outlined text-[14px]">trending_up</span>{item.variation_percent.toFixed(1)}%</span>}
                                    {item.direction === 'down' && <span className="px-2.5 py-1 rounded-full bg-danger/10 text-danger text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm backdrop-blur-sm"><span className="material-symbols-outlined text-[14px]">trending_down</span>{Math.abs(item.variation_percent).toFixed(1)}%</span>}
                                    {item.direction === 'stable' && <span className="px-2.5 py-1 rounded-full bg-surface2 text-text-muted text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm backdrop-blur-sm"><span className="material-symbols-outlined text-[14px]">horizontal_rule</span>0.0%</span>}
                                </div>
                                <div className="relative z-10 mt-auto pt-6">
                                    <h3 className="text-base font-black text-ink leading-tight mb-1 truncate group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest opacity-80">{item.slug}</p>
                                </div>

                                {/* Sparkline de fondo animada Premium */}
                                <svg className={`absolute bottom-0 right-0 w-3/4 h-2/3 opacity-[0.04] group-hover:opacity-[0.15] transition-all duration-700 pointer-events-none ${item.direction === 'up' ? 'group-hover:text-secondary' : item.direction === 'down' ? 'group-hover:text-danger' : 'group-hover:text-slate-400'}`} viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <path 
                                        d={item.direction === 'up' ? "M0,50 C20,40 40,45 60,20 C80,25 100,0 100,0" : item.direction === 'down' ? "M0,10 C20,15 40,10 60,30 C80,25 100,50 100,50" : "M0,30 L100,30"} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="animate-[dash_3s_linear_infinite]"
                                        style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
                                    />
                                    {/* Sombra de la sparkline */}
                                    <path 
                                        d={item.direction === 'up' ? "M0,50 C20,40 40,45 60,20 C80,25 100,0 100,0 L100,50 L0,50 Z" : item.direction === 'down' ? "M0,10 C20,15 40,10 60,30 C80,25 100,50 100,50 L100,50 L0,50 Z" : "M0,30 L100,30 L100,50 L0,50 Z"} 
                                        fill="currentColor" 
                                        className="opacity-20"
                                    />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Search, ChevronRight, BarChart2, TrendingUp, Layers, MapPin, Building, ShoppingBag, Activity, Sparkles, AlertCircle, PieChart, ExternalLink } from 'lucide-react';
import { ActualidadTopic } from '../../signals/services/actualidadService';

const CATEGORIAS = [
    { id: "Todos", icon: Layers },
    { id: "País", icon: MapPin },
    { id: "Economía", icon: TrendingUp },
    { id: "Ciudad / Vida diaria", icon: Building },
    { id: "Marcas y Consumo", icon: ShoppingBag },
    { id: "Deportes y Cultura", icon: Activity },
    { id: "Tendencias y Sociedad", icon: Sparkles }
];

interface ActualidadHomeProps {
    topics: ActualidadTopic[];
    loading: boolean;
    onSelectTopic: (topic: ActualidadTopic) => void;
}

// Función auxiliar para formatear la fecha a un texto amigable de hace cuánto fue publicado
function getRelativeTime(dateString: string | null) {
    if (!dateString) return "Reciente";
    const then = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - then.getTime()) / 3600000;
    
    if (diffInHours < 1) return "Hace un momento";
    if (diffInHours < 24) return `Hace ${Math.floor(diffInHours)} hs`;
    if (diffInHours < 48) return "Ayer";
    return `Hace ${Math.floor(diffInHours / 24)} días`;
}

// Función para generar un KPI mockeado determinista basado en el string (mientras construimos el backend)
function getMockKPI(id: string, participants: number) {
    if (participants === 0) return null;
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash);
    const percentage = 45 + (val % 45); // Entre 45% y 90%
    
    const conclusions = [
        "están de acuerdo",
        "creen que es positivo",
        "piensan que afectará la economía",
        "tienen una visión crítica",
    ];
    const conclusion = conclusions[val % conclusions.length];
    
    return { percentage, conclusion };
}

export function ActualidadHome({ topics, loading, onSelectTopic }: ActualidadHomeProps) {
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [heroIndex, setHeroIndex] = useState(0);

    // Helper para normalizar categorías (ignorar mayúsculas, tildes y espacios extra)
    const normalizeCategory = (cat: string) => 
        cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Mejores temas globales para el Hero (ordenados por interacciones empíricas)
    const topHeroTopics = useMemo(() => {
        if (!topics) return [];
        return [...topics]
            .sort((a, b) => (b.stats?.total_participants || 0) - (a.stats?.total_participants || 0))
            .slice(0, 4); // Mostrar los top 4
    }, [topics]);

    // Filtrar temas para la grilla inferior
    const gridTopics = useMemo(() => {
        if (selectedCategory === "Todos") return topics;
        const normalizedSelected = normalizeCategory(selectedCategory);
        return topics.filter(t => normalizeCategory(t.category) === normalizedSelected);
    }, [topics, selectedCategory]);

    const currentHeroTopic = topHeroTopics.length > 0 ? topHeroTopics[heroIndex] : null;
    const heroKpi = currentHeroTopic ? getMockKPI(currentHeroTopic.id, currentHeroTopic.stats?.total_participants || 0) : null;

    // Carrusel Automático
    useEffect(() => {
        if (topHeroTopics.length <= 1) return;
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % topHeroTopics.length);
        }, 6000); // Cambiar cada 6 segundos
        return () => clearInterval(interval);
    }, [topHeroTopics.length]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                <p className="mt-4 text-text-muted font-medium">Buscando el pulso de hoy...</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-black text-ink mb-2">Todo en calma</h2>
                <p className="text-text-secondary max-w-sm">
                    No hay nuevos temas de actualidad en este momento. Vuelve más tarde para participar en la conversación.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-fade-in fade-in max-w-ws mx-auto w-full px-4 sm:px-0">
            {/* Fondo limpio en la vista home - Reemplazado ruido visual por un gradiente sutil blanco/gris */}
            <div className="fixed top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none -z-10 bg-gradient-to-b from-slate-50 to-white"></div>

            <div className="space-y-6">
                {/* HERO DESTACADO (Carrusel Global) */}
                {currentHeroTopic && (
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
                                {/* Decoración Premium Opina+ (Corporate Colors con transparencias) */}
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
                                            
                                            {/* Indicadores del Carrusel */}
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
                                            {/* Columna Izquierda: Quote Noticiosa */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                {/* AI Impact Quote (If available) or Title */}
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

                                            {/* Columna Derecha: KPI (Si hay participantes, si no, placeholder invitando a votar) */}
                                            <div className="w-full md:w-64 lg:w-72 flex flex-col justify-center shrink-0">
                                                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] relative overflow-hidden group-hover:bg-white/80 transition-colors">
                                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400 rounded-full blur-2xl opacity-10"></div>
                                                    
                                                    {heroKpi ? (
                                                        <>
                                                            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                                                                <PieChart className="w-4 h-4" />
                                                                Conclusión Opina+
                                                            </div>
                                                            <div className="text-5xl font-black text-ink mb-1 tracking-tighter">
                                                                {heroKpi.percentage}%
                                                            </div>
                                                            <div className="text-sm font-medium text-slate-600 leading-snug">
                                                                de los participantes <strong className="text-ink">{heroKpi.conclusion}</strong>.
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
                                                                <Activity className="w-4 h-4" />
                                                                Debate Nuevo
                                                            </div>
                                                            <div className="text-2xl font-black text-ink mb-2 leading-tight">
                                                                Aún sin conclusiones
                                                            </div>
                                                            <div className="text-sm font-medium text-slate-600 leading-snug">
                                                                Sé de los primeros en dejar tu señal para generar estadísticas.
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
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
                )}

                {/* Filtro de Categorías - Movido Debajo del Hero */}
                <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar pb-2 pt-2">
                    <div className="flex gap-3">
                        {CATEGORIAS.map(cat => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`whitespace-nowrap flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all transform hover:-translate-y-1 ${
                                        isSelected
                                            ? 'bg-gradient-brand text-white shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]'
                                            : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)] hover:shadow-sm'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                    {cat.id}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* EMPTY STATE POR CATEGORÍA */}
                {gridTopics.length === 0 && (
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
                )}

                {/* SECUNDARIOS (Grid por categoría) */}
                {gridTopics.length > 0 && (
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
                )}

                {/* HISTÓRICO (Placeholder CTA) */}
                <div className="mt-8 pt-8 border-t border-stroke text-center pb-12">
                     <button className="inline-flex items-center justify-center gap-2 border border-stroke bg-white text-ink hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition-all">
                        <BarChart2 className="w-4 h-4" />
                        Ver Archivos de Actualidad
                    </button>
                </div>

            </div>
        </div>
    );
}

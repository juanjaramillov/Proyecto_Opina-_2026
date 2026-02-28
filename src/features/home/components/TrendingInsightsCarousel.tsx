import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingItem } from "../../../types/trending";

interface TrendingInsightsCarouselProps {
    data: TrendingItem[];
    filters: {
        ageRange: string;
        gender: string;
        commune: string;
    };
}

export default function TrendingInsightsCarousel({ data, filters }: TrendingInsightsCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (isPaused || data.length === 0) return;
        timeoutRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % data.length);
        }, 6000); // 6s per slide

        return () => {
            if (timeoutRef.current) clearInterval(timeoutRef.current);
        };
    }, [isPaused, data.length]);

    if (data.length === 0) {
        return (
            <div className="w-full aspect-[21/9] max-w-5xl mx-auto rounded-3xl border border-slate-100 bg-white/50 flex flex-col items-center justify-center p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 animate-pulse">radar</span>
                <h3 className="text-xl font-black text-slate-800 mb-2">Buscando señales...</h3>
                <p className="text-slate-500 font-medium">No hay suficientes datos para este cruce de filtros exacto.</p>
            </div>
        );
    }

    const activeSlide = data[current];
    const nextIdx = (current + 1) % data.length;
    const nextSlide = data[nextIdx];

    // Generador de frases llamativas según data
    const getCatchyPhrase = (item: TrendingItem) => {
        const isSpecific = filters.ageRange !== 'all' || filters.gender !== 'all' || filters.commune !== 'all';
        const segmentName = isSpecific ? "tu segmento" : "la red";

        if (item.direction === 'up' && item.variation_percent > 50) {
            return `¡Atención! Este tema está explotando en ${segmentName} ahora mismo.`;
        }
        if (item.trend_score > 80) {
            return `🔥 Patrón de alto impacto detectado. La comunidad está hiper-activa.`;
        }
        if (item.total_signals > 500) {
            return `📊 KPI Crítico: Más de ${item.total_signals} señales consolidan esta tendencia.`;
        }
        return `💡 Una nueva perspectiva está emergiendo silenciosamente en ${segmentName}.`;
    };

    const getIllustration = (item: TrendingItem) => {
        // Retorna un icono o emoji llamativo según el estado
        if (item.direction === 'up') return "trending_up";
        if (item.direction === 'down') return "trending_down";
        return "water_drop"; // Ripple/Signal effect
    };

    return (
        <div
            className="relative w-full overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl group max-w-6xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background gradients and animations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.15)_0%,_transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1)_0%,_transparent_50%)]"></div>
                {/* Noise overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            </div>

            <div className="relative z-10 w-full aspect-[4/3] md:aspect-[21/9] flex flex-col md:flex-row p-8 md:p-12 gap-8 md:gap-12">

                {/* Left Side: KPIs and Catchy Phrase */}
                <div className="flex-1 flex flex-col justify-center text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`text-${activeSlide.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="flex flex-col gap-4"
                        >
                            {/* Badges / Micro Insight */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-md">
                                    <span className="flex h-2 w-2 rounded-full animate-pulse bg-primary-400" />
                                    <span className="text-primary-300 text-[10px] font-black uppercase tracking-widest leading-none">
                                        Insight #{current + 1}
                                    </span>
                                </div>
                                {activeSlide.direction === 'up' && (
                                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                        +{activeSlide.variation_percent.toFixed(1)}% Velocidad
                                    </span>
                                )}
                                {activeSlide.direction === 'down' && (
                                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-full uppercase tracking-wider">
                                        -{activeSlide.variation_percent.toFixed(1)}% Desaceleración
                                    </span>
                                )}
                            </div>

                            {/* Main Catchy Phrase */}
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight text-balance">
                                "{getCatchyPhrase(activeSlide)}"
                            </h2>

                            {/* Subject details */}
                            <div className="mt-2 md:mt-4 border-l-2 border-primary-500/30 pl-4 py-1">
                                <p className="text-lg md:text-xl font-bold text-slate-300">
                                    <span className="text-primary-400">Batalla:</span> {activeSlide.title}
                                </p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Topic: {activeSlide.slug}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Visuals & Data representation */}
                <div className="w-full md:w-1/3 flex flex-col justify-center text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`visual-${activeSlide.id}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="relative aspect-square w-48 md:w-full max-w-[280px] mx-auto flex items-center justify-center -mt-4 md:mt-0"
                        >
                            {/* Outer glowing rings */}
                            <div className="absolute inset-0 rounded-full border border-primary-500/20 animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>

                            {/* Center Orb */}
                            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-500/20 to-emerald-500/20 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center p-4">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                    {getIllustration(activeSlide)}
                                </span>
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                    {activeSlide.trend_score.toFixed(1)}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                    Trend Score
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`cta-${activeSlide.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 md:mt-8 z-20 flex justify-center"
                        >
                            <Link
                                to={`/battle/${activeSlide.slug}`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-primary-50 hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                Indagar Señal
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* Navigation Indicators & Progress */}
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 px-8 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
                <div className="flex gap-2">
                    {data.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setCurrent(idx);
                                if (timeoutRef.current) clearInterval(timeoutRef.current);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-primary-400' : 'w-2 bg-slate-700 hover:bg-slate-600'}`}
                            aria-label={`Ir a insight ${idx + 1}`}
                        />
                    ))}
                </div>

                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {isPaused ? 'Pausado' : `Próximo: ${nextSlide?.title.slice(0, 25)}...`}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export type GenericSlide = {
    id: number | string;
    context: string;
    value: string; // The big number or phrase
    logoUrl?: string; // Optional: Logo override for "Brand" values
    label: string; // The explanation
    source: string; // The origin
    path: string;
    aiInsight?: string; // New: Witty/Ironic AI comment
};

export default function RightNowCarousel({ readOnly = false, data = [] }: { readOnly?: boolean, data?: GenericSlide[] }) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Si no hay data exterior, pasamos a estado carga/vacío temporal
    const slides = data.length > 0 ? data : [
        {
            id: 'loading-1',
            context: "Estado del Sistema",
            value: "Calibrando Señales",
            label: "Estamos sincronizando el último snapshot...",
            source: "Opina+ System",
            path: "#",
            aiInsight: "La precisión requiere un segundo."
        }
    ];

    useEffect(() => {
        if (isPaused) return;
        timeoutRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 5000); // 5s per slide
        return () => {
            if (timeoutRef.current) clearInterval(timeoutRef.current);
        };
    }, [isPaused, slides.length]);

    const activeSlide = slides[current];
    const nextIdx = (current + 1) % slides.length;
    const nextSlide = slides[nextIdx];

    // Determine variant layout
    const isBrand = !!activeSlide.logoUrl;
    const isStat = /%|\d/.test(activeSlide.value) && activeSlide.value.length < 8; // Number or short text

    const containerClasses = `relative w-full aspect-[16/10] md:aspect-[21/9] max-w-5xl mx-auto overflow-hidden group card ${readOnly ? '' : 'cursor-pointer card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white'}`;

    const content = (
        <>
            {/* Dynamic Backgrounds based on variant - MORE IMPACTFUL GRADIENTS */}
            <div className={`absolute inset-0 z-0 transition-colors duration-700 bg-white`}>
                {/* Visual Depth Elements - Animated */}
                {/* Visual Depth Elements - Removed for white purity */}
                {isBrand && <div className="hidden" />}
                {isStat && <div className="hidden" />}
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 z-10 flex flex-col items-center p-5 md:p-8">

                {/* Header Context - Static Pill */}
                <div className="w-full flex justify-center mb-1 shrink-0 z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-primary/20 ring-1 ring-white/50">
                        <span className="flex h-2 w-2 rounded-full animate-pulse bg-primary" />
                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest leading-none">
                            {activeSlide.context}
                        </span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSlide.id}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="flex-1 flex flex-col items-center justify-center text-center w-full relative min-h-0"
                    >
                        {/* --- VARIANT A: BRAND / LOGO --- */}
                        {isBrand && (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <div className="relative group/logo mb-3 shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                                    <img
                                        src={activeSlide.logoUrl}
                                        alt={activeSlide.value}
                                        className="h-20 md:h-32 object-contain drop-shadow-md hover:scale-105 transition-transform duration-500 relative z-10"
                                    />
                                </div>
                                <div className="max-w-xl px-2">
                                    <p className="text-lg md:text-2xl text-ink font-bold leading-tight drop-shadow-sm line-clamp-3">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                                            {activeSlide.label}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- VARIANT B: STAT / DATA --- */}
                        {isStat && !isBrand && (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <h2 className="font-marketing text-[5rem] md:text-[8rem] font-black leading-[0.8] tracking-tighter select-none drop-shadow-sm">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-indigo-600">
                                        {activeSlide.value}
                                    </span>
                                </h2>
                                <p className="mt-2 text-lg md:text-2xl text-ink font-bold max-w-2xl leading-snug px-2">
                                    {activeSlide.label}
                                </p>
                            </div>
                        )}

                        {/* --- VARIANT C: TEXT / QUOTE --- */}
                        {!isBrand && !isStat && (
                            <div className="flex flex-col items-center justify-center w-full h-full relative">
                                <span className="text-[6rem] text-accent/10 absolute top-0 left-4 font-serif leading-none select-none">“</span>
                                <h2 className="text-2xl md:text-5xl font-black text-ink leading-[0.95] tracking-tight max-w-3xl z-10">
                                    {activeSlide.value}
                                </h2>
                                <p className="mt-3 text-lg text-text-secondary font-medium max-w-2xl px-2">
                                    {activeSlide.label}
                                </p>
                            </div>
                        )}

                        {/* AI Insight Inside Motion Div to crossfade */}
                        {activeSlide.aiInsight && (
                            <div className="w-full mt-auto pt-2 flex justify-center z-20 shrink-0">
                                <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-50 shadow-sm flex items-center gap-2 max-w-[95%]">
                                    <span className="text-base">✨</span>
                                    <span className="text-[11px] md:text-[13px] font-semibold text-primary leading-tight text-center line-clamp-2">
                                        {activeSlide.aiInsight}
                                    </span>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Next Slide Preview - Minimal */}
            < div className="absolute bottom-6 right-8 z-20 hidden md:block opacity-40" >
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Próximo: {nextSlide.context}
                </span>
            </div >

            {/* Progress Bar */}
            < div className="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full z-30" >
                <motion.div
                    key={current}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className={`h-full ${isBrand ? 'bg-slate-800' : isStat ? 'bg-primary' : 'bg-accent'}`}
                />
            </div >
        </>
    );

    if (readOnly) {
        return (
            <section
                className={containerClasses}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {content}
            </section>
        );
    }

    return (
        <Link
            to={activeSlide.path}
            className={containerClasses}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label={`Ver detalle de ${activeSlide.context}`}
        >
            {content}
        </Link>
    );
}

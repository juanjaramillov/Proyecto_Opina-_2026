import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type GenericSlide = {
    id: number;
    context: string;
    value: string; // The big number or phrase
    logoUrl?: string; // Optional: Logo override for "Brand" values
    label: string; // The explanation
    source: string; // The origin
    path: string;
    aiInsight?: string; // New: Witty/Ironic AI comment
};

const DUMMY_SLIDES: GenericSlide[] = [
    {
        id: 1,
        context: "Tendencias",
        value: "Cargando...",
        label: "Estamos preparando las tendencias de la comunidad. Vuelve en unos minutos.",
        source: "Fuente: Opina+",
        path: "#",
        aiInsight: "Paciencia, la buena data se cocina a fuego lento."
    }
];

export default function RightNowCarousel() {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isPaused) return;
        timeoutRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % DUMMY_SLIDES.length);
        }, 5000); // 5s per slide
        return () => {
            if (timeoutRef.current) clearInterval(timeoutRef.current);
        };
    }, [isPaused]);

    const activeSlide = DUMMY_SLIDES[current];
    const nextIdx = (current + 1) % DUMMY_SLIDES.length;
    const nextSlide = DUMMY_SLIDES[nextIdx];

    // Determine variant layout
    const isBrand = !!activeSlide.logoUrl;
    const isStat = /%|\d/.test(activeSlide.value) && activeSlide.value.length < 8; // Number or short text

    return (
        <section
            className="relative w-full aspect-[16/10] md:aspect-[21/9] max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-card hover:shadow-premium group cursor-pointer border border-stroke bg-white transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] active:shadow-sm"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => navigate(activeSlide.path)}
        >
            {/* Dynamic Backgrounds based on variant - MORE IMPACTFUL GRADIENTS */}
            <div className={`absolute inset-0 z-0 transition-colors duration-700 ${isBrand ? 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/20' :
                isStat ? 'bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white' :
                    'bg-gradient-to-br from-white via-orange-50/10 to-transparent'
                }`}>
                {/* Visual Depth Elements - Animated */}
                {isBrand && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />}
                {isStat && <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-full blur-[100px]" />}
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 z-10 flex flex-col items-center p-5 md:p-8">

                {/* Header Context - Static Pill */}
                <div className="w-full flex justify-center mb-1 shrink-0 z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-indigo-100 ring-1 ring-white/50">
                        <span className={`flex h-2 w-2 rounded-full animate-pulse ${isStat ? 'bg-primary' : 'bg-accent'}`} />
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
                                    <span className="text-[11px] md:text-[13px] font-semibold text-indigo-600 leading-tight text-center line-clamp-2">
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
        </section >
    );
}

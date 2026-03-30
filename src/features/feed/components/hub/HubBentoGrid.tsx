import { ExperienceMode, TRACKS, toneClasses, TrackCard } from "./tracks/hubSecondaryData";

interface HubBentoGridProps {
    setMode: (mode: ExperienceMode) => void;
}

export function HubBentoGrid({ setMode }: HubBentoGridProps) {
    return (
        <section className="relative w-full pb-16 pt-4 md:pt-8 bg-white" id="hub-bento-grid">
            <div className="mx-auto w-full max-w-[1280px] px-4 md:px-6">
                
                {/* Cabecera del Grid */}
                <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            Explora la plataforma
                        </h2>
                        <p className="mt-1 md:mt-2 text-sm md:text-base font-medium text-slate-500">
                            Dinámicas, comunidades y métricas en profundidad.
                        </p>
                    </div>
                </div>

                {/* Contenedor Grid Asimétrico: Siempre 4 columnas en Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)] px-2 sm:px-0">
                    {TRACKS.map((card) => {
                        let spanClass = "";
                        
                        // Diseño Asimétrico del Bento - Rediseño V15 (Segunda Pasada)
                        if (card.key === "actualidad" || card.key === "torneo") {
                            // Tier 1: Altos y destacados (2x2)
                            spanClass = "md:col-span-2 md:row-span-2 min-h-[240px] md:min-h-[300px]";
                        } else if (card.key === "profundidad" || card.key === "lugares") {
                            // Tier 2: Apaisados medianos (2x1)
                            spanClass = "md:col-span-2 min-h-[180px] md:min-h-[200px]";
                        } else {
                            // Tier 3: Apaisados bases (2x1)
                            spanClass = "md:col-span-2 md:col-start-[auto] min-h-[160px] md:min-h-[180px]";
                        }

                        return (
                            <BentoCard 
                                key={card.key} 
                                card={card} 
                                setMode={setMode} 
                                className={spanClass} 
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function BentoCard({ card, setMode, className = "" }: { card: TrackCard, setMode: (m: ExperienceMode) => void, className?: string }) {
    const tone = toneClasses(card.tone);
    
    return (
        <button
            type="button"
            onClick={card.available && card.mode ? () => setMode(card.mode as ExperienceMode) : undefined}
            disabled={!card.available}
            className={`
                group relative isolate flex flex-col overflow-hidden rounded-[2rem] border text-left bg-white
                transition-all duration-500 ease-out h-full w-full
                border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]
                hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.12)] hover:-translate-y-1.5
                ${card.available ? "cursor-pointer" : "cursor-default opacity-85"}
                ${tone.border}
                ${className}
            `}
        >
            {/* Background effects */}
            <div className="absolute inset-0 z-0 bg-white" />
            <div className={`absolute inset-0 bg-gradient-to-br ${tone.glow} opacity-60 group-hover:opacity-100 transition-opacity duration-700 z-0`} />
            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${tone.glow} opacity-40 blur-[50px] transform group-hover:scale-125 transition-transform duration-1000 z-0 pointer-events-none`} />

            <div className="relative z-10 flex flex-col h-full p-5 md:p-6 lg:p-7">
                
                {/* Top Section: Icon & Meta Badge (No Status) */}
                <div className="flex items-start justify-between gap-3 w-full mb-3 md:mb-4">
                    <div className={`flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-500 group-hover:scale-[1.08] group-hover:-translate-y-0.5 bg-white ${tone.iconWrap}`}>
                        <span className="material-symbols-outlined text-[24px] md:text-[28px]">{card.icon}</span>
                    </div>

                    <div className="flex flex-col items-end gap-2 max-w-[60%]">
                        {card.meta && (
                            <span className={`inline-flex items-center rounded-lg bg-white/95 px-2 py-1 text-[10px] md:text-[11px] font-bold tracking-wide shadow-sm border ${tone.badge}`}>
                                {card.meta}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-start">
                    <h3 className={`text-xl md:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-slate-900 transition-colors duration-300 ${tone.titleHover}`}>
                        {card.title}
                    </h3>
                    <p className="mt-1.5 md:mt-2 text-sm sm:text-[15px] font-medium leading-relaxed text-slate-500 line-clamp-2 md:line-clamp-3">
                        {card.subtitle}
                    </p>
                </div>

                {/* Universal CTA Footer */}
                <div className="mt-4 pt-4 flex items-center justify-between gap-2 border-t border-slate-100/80 w-full group/cta">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${
                        card.status === "En vivo" || card.status === "Activo" || card.status === "Competitivo" 
                        ? tone.accentText 
                        : "text-slate-400"
                    }`}>
                        {(card.status === "En vivo" || card.status === "Activo" || card.status === "Competitivo") && (
                            <span className={`h-1.5 w-1.5 rounded-full ${tone.accentSoft} animate-[pulse_2s_ease-in-out_infinite]`} />
                        )}
                        {card.status}
                    </span>
                    
                    {card.available ? (
                        <div className={`flex items-center gap-1.5 text-[11px] md:text-[12px] font-bold tracking-wide transition-all duration-300 ${tone.accentText} group-hover/cta:translate-x-1`}>
                            {card.cta} <span className="material-symbols-outlined text-[16px] md:text-[18px]">arrow_forward</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-slate-400">
                            Próximamente
                        </div>
                    )}
                </div>

            </div>
        </button>
    );
}

export default HubBentoGrid;

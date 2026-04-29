import { ExperienceMode, TRACKS, TrackCard } from "./tracks/hubSecondaryData";
import { SignalNode } from '../../../../components/ui/foundation';

interface HubBentoGridProps {
    setMode: (mode: ExperienceMode) => void;
}

export function HubBentoGrid({ setMode }: HubBentoGridProps) {
    const torneo = TRACKS.find(t => t.key === 'torneo')!;
    const actualidad = TRACKS.find(t => t.key === 'actualidad')!;
    const profundidad = TRACKS.find(t => t.key === 'profundidad')!;
    const lugares = TRACKS.find(t => t.key === 'lugares')!;
    const servicios = TRACKS.find(t => t.key === 'servicios')!;

    return (
        <section className="relative w-full pb-24 pt-0 md:pt-4 bg-transparent z-20 -mt-6 md:-mt-8" id="hub-editorial-grid">
            <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
                
                {/* Header Editorial */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* V17 · alineado con el resto del Hub: Outfit Black, sin italic decorativo */}
                        <h2 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-3">Ecosistema Extendido</h2>
                        <h3 className="text-3xl md:text-4xl font-black font-display tracking-tight text-ink leading-tight">
                            Explora el <span className="font-black text-brand">Pulso</span> de Opina+
                        </h3>
                    </div>
                </div>

                <div className="flex flex-col w-full border-t border-slate-200">
                    
                    {/* FILA 1: Torneos & Actualidad */}
                    <div className="flex flex-col lg:flex-row">
                        <TorneosEditorial card={torneo} setMode={setMode} />
                        <ActualidadEditorial card={actualidad} setMode={setMode} />
                    </div>

                    {/* FILA 2: Profundidad */}
                    <div className="flex flex-col border-t border-slate-200">
                        <ProfundidadEditorial card={profundidad} setMode={setMode} />
                    </div>

                    {/* FILA 3: Satélites (Directorio) */}
                    <div className="flex border-t border-slate-200 pt-6">
                        <DirectorioEditorial lugares={lugares} servicios={servicios} setMode={setMode} />
                    </div>

                </div>
            </div>
        </section>
    );
}

// ============================================================
// MÓDULO 1: TORNEOS (Editorial Columna Principal)
// ============================================================
function TorneosEditorial({ card, setMode }: { card: TrackCard, setMode: (m: ExperienceMode) => void }) {
    return (
        <div className="lg:w-7/12 py-12 lg:py-16 lg:pr-16 flex flex-col lg:flex-row gap-8 lg:gap-12 group">
            <div className="flex-1 flex flex-col items-start justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        {/* V17 · icono compuesto (versus = 2 SignalNodes enfrentados) */}
                        <SectionMark variant="versus" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-brand">
                            {card.title} / {card.status}
                        </span>
                    </div>
                    
                    {/* V17 · gradient slate decorativo removido; text-ink plano */}
                    <h4 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tighter text-ink leading-[0.95] mb-6">
                        La arena de<br/>competición.
                    </h4>
                    
                    <p className="text-base md:text-lg font-medium leading-relaxed text-slate-500 max-w-sm mb-10">
                        {card.statement}
                    </p>
                </div>

                <button 
                    onClick={() => card.mode && setMode(card.mode as ExperienceMode)}
                    className="group/btn inline-flex items-center gap-4 bg-slate-900 text-white px-6 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-brand-600 transition-colors duration-300"
                >
                    {card.cta} 
                    <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>
            
            <div className="w-full lg:w-1/2 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                <TorneoMinimalBracket />
            </div>
        </div>
    );
}

// ============================================================
// MÓDULO 2: ACTUALIDAD (Feed / Ticker Vivo)
// ============================================================
function ActualidadEditorial({ card, setMode }: { card: TrackCard, setMode: (m: ExperienceMode) => void }) {
    return (
        <div className="lg:w-5/12 py-12 lg:py-16 lg:pl-16 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col group relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {/* V17 · icono compuesto (live = SignalNode validated lg + umbral sm) */}
                    <SectionMark variant="live" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-ink">
                        {card.title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* V17 · "Activo" en accent (verde = activación), no danger (cliché breaking news) */}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-700">Activo</span>
                    <SignalNode state="validated" size="sm" />
                </div>
            </div>

            {/* V17 · font-light → font-black para consistencia con el resto del Hub */}
            <h4 className="text-3xl md:text-4xl font-black font-display tracking-tight text-ink leading-tight mb-8">
                {card.subtitle}
            </h4>

            <div className="flex-1 flex flex-col gap-6 w-full max-w-sm relative z-10">
                <ActualidadTickerList />
            </div>

            <div className="mt-12 flex">
                <button
                    onClick={() => card.mode && setMode(card.mode as ExperienceMode)}
                    /* V17 · CTA neutralizado: text-ink + brand on hover (sin saturación danger) */
                    className="group/btn inline-flex items-center gap-2 text-sm font-black tracking-wider text-ink hover:text-brand transition-colors uppercase border-b-2 border-transparent hover:border-brand pb-1"
                >
                    {card.cta}
                    <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_right_alt</span>
                </button>
            </div>
        </div>
    );
}

// ============================================================
// MÓDULO 3: PROFUNDIDAD (Franja de Análisis)
// ============================================================
function ProfundidadEditorial({ card, setMode }: { card: TrackCard, setMode: (m: ExperienceMode) => void }) {
    return (
        <div className="w-full py-12 lg:py-16 flex flex-col md:flex-row gap-12 lg:gap-24 group">
            <div className="md:w-5/12 flex flex-col items-start justify-center">
                <div className="flex items-center gap-4 mb-6">
                    {/* V17 · icono compuesto (depth = 3 SignalNodes verticales como capas) */}
                    <SectionMark variant="depth" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand">
                        {card.title} / {card.status}
                    </span>
                </div>
                
                {/* V17 · font-medium → font-black; quitado font-serif italic decorativo */}
                <h4 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-ink mb-4">
                    Más allá de la superficie.
                </h4>
                
                <p className="text-[15px] font-medium leading-relaxed text-slate-500 mb-8 max-w-sm">
                    {card.statement}
                </p>

                <button 
                    onClick={() => card.mode && setMode(card.mode as ExperienceMode)}
                    className="group/btn inline-flex items-center gap-3 text-sm font-bold tracking-wide text-slate-900 hover:text-brand-600 transition-colors"
                >
                    <span className="w-8 h-px bg-slate-900 group-hover/btn:w-12 group-hover/btn:bg-brand-600 transition-all duration-300" />
                    {card.cta} 
                </button>
            </div>

            <div className="md:w-7/12 flex items-center justify-end">
                <ProfundidadChartVisual />
            </div>
        </div>
    );
}

// ============================================================
// MÓDULO 4: DIRECTORIO (Satélites Minimalistas)
// ============================================================
function DirectorioEditorial({ lugares, servicios, setMode }: { lugares: TrackCard, servicios: TrackCard, setMode: (m: ExperienceMode) => void }) {
    return (
        <div className="w-full flex flex-col sm:flex-row items-center gap-x-12 gap-y-4 text-sm font-medium text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-200 pr-4 hidden sm:block">
                Directorio Anexo
            </span>

            {[lugares, servicios].map((card) => (
                <button
                    key={card.key}
                    type="button"
                    onClick={card.available && card.mode ? () => setMode(card.mode as ExperienceMode) : undefined}
                    disabled={!card.available}
                    className={`flex items-center gap-3 transition-colors ${card.available ? "hover:text-slate-900 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                >
                    <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
                    <span className="tracking-wide">
                        {card.title}
                        {card.beta && <sup className="ml-1 text-[9px] font-bold text-brand-600">BETA</sup>}
                    </span>
                    {!card.available && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-2">(Próximamente)</span>}
                </button>
            ))}
        </div>
    );
}

// ============================================================
// VISUALES ARTESANALES ("ZERO-CARD")
// ============================================================

function TorneoMinimalBracket() {
    return (
        <svg viewBox="0 0 300 200" className="w-full max-w-[280px] h-auto text-slate-200 group-hover:text-brand-200 transition-colors duration-700" aria-hidden="true">
            {/* Outline editorial ultrafino */}
            <g stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="square">
                {/* Cuartos */}
                <path d="M10 20 L80 20 L80 60 L140 60" />
                <path d="M10 100 L80 100 L80 60" />
                
                <path d="M10 140 L80 140 L80 180 L140 180" />
                <path d="M10 220 L80 220 L80 180" />
                
                {/* Semis */}
                <path d="M140 60 L210 60 L210 120 L280 120" />
                <path d="M140 180 L210 180 L210 120" />
            </g>
            
            {/* Puntos de anclaje técnicos */}
            <g fill="currentColor">
                <rect x="8" y="18" width="4" height="4" />
                <rect x="8" y="98" width="4" height="4" />
                <rect x="8" y="138" width="4" height="4" />
                <rect x="8" y="218" width="4" height="4" />
                
                <rect x="138" y="58" width="4" height="4" className="text-brand-400" />
                <rect x="138" y="178" width="4" height="4" className="text-brand-400" />
                
                {/* V17 · Finalista como Nodo de Señal Validada amplificado (halo accent + nodo brand) */}
                <circle cx="280" cy="120" r="11" className="stroke-accent fill-none" strokeWidth="1.5" />
                <circle cx="280" cy="120" r="6" className="fill-brand group-hover:fill-brand-500 transition-colors duration-300" />
            </g>
        </svg>
    );
}

function ActualidadTickerList() {
    const news = [
        { topic: 'Nuevas Tendencias', time: 'hace 2 min', pulse: true },
        { topic: 'Consumo Masivo', time: 'hace 15 min', pulse: false },
        { topic: 'Tech & IA', time: 'hace 1 hora', pulse: false }
    ];

    return (
        <div className="flex flex-col border-l border-slate-200">
            {news.map((item, i) => (
                <div key={i} className="pl-5 py-3 relative group/item">
                    {/* V17 · Nodo de Señal · validated si está vivo, umbral si todavía no */}
                    <div className="absolute left-[-8px] top-[10px]">
                        <SignalNode state={item.pulse ? "validated" : "umbral"} size="sm" />
                    </div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {item.time}
                    </span>
                    <span className="block text-sm md:text-base font-medium text-slate-800 group-hover/item:text-danger-600 transition-colors">
                        {item.topic}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ProfundidadChartVisual() {
    return (
        <div className="w-full flex gap-1 h-32 md:h-40 items-end opacity-60 group-hover:opacity-100 transition-opacity duration-700">
            {/* Gráfico de barras asimétrico tipo Financial Times */}
            {[40, 25, 60, 45, 80, 55, 95, 70, 30, 85, 65, 50, 100].map((h, i) => (
                <div 
                    key={i} 
                    className="flex-1 bg-slate-200 group-hover:bg-slate-300 transition-colors duration-500 rounded-t-[1px] relative"
                    style={{ height: `${h}%` }}
                >
                    {/* Línea de lectura analítica superior */}
                    {i % 3 === 0 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-400">
                            {h}
                        </div>
                    )}
                    {/* V17 · acento brand/accent en barras altas (umbral cruzado · señal activada) */}
                    {h > 90 && (
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
                    )}
                    {h > 80 && h <= 90 && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand" />
                    )}
                </div>
            ))}
        </div>
    );
}

// ============================================================
// SECTIONMARK · "Iconos" compuestos de SignalNodes (microelemento canónico V17)
// Reemplaza Material Symbols genéricos por composiciones propias de marca.
// ============================================================
function SectionMark({ variant }: { variant: 'versus' | 'live' | 'depth' }) {
    if (variant === 'versus') {
        // Torneos · 2 nodos enfrentados con línea fina entre ellos
        return (
            <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                <SignalNode state="validated" size="md" />
                <span className="block w-2.5 h-px bg-slate-300" />
                <SignalNode state="validated" size="md" />
            </span>
        );
    }
    if (variant === 'live') {
        // Actualidad · nodo validado grande + nodo umbral pequeño (live + breaking)
        return (
            <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                <SignalNode state="validated" size="lg" />
                <SignalNode state="umbral" size="sm" />
            </span>
        );
    }
    if (variant === 'depth') {
        // Profundidad · 3 nodos verticales (capas / dimensiones)
        return (
            <span className="inline-flex flex-col gap-1" aria-hidden="true">
                <SignalNode state="validated" size="sm" />
                <SignalNode state="umbral" size="sm" />
                <SignalNode state="insufficient" size="sm" />
            </span>
        );
    }
    return null;
}

export default HubBentoGrid;

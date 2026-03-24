// Original path: src/features/feed/components/hub/HubSecondaryTracks.tsx

type ExperienceMode = "menu" | "versus" | "torneo" | "profundidad" | "actualidad" | "lugares";
type ActiveTrackMode = Exclude<ExperienceMode, "menu" | "versus">;
type TrackKey = ActiveTrackMode | "servicios" | "publicidad";

interface HubSecondaryTracksProps {
    setMode: (mode: ExperienceMode) => void;
}

interface TrackCard {
    key: TrackKey;
    mode?: ActiveTrackMode;
    title: string;
    subtitle: string;
    statement: string;
    bullets: string[];
    cta: string;
    status: string;
    meta?: string;
    icon: string;
    tone: "indigo" | "emerald" | "orange" | "sky" | "violet" | "pink";
    preview: "torneo" | "actualidad" | "lugares" | "profundidad" | "locked";
    available: boolean;
}

const TRACKS: TrackCard[] = [
    {
        key: "torneo",
        mode: "torneo",
        title: "Torneos",
        subtitle: "Duelo tras duelo hasta que quede un ganador.",
        statement: "Sigue eliminatorias vivas y descubre qué opción domina cuando la comparación sube de nivel.",
        bullets: ["Vota cara a cara", "Desbloquea fases", "Ve cómo escala el ganador"],
        cta: "Explorar duelos",
        status: "Activo",
        meta: "4.2K señales",
        icon: "emoji_events",
        tone: "indigo",
        preview: "torneo",
        available: true,
    },
    {
        key: "actualidad",
        mode: "actualidad",
        title: "Actualidad",
        subtitle: "La conversación del momento, en tiempo real.",
        statement: "Mide cómo reacciona la comunidad frente a noticias, temas calientes y cambios que impactan hoy.",
        bullets: ["Temas vivos", "Tendencias rápidas", "Lectura inmediata del contexto"],
        cta: "Ver tendencias",
        status: "En vivo",
        meta: "Nuevo hoy",
        icon: "campaign",
        tone: "emerald",
        preview: "actualidad",
        available: true,
    },
    {
        key: "lugares",
        mode: "lugares",
        title: "Lugares",
        subtitle: "La experiencia real en sucursales y espacios físicos.",
        statement: "Encuentra qué lugares destacan, fallan o sorprenden cerca de ti con señales de personas reales.",
        bullets: ["Cerca de ti", "Servicio real", "Comparación entre sedes"],
        cta: "Explorar lugares",
        status: "Cerca de ti",
        meta: "1.5K señales",
        icon: "place",
        tone: "orange",
        preview: "lugares",
        available: true,
    },
    {
        key: "profundidad",
        mode: "profundidad",
        title: "Profundidad",
        subtitle: "Una mirada más completa que el voto rápido.",
        statement: "Entra más hondo en una marca, producto o tema con una evaluación más estructurada y reveladora.",
        bullets: ["Más contexto", "Más capas", "Más criterio comparativo"],
        cta: "Entrar al análisis",
        status: "Premium",
        meta: "10 preguntas",
        icon: "psychology",
        tone: "sky",
        preview: "profundidad",
        available: true,
    },
    {
        key: "servicios",
        title: "Servicios",
        subtitle: "Herramientas y capas profesionales dentro del ecosistema.",
        statement: "Una futura capa para descubrir y activar soluciones con una lectura más útil del mercado.",
        bullets: ["Acceso por etapas", "Orientado a valor", "Más adelante en el roadmap"],
        cta: "Disponible pronto",
        status: "Próximamente",
        meta: "B2B",
        icon: "storefront",
        tone: "violet",
        preview: "locked",
        available: false,
    },
    {
        key: "publicidad",
        title: "Publicidad",
        subtitle: "Espacios para activar campañas con mejor señal.",
        statement: "Una futura capa para conectar productos y mensajes con una audiencia más precisa y medible.",
        bullets: ["Controlado", "Segmentable", "Pensado para más adelante"],
        cta: "Acceso restringido",
        status: "Próximamente",
        meta: "Beta",
        icon: "ads_click",
        tone: "pink",
        preview: "locked",
        available: false,
    },
];

function toneClasses(tone: TrackCard["tone"]) {
    switch (tone) {
        case "indigo":
            return {
                border: "hover:border-indigo-300",
                shadow: "hover:shadow-[0_24px_60px_-28px_rgba(79,70,229,0.38)]",
                glow: "from-indigo-500/14 via-indigo-400/8 to-transparent",
                wash: "from-indigo-50/90 via-white to-white",
                iconWrap: "bg-indigo-50 text-indigo-600 border-indigo-100",
                badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
                meta: "bg-white/88 text-slate-600 border-slate-200/80",
                titleHover: "group-hover:text-indigo-600",
                bullet: "text-indigo-500",
                cta: "from-indigo-500 to-blue-500",
                ctaText: "text-white",
                ctaGhost: "bg-indigo-50 text-indigo-700 border-indigo-100",
                previewRing: "border-indigo-100",
                previewBg: "from-indigo-50/75 via-white to-white",
                previewSoft: "bg-indigo-50/80",
                previewLine: "bg-indigo-500",
                previewLineSoft: "bg-indigo-100",
                softBlob: "bg-indigo-500/10",
                hairline: "from-indigo-100/0 via-indigo-200/80 to-indigo-100/0",
                accentText: "text-indigo-600",
                accentSoft: "bg-indigo-500",
            };
        case "emerald":
            return {
                border: "hover:border-emerald-300",
                shadow: "hover:shadow-[0_24px_60px_-28px_rgba(16,185,129,0.32)]",
                glow: "from-emerald-500/12 via-emerald-400/6 to-transparent",
                wash: "from-emerald-50/90 via-white to-white",
                iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-100",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
                meta: "bg-white/88 text-slate-600 border-slate-200/80",
                titleHover: "group-hover:text-emerald-600",
                bullet: "text-emerald-500",
                cta: "from-emerald-400 to-teal-400",
                ctaText: "text-white",
                ctaGhost: "bg-emerald-50 text-emerald-700 border-emerald-100",
                previewRing: "border-emerald-100",
                previewBg: "from-emerald-50/75 via-white to-white",
                previewSoft: "bg-emerald-50/80",
                previewLine: "bg-emerald-500",
                previewLineSoft: "bg-emerald-100",
                softBlob: "bg-emerald-500/10",
                hairline: "from-emerald-100/0 via-emerald-200/80 to-emerald-100/0",
                accentText: "text-emerald-600",
                accentSoft: "bg-emerald-500",
            };
        case "orange":
            return {
                border: "hover:border-orange-300",
                shadow: "hover:shadow-[0_24px_60px_-28px_rgba(249,115,22,0.32)]",
                glow: "from-orange-500/14 via-amber-400/8 to-transparent",
                wash: "from-orange-50/90 via-white to-white",
                iconWrap: "bg-orange-50 text-orange-600 border-orange-100",
                badge: "bg-orange-50 text-orange-700 border-orange-100",
                meta: "bg-white/88 text-slate-600 border-slate-200/80",
                titleHover: "group-hover:text-orange-600",
                bullet: "text-orange-500",
                cta: "from-orange-400 to-amber-400",
                ctaText: "text-white",
                ctaGhost: "bg-orange-50 text-orange-700 border-orange-100",
                previewRing: "border-orange-100",
                previewBg: "from-orange-50/75 via-white to-white",
                previewSoft: "bg-orange-50/80",
                previewLine: "bg-orange-500",
                previewLineSoft: "bg-orange-100",
                softBlob: "bg-orange-500/10",
                hairline: "from-orange-100/0 via-orange-200/80 to-orange-100/0",
                accentText: "text-orange-600",
                accentSoft: "bg-orange-500",
            };
        case "sky":
            return {
                border: "hover:border-sky-300",
                shadow: "hover:shadow-[0_24px_60px_-28px_rgba(14,165,233,0.32)]",
                glow: "from-sky-500/12 via-cyan-400/8 to-transparent",
                wash: "from-sky-50/90 via-white to-white",
                iconWrap: "bg-sky-50 text-sky-600 border-sky-100",
                badge: "bg-sky-50 text-sky-700 border-sky-100",
                meta: "bg-white/88 text-slate-600 border-slate-200/80",
                titleHover: "group-hover:text-sky-600",
                bullet: "text-sky-500",
                cta: "from-sky-400 to-cyan-400",
                ctaText: "text-white",
                ctaGhost: "bg-sky-50 text-sky-700 border-sky-100",
                previewRing: "border-sky-100",
                previewBg: "from-sky-50/75 via-white to-white",
                previewSoft: "bg-sky-50/80",
                previewLine: "bg-sky-500",
                previewLineSoft: "bg-sky-100",
                softBlob: "bg-sky-500/10",
                hairline: "from-sky-100/0 via-sky-200/80 to-sky-100/0",
                accentText: "text-sky-600",
                accentSoft: "bg-sky-500",
            };
        case "violet":
            return {
                border: "hover:border-violet-300",
                shadow: "hover:shadow-[0_24px_60px_-28px_rgba(139,92,246,0.30)]",
                glow: "from-violet-500/12 via-violet-400/8 to-transparent",
                wash: "from-violet-50/90 via-white to-white",
                iconWrap: "bg-violet-50 text-violet-600 border-violet-100",
                badge: "bg-violet-50 text-violet-700 border-violet-100",
                meta: "bg-white/88 text-slate-600 border-slate-200/80",
                titleHover: "group-hover:text-violet-600",
                bullet: "text-violet-500",
                cta: "from-violet-400 to-fuchsia-400",
                ctaText: "text-white",
                ctaGhost: "bg-violet-50 text-violet-700 border-violet-100",
                previewRing: "border-violet-100",
                previewBg: "from-violet-50/75 via-white to-white",
                previewSoft: "bg-violet-50/80",
                previewLine: "bg-violet-500",
                previewLineSoft: "bg-violet-100",
                softBlob: "bg-violet-500/10",
                hairline: "from-violet-100/0 via-violet-200/80 to-violet-100/0",
                accentText: "text-violet-600",
                accentSoft: "bg-violet-500",
            };
        case "pink":
            return {
                border: "hover:border-pink-300",
                shadow: "hover:shadow-[0_24px_60px_-28px_rgba(236,72,153,0.28)]",
                glow: "from-pink-500/12 via-rose-400/8 to-transparent",
                wash: "from-pink-50/90 via-white to-white",
                iconWrap: "bg-pink-50 text-pink-600 border-pink-100",
                badge: "bg-pink-50 text-pink-700 border-pink-100",
                meta: "bg-white/88 text-slate-600 border-slate-200/80",
                titleHover: "group-hover:text-pink-600",
                bullet: "text-pink-500",
                cta: "from-pink-400 to-rose-400",
                ctaText: "text-white",
                ctaGhost: "bg-pink-50 text-pink-700 border-pink-100",
                previewRing: "border-pink-100",
                previewBg: "from-pink-50/75 via-white to-white",
                previewSoft: "bg-pink-50/80",
                previewLine: "bg-pink-500",
                previewLineSoft: "bg-pink-100",
                softBlob: "bg-pink-500/10",
                hairline: "from-pink-100/0 via-pink-200/80 to-pink-100/0",
                accentText: "text-pink-600",
                accentSoft: "bg-pink-500",
            };
    }
}

function CardPattern({ tone }: { tone: TrackCard["tone"] }) {
    if (tone === "indigo") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_10%_15%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_92%_10%,rgba(59,130,246,0.12),transparent_34%)]" />
                <div className="absolute inset-x-4 top-10 h-20 opacity-80">
                    <div className="absolute inset-x-0 top-2 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                    <div className="absolute inset-x-6 top-8 h-10 rounded-full border border-indigo-100/80" />
                    <div className="absolute inset-x-12 top-12 h-8 rounded-full border border-indigo-100/70" />
                </div>
            </>
        );
    }

    if (tone === "emerald") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_8%_18%,rgba(16,185,129,0.12),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(45,212,191,0.10),transparent_34%)]" />
                <div className="absolute inset-x-5 top-8 h-24 opacity-70">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(16,185,129,0.09)_22%,transparent_48%,rgba(16,185,129,0.06)_68%,transparent_100%)]" />
                    <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                </div>
            </>
        );
    }

    if (tone === "orange") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_10%_14%,rgba(249,115,22,0.14),transparent_36%),radial-gradient(circle_at_92%_12%,rgba(251,191,36,0.10),transparent_34%)]" />
                <div className="absolute right-4 top-7 h-24 w-44 opacity-70 [background-image:linear-gradient(rgba(251,146,60,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.11)_1px,transparent_1px)] [background-size:16px_16px] [transform:perspective(180px)_rotateX(68deg)] rounded-2xl" />
            </>
        );
    }

    if (tone === "sky") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.14),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(34,211,238,0.10),transparent_34%)]" />
                <div className="absolute inset-x-5 top-8 h-24 opacity-70 [background-image:linear-gradient(rgba(56,189,248,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
            </>
        );
    }

    if (tone === "violet") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_16%,rgba(139,92,246,0.14),transparent_36%),radial-gradient(circle_at_88%_10%,rgba(217,70,239,0.10),transparent_32%)]" />
                <div className="absolute right-5 top-6 h-24 w-24 rounded-[28px] border border-violet-100/80 opacity-80" />
                <div className="absolute right-11 top-12 h-12 w-12 rounded-2xl border border-violet-100/80 opacity-70" />
            </>
        );
    }

    return (
        <>
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_16%,rgba(236,72,153,0.14),transparent_36%),radial-gradient(circle_at_88%_10%,rgba(251,113,133,0.10),transparent_32%)]" />
            <div className="absolute inset-x-5 top-10 h-20 opacity-75">
                <div className="absolute inset-x-0 top-4 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                <div className="absolute inset-x-6 top-10 h-8 rounded-full border border-pink-100/80" />
            </div>
        </>
    );
}

function TorneoPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 top-0 h-10 rounded-b-[24px] ${tone.softBlob} blur-2xl opacity-70`} />
            <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-[conic-gradient(from_120deg,#60a5fa,#22d3ee,#f59e0b,#60a5fa)] opacity-80" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Marca A</span>
                </div>

                <div className="flex w-24 flex-col items-center gap-2 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">vs</span>
                    <div className={`h-2.5 w-full rounded-full ${tone.previewLineSoft} overflow-hidden`}>
                        <div className={`h-full w-[62%] rounded-full ${tone.previewLine}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${tone.accentText}`}>Final viva</span>
                </div>

                <div className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-[conic-gradient(from_40deg,#f472b6,#f59e0b,#38bdf8,#f472b6)] opacity-80" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Marca B</span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500">Siguiente fase</span>
                <span className={`text-[11px] font-bold ${tone.accentText}`}>Llave 2</span>
            </div>
        </div>
    );
}

function ActualidadPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-60`} />
            <div className="relative space-y-3">
                {[
                    ["Crisis dólar", "53%"],
                    ["Baja tasas", "47%"],
                ].map(([label, value], idx) => (
                    <div key={label} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[12px] font-bold text-slate-700">{label}</span>
                            <span className={`text-[12px] font-black ${tone.accentText}`}>{value}</span>
                        </div>
                        <div className={`h-2.5 rounded-full ${tone.previewLineSoft} overflow-hidden`}>
                            <div
                                className={`h-full rounded-full ${tone.previewLine}`}
                                style={{ width: idx === 0 ? "53%" : "47%" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
                <span className={`h-2 w-2 rounded-full ${tone.accentSoft} animate-pulse`} />
                <span className="text-[11px] font-semibold text-slate-600">La conversación cambia minuto a minuto</span>
            </div>
        </div>
    );
}

function LugaresPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-60`} />
            <div className="relative space-y-3">
                {[
                    ["Café Central", "8.6"],
                    ["Tienda Moderna", "6.9"],
                ].map(([name, score], idx) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                                <span className={`material-symbols-outlined text-[18px] ${tone.accentText}`}>
                                    {idx === 0 ? "local_cafe" : "storefront"}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-[12px] font-bold text-slate-700">{name}</div>
                                <div className="text-[10px] text-slate-500">{idx === 0 ? "237 reseñas" : "149 reseñas"}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-[18px] font-black leading-none ${tone.accentText}`}>{score}</div>
                            <div className="text-[10px] text-slate-400">/10</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfundidadPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-60`} />
            <div className="relative">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-bold text-slate-700">¿Qué tan recomendable te parece?</span>
                    <span className={`text-[12px] font-black ${tone.accentText}`}>9.1</span>
                </div>

                <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-8 flex-1 rounded-xl border ${
                                idx < 9 ? `${tone.previewLineSoft} border-transparent` : "bg-white border-slate-200"
                            }`}
                        />
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {["Confianza", "Valor", "Experiencia"].map((chip) => (
                        <span
                            key={chip}
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tone.badge}`}
                        >
                            {chip}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LockedPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.22)]`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-50`} />
            <div className="relative flex h-[124px] flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-slate-200 bg-white/85">
                <span className={`material-symbols-outlined text-[34px] ${tone.accentText}`}>lock</span>
                <div className="text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Disponible más adelante</div>
                    <div className="mt-1 text-[12px] text-slate-500">Se activará por etapa</div>
                </div>
            </div>
        </div>
    );
}

function PreviewByType({ preview, tone }: { preview: TrackCard["preview"]; tone: ReturnType<typeof toneClasses> }) {
    switch (preview) {
        case "torneo":
            return <TorneoPreview tone={tone} />;
        case "actualidad":
            return <ActualidadPreview tone={tone} />;
        case "lugares":
            return <LugaresPreview tone={tone} />;
        case "profundidad":
            return <ProfundidadPreview tone={tone} />;
        default:
            return <LockedPreview tone={tone} />;
    }
}

function TrackCardView({
    card,
    setMode,
}: {
    card: TrackCard;
    setMode: (mode: ExperienceMode) => void;
}) {
    const tone = toneClasses(card.tone);

    return (
        <button
            type="button"
            onClick={card.available && card.mode ? () => setMode(card.mode) : undefined}
            aria-disabled={!card.available}
            className={[
                "group relative isolate flex h-[620px] w-[332px] shrink-0 snap-center flex-col overflow-hidden rounded-[34px] border bg-white text-left transition-all duration-500 ease-out md:h-[640px] md:w-[360px] md:snap-start",
                "border-slate-200 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] hover:-translate-y-1.5",
                tone.border,
                tone.shadow,
                card.available ? "cursor-pointer" : "cursor-default",
                !card.available ? "opacity-[0.96]" : "",
            ].join(" ")}
        >
            <div className={`absolute inset-0 bg-gradient-to-b ${tone.wash}`} />
            <div className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-br ${tone.glow}`} />
            <CardPattern tone={card.tone} />

            <div className="relative z-10 flex h-full flex-col px-6 pb-6 pt-6 md:px-7 md:pb-7">
                <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] border shadow-sm transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-[1.03] ${tone.iconWrap}`}>
                        <span className="material-symbols-outlined text-[28px]">{card.icon}</span>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${tone.badge}`}>
                            {card.status === "En vivo" || card.status === "Activo" ? (
                                <span className={`h-1.5 w-1.5 rounded-full ${tone.accentSoft} animate-pulse`} />
                            ) : (
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                            )}
                            {card.status}
                        </span>

                        {card.meta ? (
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone.meta}`}>
                                {card.meta}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-5">
                    <h3 className={`text-[34px] font-black leading-none tracking-[-0.04em] text-slate-900 transition-colors duration-300 ${tone.titleHover}`}>
                        {card.title}
                    </h3>
                    <p className="mt-3 max-w-[27ch] text-[17px] font-medium leading-[1.3] text-slate-600">
                        {card.subtitle}
                    </p>
                </div>

                <div className={`mt-5 h-px bg-gradient-to-r ${tone.hairline}`} />

                <div className="mt-5 space-y-4">
                    <p className="text-[14px] font-bold leading-[1.45] text-slate-800">
                        {card.statement}
                    </p>

                    <ul className="space-y-2.5">
                        {card.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2.5">
                                <span className={`material-symbols-outlined mt-0.5 text-[16px] ${tone.bullet}`}>check_circle</span>
                                <span className="text-[13px] font-medium leading-[1.35] text-slate-600">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 flex-1">
                    <PreviewByType preview={card.preview} tone={tone} />
                </div>

                <div className="mt-5">
                    <span
                        className={[
                            "inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-4 text-[15px] font-black tracking-[-0.02em] transition-all duration-300",
                            card.available
                                ? `bg-gradient-to-r ${tone.cta} ${tone.ctaText} border-transparent shadow-[0_12px_24px_-16px_rgba(15,23,42,0.4)] group-hover:scale-[1.01]`
                                : `${tone.ctaGhost} shadow-none`,
                        ].join(" ")}
                    >
                        {card.cta}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </span>
                </div>
            </div>
        </button>
    );
}

export function HubSecondaryTracks({ setMode }: HubSecondaryTracksProps) {
    return (
        <div className="relative w-full bg-slate-50/60 pb-20">
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-8 md:px-6 md:pt-12">
                <div className="mb-5 flex flex-col justify-between gap-4 md:mb-7 md:flex-row md:items-end">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
                            Radar de Experiencias
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-600 md:text-base">
                            Explora otras dinámicas activas en la comunidad.
                        </p>
                    </div>

                    <div className="self-start rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur md:self-auto">
                        <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] md:text-[11px]">Desliza</span>
                            <span className="material-symbols-outlined text-[18px]">trending_flat</span>
                        </div>
                    </div>
                </div>

                <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-3 hide-scrollbar md:-mx-6 md:px-6">
                    {TRACKS.map((card) => (
                        <TrackCardView key={card.key} card={card} setMode={setMode} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HubSecondaryTracks;

import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignalStore } from "../../../store/signalStore";

type Props = {
    displayMode?: "hero" | "grid";
    onSignalClick?: () => void;
};

type Path = {
    title: string;
    description: string;
    cta: string;
    to: string;
    icon: string;
    badge?: string;
    theme: "indigo" | "cyan";
};

export default function ParticipationModules({ displayMode = "grid", onSignalClick }: Props) {
    const navigate = useNavigate();
    const { level, streakDays, signals } = useSignalStore();
    const xp = signals;

    // ⬇️ Data conectada real (XP, racha, señales remaining, etc.)
    const userState = {
        levelLabel: `Nivel ${level}`,
        xpLabel: `${xp} XP`,
        streakLabel: `Racha ${streakDays} días`,
        signalsLabel: `Señales: ${signals}`,
    };

    const primary = useMemo<Path[]>(
        () => [
            {
                title: "Versus",
                description: "Comparaciones 1 a 1 y progresivas. Rápido, adictivo y con feedback.",
                cta: "Empezar Versus",
                to: "/versus",
                icon: "swords",
                badge: "Más popular",
                theme: "indigo",
            },
            {
                title: "Insights",
                description: "Micro-preguntas para capturar contexto real. Ideal para segmentación.",
                cta: "Responder Insights",
                to: "/senales/insights",
                icon: "query_stats",
                badge: "Nuevo",
                theme: "cyan",
            },
        ],
        []
    );

    const secondary = useMemo(
        () => [
            {
                title: "Lugares y Servicios",
                description: "Evalúa experiencias, atención y calidad percibida.",
                cta: "Explorar",
                to: "/senales/lugares-servicios",
                icon: "place",
            },
            {
                title: "Productos",
                description: "Busca o escanea productos para dejar tu señal.",
                cta: "Ir a Productos",
                to: "/senales/productos",
                icon: "barcode_scanner",
            },
        ],
        []
    );

    const go = (to: string) => navigate(to);

    return (
        <section className="w-full">
            {/* Local styles for premium motion (no deps) */}
            <style>{`
        .op-hero-bg {
          background:
            radial-gradient(800px circle at 20% 10%, rgba(99,102,241,.18), transparent 45%),
            radial-gradient(700px circle at 85% 35%, rgba(34,211,238,.18), transparent 45%),
            radial-gradient(700px circle at 30% 85%, rgba(236,72,153,.12), transparent 45%),
            linear-gradient(180deg, rgba(15,23,42,.02), rgba(15,23,42,.00));
        }
        .op-grid {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
        }
        .op-grid:before {
          content: "";
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, rgba(99,102,241,.25), rgba(34,211,238,.18), rgba(236,72,153,.18));
          filter: blur(18px);
          opacity: .45;
          transform: translate3d(0,0,0);
          animation: opGlow 10s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes opGlow {
          0% { transform: translateX(-6%); opacity: .35; }
          50% { transform: translateX(6%); opacity: .55; }
          100% { transform: translateX(-6%); opacity: .35; }
        }
        .op-glass {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .op-pill {
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.55);
        }
      `}</style>

            {/* HERO */}
            <div className="op-grid border border-stroke bg-surface shadow-premium">
                <div className="absolute inset-0 op-hero-bg pointer-events-none" />

                <div className="relative p-7 md:p-9">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase text-slate-500/80">
                                <span className="material-symbols-outlined text-base">bolt</span>
                                Señales
                            </div>

                            <h2 className="mt-3 text-2xl md:text-3xl font-black text-ink leading-tight">
                                Deja señales con contexto.
                                <span className="block text-slate-600 font-extrabold">Y recibe claridad real, no “likes”.</span>
                            </h2>

                            <p className="mt-3 text-sm md:text-base text-text-secondary leading-relaxed">
                                Señales = datos útiles. Progreso = más poder dentro de la app. Feedback = enganche inmediato.
                            </p>

                            <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                <button
                                    className="btn-primary px-5 py-3 text-sm md:text-base flex items-center justify-center gap-2"
                                    onClick={() => go("/versus")}
                                >
                                    Empezar ahora
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </button>

                                <button
                                    className="px-5 py-3 text-sm md:text-base rounded-2xl border border-stroke bg-white/40 hover:bg-white/65 transition-all font-black text-slate-900 flex items-center justify-center gap-2 op-glass"
                                    onClick={onSignalClick ?? (() => go("/senales/insights"))}
                                >
                                    Ver Insights
                                    <span className="material-symbols-outlined text-base">travel_explore</span>
                                </button>
                            </div>

                            {/* STATUS STRIP */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                <StatusPill icon="military_tech" text={userState.levelLabel} />
                                <StatusPill icon="stars" text={userState.xpLabel} />
                                <StatusPill icon="local_fire_department" text={userState.streakLabel} />
                                <StatusPill icon="tune" text={userState.signalsLabel} />
                            </div>
                        </div>

                        {/* METRICS */}
                        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
                            <Metric title="Tiempo" value="10s" subtitle="por señal" />
                            <Metric title="Feedback" value="Instant" subtitle="al participar" />
                            <Metric title="Progreso" value="XP" subtitle="y recompensas" />
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURED PATHS */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {primary.map((p) => (
                    <SpotlightCard
                        key={p.title}
                        theme={p.theme}
                        onClick={() => go(p.to)}
                        title={p.title}
                        description={p.description}
                        cta={p.cta}
                        icon={p.icon}
                        badge={p.badge}
                    />
                ))}
            </div>

            {/* SECONDARY */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondary.map((s) => (
                    <div
                        key={s.title}
                        className="rounded-3xl border border-stroke bg-surface shadow-premium p-6 flex items-center justify-between gap-4 hover:shadow-lift transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-slate-900/5 border border-stroke flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-800">{s.icon}</span>
                            </div>

                            <div>
                                <div className="font-black text-ink">{s.title}</div>
                                <div className="text-sm text-text-secondary">{s.description}</div>
                            </div>
                        </div>

                        <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2" onClick={() => go(s.to)}>
                            {s.cta}
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    </div>
                ))}
            </div>

            {displayMode === "hero" ? (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={onSignalClick ?? (() => navigate("/senales"))}
                        className="text-sm font-black text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-2"
                    >
                        Ver todo en Señales
                        <span className="material-symbols-outlined text-base">south</span>
                    </button>
                </div>
            ) : null}
        </section>
    );
}

function StatusPill({ icon, text }: { icon: string; text: string }) {
    return (
        <div className="op-pill op-glass rounded-full px-3 py-1.5 inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-700">{icon}</span>
            <span className="text-xs font-black text-slate-800">{text}</span>
        </div>
    );
}

function Metric({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
    return (
        <div className="rounded-2xl border border-stroke bg-white/40 p-4 min-w-[92px] op-glass">
            <div className="text-[11px] font-black tracking-widest uppercase text-slate-500/80">{title}</div>
            <div className="mt-1 text-lg font-black text-ink">{value}</div>
            <div className="text-xs text-text-secondary">{subtitle}</div>
        </div>
    );
}

function SpotlightCard({
    theme,
    onClick,
    title,
    description,
    cta,
    icon,
    badge,
}: {
    theme: "indigo" | "cyan";
    onClick: () => void;
    title: string;
    description: string;
    cta: string;
    icon: string;
    badge?: string;
}) {
    const ref = useRef<HTMLButtonElement | null>(null);
    const [pos, setPos] = useState({ x: 50, y: 40 });

    const themeStyles =
        theme === "indigo"
            ? {
                glow: "rgba(99,102,241,.25)",
                tint: "from-indigo-500/20 via-fuchsia-500/10 to-transparent",
            }
            : {
                glow: "rgba(34,211,238,.22)",
                tint: "from-cyan-500/20 via-emerald-500/10 to-transparent",
            };

    const onMove: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        setPos({ x, y });
    };

    return (
        <button
            ref={ref}
            onMouseMove={onMove}
            onClick={onClick}
            className="text-left relative overflow-hidden rounded-3xl border border-stroke bg-surface shadow-premium hover:shadow-lift transition-all duration-300 hover:-translate-y-0.5"
            style={{
                backgroundImage: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, ${themeStyles.glow}, transparent 45%)`,
            }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${themeStyles.tint}`} />

            <div className="relative p-6 md:p-7 flex flex-col min-h-[200px]">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/55 border border-stroke flex items-center justify-center op-glass">
                            <span className="material-symbols-outlined text-slate-900">{icon}</span>
                        </div>

                        <div>
                            <div className="text-lg md:text-xl font-black text-ink leading-tight">{title}</div>
                            {badge ? (
                                <div className="mt-1 inline-flex items-center text-[11px] font-black px-2 py-1 rounded-full bg-white/55 border border-stroke text-slate-800 op-glass">
                                    {badge}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <span className="material-symbols-outlined text-slate-600">north_east</span>
                </div>

                <p className="mt-3 text-sm text-text-secondary leading-relaxed flex-1">{description}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs font-black tracking-widest uppercase text-slate-500/80">
                        Entrar
                    </div>

                    <div className="inline-flex items-center gap-2 font-black text-slate-900">
                        {cta}
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                </div>
            </div>
        </button>
    );
}

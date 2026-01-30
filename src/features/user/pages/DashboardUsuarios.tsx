/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import RequireEntitlement from '../../auth/components/RequireEntitlement';
import { useAccountProfile } from "../../../auth/useAccountProfile";

type View = "Resumen" | "Insights" | "Versus" | "Opiniones";

const DATA = {
    kpis: [
        { label: "Señales hoy", value: "1.284" },
        { label: "Participación semanal", value: "+12%" },
        { label: "Tema más caliente", value: "Movilidad" },
        { label: "Confianza promedio", value: "68/100" },
    ],
    highlights: [
        "La señal colectiva subió en Movilidad (probablemente porque alguien volvió a hablar del Transantiago).",
        "En Consumo, el precio sigue ganando… pero por poco.",
        "Las opiniones de servicios están polarizadas: 5 estrellas o funa.",
    ],
};

function Pill({
    active,
    children,
    onClick,
}: {
    active?: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={[
                "px-3 py-2 rounded-full text-sm font-semibold border transition",
                active ? "bg-primary text-white border-primary" : "bg-white border-stroke text-text-secondary hover:bg-surface2",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

export default function DashboardUsuarios() {
    const [view, setView] = useState<View>("Resumen");

    // Filtros LIMITADOS (por diseño)
    const [timeRange, setTimeRange] = useState("7 días");
    const [tema, setTema] = useState("Todos");

    const subtitle = useMemo(() => {
        return `Vista general · ${timeRange} · ${tema}`;
    }, [timeRange, tema]);

    const { profile, loading } = useAccountProfile();

    if (loading || !profile) return null; // Or a spinner

    return (
        <RequireEntitlement
            tier={profile.tier}
            profileCompleteness={profile.profileCompleteness}
            hasCI={profile.hasCI}
            require="insights"
        >
            <div className="container-ws section-y">
                <header className="pt-8 pb-10 text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-6">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Vista Explorador
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-ink leading-[0.9] tracking-tight mb-4">
                        Panorama de <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                            Señales.
                        </span>
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                        Navega resultados generales de la comunidad. Tus señales salen de tu interacción en toda la app.
                    </p>
                </header>

                {/* Controls */}
                <section className="card p-5 mb-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {(["Resumen", "Insights", "Versus", "Opiniones"] as View[]).map((v) => (
                                <Pill key={v} active={view === v} onClick={() => setView(v)}>
                                    {v}
                                </Pill>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 items-center justify-end">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-stroke bg-white text-sm font-semibold"
                            >
                                <option>24 horas</option>
                                <option>7 días</option>
                                <option>30 días</option>
                            </select>

                            <select
                                value={tema}
                                onChange={(e) => setTema(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-stroke bg-white text-sm font-semibold"
                            >
                                <option>Todos</option>
                                <option>Movilidad</option>
                                <option>Trabajo</option>
                                <option>Consumo</option>
                                <option>Educación</option>
                            </select>

                            <span className="text-xs text-text-muted">{subtitle}</span>
                        </div>
                    </div>
                </section>

                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {DATA.kpis.map((k) => (
                        <div key={k.label} className="card p-5">
                            <div className="text-xs text-text-muted font-semibold uppercase">{k.label}</div>
                            <div className="mt-2 text-3xl font-extrabold grad-text">{k.value}</div>
                            <div className="mt-1 text-sm text-text-secondary">Basado en señales agregadas</div>
                        </div>
                    ))}
                </section>

                {/* Content */}
                <section className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-7 card p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-ink">Resultados (demo)</h2>
                            <span className="badge">Interativo</span>
                        </div>

                        <div className="mt-4 rounded-2xl bg-surface2 p-5 border border-stroke">
                            <div className="text-sm font-semibold text-ink">Gráfico placeholder</div>
                            <div className="mt-2 text-sm text-text-secondary">
                                Aquí después conectas Supabase y reemplazas este bloque por gráficos reales.
                                La idea: el usuario ve tendencias, no el detalle quirúrgico.
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {[72, 58, 81].map((v, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-stroke p-3">
                                        <div className="text-xs text-text-muted font-semibold">Índice {i + 1}</div>
                                        <div className="text-2xl font-extrabold text-ink mt-1">{v}</div>
                                        <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                            <div className="h-2 bg-primary" style={{ width: `${v}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-text-muted">
                            Nota: este dashboard es limitado a propósito. Si quieres filtros avanzados, existe el panel de empresas.
                        </div>
                    </div>

                    <div className="lg:col-span-5 card p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-ink">Insights rápidos</h2>
                            <span className="badge-accent">Auto</span>
                        </div>

                        <ul className="mt-4 space-y-3">
                            {DATA.highlights.map((h, i) => (
                                <li key={i} className="rounded-2xl border border-stroke bg-white p-4">
                                    <div className="text-sm text-text-secondary">💡 {h}</div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/10 p-4">
                            <div className="text-sm font-bold text-ink">Acción sugerida</div>
                            <div className="mt-1 text-sm text-text-secondary">
                                Entra a <b>Radiografía</b> si quieres el “tú vs otros”.
                                Acá es para ver el mapa general.
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </RequireEntitlement>
    );
}

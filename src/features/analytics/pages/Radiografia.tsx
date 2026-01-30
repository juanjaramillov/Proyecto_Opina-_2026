import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleGate from "../../auth/components/RoleGate";
import EmptyState from "../../../components/ui/EmptyState";

type Segment = {
    id: string;
    label: string;
    a: number; // %
    b: number; // %
};

function clamp(n: number) {
    return Math.max(0, Math.min(100, n));
}

function bar(pct: number, tone: "a" | "b") {
    return (
        <div className="h-3 w-full rounded-full bg-surface2 overflow-hidden">
            <div
                className={`h-full ${tone === "a" ? "bg-primary/70" : "bg-accent/70"}`}
                style={{ width: `${clamp(pct)}%` }}
            />
        </div>
    );
}

export default function Radiografia() {
    const navigate = useNavigate();

    // Demo topic
    const topic = {
        title: "Internet hogar: satisfacción real",
        subtitle: "Promesas vs experiencia. La diferencia aparece rápido.",
        options: ["Proveedor A", "Proveedor B"],
        totalSignals: 1988,
        freshness: "Esta semana",
    };

    // Segmentos demo
    const segments: Segment[] = useMemo(
        () => [
            { id: "s1", label: "Total", a: 56, b: 44 },
            { id: "s2", label: "18–29", a: 61, b: 39 },
            { id: "s3", label: "30–44", a: 53, b: 47 },
            { id: "s4", label: "45+", a: 48, b: 52 },
            { id: "s5", label: "Región Metropolitana", a: 58, b: 42 },
            { id: "s6", label: "Regiones", a: 51, b: 49 },
        ],
        []
    );

    const [selected, setSelected] = useState<string>("s1");
    const seg = segments.find((s) => s.id === selected) ?? segments[0];

    const insight = useMemo(() => {
        if (seg.a - seg.b >= 8)
            return "La preferencia es clara. El patrón aparece sin esfuerzo.";
        if (seg.b - seg.a >= 8)
            return "Cambio de liderazgo en este segmento específico.";
        return "Competencia ajustada. Aquí conviene mirar tendencia temporal.";
    }, [seg]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-text-secondary hover:text-ink"
                    >
                        ← Volver
                    </button>

                    <h1 className="mt-2 text-2xl font-bold text-ink">
                        {topic.title}
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        {topic.subtitle}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-surface2 px-2 py-0.5 text-xs text-text-secondary">
                            {topic.freshness}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-surface2 px-2 py-0.5 text-xs text-text-secondary">
                            {topic.totalSignals.toLocaleString("es-CL")} señales
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-ink">
                            Pro
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate("/versus")}
                        className="rounded-xl border border-stroke bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-card hover:bg-surface2 transition"
                    >
                        Emitir señal
                    </button>
                    <button
                        onClick={() => navigate("/enterprise")}
                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition"
                    >
                        Usar en modo empresa
                    </button>
                </div>
            </section>

            {/* Top result */}
            <section className="rounded-2xl border border-stroke bg-surface p-6 shadow-card">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-xs text-text-muted">Resultado general</div>
                        <div className="mt-2 text-sm font-semibold text-ink">
                            {topic.options[0]} vs {topic.options[1]}
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                                    <span>{topic.options[0]}</span>
                                    <span>{seg.a}%</span>
                                </div>
                                {bar(seg.a, "a")}
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                                    <span>{topic.options[1]}</span>
                                    <span>{seg.b}%</span>
                                </div>
                                {bar(seg.b, "b")}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-surface2 p-5">
                        <div className="text-sm font-semibold text-ink">Lectura rápida</div>
                        <p className="mt-2 text-sm text-text-secondary">
                            {insight}
                        </p>

                        <div className="mt-4 rounded-xl bg-surface p-4 text-sm shadow-card">
                            👉 No hay comentarios. No hay contexto.
                            <span className="text-ink font-medium">
                                Solo elección agregada.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Segments */}
            <section className="rounded-2xl border border-stroke bg-surface p-6 shadow-card">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-ink">Segmentos</h2>
                        <p className="mt-1 text-sm text-text-secondary">
                            Cambia el corte. Mira cómo se mueve la preferencia.
                        </p>
                    </div>

                    <div className="text-xs text-text-muted">
                        Disponible en Pro
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[240px_1fr]">
                    <div className="space-y-1">
                        {segments.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelected(s.id)}
                                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${s.id === selected
                                    ? "bg-primary/10 text-ink"
                                    : "bg-surface2 text-text-secondary hover:bg-surface"
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl bg-surface2 p-5">
                        <div className="text-sm font-semibold text-ink">
                            {segments.find((s) => s.id === selected)?.label}
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                                    <span>{topic.options[0]}</span>
                                    <span>{seg.a}%</span>
                                </div>
                                {bar(seg.a, "a")}
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                                    <span>{topic.options[1]}</span>
                                    <span>{seg.b}%</span>
                                </div>
                                {bar(seg.b, "b")}
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-text-muted">
                            Tip: diferencias pequeñas suelen amplificarse con más señales.
                        </div>
                    </div>
                </div>
            </section>

            {/* Gating Pro */}
            <RoleGate allow="empresa">
                <section className="rounded-2xl border border-dashed border-stroke bg-surface p-6 shadow-card">
                    <h3 className="text-sm font-semibold text-ink">
                        Análisis avanzado (empresa)
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Históricos, comparación temporal, exportación y cruces múltiples.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl bg-surface2 p-4 text-sm">
                            Tendencia semanal
                        </div>
                        <div className="rounded-xl bg-surface2 p-4 text-sm">
                            Comparación por región
                        </div>
                        <div className="rounded-xl bg-surface2 p-4 text-sm">
                            Exportar datos
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/monetization")}
                        className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition"
                    >
                        Desbloquear Pro
                    </button>

                    <div className="mt-2 text-xs text-text-muted">
                        Esto no es decoración. Es donde se toman decisiones.
                    </div>
                </section>
            </RoleGate>

            {/* Empty fallback (si algo falla) */}
            {!segments.length && (
                <EmptyState
                    emoji="📉"
                    title="No hay suficientes señales"
                    description="Cuando el volumen crece, la radiografía aparece. Vuelve pronto."
                    actionLabel="Emitir señal"
                    onAction={() => navigate("/versus")}
                />
            )}
        </div>
    );
}

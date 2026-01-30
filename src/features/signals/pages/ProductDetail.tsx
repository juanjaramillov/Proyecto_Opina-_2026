import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";

type Review = {
    id: string;
    rating: number;
    title: string;
    body: string;
    verified: boolean;
    date: string;
};

function fmt(n: number) {
    return n.toLocaleString("es-CL");
}

function stars(rating: number) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return "★".repeat(full) + (half ? "⯨" : "") + "☆".repeat(empty);
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

export default function ProductDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Demo: en el futuro esto viene por API usando id
    const product = useMemo(() => {
        return {
            id: id ?? "1",
            name: "Coca-Cola 1.5L",
            brand: "Coca-Cola",
            barcode: "7801615100034",
            category: "Bebidas",
            avgRating: 4.5,
            reviewsCount: 1244,
            signals: 3021,
            verifiedRatio: 0.78,
            priceFeel: "Caro" as const,
            highlights: [
                "Sabor consistente",
                "Fácil de encontrar",
                "Precio percibido alto",
            ],
        };
    }, [id]);

    const [filterVerified, setFilterVerified] = useState(false);
    const [minRating, setMinRating] = useState(0);

    const breakdown = useMemo(() => {
        // Distribución demo (debe sumar 100)
        return [
            { stars: 5, pct: 62 },
            { stars: 4, pct: 24 },
            { stars: 3, pct: 8 },
            { stars: 2, pct: 3 },
            { stars: 1, pct: 3 },
        ];
    }, []);

    const reviews: Review[] = useMemo(
        () => [
            {
                id: "rv1",
                rating: 5,
                title: "Cumple. Siempre.",
                body: "No es filosofía, es Coca-Cola. Si quieres ir a la segura, listo.",
                verified: true,
                date: "Hace 3 días",
            },
            {
                id: "rv2",
                rating: 4,
                title: "Rica, pero cara",
                body: "Me encanta, pero el precio se siente. Igual cae igual.",
                verified: true,
                date: "Hace 1 semana",
            },
            {
                id: "rv3",
                rating: 3,
                title: "Bien, nada más",
                body: "No tengo quejas, pero tampoco me cambia la vida.",
                verified: false,
                date: "Hace 2 semanas",
            },
            {
                id: "rv4",
                rating: 5,
                title: "Clásico absoluto",
                body: "Sabor estable. No falla. Y sí, es adictiva, gracias por preguntar.",
                verified: true,
                date: "Hace 1 mes",
            },
            {
                id: "rv5",
                rating: 2,
                title: "Me sube el azúcar con mirarla",
                body: "Demasiado dulce para mí. No es mi estilo.",
                verified: false,
                date: "Hace 1 mes",
            },
        ],
        []
    );

    const filtered = useMemo(() => {
        return reviews
            .filter((r) => (filterVerified ? r.verified : true))
            .filter((r) => r.rating >= minRating);
    }, [reviews, filterVerified, minRating]);

    const priceBadge = (p: string) => {
        const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
        if (p === "Barato") return <span className={base + " bg-accent/15 text-ink"}>Barato</span>;
        if (p === "Caro") return <span className={base + " bg-danger/15 text-ink"}>Caro</span>;
        return <span className={base + " bg-surface2 text-ink"}>Ok</span>;
    };

    return (
        <div className="space-y-8">
            {/* Top */}
            <section className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-text-secondary hover:text-ink"
                    >
                        ← Volver
                    </button>

                    <h1 className="mt-2 text-2xl font-bold text-ink">
                        {product.name}
                    </h1>
                    <div className="mt-1 text-sm text-text-secondary">
                        {product.brand} • {product.category} • Código: <span className="text-ink font-medium">{product.barcode}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-surface2 px-2 py-0.5 text-xs text-text-secondary">
                            Producto
                        </span>
                        {priceBadge(product.priceFeel)}
                        <span className="inline-flex items-center rounded-full bg-surface2 px-2 py-0.5 text-xs text-text-secondary">
                            {Math.round(product.verifiedRatio * 100)}% verificado
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl bg-surface p-5 shadow-card md:w-[360px]">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-xs text-text-muted">Rating</div>
                            <div className="mt-1 text-3xl font-semibold text-ink">
                                {product.avgRating.toFixed(1)}
                            </div>
                            <div className="text-xs text-text-muted">{stars(product.avgRating)}</div>
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-text-muted">Reseñas</div>
                            <div className="mt-1 text-lg font-semibold text-ink">
                                {fmt(product.reviewsCount)}
                            </div>
                            <div className="mt-2 text-xs text-text-muted">Señales</div>
                            <div className="text-lg font-semibold text-ink">
                                {fmt(product.signals)}
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition">
                        Opinar (comprado/verificado)
                    </button>

                    <div className="mt-2 text-xs text-text-muted">
                        En app móvil: escaneo + boleta + verificación. Aquí es demo.
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="grid gap-4 md:grid-cols-3">
                {product.highlights.map((h, idx) => (
                    <div key={idx} className="rounded-2xl bg-surface p-6 shadow-card">
                        <div className="text-xs text-text-muted">Insight</div>
                        <div className="mt-2 text-sm font-semibold text-ink">{h}</div>
                        <div className="mt-2 text-xs text-text-secondary">
                            Esto se vuelve más preciso a mayor volumen de señales.
                        </div>
                    </div>
                ))}
            </section>

            {/* Breakdown */}
            <section className="rounded-2xl border border-stroke bg-surface p-6 shadow-card">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-ink">Distribución de rating</h2>
                        <p className="mt-1 text-sm text-text-secondary">
                            No todo es promedio. Mira la forma de la curva.
                        </p>
                    </div>
                    <div className="text-xs text-text-muted">
                        Tip: una curva polarizada suele indicar “amor/odio”.
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {breakdown.map((b) => (
                        <div key={b.stars} className="grid grid-cols-[40px_1fr_50px] items-center gap-3">
                            <div className="text-sm text-text-secondary">{b.stars}★</div>
                            <div className="h-3 rounded-full bg-surface2 overflow-hidden">
                                <div
                                    className="h-full bg-primary/60"
                                    style={{ width: `${clamp(b.pct, 0, 100)}%` }}
                                />
                            </div>
                            <div className="text-sm text-ink font-medium text-right">{b.pct}%</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Filters + Reviews */}
            <section className="rounded-2xl border border-stroke bg-surface p-6 shadow-card">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-ink">Reseñas</h2>
                        <p className="mt-1 text-sm text-text-secondary">
                            Comentarios cortos. Nada de tesis. Gracias.
                        </p>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stroke bg-bg px-3 py-2 text-sm">
                            <span className="text-text-secondary">Solo verificados</span>
                            <input
                                type="checkbox"
                                checked={filterVerified}
                                onChange={(e) => setFilterVerified(e.target.checked)}
                            />
                        </label>

                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="rounded-xl border border-stroke bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value={0}>Cualquier rating</option>
                            <option value={3}>3+</option>
                            <option value={4}>4+</option>
                            <option value={5}>Solo 5</option>
                        </select>
                    </div>
                </div>

                <div className="mt-5">
                    {filtered.length === 0 ? (
                        <EmptyState
                            emoji="🧾"
                            title="No hay reseñas con esos filtros"
                            description="O eres demasiado exigente… o el mundo está mejorando. Aún no lo sé."
                            actionLabel="Reset filtros"
                            onAction={() => {
                                setFilterVerified(false);
                                setMinRating(0);
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((r) => (
                                <div key={r.id} className="rounded-2xl bg-surface2 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-ink">{r.title}</div>
                                            <div className="mt-1 text-xs text-text-muted">
                                                {stars(r.rating)} • {r.date} •{" "}
                                                {r.verified ? (
                                                    <span className="text-ink font-medium">Comprado/verificado</span>
                                                ) : (
                                                    <span className="text-text-secondary">No verificado</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-ink">
                                            {r.rating.toFixed(0)}/5
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm text-text-secondary">{r.body}</p>

                                    <div className="mt-4 flex gap-2 text-xs text-text-muted">
                                        <button className="rounded-xl border border-stroke bg-surface px-3 py-2 hover:bg-bg transition">
                                            Útil
                                        </button>
                                        <button className="rounded-xl border border-stroke bg-surface px-3 py-2 hover:bg-bg transition">
                                            No útil
                                        </button>
                                        <button className="ml-auto rounded-xl border border-stroke bg-surface px-3 py-2 hover:bg-bg transition">
                                            Reportar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="rounded-2xl bg-surface2 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-ink">
                            ¿Quieres que esto sea “verificado de verdad”?
                        </div>
                        <div className="mt-1 text-sm text-text-secondary">
                            Boleta + barcode + historial. Si no compraste, tu opinión pesa menos. Simple.
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/review")}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition"
                    >
                        Volver a rankings
                    </button>
                </div>
            </section>
        </div>
    );
}

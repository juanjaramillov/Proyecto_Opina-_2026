/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";

type Kind = "Lugar" | "Producto";
type Category =
    | "Supermercados"
    | "Farmacias"
    | "Restaurantes"
    | "Internet"
    | "Delivery"
    | "Bebidas"
    | "Snacks";

type Item = {
    id: string;
    kind: Kind;
    category: Category;
    name: string;
    brand?: string;
    rating: number; // 0..5
    reviews: number;
    signals: number;
    priceFeel: "Caro" | "Ok" | "Barato";
    verifiedRatio: number; // 0..1
    barcode?: string; // demo
};

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function stars(rating: number) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return "★".repeat(full) + (half ? "⯨" : "") + "☆".repeat(empty);
}

function fmt(n: number) {
    return n.toLocaleString("es-CL");
}

export default function ConsumerReview() {
    const navigate = useNavigate();

    const [q, setQ] = useState("");
    const [kind, setKind] = useState<"Todos" | Kind>("Todos");
    const [cat, setCat] = useState<"Todas" | Category>("Todas");
    const [minRating, setMinRating] = useState(0);
    const [scanMode, setScanMode] = useState(false);
    const [barcode, setBarcode] = useState("");

    const items: Item[] = useMemo(
        () => [
            {
                id: "l1",
                kind: "Lugar",
                category: "Supermercados",
                name: "Lider",
                rating: 3.9,
                reviews: 842,
                signals: 2113,
                priceFeel: "Caro",
                verifiedRatio: 0.62,
            },
            {
                id: "l2",
                kind: "Lugar",
                category: "Supermercados",
                name: "Jumbo",
                rating: 4.2,
                reviews: 611,
                signals: 1874,
                priceFeel: "Caro",
                verifiedRatio: 0.67,
            },
            {
                id: "l3",
                kind: "Lugar",
                category: "Farmacias",
                name: "Cruz Verde",
                rating: 3.6,
                reviews: 520,
                signals: 1461,
                priceFeel: "Caro",
                verifiedRatio: 0.58,
            },
            {
                id: "l4",
                kind: "Lugar",
                category: "Internet",
                name: "Movistar Hogar",
                rating: 3.2,
                reviews: 913,
                signals: 2402,
                priceFeel: "Ok",
                verifiedRatio: 0.71,
            },
            {
                id: "l5",
                kind: "Lugar",
                category: "Internet",
                name: "Entel Fibra",
                rating: 4.0,
                reviews: 705,
                signals: 1988,
                priceFeel: "Ok",
                verifiedRatio: 0.73,
            },
            {
                id: "p1",
                kind: "Producto",
                category: "Bebidas",
                name: "Coca-Cola 1.5L",
                brand: "Coca-Cola",
                rating: 4.5,
                reviews: 1244,
                signals: 3021,
                priceFeel: "Caro",
                verifiedRatio: 0.78,
                barcode: "7801615100034",
            },
            {
                id: "p2",
                kind: "Producto",
                category: "Snacks",
                name: "Papas Lays Clásicas",
                brand: "Lays",
                rating: 4.1,
                reviews: 733,
                signals: 1680,
                priceFeel: "Ok",
                verifiedRatio: 0.74,
                barcode: "7802000000000",
            },
            {
                id: "p3",
                kind: "Producto",
                category: "Delivery",
                name: "Pedido promedio (apps)",
                brand: "Comparativo",
                rating: 3.7,
                reviews: 892,
                signals: 2055,
                priceFeel: "Caro",
                verifiedRatio: 0.61,
            },
        ],
        []
    );

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        const min = clamp(minRating, 0, 5);

        return items
            .filter((it) => (kind === "Todos" ? true : it.kind === kind))
            .filter((it) => (cat === "Todas" ? true : it.category === cat))
            .filter((it) => it.rating >= min)
            .filter((it) => {
                if (!needle) return true;
                return (
                    it.name.toLowerCase().includes(needle) ||
                    (it.brand ? it.brand.toLowerCase().includes(needle) : false) ||
                    it.category.toLowerCase().includes(needle)
                );
            })
            .sort((a, b) => b.signals - a.signals);
    }, [items, q, kind, cat, minRating]);

    const barcodeMatch = useMemo(() => {
        const code = barcode.trim();
        if (!code) return null;
        return items.find((i) => i.kind === "Producto" && i.barcode === code) ?? null;
    }, [barcode, items]);

    const badge = (text: string) => (
        <span className="inline-flex items-center rounded-full bg-surface2 px-2 py-0.5 text-xs text-text-secondary">
            {text}
        </span>
    );

    const priceBadge = (p: Item["priceFeel"]) => {
        const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
        if (p === "Barato") return <span className={base + " bg-accent/15 text-ink"}>Barato</span>;
        if (p === "Caro") return <span className={base + " bg-danger/15 text-ink"}>Caro</span>;
        return <span className={base + " bg-surface2 text-ink"}>Ok</span>;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Rankings</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Lugares y productos. Opinión agregada. Sin “me pasó una vez”.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setScanMode((v) => !v)}
                        className="rounded-xl border border-stroke bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-card hover:bg-surface2 transition"
                    >
                        {scanMode ? "Salir de modo scan" : "Modo scan"}
                    </button>

                    <button
                        onClick={() => navigate("/product/1")}
                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition"
                    >
                        Ver ficha producto
                    </button>
                </div>
            </section>

            {/* Scan mode */}
            {scanMode && (
                <section className="rounded-2xl border border-stroke bg-surface p-5 shadow-card">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-ink">Modo scan (demo)</div>
                            <div className="mt-1 text-sm text-text-secondary">
                                En app móvil esto sería cámara. Aquí es input para simular.
                            </div>
                        </div>
                        <div className="text-xs text-text-muted">
                            Tip: prueba <b>7801615100034</b>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
                        <input
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="Ingresa código de barras…"
                            className="w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                            onClick={() => { }}
                            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lift"
                        >
                            Buscar
                        </button>
                    </div>

                    <div className="mt-4">
                        {barcode.trim() && !barcodeMatch ? (
                            <div className="rounded-xl bg-surface2 p-4 text-sm text-text-secondary">
                                No encontré ese producto todavía.
                                <span className="text-ink font-medium">
                                    Perfecto: alguien tiene que ser el primero.
                                </span>
                            </div>
                        ) : null}

                        {barcodeMatch ? (
                            <button
                                onClick={() => navigate("/product/1")}
                                className="w-full text-left rounded-2xl border border-stroke bg-surface p-5 shadow-card hover:shadow-lift transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {badge("Producto")}
                                            {badge(barcodeMatch.category)}
                                            {priceBadge(barcodeMatch.priceFeel)}
                                        </div>
                                        <div className="mt-3 text-base font-semibold text-ink">
                                            {barcodeMatch.name}
                                        </div>
                                        <div className="mt-1 text-sm text-text-secondary">
                                            {barcodeMatch.brand ?? "—"}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-ink">
                                            {barcodeMatch.rating.toFixed(1)} / 5
                                        </div>
                                        <div className="text-xs text-text-muted">
                                            {stars(barcodeMatch.rating)}
                                        </div>
                                        <div className="mt-2 text-xs text-text-secondary">
                                            {fmt(barcodeMatch.reviews)} reseñas
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-xs text-text-muted">
                                    Click para ver ficha completa →
                                </div>
                            </button>
                        ) : null}
                    </div>
                </section>
            )}

            {/* Filters */}
            <section className="rounded-2xl border border-stroke bg-surface p-4 shadow-card">
                <div className="grid gap-3 md:grid-cols-[1fr_160px_220px_180px]">
                    <div>
                        <div className="text-xs text-text-muted">Buscar</div>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Ej: Jumbo, internet, Coca-Cola…"
                            className="mt-1 w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <div className="text-xs text-text-muted">Tipo</div>
                        <select
                            value={kind}
                            onChange={(e) => setKind(e.target.value as any)}
                            className="mt-1 w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="Todos">Todos</option>
                            <option value="Lugar">Lugar</option>
                            <option value="Producto">Producto</option>
                        </select>
                    </div>

                    <div>
                        <div className="text-xs text-text-muted">Categoría</div>
                        <select
                            value={cat}
                            onChange={(e) => setCat(e.target.value as any)}
                            className="mt-1 w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="Todas">Todas</option>
                            <option value="Supermercados">Supermercados</option>
                            <option value="Farmacias">Farmacias</option>
                            <option value="Restaurantes">Restaurantes</option>
                            <option value="Internet">Internet</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Snacks">Snacks</option>
                        </select>
                    </div>

                    <div>
                        <div className="text-xs text-text-muted">Rating mínimo</div>
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="mt-1 w-full rounded-xl border border-stroke bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value={0}>Cualquiera</option>
                            <option value={3}>3+</option>
                            <option value={3.5}>3.5+</option>
                            <option value={4}>4+</option>
                            <option value={4.5}>4.5+</option>
                        </select>
                    </div>
                </div>

                <div className="mt-3 text-xs text-text-muted">
                    Esto todavía es demo. Pero ya se siente como app.
                </div>
            </section>

            {/* List */}
            {filtered.length === 0 ? (
                <EmptyState
                    emoji="🧾"
                    title="Nada con esos filtros"
                    description="O tu estándar es demasiado alto… o estás buscando algo que todavía no existe. También es posible que sea ambas."
                    actionLabel="Reset filtros"
                    onAction={() => {
                        setQ("");
                        setKind("Todos");
                        setCat("Todas");
                        setMinRating(0);
                    }}
                />
            ) : (
                <section className="grid gap-4 md:grid-cols-2">
                    {filtered.map((it) => (
                        <button
                            key={it.id}
                            onClick={() => (it.kind === "Producto" ? navigate("/product/1") : navigate("/radiografia"))}
                            className="text-left rounded-2xl border border-stroke bg-surface p-6 shadow-card hover:shadow-lift transition"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {badge(it.kind)}
                                        {badge(it.category)}
                                        {priceBadge(it.priceFeel)}
                                        <span className="inline-flex items-center rounded-full bg-surface2 px-2 py-0.5 text-xs text-text-secondary">
                                            {Math.round(it.verifiedRatio * 100)}% verificado
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-base font-semibold text-ink">
                                        {it.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-text-secondary">
                                        {it.brand ? it.brand : "—"}
                                    </p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <div className="text-sm font-semibold text-ink">
                                        {it.rating.toFixed(1)} / 5
                                    </div>
                                    <div className="text-xs text-text-muted">{stars(it.rating)}</div>
                                    <div className="mt-2 text-xs text-text-secondary">
                                        {fmt(it.reviews)} reseñas
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-text-muted">
                                <div className="rounded-xl bg-surface2 p-3">
                                    <div>Señales</div>
                                    <div className="text-sm font-semibold text-ink">{fmt(it.signals)}</div>
                                </div>
                                <div className="rounded-xl bg-surface2 p-3">
                                    <div>Lectura</div>
                                    <div className="text-sm font-semibold text-ink">
                                        {it.rating >= 4.2 ? "Recomendado" : it.rating >= 3.6 ? "Depende" : "Ojo"}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                                <span>Ver detalle</span>
                                <span>→</span>
                            </div>
                        </button>
                    ))}
                </section>
            )}

            {/* Bottom CTA */}
            <section className="rounded-2xl bg-surface2 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-ink">
                            ¿Tu producto no aparece?
                        </div>
                        <div className="mt-1 text-sm text-text-secondary">
                            En el mundo real, eso es una oportunidad. En Opina+, también.
                        </div>
                    </div>
                    <button
                        onClick={() => setScanMode(true)}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition"
                    >
                        Activar modo scan
                    </button>
                </div>
            </section>
        </div>
    );
}

import { Zap, Brain, MapPin, ScanBarcode } from 'lucide-react';

function renderCardIcon(icon: string) {
    const className = "w-6 h-6";
    switch (icon) {
        case 'zap': return <Zap className={className} />;
        case 'brain': return <Brain className={className} />;
        case 'map-pin': return <MapPin className={className} />;
        case 'scan-barcode': return <ScanBarcode className={className} />;
        default: return <Zap className={className} />;
    }
}

function formatActivosAhora(value: number) {
    if (!Number.isFinite(value)) return "—";
    if (value < 10) return "Pocos";
    return `${value}`;
}

interface SignalCardProps {
    onClick: () => void;
    title: string;
    description: string;
    icon: string;
    delay: number;
    kpis: readonly { label: string; value: string }[];
    isFeatured?: boolean;
    variant: 'versus' | 'directo' | 'recomendados' | 'vitrina';
}

export default function SignalCard({
    onClick,
    title,
    description,
    icon,
    delay,
    kpis,
    isFeatured,
    variant
}: SignalCardProps) {
    return (
        <div
            onClick={onClick}
            style={{ animationDelay: `${delay}ms` }}
            className={`group relative w-full flex items-center gap-6
                rounded-[26px] px-6 py-6
                bg-white/85 backdrop-blur-sm
                border border-black/5
                shadow-[0_12px_40px_rgba(15,23,42,0.08)]
                transition-all duration-200
                hover:-translate-y-[2px] hover:shadow-[0_18px_55px_rgba(15,23,42,0.12)]
                cursor-pointer animate-float-in fill-mode-forwards
                ${variant === "versus" ? "ring-1 ring-blue-200/60" : ""}
                ${isFeatured ? "min-h-[170px] md:min-h-[190px]" : "min-h-[130px] md:min-h-[150px]"}`}
        >
            {/* Tinte por sección */}
            <div
                className={`pointer-events-none absolute inset-0 opacity-[0.18]
                ${variant === "versus" ? "bg-gradient-to-br from-blue-200/70 via-white/0 to-indigo-200/60" : ""}
                ${variant === "directo" ? "bg-gradient-to-br from-cyan-200/60 via-white/0 to-sky-200/60" : ""}
                ${variant === "recomendados" ? "bg-gradient-to-br from-emerald-200/60 via-white/0 to-teal-200/60" : ""}
                ${variant === "vitrina" ? "bg-gradient-to-br from-amber-200/60 via-white/0 to-orange-200/60" : ""}`}
            />

            {/* Energy Glow (Versus only) */}
            {variant === "versus" && (
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-1/3 -left-1/4 w-[140%] h-[140%] bg-[radial-gradient(circle_at_25%_35%,rgba(59,130,246,0.18),transparent_60%)]" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">

                    <div className={`
                        flex items-center justify-center
                        w-12 h-12 rounded-xl shrink-0
                        ${variant === "versus" && "bg-blue-600/15 text-blue-600"}
                        ${variant === "directo" && "bg-cyan-600/15 text-cyan-600"}
                        ${variant === "recomendados" && "bg-emerald-600/15 text-emerald-600"}
                        ${variant === "vitrina" && "bg-amber-600/20 text-amber-600"}
                    `}>
                        {renderCardIcon(icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-slate-900 font-semibold text-lg leading-tight">
                            {title}
                        </div>
                        <div className="text-slate-600 text-sm mt-0.5 leading-snug">
                            {description}
                        </div>
                        {isFeatured && (
                            <div className="mt-2 inline-flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-xs font-bold backdrop-blur-md">
                                    Empieza aquí
                                </div>
                                <div className="text-slate-400 text-xs font-medium">
                                    → 1 minuto
                                </div>
                            </div>
                        )}
                    </div>

                    {variant === "versus" ? (
                        <button className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition">
                            Entrar
                        </button>
                    ) : (
                        <button className="shrink-0 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition">
                            Entrar
                        </button>
                    )}

                    {/* Simplified KPI Panel */}
                    <div className="ml-6 flex flex-col gap-2 w-[150px] shrink-0">
                        {kpis?.slice(0, 3).map((kpi) => (
                            <div key={kpi.label} className="flex justify-between text-xs text-slate-500">
                                <span>{kpi.label}</span>
                                <span className="font-semibold text-slate-800">
                                    {kpi.label === "Activos ahora" ? formatActivosAhora(Number(kpi.value.replace(/[^0-9.-]+/g, ""))) : kpi.value}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

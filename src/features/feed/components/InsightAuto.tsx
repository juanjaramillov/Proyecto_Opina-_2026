
type Confidence = "Baja" | "Media" | "Alta";

type Props = {
    region: string;
    age: string;
    category: string;
    windowLabel: string; // ej: "7 días"
    deltaPts: number; // ej: +1.7 o -2.1
    volatility: "Baja" | "Media" | "Alta";
    driversTop2: [string, string];
    sampleN: number; // ej: 2476
};

function trendWord(deltaPts: number) {
    if (deltaPts > 0) return "repunte";
    if (deltaPts < 0) return "retroceso";
    return "estabilidad";
}

function intensityWord(deltaPts: number) {
    const abs = Math.abs(deltaPts);
    if (abs === 0) return "plana";
    if (abs <= 1) return "leve";
    if (abs <= 3) return "moderada";
    return "fuerte";
}

function confidenceFrom(sampleN: number, volatility: Props["volatility"]): Confidence {
    // MVP simple: más base + menor volatilidad = mayor confianza
    if (sampleN >= 8000 && volatility !== "Alta") return "Alta";
    if (sampleN >= 2500) return volatility === "Alta" ? "Baja" : "Media";
    return "Baja";
}

export default function InsightAuto(props: Props) {
    const {
        region,
        age,
        category,
        windowLabel,
        deltaPts,
        volatility,
        driversTop2,
        sampleN,
    } = props;

    const dir = trendWord(deltaPts);
    const intensity = intensityWord(deltaPts);
    const sign = deltaPts > 0 ? "+" : "";
    const confidence = confidenceFrom(sampleN, volatility);

    return (
        <section className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-primary/25 bg-white/5 font-extrabold text-[11px] text-ink tracking-tight">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        INSIGHT AUTOMÁTICO
                    </div>

                    <p className="mt-3 text-[14px] leading-relaxed text-ink font-extrabold max-w-[90ch]">
                        En el segmento <b>{region} ({age})</b>, la señal en <b>{category}</b> muestra un{" "}
                        <b>{dir}</b> <b>{intensity}</b> ({sign}{deltaPts.toFixed(1)} pts) en los últimos{" "}
                        <b>{windowLabel}</b>, impulsado principalmente por{" "}
                        <b>{driversTop2[0]}</b> y <b>{driversTop2[1]}</b>, con{" "}
                        <b>volatilidad {volatility.toLowerCase()}</b>.
                    </p>
                </div>

                <div className="flex gap-2.5 flex-wrap items-center">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/14 bg-white/5 font-extrabold text-[11px] text-muted2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[16px]">group</span>
                        Base: {sampleN.toLocaleString("es-CL")}
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/14 bg-white/5 font-extrabold text-[11px] text-muted2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[16px]">timer</span>
                        Ventana: {windowLabel}
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/14 bg-white/5 font-extrabold text-[11px] text-muted2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Confianza: {confidence}
                    </span>
                </div>
            </div>
        </section>
    );
}

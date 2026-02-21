
import { AccountTier } from "../../auth";

type Confidence = "Baja" | "Media" | "Alta";

type Props = {
    tier: AccountTier;
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
        tier,
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

    // SILENCE RULES (Regla de Producto)
    const shouldShow = () => {
        // 1. Minimum Volume Global (Lowered to 10 for local/demo visibility)
        if (sampleN < 10) return false;

        // 2. Guest Rules: Lowered for demo visibility
        if (tier === 'guest' && sampleN < 5) return false;

        // 3. Registered/Verified: Show unless extremely contradictory
        return true;
    };

    if (!shouldShow()) {
        return null; // El silencio es la mejor respuesta
    }

    // Dynamic Text Generation based on Tier
    const getInsightText = () => {
        // Level 1: Guest (Simple observation)
        const base = `En el segmento <b>${region} (${age})</b>, la señal en <b>${category}</b> muestra un <b>${dir}</b> <b>${intensity}</b> (${sign}${deltaPts.toFixed(1)} pts).`;

        if (tier === 'guest') return base;

        // Level 2: Registered (Interpretation)
        const drivers = ` Este movimiento en los últimos <b>${windowLabel}</b> es impulsado por <b>${driversTop2[0]}</b> y <b>${driversTop2[1]}</b>.`;

        if (tier === 'verified_basic') return base + drivers;

        // Level 3: Verified (Systemic Context)
        const context = ` La <b>volatilidad ${volatility.toLowerCase()}</b> sugiere una consolidación del patrón, cruzando datos de comportamiento histórico para este perfil.`;

        return base + drivers + context;
    };


    return (
        <div className="mb-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-[15px] font-black text-ink mb-3 flex items-center gap-2 tracking-tight">
                <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
                Análisis Automático
            </h3>
            <section className="card p-4 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-primary/25 bg-slate-50 font-extrabold text-[11px] text-ink tracking-tight">
                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                            INSIGHT AUTOMÁTICO
                        </div>

                        <p className="mt-3 text-[14px] leading-relaxed text-ink font-extrabold max-w-[90ch]" dangerouslySetInnerHTML={{ __html: getInsightText() }} />
                    </div>

                    <div className="flex gap-2.5 flex-wrap items-center">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-100 bg-slate-50 font-extrabold text-[11px] text-muted2 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            Base: {sampleN.toLocaleString("es-CL")}
                        </span>
                        {tier !== 'guest' && (
                            <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-100 bg-slate-50 font-extrabold text-[11px] text-muted2 whitespace-nowrap">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                Confianza: {confidence}
                            </span>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

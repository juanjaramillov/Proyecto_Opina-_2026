import { Award, Shield, Activity, Layers, Target, AlertTriangle } from "lucide-react";
import {
    B2BEligibility,
    SegmentInfluence,
    DepthInsight,
    TemporalComparison,
} from "../../../signals/services/insightsService";

interface Props {
    b2bEligibility: B2BEligibility | null | undefined;
    segmentInfluence: SegmentInfluence[];
    depthInsights: DepthInsight[];
    temporalComparison: TemporalComparison[];
}

/**
 * Renderiza los 6 índices compuestos del Marco Metodológico + OpinaScore v1.
 * Todos los valores se DERIVAN de B2BEligibility (que ya calcula opinascore_value,
 * integrity_score, entropy_normalized, n_eff en el backend) + heurísticos sobre
 * SegmentInfluence / DepthInsights / TemporalComparison.
 *
 * Marco metodológico: Convicción / Fragilidad / Coherencia / Sensibilidad /
 * Calidad de Evidencia / Decisión Real + OpinaScore.
 */
export function B2BCompositeIndicesCard({
    b2bEligibility,
    segmentInfluence,
    depthInsights,
    temporalComparison,
}: Props) {
    if (!b2bEligibility) {
        return (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Índices Compuestos
                    </span>
                </div>
                <p className="text-xs font-medium text-slate-400 italic">
                    Aún no hay suficientes señales para calcular los índices compuestos. Se requieren más comparaciones para activar OpinaScore.
                </p>
            </div>
        );
    }

    // Derivaciones de los 6 compuestos del marco
    const opinascore = b2bEligibility.opinascore_value || 0;
    const integrity = b2bEligibility.integrity_score || 0;
    const entropy = b2bEligibility.entropy_normalized || 0;
    const nEff = b2bEligibility.n_eff || 0;

    // Convicción: qué tan fuerte es el score, ponderado por integridad y muestra
    const conviccion = Math.min(100, Math.round(opinascore * integrity * Math.min(1, nEff / 100)));

    // Fragilidad: inverso de integridad, amplificado por entropy alta y muestra baja
    const fragilidad = Math.min(100, Math.round((100 - integrity) + entropy * 20 + Math.max(0, 50 - nEff)));

    // Coherencia cross-módulo: consistencia de la tendencia (variation_percent estable entre opciones)
    const coherencia = (() => {
        if (temporalComparison.length < 2) return null;
        const variations = temporalComparison.map(t => Math.abs(t.variation_percent || 0));
        const mean = variations.reduce((a, b) => a + b, 0) / variations.length;
        const variance = variations.reduce((a, b) => a + (b - mean) ** 2, 0) / variations.length;
        return Math.max(0, Math.round(100 - Math.sqrt(variance)));
    })();

    // Sensibilidad Contextual: dispersión de impacto por segmento (mayor dispersión = mayor sensibilidad)
    const sensibilidad = (() => {
        if (segmentInfluence.length === 0) return null;
        const impacts = segmentInfluence.map(s => s.contribution_percent || 0);
        const max = Math.max(...impacts);
        const min = Math.min(...impacts);
        return Math.min(100, Math.round((max - min) * 2));
    })();

    // Calidad de Evidencia: muestra efectiva ponderada por integridad
    const calidadEvidencia = Math.min(100, Math.round(Math.min(100, nEff / 2) * (integrity / 100)));

    // Traducción a Decisión Real: directo del eligibility_status del backend
    const decisionRealLabel =
        b2bEligibility.eligibility_status === "PUBLISHABLE"
            ? "Lista para decisión"
            : b2bEligibility.eligibility_status === "EXPLORATORY"
                ? "Exploratorio"
                : "Solo interno";
    const decisionRealColor =
        b2bEligibility.eligibility_status === "PUBLISHABLE"
            ? "text-accent-600 bg-accent-50 border-accent-200"
            : b2bEligibility.eligibility_status === "EXPLORATORY"
                ? "text-warning-600 bg-warning-50 border-warning-200"
                : "text-slate-500 bg-slate-100 border-slate-200";

    const indices = [
        { key: "conviccion", label: "Convicción", value: conviccion, max: 100, icon: Award, color: "text-brand-600", desc: "Fuerza del score ponderada por muestra e integridad." },
        { key: "fragilidad", label: "Fragilidad", value: fragilidad, max: 100, icon: AlertTriangle, color: "text-danger-500", desc: "Inversa de integridad, amplificada por entropy alta o muestra baja.", invert: true },
        { key: "coherencia", label: "Coherencia", value: coherencia, max: 100, icon: Layers, color: "text-accent-600", desc: "Consistencia de la tendencia entre las opciones del módulo." },
        { key: "sensibilidad", label: "Sensibilidad Contextual", value: sensibilidad, max: 100, icon: Target, color: "text-brand-500", desc: "Cuánto cambia el score entre segmentos demográficos." },
        { key: "calidad", label: "Calidad de Evidencia", value: calidadEvidencia, max: 100, icon: Shield, color: "text-accent", desc: "Tamaño efectivo de muestra × integridad." },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                        Índices Compuestos
                    </h4>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded-md">
                    Marco metodológico
                </span>
            </div>

            {/* Top: OpinaScore destacado */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-brand-900 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 p-4">
                    <Award className="w-20 h-20" />
                </div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-200">OpinaScore v1</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white uppercase tracking-tight">
                        {b2bEligibility.opinascore_context || "general"}
                    </span>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-5xl font-black tracking-tighter">{Math.round(opinascore)}</span>
                    <span className="text-sm font-bold text-brand-200">/ 100</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest font-bold relative z-10">
                    <span className="px-2 py-1 bg-white/10 rounded-full">
                        n_eff {Math.round(nEff)}
                    </span>
                    <span className="px-2 py-1 bg-white/10 rounded-full">
                        Integridad {Math.round(integrity)}%
                    </span>
                    <span className={`px-2 py-1 rounded-full border ${decisionRealColor}`}>
                        {decisionRealLabel}
                    </span>
                </div>
            </div>

            {/* Grid de 5 compuestos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {indices.map(idx => {
                    const Icon = idx.icon;
                    const display = idx.value == null ? "—" : `${idx.value}`;
                    const pct = idx.value == null ? 0 : Math.min(100, idx.value);
                    return (
                        <div key={idx.key} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-3.5 h-3.5 ${idx.color}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                        {idx.label}
                                    </span>
                                </div>
                                <span className="text-base font-black text-slate-900 tracking-tight">{display}</span>
                            </div>
                            <div className="w-full bg-slate-200/70 rounded-full h-1 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${idx.invert ? "bg-danger-400" : "bg-brand-400"}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 leading-snug">{idx.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <p className="text-[10px] text-slate-400 mt-5 leading-relaxed italic">
                Composición derivada del estado actual del backend (opinascore_value, integrity_score, entropy_normalized) + heurísticos sobre la dispersión por segmento y módulo. Para uso analítico interno.
            </p>

            {/* Bridge contextual cuando hay depth data */}
            {depthInsights.length > 0 && (
                <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-xl">
                    <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-1">
                        Profundidad detectada
                    </p>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        Se cuenta con {depthInsights.reduce((a, b) => a + b.total_responses, 0)} respuestas analíticas para estabilizar la coherencia cross-módulo.
                    </p>
                </div>
            )}
        </div>
    );
}

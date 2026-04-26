/**
 * Narrative Engine B2B (DEBT-003 cierre · Fase 4.4)
 *
 * Motor narrativo determinístico sobre `IntelligenceBenchmarkEntry`. Reemplaza
 * el stub `setEntityNarrative(null)` que vivía en `useBenchmarkB2BState` y las
 * plantillas in-line que vivían en `reportsHelpers.buildReportContent`.
 *
 * ## Por qué rule-based y no LLM
 *
 * 1. **Reproducibilidad**: para un mismo snapshot, el texto siempre es el mismo.
 *    Un comprador B2B que exporta un reporte hoy y mañana no puede ver
 *    narrativas distintas sobre los mismos números — eso lee como "inventado".
 * 2. **Auditabilidad**: cada frase se puede trazar a una clasificación y un
 *    template. No hay alucinación posible sobre métricas que no existen.
 * 3. **Sin dependencia externa**: no requiere API keys, no cuenta tokens,
 *    no degrada si un proveedor cae. Cero latencia.
 * 4. **Testable**: cada categoría tiene tests de frontera y anti-regresión.
 *
 * Cuando exista presupuesto para un LLM, este motor sigue sirviendo como
 * fallback determinístico + como dataset de "ground truth" para evaluar
 * outputs generativos contra reglas duras.
 *
 * ## Contrato de categorías
 *
 * La función `classifyEntity` devuelve exactamente una de 8 categorías,
 * evaluadas en orden (primera que matchea gana). Una entrada nunca produce
 * clasificación ambigua: la prioridad está documentada en el código.
 *
 * - `insufficient_sample`: nEff < 30 o stabilityLabel === 'insuficiente'.
 * - `market_dominator`: rank 1 && marginVsSecond >= 0.10 && stability estable.
 * - `contested_leader`: rank 1 && marginVsSecond < 0.10 (margen ajustado).
 * - `rising_challenger`: rank > 1 && stability 'en_aceleración'.
 * - `falling_incumbent`: rank <= 3 && stability 'en_caída'.
 * - `volatile_player`: stability 'volátil'.
 * - `stable_challenger`: rank 2-5 && stability 'estable' && no matches anteriores.
 * - `fringe`: default (rank > 5 sin tracción clara).
 *
 * ## Confianza
 *
 * `computeConfidence` usa ancho del Wilson CI + nEff:
 * - `Alta`: nEff >= 150 y (upper - lower) < 0.10
 * - `Media`: nEff >= 60 y (upper - lower) < 0.20
 * - `Baja`: resto
 */

import type { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import type { BenchmarkSystemNarrative } from "../hooks/useBenchmarkB2BState";

export type NarrativeCategory =
    | "insufficient_sample"
    | "market_dominator"
    | "contested_leader"
    | "rising_challenger"
    | "falling_incumbent"
    | "volatile_player"
    | "stable_challenger"
    | "fringe";

export type NarrativeConfidence = "Alta" | "Media" | "Baja";

/** Umbral absoluto de nEff por debajo del cual no emitimos narrativa. */
export const INSUFFICIENT_NEFF = 30;

/** Margen mínimo (en puntos porcentuales) para considerar liderazgo "dominante". */
export const DOMINANT_MARGIN = 0.10;

/**
 * Clasifica una entrada del benchmark en una categoría narrativa determinística.
 * Evalúa reglas en orden; la primera que matchea gana.
 */
export function classifyEntity(entry: IntelligenceBenchmarkEntry): NarrativeCategory {
    // 1. Muestra insuficiente manda sobre todo lo demás
    if (entry.nEff < INSUFFICIENT_NEFF || entry.stabilityLabel === "insuficiente") {
        return "insufficient_sample";
    }

    // 2. Liderazgos (rank === 1)
    if (entry.leaderRank === 1) {
        if (entry.marginVsSecond >= DOMINANT_MARGIN && entry.stabilityLabel === "estable") {
            return "market_dominator";
        }
        return "contested_leader";
    }

    // 3. Momentum (aceleración / caída) — aplican aun fuera del top
    if (entry.stabilityLabel === "en_aceleración") {
        return "rising_challenger";
    }
    if (entry.stabilityLabel === "en_caída" && entry.leaderRank <= 3) {
        return "falling_incumbent";
    }

    // 4. Volatilidad
    if (entry.stabilityLabel === "volátil") {
        return "volatile_player";
    }

    // 5. Retadores estables en top 5
    if (entry.leaderRank <= 5 && entry.stabilityLabel === "estable") {
        return "stable_challenger";
    }

    // 6. Fringe (fuera del top, sin momentum destacado)
    return "fringe";
}

/**
 * Calcula confianza observacional sobre Wilson CI + nEff.
 * Independiente de la categoría: una entidad puede ser `fringe` con confianza
 * Alta (muchas señales, poca tracción) o `market_dominator` con confianza Baja
 * (pocas señales, margen aparente pero frágil).
 */
export function computeConfidence(entry: IntelligenceBenchmarkEntry): NarrativeConfidence {
    const ciWidth = entry.wilsonUpperBound - entry.wilsonLowerBound;
    if (entry.nEff >= 150 && ciWidth < 0.10) return "Alta";
    if (entry.nEff >= 60 && ciWidth < 0.20) return "Media";
    return "Baja";
}

/** Traduce la categoría a la etiqueta corta que la UI muestra junto a la narrativa. */
function categoryShortLabel(category: NarrativeCategory): string {
    switch (category) {
        case "market_dominator": return "Dominador";
        case "contested_leader": return "Líder Disputado";
        case "rising_challenger": return "Retador en Aceleración";
        case "falling_incumbent": return "Líder en Caída";
        case "volatile_player": return "Jugador Volátil";
        case "stable_challenger": return "Retador Estable";
        case "fringe": return "Fringe";
        case "insufficient_sample": return "Muestra Insuficiente";
    }
}

/**
 * Genera el cuerpo narrativo para una categoría + entrada. Cada template
 * interpola SÓLO métricas presentes en la entrada; si falta un valor
 * relevante (e.g. marginVsSecond para un rank > 1), se omite la frase.
 */
function buildNarrativeText(
    category: NarrativeCategory,
    entry: IntelligenceBenchmarkEntry
): string {
    const preferencePct = (entry.weightedPreferenceShare * 100).toFixed(1);
    const winPct = (entry.weightedWinRate * 100).toFixed(1);
    const marginPct = (entry.marginVsSecond * 100).toFixed(1);
    const n = entry.nEff.toFixed(0);
    const rank = entry.leaderRank;

    switch (category) {
        case "insufficient_sample":
            return `${entry.entityName} no tiene aún masa crítica para inferencia confiable: ${n} señales efectivas bajo el umbral de ${INSUFFICIENT_NEFF}. Los valores observados (${preferencePct}% preferencia, ${winPct}% win rate) son indicativos, no concluyentes. Priorizar captura antes de decidir táctica.`;

        case "market_dominator":
            return `${entry.entityName} lidera el mercado con ${preferencePct}% de preferencia y ${marginPct} pp sobre el segundo — posición consolidada y estable. Win rate de ${winPct}% confirma que la preferencia se traduce en victorias 1v1 reales, no sólo en visibilidad. Estrategia sugerida: defender margen, no reabrir posicionamiento.`;

        case "contested_leader":
            return `${entry.entityName} mantiene el #1 disputado con ${preferencePct}% de preferencia, pero el margen sobre el segundo es ${marginPct} pp — estadísticamente defendible sólo si se sostienen los drivers actuales. Win rate ${winPct}% señala competencia dura en los match-ups directos. Riesgo: un evento de marca del retador podría mover el orden en una ventana corta.`;

        case "rising_challenger":
            return `${entry.entityName} está en aceleración desde el rank ${rank} con ${preferencePct}% de preferencia (${winPct}% win rate en enfrentamientos directos). El gradiente es positivo sobre ${n} señales; la probabilidad de escalada al top 3 en la próxima ventana es material. Evaluar respuestas tácticas del incumbente antes de que el momentum se normalice.`;

        case "falling_incumbent":
            return `${entry.entityName} (rank ${rank}) muestra trayectoria descendente con preferencia ${preferencePct}% y win rate ${winPct}% — el momentum negativo es el hallazgo dominante sobre ${n} señales. La posición nominal sigue alta pero no refleja la dinámica actual. Prioridad: diagnosticar causas de fuga antes de que el rank se ajuste.`;

        case "volatile_player":
            return `${entry.entityName} opera en régimen volátil: preferencia ${preferencePct}% y win rate ${winPct}% varían entre ventanas con magnitud mayor a la de sus pares. ${n} señales observadas. La volatilidad puede venir de campañas puntuales o base fiel pequeña; revisar consistencia por segmento antes de firmar narrativa comercial.`;

        case "stable_challenger":
            return `${entry.entityName} ocupa el rank ${rank} de forma estable, con ${preferencePct}% de preferencia y ${winPct}% de win rate. Sin aceleración ni deterioro material sobre ${n} señales. Perfil apto para oferta comercial estándar: predecible, auditable, sin sorpresas esperables en el horizonte corto.`;

        case "fringe":
            return `${entry.entityName} se ubica en el rank ${rank} con ${preferencePct}% de preferencia sobre ${n} señales. Sin momentum destacado. Posición consistente con cuota marginal en la categoría; la narrativa para este nivel suele tener poco valor táctico hasta que surja aceleración o caída.`;
    }
}

/**
 * API pública del motor: produce un `BenchmarkSystemNarrative` listo para
 * consumir por `BenchmarkB2BDeepDivePanel` o `ReportsB2BDocument`.
 */
export function generateEntityNarrative(entry: IntelligenceBenchmarkEntry): BenchmarkSystemNarrative {
    const category = classifyEntity(entry);
    const confidence = computeConfidence(entry);
    const intelligenceText = buildNarrativeText(category, entry);
    return {
        intelligenceText,
        confidence,
        category: categoryShortLabel(category),
        backingMetrics: {
            // `deltaPercentage` expresado en pp — calculado desde marginVsSecond
            // para líderes, entropyNormalized como proxy de volatilidad para el
            // resto. Mantenemos la semántica del campo original (delta %) para
            // no romper el consumidor de Hard Metrics en el panel.
            deltaPercentage: entry.leaderRank === 1
                ? Number((entry.marginVsSecond * 100).toFixed(1))
                : Number(((1 - entry.entropyNormalized) * 100).toFixed(1)),
        },
    };
}

/**
 * Resumen narrativo de mercado para reportes ejecutivos. Toma todas las
 * entradas elegibles comercialmente (premium o standard) y arma las 4 piezas
 * que necesita `ReportContent`: summary, findings, alert, recommendation.
 * Esta función reemplaza a la interpolación que vivía en `reportsHelpers`.
 */
export interface MarketNarrativeInput {
    entries: IntelligenceBenchmarkEntry[];
    highAlertMessage: string | null;
}

export interface MarketNarrativeOutput {
    summary: string;
    findings: string[];
    criticalAlert: string;
    strategicRecommendation: string;
}

export function generateMarketNarrative(input: MarketNarrativeInput): MarketNarrativeOutput {
    const eligible = input.entries.filter(
        e => e.commercialEligibilityLabel === "premium_export_ready" ||
             e.commercialEligibilityLabel === "standard_ready"
    );
    const leader = eligible.find(e => e.leaderRank === 1) || eligible[0] || null;
    const rising = eligible.find(e => e.stabilityLabel === "en_aceleración");
    const falling = eligible.find(e => e.stabilityLabel === "en_caída");

    let summary: string;
    if (!leader) {
        summary = "El universo analizado no tiene todavía una entidad elegible para exportación comercial. La dinámica está distribuida sin un claro ganador con masa crítica suficiente para respaldar un claim de liderazgo.";
    } else {
        const leaderCategory = classifyEntity(leader);
        if (leaderCategory === "market_dominator") {
            summary = `El mercado tiene un líder consolidado: ${leader.entityName} (${(leader.weightedPreferenceShare * 100).toFixed(1)}% preferencia, +${(leader.marginVsSecond * 100).toFixed(1)} pp sobre el segundo). La distancia es suficiente para sostener estrategia defensiva sin reapertura de posicionamiento.`;
        } else if (leaderCategory === "contested_leader") {
            summary = `El mercado tiene un #1 disputado: ${leader.entityName} lidera con ${(leader.weightedPreferenceShare * 100).toFixed(1)}% pero el margen sobre el segundo es apenas ${(leader.marginVsSecond * 100).toFixed(1)} pp — orden reversible en una ventana corta ante cualquier shock de marca del retador.`;
        } else {
            summary = `${leader.entityName} figura en #1 con ${(leader.weightedPreferenceShare * 100).toFixed(1)}% de preferencia, clasificado como "${categoryShortLabel(leaderCategory)}". El liderazgo existe pero no es la pieza dominante del análisis — la lectura debe centrarse en momentum y retadores.`;
        }
    }

    const findings = eligible
        .slice(0, 3)
        .map(e => {
            const cat = classifyEntity(e);
            return `${e.entityName} (rank ${e.leaderRank}, "${categoryShortLabel(cat)}") — ${(e.weightedPreferenceShare * 100).toFixed(1)}% preferencia sobre ${e.nEff.toFixed(0)} señales. Elegibilidad: ${e.commercialEligibilityLabel.replace(/_/g, " ")}.`;
        });

    const criticalAlert = input.highAlertMessage
        ?? "No se detectan fugas de lealtad críticas ni pérdidas de momentum severas en el universo analizado durante la ventana observada.";

    let strategicRecommendation: string;
    if (rising) {
        strategicRecommendation = `Oportunidad Táctica: ${rising.entityName} muestra aceleración material (rank ${rising.leaderRank}, ${(rising.weightedPreferenceShare * 100).toFixed(1)}% preferencia). Evaluar respuesta competitiva o alianza antes de que el momentum se normalice.`;
    } else if (falling) {
        strategicRecommendation = `Señal de Riesgo: ${falling.entityName} está en caída medible (rank ${falling.leaderRank}, ${(falling.weightedPreferenceShare * 100).toFixed(1)}% preferencia). Si es una entidad aliada o bajo análisis, priorizar diagnóstico de causas.`;
    } else if (leader) {
        strategicRecommendation = `Mantener disciplina sobre ${leader.entityName}: no hay retador en aceleración clara ni momentum negativo en el top elegible. Consolidar drivers existentes en lugar de reabrir narrativa.`;
    } else {
        strategicRecommendation = "Se requiere mayor flujo de señales elegibles para emitir una recomendación estratégica sólida. La prioridad es ampliar captura, no optimizar sobre una muestra que no resiste decisiones c-level.";
    }

    return { summary, findings, criticalAlert, strategicRecommendation };
}

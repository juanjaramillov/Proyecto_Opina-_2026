import { describe, it, expect } from "vitest";
import type { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import {
    classifyEntity,
    computeConfidence,
    generateEntityNarrative,
    generateMarketNarrative,
    INSUFFICIENT_NEFF,
    DOMINANT_MARGIN,
} from "./narrativeEngine";

/**
 * Helper: construye una entry canónica con valores neutrales, y permite
 * overrides parciales. Evita copiar 11 campos en cada test.
 */
function makeEntry(overrides: Partial<IntelligenceBenchmarkEntry> = {}): IntelligenceBenchmarkEntry {
    return {
        entityId: "ent_1",
        entityName: "Acme",
        leaderRank: 1,
        weightedPreferenceShare: 0.35,
        weightedWinRate: 0.55,
        marginVsSecond: 0.15,
        nEff: 200,
        wilsonLowerBound: 0.32,
        wilsonUpperBound: 0.38,
        entropyNormalized: 0.45,
        stabilityLabel: "estable",
        commercialEligibilityLabel: "premium_export_ready",
        ...overrides,
    };
}

describe("narrativeEngine · classifyEntity", () => {
    it("insufficient_sample cuando nEff < umbral", () => {
        expect(classifyEntity(makeEntry({ nEff: INSUFFICIENT_NEFF - 1 }))).toBe("insufficient_sample");
    });

    it("insufficient_sample cuando stabilityLabel === 'insuficiente', aunque nEff sea alto", () => {
        expect(classifyEntity(makeEntry({ nEff: 500, stabilityLabel: "insuficiente" }))).toBe("insufficient_sample");
    });

    it("market_dominator: rank 1 + margen ≥ umbral + estable", () => {
        const entry = makeEntry({ leaderRank: 1, marginVsSecond: DOMINANT_MARGIN, stabilityLabel: "estable" });
        expect(classifyEntity(entry)).toBe("market_dominator");
    });

    it("contested_leader: rank 1 pero margen < umbral", () => {
        const entry = makeEntry({ leaderRank: 1, marginVsSecond: DOMINANT_MARGIN - 0.01 });
        expect(classifyEntity(entry)).toBe("contested_leader");
    });

    it("contested_leader: rank 1 con margen alto pero stability volátil (no gana market_dominator)", () => {
        const entry = makeEntry({ leaderRank: 1, marginVsSecond: 0.25, stabilityLabel: "volátil" });
        expect(classifyEntity(entry)).toBe("contested_leader");
    });

    it("rising_challenger: rank > 1 + stability 'en_aceleración'", () => {
        expect(classifyEntity(makeEntry({ leaderRank: 3, stabilityLabel: "en_aceleración" }))).toBe("rising_challenger");
    });

    it("falling_incumbent: rank <= 3 + stability 'en_caída'", () => {
        expect(classifyEntity(makeEntry({ leaderRank: 2, stabilityLabel: "en_caída" }))).toBe("falling_incumbent");
    });

    it("en_caída fuera del top 3 NO es falling_incumbent (cae a fringe o volatile)", () => {
        const entry = makeEntry({ leaderRank: 10, stabilityLabel: "en_caída" });
        // `en_caída` no es 'volátil' ni 'estable', así que cae a fringe.
        expect(classifyEntity(entry)).toBe("fringe");
    });

    it("volatile_player: stability 'volátil' fuera del rank 1", () => {
        expect(classifyEntity(makeEntry({ leaderRank: 4, stabilityLabel: "volátil" }))).toBe("volatile_player");
    });

    it("stable_challenger: rank 2-5, estable, sin momentum", () => {
        expect(classifyEntity(makeEntry({ leaderRank: 3, stabilityLabel: "estable" }))).toBe("stable_challenger");
    });

    it("fringe: rank > 5, estable", () => {
        expect(classifyEntity(makeEntry({ leaderRank: 12, stabilityLabel: "estable" }))).toBe("fringe");
    });
});

describe("narrativeEngine · computeConfidence", () => {
    it("Alta cuando nEff >= 150 y CI width < 0.10", () => {
        const entry = makeEntry({ nEff: 200, wilsonLowerBound: 0.32, wilsonUpperBound: 0.38 });
        expect(computeConfidence(entry)).toBe("Alta");
    });

    it("Media cuando nEff >= 60 y CI width < 0.20 (pero no Alta)", () => {
        const entry = makeEntry({ nEff: 80, wilsonLowerBound: 0.30, wilsonUpperBound: 0.45 });
        expect(computeConfidence(entry)).toBe("Media");
    });

    it("Baja cuando nEff < 60", () => {
        const entry = makeEntry({ nEff: 50, wilsonLowerBound: 0.20, wilsonUpperBound: 0.60 });
        expect(computeConfidence(entry)).toBe("Baja");
    });

    it("Baja cuando CI es ancho aunque nEff sea alto", () => {
        const entry = makeEntry({ nEff: 500, wilsonLowerBound: 0.10, wilsonUpperBound: 0.70 });
        expect(computeConfidence(entry)).toBe("Baja");
    });
});

describe("narrativeEngine · generateEntityNarrative", () => {
    it("market_dominator menciona margen y estabilidad", () => {
        const entry = makeEntry({ leaderRank: 1, marginVsSecond: 0.18, stabilityLabel: "estable" });
        const out = generateEntityNarrative(entry);
        expect(out.category).toBe("Dominador");
        expect(out.intelligenceText).toContain("lidera el mercado");
        expect(out.intelligenceText).toContain("18.0 pp");
        // deltaPercentage para líderes es marginVsSecond * 100
        expect(out.backingMetrics?.deltaPercentage).toBe(18.0);
    });

    it("contested_leader habla de orden reversible", () => {
        const entry = makeEntry({ leaderRank: 1, marginVsSecond: 0.03 });
        const out = generateEntityNarrative(entry);
        expect(out.category).toBe("Líder Disputado");
        expect(out.intelligenceText).toContain("disputado");
    });

    it("rising_challenger menciona aceleración", () => {
        const entry = makeEntry({ leaderRank: 4, stabilityLabel: "en_aceleración" });
        const out = generateEntityNarrative(entry);
        expect(out.category).toBe("Retador en Aceleración");
        expect(out.intelligenceText).toContain("aceleración");
    });

    it("insufficient_sample no hace promesas — menciona el umbral", () => {
        const entry = makeEntry({ nEff: 10 });
        const out = generateEntityNarrative(entry);
        expect(out.category).toBe("Muestra Insuficiente");
        expect(out.intelligenceText).toContain("no tiene aún masa crítica");
        expect(out.intelligenceText).toContain(`umbral de ${INSUFFICIENT_NEFF}`);
    });

    it("confidence se agrega independiente de la categoría", () => {
        const entry = makeEntry({ leaderRank: 8, nEff: 40, wilsonLowerBound: 0.15, wilsonUpperBound: 0.55 });
        const out = generateEntityNarrative(entry);
        expect(out.category).toBe("Fringe");
        expect(out.confidence).toBe("Baja");
    });
});

describe("narrativeEngine · generateMarketNarrative", () => {
    it("sin líder elegible devuelve narrativa de 'sin ganador claro'", () => {
        const out = generateMarketNarrative({
            entries: [
                makeEntry({ commercialEligibilityLabel: "internal_only" }),
            ],
            highAlertMessage: null,
        });
        expect(out.summary).toContain("no tiene todavía una entidad elegible");
        expect(out.strategicRecommendation).toContain("ampliar captura");
    });

    it("con market_dominator el summary reporta liderazgo consolidado", () => {
        const out = generateMarketNarrative({
            entries: [
                makeEntry({ entityName: "Alpha", leaderRank: 1, marginVsSecond: 0.20, stabilityLabel: "estable" }),
                makeEntry({ entityName: "Beta", leaderRank: 2, weightedPreferenceShare: 0.15, stabilityLabel: "estable" }),
            ],
            highAlertMessage: null,
        });
        expect(out.summary).toContain("líder consolidado");
        expect(out.summary).toContain("Alpha");
        expect(out.findings).toHaveLength(2);
    });

    it("con retador en aceleración la recomendación destaca oportunidad táctica", () => {
        const out = generateMarketNarrative({
            entries: [
                makeEntry({ entityName: "Alpha", leaderRank: 1, stabilityLabel: "estable", marginVsSecond: 0.15 }),
                makeEntry({ entityName: "Gamma", leaderRank: 2, stabilityLabel: "en_aceleración", weightedPreferenceShare: 0.22 }),
            ],
            highAlertMessage: null,
        });
        expect(out.strategicRecommendation).toContain("Oportunidad Táctica");
        expect(out.strategicRecommendation).toContain("Gamma");
    });

    it("con entidad en caída la recomendación la reporta como señal de riesgo", () => {
        const out = generateMarketNarrative({
            entries: [
                makeEntry({ entityName: "Alpha", leaderRank: 1, stabilityLabel: "estable" }),
                makeEntry({ entityName: "Delta", leaderRank: 2, stabilityLabel: "en_caída" }),
            ],
            highAlertMessage: null,
        });
        expect(out.strategicRecommendation).toContain("Señal de Riesgo");
        expect(out.strategicRecommendation).toContain("Delta");
    });

    it("alerta alta se propaga tal cual (no se reescribe)", () => {
        const out = generateMarketNarrative({
            entries: [makeEntry()],
            highAlertMessage: "Fuga de lealtad severa en segmento Premium urbano.",
        });
        expect(out.criticalAlert).toBe("Fuga de lealtad severa en segmento Premium urbano.");
    });

    it("sin alerta alta se entrega un fallback honesto", () => {
        const out = generateMarketNarrative({
            entries: [makeEntry()],
            highAlertMessage: null,
        });
        expect(out.criticalAlert).toContain("No se detectan fugas de lealtad críticas");
    });

    it("findings respeta corte en top 3 aunque haya más elegibles", () => {
        const entries = Array.from({ length: 7 }, (_, i) =>
            makeEntry({ entityName: `E${i}`, entityId: `e${i}`, leaderRank: i + 1 })
        );
        const out = generateMarketNarrative({ entries, highAlertMessage: null });
        expect(out.findings).toHaveLength(3);
    });
});

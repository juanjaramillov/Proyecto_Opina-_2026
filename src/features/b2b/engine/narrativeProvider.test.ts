import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import type { BenchmarkSystemNarrative } from "../hooks/useBenchmarkB2BState";
import {
    DefaultNarrativeProvider,
    getNarrativeProvider,
    setNarrativeProvider,
    resetNarrativeProvider,
    type NarrativeProvider,
} from "./narrativeProvider";
import type { MarketNarrativeInput, MarketNarrativeOutput } from "./narrativeEngine";

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

describe("narrativeProvider · default behavior", () => {
    afterEach(() => {
        resetNarrativeProvider();
    });

    it("getNarrativeProvider devuelve el default al inicio", () => {
        expect(getNarrativeProvider().name).toBe("rule-based-v1");
    });

    it("DefaultNarrativeProvider.generateEntityNarrative devuelve narrativa del rule-based", async () => {
        const entry = makeEntry({ leaderRank: 1, marginVsSecond: 0.20, stabilityLabel: "estable" });
        const narrative = await DefaultNarrativeProvider.generateEntityNarrative(entry);
        expect(narrative.category).toBe("Dominador");
        expect(narrative.intelligenceText).toContain("lidera el mercado");
    });

    it("DefaultNarrativeProvider.generateMarketNarrative devuelve los 4 bloques", async () => {
        const out = await DefaultNarrativeProvider.generateMarketNarrative({
            entries: [makeEntry()],
            highAlertMessage: null,
        });
        expect(out).toHaveProperty("summary");
        expect(out).toHaveProperty("findings");
        expect(out).toHaveProperty("criticalAlert");
        expect(out).toHaveProperty("strategicRecommendation");
    });
});

describe("narrativeProvider · swap injection", () => {
    beforeEach(() => {
        resetNarrativeProvider();
    });
    afterEach(() => {
        resetNarrativeProvider();
    });

    it("setNarrativeProvider cambia el provider activo", () => {
        const mock: NarrativeProvider = {
            name: "mock-llm",
            generateEntityNarrative: vi.fn(),
            generateMarketNarrative: vi.fn(),
        };
        setNarrativeProvider(mock);
        expect(getNarrativeProvider().name).toBe("mock-llm");
    });

    it("un provider inyectado recibe las llamadas, no el default", async () => {
        const fakeNarrative: BenchmarkSystemNarrative = {
            intelligenceText: "llm output",
            confidence: "Alta",
            category: "Inventada",
        };
        const mock: NarrativeProvider = {
            name: "mock-llm",
            generateEntityNarrative: vi.fn().mockResolvedValue(fakeNarrative),
            generateMarketNarrative: vi.fn(),
        };
        setNarrativeProvider(mock);

        const result = await getNarrativeProvider().generateEntityNarrative(makeEntry());
        expect(result.intelligenceText).toBe("llm output");
        expect(mock.generateEntityNarrative).toHaveBeenCalledTimes(1);
    });

    it("resetNarrativeProvider restaura el default", () => {
        setNarrativeProvider({
            name: "custom",
            generateEntityNarrative: vi.fn(),
            generateMarketNarrative: vi.fn(),
        });
        resetNarrativeProvider();
        expect(getNarrativeProvider().name).toBe("rule-based-v1");
    });

    it("provider async con latencia no rompe el contrato — el consumidor hace await", async () => {
        const fakeNarrative: BenchmarkSystemNarrative = {
            intelligenceText: "delayed",
            confidence: "Media",
            category: "Retador en Aceleración",
        };
        const slowProvider: NarrativeProvider = {
            name: "slow-llm",
            generateEntityNarrative: () => new Promise((resolve) => setTimeout(() => resolve(fakeNarrative), 10)),
            generateMarketNarrative: (_input: MarketNarrativeInput): Promise<MarketNarrativeOutput> =>
                Promise.resolve({
                    summary: "s", findings: [], criticalAlert: "c", strategicRecommendation: "r"
                }),
        };
        setNarrativeProvider(slowProvider);

        const result = await getNarrativeProvider().generateEntityNarrative(makeEntry());
        expect(result.intelligenceText).toBe("delayed");
    });

    it("provider custom puede delegar a DefaultNarrativeProvider como fallback", async () => {
        // Patrón recomendado para un LLMNarrativeProvider: intentar su lógica,
        // cazar error, y devolver el rule-based.
        const failingLLM: NarrativeProvider = {
            name: "llm-with-fallback",
            generateEntityNarrative: async (entry) => {
                try {
                    throw new Error("LLM timeout");
                } catch {
                    return DefaultNarrativeProvider.generateEntityNarrative(entry);
                }
            },
            generateMarketNarrative: async (input) =>
                DefaultNarrativeProvider.generateMarketNarrative(input),
        };
        setNarrativeProvider(failingLLM);

        const entry = makeEntry({ leaderRank: 1, marginVsSecond: 0.18 });
        const result = await getNarrativeProvider().generateEntityNarrative(entry);
        expect(result.category).toBe("Dominador"); // Vino del fallback rule-based
    });
});

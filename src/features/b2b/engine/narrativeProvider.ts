/**
 * Narrative Provider Abstraction (Fase 5.1)
 *
 * Esta capa deja listo el proyecto para que sumar un LLM al motor narrativo B2B
 * sea **reemplazar un provider, no reescribir consumidores**. El contrato es:
 *
 *   1. `NarrativeProvider` expone exactamente las dos funciones que hoy
 *      consume la app (`generateEntityNarrative`, `generateMarketNarrative`).
 *   2. `DefaultNarrativeProvider` implementa esas dos funciones sobre el motor
 *      rule-based que vive en `narrativeEngine.ts`. Es síncrono, determinístico,
 *      auditable, sin dependencia externa.
 *   3. `getNarrativeProvider()` es la factoría que consumen los callers. Hoy
 *      devuelve siempre el default. Mañana puede resolver según un flag de
 *      configuración (p.ej. `VITE_NARRATIVE_PROVIDER=llm`).
 *   4. `setNarrativeProvider(custom)` permite inyectar un provider alternativo
 *      en tests o cuando se agregue un `LLMNarrativeProvider`.
 *
 * ## Por qué esta forma
 *
 * - **No rompe callers**: los dos consumidores (`useBenchmarkB2BState` y
 *   `reportsHelpers`) siguen viendo funciones con la misma firma. El swap
 *   ocurre en una sola capa.
 * - **Admite proveedores asíncronos**: las firmas devuelven Promise. El
 *   provider rule-based resuelve inmediatamente vía `Promise.resolve(...)`,
 *   un LLM podría hacer await de su API sin cambiar consumidores.
 * - **Admite fallback**: un `LLMNarrativeProvider` puede capturar su propio
 *   error y retornar `DefaultNarrativeProvider.generateEntityNarrative(entry)`
 *   como salida — quedándose siempre con una narrativa válida.
 *
 * ## Ejemplo de implementación futura (no incluido en este archivo)
 *
 * ```ts
 * class LLMNarrativeProvider implements NarrativeProvider {
 *   async generateEntityNarrative(entry) {
 *     try {
 *       const llmOut = await callLLM(buildPrompt(entry));
 *       return validateAndNormalize(llmOut);
 *     } catch {
 *       return DefaultNarrativeProvider.generateEntityNarrative(entry);
 *     }
 *   }
 *   // ...
 * }
 * setNarrativeProvider(new LLMNarrativeProvider());
 * ```
 *
 * Notas:
 *  - Un LLMNarrativeProvider debería validar su salida contra un schema
 *    (Zod idealmente) antes de entregarla: la UI consume `BenchmarkSystemNarrative`
 *    con campos estructurados, no texto libre.
 *  - La clasificación (`classifyEntity`) del rule-based sigue disponible como
 *    ground truth para evals: comparar categoría del LLM vs categoría rule-based
 *    en un corpus de entries sintéticas detecta alucinaciones.
 */

import type { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import type { BenchmarkSystemNarrative } from "../hooks/useBenchmarkB2BState";
import {
    generateEntityNarrative as ruleBasedEntity,
    generateMarketNarrative as ruleBasedMarket,
    type MarketNarrativeInput,
    type MarketNarrativeOutput,
} from "./narrativeEngine";

export interface NarrativeProvider {
    /** Identificador del provider — útil para logs y debugging. */
    readonly name: string;

    /**
     * Genera narrativa para una entidad individual. Debe devolver un
     * `BenchmarkSystemNarrative` con los 3 campos requeridos + backingMetrics
     * opcional. Una implementación que no pueda cumplir debe caer al provider
     * default, no lanzar.
     */
    generateEntityNarrative(entry: IntelligenceBenchmarkEntry): Promise<BenchmarkSystemNarrative>;

    /**
     * Genera las 4 piezas del reporte ejecutivo a nivel mercado. Mismo
     * compromiso: nunca lanzar al caller; fallback al rule-based si corresponde.
     */
    generateMarketNarrative(input: MarketNarrativeInput): Promise<MarketNarrativeOutput>;
}

/**
 * Provider por defecto: delega al motor rule-based determinístico. Síncrono
 * bajo el capó, expuesto como async para respetar la interfaz.
 */
export const DefaultNarrativeProvider: NarrativeProvider = {
    name: "rule-based-v1",
    generateEntityNarrative: (entry) => Promise.resolve(ruleBasedEntity(entry)),
    generateMarketNarrative: (input) => Promise.resolve(ruleBasedMarket(input)),
};

let activeProvider: NarrativeProvider = DefaultNarrativeProvider;

/**
 * Devuelve el provider activo. Los consumidores deben llamar esta función
 * en cada invocación (no cachearla) para respetar `setNarrativeProvider`
 * en tests y en runtime feature flagging.
 */
export function getNarrativeProvider(): NarrativeProvider {
    return activeProvider;
}

/**
 * Inyecta un provider alternativo. Diseñado para:
 *  - Tests que quieren mockear respuestas del LLM.
 *  - Runtime: el bootstrap de la app decide según env flags.
 *  - Experimentos A/B de proveedores narrativos.
 */
export function setNarrativeProvider(provider: NarrativeProvider): void {
    activeProvider = provider;
}

/**
 * Resetea al provider default. Útil en `afterEach` de tests.
 */
export function resetNarrativeProvider(): void {
    activeProvider = DefaultNarrativeProvider;
}

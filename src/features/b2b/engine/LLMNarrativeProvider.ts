import { z } from 'zod';
import type { IntelligenceBenchmarkEntry } from '../../../read-models/b2b/intelligenceAnalyticsTypes';
import type { BenchmarkSystemNarrative } from '../hooks/useBenchmarkB2BState';
import {
    DefaultNarrativeProvider,
    type NarrativeProvider
} from './narrativeProvider';
import type { MarketNarrativeInput, MarketNarrativeOutput } from './narrativeEngine';
import { logger } from '../../../lib/logger';
import { getErrorReporter } from '../../../lib/observability/errorReporter';
import { supabase } from '../../../supabase/client';

// Zod schemas para validar la respuesta que devuelve la Edge Function `llm-narrative`.
const EntityNarrativeSchema = z.object({
    intelligenceText: z.string(),
    confidence: z.enum(['Alta', 'Media', 'Baja']),
    category: z.string(),
    backingMetrics: z.object({
        deltaPercentage: z.number()
    }).optional()
});

const MarketNarrativeSchema = z.object({
    summary: z.string(),
    findings: z.array(z.string()),
    criticalAlert: z.string().optional(),
    strategicRecommendation: z.string()
});

/**
 * Provider de narrativas B2B backend-only.
 *
 * IMPORTANTE: este provider NO llama a OpenAI desde el navegador.
 * Delega en la Edge Function `llm-narrative` que vive en Supabase y es la única
 * que tiene acceso a OPENAI_API_KEY (configurada como secret en el servidor).
 *
 * El navegador solo conoce el anon key de Supabase — la clave de OpenAI nunca
 * viaja al cliente, por lo que no es extraíble desde DevTools.
 */
export class LLMNarrativeProvider implements NarrativeProvider {
    readonly name = 'openai-gpt4o-v1';

    async generateEntityNarrative(entry: IntelligenceBenchmarkEntry): Promise<BenchmarkSystemNarrative> {
        try {
            const { data, error } = await supabase.functions.invoke('llm-narrative', {
                body: {
                    type: 'entity',
                    input: {
                        entityName: entry.entityName,
                        weightedPreferenceShare: entry.weightedPreferenceShare,
                        leaderRank: entry.leaderRank,
                        nEff: entry.nEff,
                        marginVsSecond: entry.marginVsSecond ?? null,
                        stabilityLabel: entry.stabilityLabel,
                    },
                },
            });

            if (error) {
                throw new Error(`Edge Function llm-narrative error: ${error.message}`);
            }
            if (!data) {
                throw new Error('Respuesta LLM vacía');
            }

            // `supabase.functions.invoke` ya parsea la respuesta JSON cuando el
            // content-type es application/json. Soportamos ambos casos por robustez.
            const parsed = EntityNarrativeSchema.parse(
                typeof data === 'string' ? JSON.parse(data) : data
            );
            return parsed;

        } catch (error) {
            getErrorReporter().captureException(error, {
                domain: 'b2b_intelligence',
                action: 'generateEntityNarrative',
                origin: 'LLMNarrativeProvider',
                entity: entry.entityName
            });
            // Fallback determinístico
            logger.warn('[LLMNarrativeProvider] Fallback a DefaultNarrativeProvider', { entity: entry.entityName });
            return DefaultNarrativeProvider.generateEntityNarrative(entry);
        }
    }

    async generateMarketNarrative(input: MarketNarrativeInput): Promise<MarketNarrativeOutput> {
        try {
            const { data, error } = await supabase.functions.invoke('llm-narrative', {
                body: {
                    type: 'market',
                    input: {
                        entries: input.entries.map(e => ({
                            entityName: e.entityName,
                            weightedPreferenceShare: e.weightedPreferenceShare,
                            leaderRank: e.leaderRank,
                            nEff: e.nEff,
                        })),
                        highAlertMessage: input.highAlertMessage ?? null,
                    },
                },
            });

            if (error) {
                throw new Error(`Edge Function llm-narrative error: ${error.message}`);
            }
            if (!data) {
                throw new Error('Respuesta LLM vacía');
            }

            const parsed = MarketNarrativeSchema.parse(
                typeof data === 'string' ? JSON.parse(data) : data
            );
            return { ...parsed, criticalAlert: parsed.criticalAlert ?? "Ninguna alerta crítica." };

        } catch (error) {
            getErrorReporter().captureException(error, {
                domain: 'b2b_intelligence',
                action: 'generateMarketNarrative',
                origin: 'LLMNarrativeProvider'
            });
            // Fallback determinístico
            logger.warn('[LLMNarrativeProvider] Fallback a DefaultNarrativeProvider (Market)');
            return DefaultNarrativeProvider.generateMarketNarrative(input);
        }
    }
}

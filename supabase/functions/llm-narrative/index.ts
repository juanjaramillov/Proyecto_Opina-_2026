import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
import { corsHeaders } from "../_shared/requireAdmin.ts";
import { requireAuth } from "../_shared/requireAuth.ts";

// Roles autorizados a pedir narrativas LLM (evita abuso desde B2C).
const ALLOWED_ROLES = new Set(['admin', 'b2b_pro']);

type EntityInput = {
    entityName: string;
    weightedPreferenceShare: number;
    leaderRank: number;
    nEff: number;
    marginVsSecond: number | null;
    stabilityLabel: string;
};

type MarketEntryInput = {
    entityName: string;
    weightedPreferenceShare: number;
    leaderRank: number;
    nEff: number;
};

type MarketInput = {
    entries: MarketEntryInput[];
    highAlertMessage?: string | null;
};

type RequestBody =
    | { type: 'entity'; input: EntityInput }
    | { type: 'market'; input: MarketInput };

serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Auth: exige JWT válido y rol admin/b2b_pro
        const { role } = await requireAuth(req);
        if (!ALLOWED_ROLES.has(role)) {
            return new Response(
                JSON.stringify({ error: 'Forbidden: Role not allowed to request LLM narratives' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Secret de OpenAI (del entorno del servidor, nunca del navegador)
        const openAiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAiKey) {
            console.error('[llm-narrative] OPENAI_API_KEY no configurada');
            return new Response(
                JSON.stringify({ error: 'OPENAI_API_KEY no está configurada en el servidor.' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const openai = new OpenAI({ apiKey: openAiKey });

        // 3. Parse body
        let body: RequestBody;
        try {
            body = await req.json();
        } catch {
            return new Response(JSON.stringify({ error: 'Body is not valid JSON.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!body || (body.type !== 'entity' && body.type !== 'market')) {
            return new Response(JSON.stringify({ error: "Campo 'type' debe ser 'entity' o 'market'." }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 4. Dispatch por tipo de narrativa
        if (body.type === 'entity') {
            const entry = body.input;
            const prompt = `
                Actúa como un analista de datos estratégico experto en B2B.
                Evalúa a la siguiente empresa y genera una narrativa ejecutiva concisa (2-3 líneas máximo).
                Clasifica su posición en el mercado e indica un nivel de confianza basado en la muestra estadística.

                Datos:
                Nombre: ${entry.entityName}
                Score: ${(entry.weightedPreferenceShare * 100).toFixed(1)}%
                Ranking: #${entry.leaderRank}
                Total Votos: ${entry.nEff}
                Margen contra el segundo: ${entry.marginVsSecond !== null ? (entry.marginVsSecond * 100).toFixed(1) + '%' : 'N/A'}
                Estabilidad: ${entry.stabilityLabel}
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "entity_narrative",
                        schema: {
                            type: "object",
                            properties: {
                                intelligenceText: { type: "string" },
                                confidence: { type: "string", enum: ["Alta", "Media", "Baja"] },
                                category: { type: "string" },
                                backingMetrics: {
                                    type: "object",
                                    properties: {
                                        deltaPercentage: { type: "number" },
                                    },
                                },
                            },
                            required: ["intelligenceText", "confidence", "category"],
                        },
                    },
                },
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                return new Response(JSON.stringify({ error: 'Respuesta LLM vacía' }), {
                    status: 502,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            return new Response(content, {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // body.type === 'market'
        const input = body.input;
        const entriesText = input.entries
            .map(e => `- ${e.entityName}: Score ${(e.weightedPreferenceShare * 100).toFixed(1)}% (Rank #${e.leaderRank}, Votos: ${e.nEff})`)
            .join('\n');

        const prompt = `
            Actúa como un analista de datos estratégico experto en B2B.
            Tienes los siguientes datos de un benchmark de mercado. Genera un reporte ejecutivo estructurado.

            Entidades evaluadas:
            ${entriesText}

            Alerta configurada: ${input.highAlertMessage || 'Ninguna'}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "market_narrative",
                    schema: {
                        type: "object",
                        properties: {
                            summary: { type: "string" },
                            findings: { type: "array", items: { type: "string" } },
                            criticalAlert: { type: "string" },
                            strategicRecommendation: { type: "string" },
                        },
                        required: ["summary", "findings", "strategicRecommendation"],
                    },
                },
            },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            return new Response(JSON.stringify({ error: 'Respuesta LLM vacía' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(content, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: unknown) {
        // requireAuth lanza Response en errores 401/403
        if (error instanceof Response) return error;

        console.error('[llm-narrative] Error inesperado:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

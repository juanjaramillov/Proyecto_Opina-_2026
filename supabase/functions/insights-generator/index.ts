import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.28.0"
import { requireAdmin, corsHeaders } from "../_shared/requireAdmin.ts";

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { supabaseAdmin: supabase } = await requireAdmin(req);

        const openAiKey = Deno.env.get('OPENAI_API_KEY');

        if (!openAiKey) {
            throw new Error("OPENAI_API_KEY no está configurada.");
        }

        const openai = new OpenAI({ apiKey: openAiKey });

        // Parse payload
        let body;
        try {
            body = await req.json();
        } catch {
            return new Response(JSON.stringify({ error: "Body is not valid JSON." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const battleSlug = body.battle_slug;
        if (!battleSlug) {
            return new Response(JSON.stringify({ error: "Se requiere 'battle_slug' en el body." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        console.log(`Iniciando Generador de Insights para la batalla: ${battleSlug}...`);

        // 1. Obtener datos de la Batalla y sus opciones
        const { data: battleData, error: battleError } = await supabase
            .from('battles')
            .select(`
                id,
                title,
                description,
                ai_summary,
                category:categories(name),
                options:battle_options(id, label, sort_order)
            `)
            .eq('slug', battleSlug)
            .single();

        if (battleError || !battleData) {
            throw new Error(`Batalla no encontrada: ${battleSlug}`);
        }

        const opciones = battleData.options as { label: string }[];

        // 2. Usar la función RPC para obtener los puntajes exactos de las opciones
        // Inyectamos el slug a 'get_segmented_ranking' para obtener los pesos
        const { data: rankingData, error: rpcError } = await supabase
            .rpc('get_segmented_ranking', {
                p_battle_slug: battleSlug,
                p_age_range: 'all',
                p_gender: 'all',
                p_commune: 'all'
            });

        if (rpcError) {
             console.error("RPC Error:", rpcError);
             throw new Error("No se pudo obtener el ranking de la batalla.");
        }

        const finalRanking = rankingData || [];
        
        // Mapear opciones con sus scores
        const scoresContext = opciones.map(op => {
            const rData = finalRanking.find((r: { option_label: string; total_weight: number }) => r.option_label === op.label);
            const score = rData ? rData.total_weight : 0;
            return `${op.label}: ${score} votos de peso relativo`;
        }).join('\n');

        console.log(`Datos obtenidos: ${scoresContext}`);

        // 3. Consultar a OpenAI para el "Magic Summary"
        console.log("Consultando a OpenAI...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un Analista de Datos Senior para "Opina+", una app de votaciones chilena.
Tu trabajo es interpretar los resultados actuales de una batalla y escribir un 'Insight Ejecutivo' breve y profesional para los reportes B2B.

**Instrucciones**:
- Redacta un párrafo (MÁXIMO 3 líneas) que resuma cuál es la marca ganadora o si la competencia está muy peleada ("polarizada").
- Expresa el resultado en un tono neutro, analítico y corporativo.
- NO uses viñetas. Solo un bloque de texto que vaya directo al grano.
- Interpreta la diferencia entre los puntos. Si la diferencia es poca, di que hay alta competitividad. Si es grande, di que hay dominio claro.`
                },
                {
                    role: "user",
                    content: `Batalla: "${battleData.title}"
Categoría: ${battleData.category.name}
Resultados crudos:
${scoresContext}`
                }
            ],
            temperature: 0.3
        });

        const magicSummaryText = completion.choices[0].message.content || 'Sin insight generado.';

        console.log(`OpenAI Generó: ${magicSummaryText}`);

        // 4. Actualizar la tabla de battles con este nuevo resumen
        const { error: updateError } = await supabase
            .from('battles')
            .update({ 
                ai_summary: magicSummaryText,
                ai_summary_generated_at: new Date().toISOString()
            })
            .eq('id', battleData.id);

        if (updateError) {
            console.error("Update Error:", updateError);
            throw new Error("No se pudo actualizar la tabla de batallas con el resumen AI.");
        }

        console.log(`Insights insertados en BD con éxito para ${battleSlug}`);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: `Insight creado y guardado.`,
                ai_summary: magicSummaryText
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error: unknown) {
        console.error("Error en function insights-generator:", error);
        if (error instanceof Response) return error;

        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

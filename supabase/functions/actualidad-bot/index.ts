import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5"
import OpenAI from "https://esm.sh/openai@4.28.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types for DB inserts
type TopicInsert = {
    slug: string;
    title: string;
    short_summary: string;
    category: string;
    status: string;
    impact_quote?: string;
    tags?: string[];
    actors?: string[];
    intensity?: number;
    relevance_chile?: number;
    confidence_score?: number;
    event_stage?: string;
    topic_duration?: string;
    opinion_maturity?: string;
    source_domain?: string;
    created_by_ai: boolean;
    metadata?: Record<string, any>;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error("Missing Authorization header");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
        const openAiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openAiKey) {
            throw new Error("OPENAI_API_KEY no está configurada.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openAiKey });

        console.log("Iniciando extracción de RSS (Google News Chile)...");
        const rssUrl = "https://news.google.com/rss/search?q=chile+actualidad+nacional&hl=es-419&gl=CL&ceid=CL:es-419";
        const rssResponse = await fetch(rssUrl);
        const rssXml = await rssResponse.text();

        const parser = new XMLParser();
        const rssData = parser.parse(rssXml);

        const items = rssData?.rss?.channel?.item || [];
        const topNews = Array.isArray(items) ? items.slice(0, 10) : [items].slice(0, 10);

        if (topNews.length === 0) {
            return new Response(JSON.stringify({ error: "No se encontraron noticias." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const newsText = topNews.map((n: Record<string, string>, i: number) => `Noticia ${i + 1}:\nTítulo: ${n.title}\nResumen: ${n.description}\nEnlace: ${n.link}`).join("\n\n");

        console.log("Consultando a OpenAI...");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Eres el editor jefe de Actualidad en Opina+, una plataforma chilena que transforma hechos recientes en señales de opinión.
No eres un simple redactor de noticias.
Tu función es detectar temas urgentes, relevantes y opinables para que las personas en Chile puedan reaccionar, interpretar y tomar postura.

Debes priorizar hechos que:
- generen postura clara,
- tengan impacto social, económico o cotidiano,
- puedan resumirse de forma breve y neutral,
- y permitan construir preguntas útiles para Opina+.

No debes seleccionar temas solo por importancia periodística.
Debes seleccionar temas por su capacidad de generar señal.

Selecciona solo temas opinables.
Un tema opinable es aquel donde una persona razonable puede tener una postura clara, una reacción o una preferencia.
Evita hechos meramente informativos que no generan posición.

Analiza las noticias o clusters de noticias recibidos como entrada y genera exactamente 3 temas editoriales para Opina+.

Cada tema debe:
- ser distinto de los otros,
- evitar duplicidad temática,
- tener foco en Chile,
- ser entendible sin contexto técnico excesivo,
- y estar listo para revisión en la mesa editorial admin.

Los 3 temas generados deben ser lo más diversos posible en categoría y tipo de conflicto.
No repetir el mismo subtema dentro del mismo lote salvo que sea un evento excepcional de altísimo impacto nacional.

El tono debe ser claro, directo, neutral y entendible.
No usar tono partidista.
No usar clickbait barato.
No exagerar.
No inventar hechos.
No editorializar el resumen.
La frase de impacto puede invitar al debate, pero sin sonar sensacionalista.

ESTRUCTURA OBLIGATORIA DEL JSON:
Tu salida DEBE SER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO con la clave "topics".
No agregues introducciones, explicaciones, markdown ni backticks de bloque de código alrededor de la respuesta.
Debe seguir este contrato exacto:
{
  "topics": [
    {
      "title": "string (máximo 5 palabras, claro, verbo implícito)",
      "summary": "string (máximo 250 caracteres, neutral sin adjetivos)",
      "impact_phrase": "string (máximo 100 caracteres, invita a opinar/debate)",
      "category": "País | Economía | Ciudad / Vida diaria | Marcas y Consumo | Deportes y Cultura | Tendencias y Sociedad",
      "tags": ["string", "string"], // 2 a 5 tags concretos
      "actors": ["string", "string"], // 1 a 4 actores
      "intensity": 1, // 1 (ligera) a 3 (polarizante)
      "relevance_chile": 1, // 1 a 5
      "confidence_score": 1, // 1 a 5
      "event_stage": "announcement | discussion | implementation | crisis | result",
      "topic_duration": "flash | short | medium | long",
      "opinion_maturity": "low | medium | high",
      "source_url": "string (extraer de la entrada original)",
      "source_title": "string",
      "source_domain": "string",
      "source_published_at": "string",
      "questions": [
        {
          "order": 1,
          "text": "string (Medir reacción inicial)",
          "type": "scale_0_10",
          "options": []
        },
        {
          "order": 2,
          "text": "string (Entender cómo interpreta el hecho)",
          "type": "single_choice",
          "options": [
            { "id": "a", "text": "string" },
            { "id": "b", "text": "string" }
          ]
        },
        {
          "order": 3,
          "text": "string (Posición final deseada)",
          "type": "single_choice_polar",
          "options": [
            { "id": "a", "text": "string" },
            { "id": "b", "text": "string" }
          ]
        }
      ]
    }
  ]
}`
                },
                {
                    role: "user",
                    content: newsText
                }
            ],
            response_format: { type: "json_object" },
        });

        const completionText = completion.choices[0].message.content || '{"topics":[]}';
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(completionText);
        } catch {
            return new Response(JSON.stringify({ error: "Fallo parceo OpenAI JSON.", text: completionText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const temasArray = Array.isArray(parsedPayload) ? parsedPayload : (parsedPayload.topics || parsedPayload.temas || []);

        if (temasArray.length === 0) {
            return new Response(JSON.stringify({ error: "OpenAI no generó temas válidos." }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`Insertando ${temasArray.length} temas en Supabase (estado: detected)...`);

        let insertedCount = 0;

        for (const t of temasArray) {
            // 1. Insert Topic
            const slug = (t.title || t.titulo || 'tema').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
            
            // Extraer dominio simple para source_domain
            let domain = '';
            try {
                if (t.source_url) {
                    domain = new URL(t.source_url).hostname.replace('www.', '');
                }
            } catch (e) {}

            const topicInsert: TopicInsert = {
                slug,
                title: t.title || t.titulo,
                short_summary: t.summary || t.resumen,
                category: t.category || t.categoria,
                status: 'detected', // Estado inicial post IA
                impact_quote: t.impact_phrase || t.frase_impacto,
                tags: t.tags || [],
                actors: t.actors || [],
                intensity: t.intensity || 1,
                relevance_chile: t.relevance_chile || 3,
                confidence_score: t.confidence_score || 85,
                event_stage: t.event_stage || 'announcement',
                topic_duration: t.topic_duration || 'short',
                opinion_maturity: t.opinion_maturity || 'low',
                source_domain: domain,
                created_by_ai: true,
                metadata: { 
                  source_url: t.source_url || '',
                  raw_ai_payload: t // Inyección del contrato IA completo por trazabilidad
                }
            };

            const { data: topicData, error: topicError } = await supabase
                .from('current_topics')
                .insert([topicInsert])
                .select('id')
                .single();

            if (topicError || !topicData) {
                console.error("Error al insertar tema", t.title, topicError);
                continue;
            }

            const topicId = topicData.id;

            // 2. Create Question Set
            const { data: setData, error: setError } = await supabase
                .from('topic_question_sets')
                .insert([{ topic_id: topicId }])
                .select('id')
                .single();

            if (setError || !setData) {
                console.error("Error al insertar set", setError);
                continue;
            }
            const setId = setData.id;

            // 3. Insert Questions
            const questionsToInsert = (t.questions || t.preguntas || []).map((q: Record<string, any>, i: number) => ({
                set_id: setId,
                question_order: q.order || q.orden || (i + 1),
                question_text: q.text || q.texto,
                answer_type: q.type || q.tipo,
                options_json: q.options || q.opciones || []
            }));

            if (questionsToInsert.length > 0) {
                const { error: qError } = await supabase
                    .from('topic_questions')
                    .insert(questionsToInsert);
                if (qError) {
                    console.error("Error al insertar preguntas", qError);
                }
            }
            
            insertedCount++;
        }

        return new Response(
            JSON.stringify({ success: true, message: `Insertados ${insertedCount} temas en status 'detected'.` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error: unknown) {
        console.error("Error en function:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

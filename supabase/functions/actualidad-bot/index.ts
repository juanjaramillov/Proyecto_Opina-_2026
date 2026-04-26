import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5"
import OpenAI from "https://esm.sh/openai@4.28.0"
import { requireAdmin, corsHeaders } from "../_shared/requireAdmin.ts";

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
    metadata?: Record<string, unknown>;
}

serve(async (req) => {
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

        console.log("Iniciando extracción de RSS (Google News)...");
        
        // Medios Nacionales (Chile) e Internacionales
        const clDomains = [
            "emol.com", "biobiochile.cl", "latercera.com", "meganoticias.cl",
            "24horas.cl", "cooperativa.cl", "ciperchile.cl", "df.cl"
        ];
        
        const intDomains = [
            "reuters.com", "apnews.com", "afp.com", "bbc.com",
            "nytimes.com", "ft.com", "bloomberg.com", "economist.com"
        ];

        const parser = new XMLParser();

        // Función auxiliar para obtener las top N noticias de un dominio específico
        const fetchDomainNews = async (domain: string, isIntl: boolean, limit: number = 5) => {
            const query = `site:${domain}`;
            const gl = isIntl ? "US" : "CL";
            const hl = isIntl ? "en-US" : "es-419";
            const ceid = isIntl ? "US:en" : "CL:es-419";
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
            
            try {
                const res = await fetch(rssUrl);
                const xml = await res.text();
                const parsed = parser.parse(xml);
                let items = parsed.rss?.channel?.item;
                if (!items) return [];
                if (!Array.isArray(items)) items = [items];
                return items.slice(0, limit);
            } catch (err) {
                console.error(`Error fetch RSS para ${domain}`, err);
                return [];
            }
        };

        console.log("Obteniendo noticias Nacionales e Internacionales balanceadas...");
        
        // Hacemos un fetch por cada dominio en paralelo para asegurar distribución equitativa
        const clPromises = clDomains.map(d => fetchDomainNews(d, false, 5));
        const intlPromises = intDomains.map(d => fetchDomainNews(d, true, 5));

        const [clResults, intlResults] = await Promise.all([
            Promise.all(clPromises),
            Promise.all(intlPromises)
        ]);

        const topNewsCl = clResults.flat();
        const topNewsInt = intlResults.flat();
        const topNews = [...topNewsCl, ...topNewsInt];

        // Deduplicar URLs exactas o títulos idénticos por seguridad antes de pasar a la IA
        const seenUrls = new Set();
        const uniqueNews = [];
        for (const item of topNews) {
            if (!seenUrls.has(item.link)) {
                seenUrls.add(item.link);
                uniqueNews.push(item);
            }
        }

        if (uniqueNews.length === 0) {
            return new Response(JSON.stringify({ error: "No se encontraron noticias únicas." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const newsText = uniqueNews.map((n: any, i: number) => {
            const fuente = n.source || n.title.split(' - ').pop() || "Desconocida";
            const imgMatch = n.description ? n.description.match(/<img[^>]+src="([^">]+)"/) : null;
            const imageUrl = imgMatch ? imgMatch[1] : "";
            
            // Pasamos la URL imagen a OpenAI para que la devuelva si usa esta noticia
            return `Noticia ${i + 1}:\nMedio/Fuente: ${fuente}\nTítulo: ${n.title}\nResumen: ${n.description}\nEnlace: ${n.link}\nImagen: ${imageUrl}`;
        }).join("\n\n");

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

CRÍTICO - AGRUPACIÓN DE EVENTOS:
Recibirás hasta 80 noticias. Es altamente probable que haya múltiples noticias cubriendo EL MISMO EVENTO desde distintos medios. 
Obligatoriamente debes AGRUPAR todas las noticias que hablen del mismo evento o tema central y consolidarlas en UN ÚNICO TEMA final. 
Bajo ninguna circunstancia puedes generar dos o más temas distintos que traten sobre el mismo evento subyacente.

Analiza las noticias o clusters de noticias recibidos como entrada y genera EXACTAMENTE 10 temas editoriales para Opina+.

Cada tema final debe:
- Ser un clúster de noticias si había múltiples coberturas.
- Ser radicalmente distinto de los otros 9 temas generados.
- Evitar cualquier duplicidad temática o redundancia.
- Extraer el 'source_url' y 'image_url' de la noticia más representativa de ese clúster.

Los 10 temas generados deben ser lo más diversos posible en categoría (Economía, Política, Internacional, etc.) y tipo de conflicto.
No repetir el mismo subtema dentro del mismo lote salvo que sea un evento excepcional de altísimo impacto nacional.

CRÍTICO - BALANCE EMOCIONAL Y TONO:
Para evitar un feed denso o depresivo, DEBES balancear los temas. 
Entre los 10 temas finales, OBLIGATORIAMENTE debe haber al menos 3 o 4 temas de corte positivo, inspirador, logros deportivos, innovaciones tecnológicas, éxitos chilenos o descubrimientos fascinantes. No todo puede ser política, crímenes o crisis económicas.

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
      "category": "País | Internacional | Economía | Ciudad / Vida diaria | Marcas y Consumo | Deportes y Cultura | Tendencias y Sociedad",
      "tags": ["string", "string"], // 2 a 5 tags concretos
      "actors": ["string", "string"], // 1 a 4 actores
      "intensity": 1, // 1 (ligera) a 3 (polarizante)
      "relevance_chile": 1, // 1 a 5
      "confidence_score": 1, // 1 a 5
      "event_stage": "announcement | discussion | implementation | crisis | result",
      "topic_duration": "flash | short | medium | long",
      "opinion_maturity": "low | medium | high",
      "source_url": "string (el enlace proporcionado)",
      "source_title": "string (nombre del medio original, ej: La Tercera)",
      "source_domain": "string (dominio inferido del medio, ej: latercera.com. NO USAR news.google.com)",
      "source_published_at": "string",
      "image_url": "string (la URL de la imagen proporcionada en el bloque de la noticia)",
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
        const insertErrors: { action?: string; title?: string; error: unknown }[] = [];

        for (const t of temasArray) {
            // 1. Insert Topic
            const slug = (t.title || t.titulo || 'tema').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
            
            // Usar el dominio inferido por la IA o extraer de la URL como fallback
            let domain = t.source_domain || t.source_title || '';
            if (!domain || domain.includes('google.com')) {
                try {
                    if (t.source_url) {
                        domain = new URL(t.source_url).hostname.replace('www.', '');
                    }
                } catch {
                    // Ignore missing or invalid URL
                }
            }

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
                  image_url: t.image_url || '',
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
                insertErrors.push({ title: t.title, error: topicError });
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
                insertErrors.push({ action: 'Insert Question Set', error: setError });
                continue;
            }
            const setId = setData.id;

            // 3. Insert Questions
            const questionsToInsert = (t.questions || t.preguntas || []).map((q: { order?: number; orden?: number; text?: string; texto?: string; type?: string; tipo?: string; options?: unknown[]; opciones?: unknown[] }, i: number) => ({
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
                    insertErrors.push({ action: 'Insert Questions', error: qError });
                }
            }
            
            insertedCount++;
        }

        return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Insertados ${insertedCount} temas en status 'detected'.`,
              errors: insertErrors,
              payload_received: temasArray.length
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error: unknown) {
        console.error("Error en function actualidad-bot:", error);
        if (error instanceof Response) return error;

        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

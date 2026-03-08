import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.5"
import OpenAI from "https://esm.sh/openai@4.28.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Enforce authorization if needed (e.g. cron job uses anon key or service role)
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
        // Google News RSS:
        const rssUrl = "https://news.google.com/rss/search?q=chile+actualidad+nacional&hl=es-419&gl=CL&ceid=CL:es-419";
        const rssResponse = await fetch(rssUrl);
        const rssXml = await rssResponse.text();

        const parser = new XMLParser();
        const rssData = parser.parse(rssXml);

        // Extraer los 5 primeros items
        const items = rssData?.rss?.channel?.item || [];
        const topNews = Array.isArray(items) ? items.slice(0, 5) : [items].slice(0, 5);

        if (topNews.length === 0) {
            return new Response(JSON.stringify({ error: "No se encontraron noticias." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const newsText = topNews.map((n: any, i: number) => `Noticia ${i + 1}:\nTítulo: ${n.title}\nResumen: ${n.description}`).join("\n\n");

        console.log("Consultando a OpenAI...");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un editor jefe de la plataforma Opina+, encargada de medir el pulso social en Chile.
Debes tomar estas noticias recientes y producir exactamente 2 a 3 temas urgentes para debatir.
Para cada tema, debes elegir un Título Corto (máx 5 palabras), un Contexto Corto (máximamente descriptivo y neutral, máx 250 caracteres), una Categoría (Política, Economía, Sociedad, Deportes, etc).
También debes generar una "pregunta_postura": ej: {"texto": "¿Estás de acuerdo?", "opciones": [{"id": "a_favor", "texto": "A favor"}, {"id": "en_contra", "texto": "En contra"}]}.
Y una "pregunta_impacto": ej: {"texto": "¿Te impacta esto?", "opciones": [{"id": "mucho", "texto": "Mucho"}, {"id": "poco", "texto": "Poco"}, {"id": "nada", "texto": "Nada"}]}.

Tu salida debe ser un OBJETO JSON con una única clave "temas" que sea un arreglo. Formato estricto:
{
  "temas": [
    {
      "titulo": "...",
      "contexto_corto": "...",
      "categoria": "...",
      "pregunta_postura": { "texto": "...", "opciones": [{ "id": "op_1", "texto": "..." }, { "id": "op_2", "texto": "..." }] },
      "pregunta_impacto": { "texto": "...", "opciones": [{ "id": "imp_1", "texto": "..." }, { "id": "imp_2", "texto": "..." }] }
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

        // Let's retry config to ensure JSON object mode works cleanly
        let completionText = completion.choices[0].message.content || '{"temas":[]}';
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(completionText);
        } catch (e) {
            return new Response(JSON.stringify({ error: "Fallo parceo OpenAI JSON.", text: completionText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const temasArray = Array.isArray(parsedPayload) ? parsedPayload : (parsedPayload.temas || []);

        if (temasArray.length === 0) {
            return new Response(JSON.stringify({ error: "OpenAI no generó temas válidos." }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`Insertando ${temasArray.length} temas en Supabase...`);

        const insertPayloads = temasArray.map((t: any) => ({
            titulo: t.titulo,
            contexto_corto: t.contexto_corto,
            categoria: t.categoria,
            pregunta_postura: t.pregunta_postura,
            pregunta_impacto: t.pregunta_impacto,
            estado: 'activo'
        }));

        const { data, error } = await supabase
            .from('actualidad_topics')
            .insert(insertPayloads)
            .select('*');

        if (error) {
            console.error("Error BD:", error);
            throw error;
        }

        return new Response(
            JSON.stringify({ success: true, message: `Insertados ${data.length} temas.`, data }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error: any) {
        console.error("Error en function:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

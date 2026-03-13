import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

type GeneratedQuestion = {
    key: string;
    text: string;
    options: string[];
};

const generateQuestionsForCategory = async (categoryName: string): Promise<GeneratedQuestion[]> => {
    if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY.trim()}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content: `Eres un investigador de mercado creando 9 preguntas obligatorias para evaluar una marca dentro de una categoría específica.
- Todas las preguntas deben ser de selección múltiple (choice) y tener entre 3 y 5 opciones cortas.
- Las preguntas deben ser genéricas para abarcar cualquier marca de esa categoría.
- Devuelve un array JSON puramente válido, sin markdown ni backticks, estrictamente en este formato:
[
  { "key": "calidad", "text": "¿Cómo calificas la calidad?", "options": ["Mala", "Regular", "Buena", "Excelente"] },
  ... 8 más
]
- NUNCA devuelvas Markdown. Solamente el array crudo en JSON. Exactamente 9 elementos.`
                },
                {
                    role: "user",
                    content: `Genera las 9 preguntas de evaluación profunda para la categoría: ${categoryName}`
                }
            ]
        })
    });

    const data = await response.json();
    let content = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : "[]";
    
    // Clean up potential markdown blocks if GPT misbehaves
    content = content.replace(/^```json/g, '').replace(/```$/g, '').trim();

    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length >= 9) {
            return parsed.slice(0, 9);
        }
        return [];
    } catch (e) {
        console.error("Error parsing JSON from OpenAI:", content);
        return [];
    }
};

async function ensure10Depths() {
    console.log("=========================================");
    console.log("INICIANDO ESTANDARIZACIÓN DE PROFUNDIDAD (10 PREGUNTAS)");
    console.log("=========================================\n");

    const { data: categories, error: catErr } = await supabase.from('categories').select('*').eq('active', true);
    if (catErr || !categories) {
        console.error("Error obteniendo categorías", catErr);
        return;
    }

    let totalEntitiesUpdated = 0;

    for (const category of categories) {
        console.log(`\nProcesando subcategoría: ${category.name} (${category.slug})`);

        // Obtener la plantilla de 9 preguntas de la IA
        const categoryQuestions = await generateQuestionsForCategory(category.name);
        
        if (categoryQuestions.length < 9) {
            console.error(`  [X] Falla: La IA no devolvió 9 preguntas válidas para ${category.name}, saltando.`);
            continue;
        }

        console.log(`  [+] Plantilla de preguntas generada. (Ej: ${categoryQuestions[0].text})`);

        // Obtener marcas de esta categoría
        let { data: entities } = await supabase
            .from('entities')
            .select('*')
            .eq('type', 'brand')
            .ilike('category', category.slug);

        if (!entities || entities.length === 0) {
            const { data: fallback } = await supabase
                .from('entities')
                .select('*')
                .eq('type', 'brand')
                .ilike('category', category.name);
            entities = fallback || [];
        }

        if (entities.length === 0) {
            console.log(`  -> Sin entidades en esta categoría.`);
            continue;
        }

        console.log(`  -> Aplicando a ${entities.length} marcas...`);

        for (const entity of entities) {
            // Eliminar definiciones viejas
            await supabase.from('depth_definitions').delete().eq('entity_id', entity.id);

            // Crear el array de inserción de las 10 preguntas
            const inserts = [];
            const seenKeys = new Set<string>(['recomendacion']);

            // Pregunta 1 obligatoria: NPS Evaluativa General
            inserts.push({
                entity_id: entity.id,
                position: 1,
                question_key: 'recomendacion',
                question_text: `¿Del 0 al 10, qué tanto recomendarías ${entity.name}?`,
                question_type: 'nps_0_10',
                options: JSON.stringify([])
            });

            // Preguntas 2-10: IA Standard
            categoryQuestions.forEach((q, idx) => {
                let safeKey = q.key;
                let counter = 1;
                while (seenKeys.has(safeKey)) {
                    safeKey = `${q.key}_${counter}`;
                    counter++;
                }
                seenKeys.add(safeKey);

                inserts.push({
                    entity_id: entity.id,
                    position: idx + 2, // 2 a 10
                    question_key: safeKey,
                    question_text: q.text,
                    question_type: 'choice',
                    options: JSON.stringify(q.options)
                });
            });

            const { error: insErr } = await supabase.from('depth_definitions').upsert(inserts, { onConflict: 'entity_id,question_key' });
            
            if (insErr) {
                console.error(`      [X] Error insertando para ${entity.name}:`, insErr);
            } else {
                totalEntitiesUpdated++;
            }
        }
        
        console.log(`  [+] Categoría ${category.name} finalizada.`);
    }

    console.log(`\n=== PROCESO COMPLETADO. Total de marcas actualizadas con 10 preguntas: ${totalEntitiesUpdated} ===`);
}

ensure10Depths();

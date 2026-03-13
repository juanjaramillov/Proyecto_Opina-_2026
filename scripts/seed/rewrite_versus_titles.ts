import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import OpenAI from 'openai';

dotenv.config({ path: resolve(process.cwd(), '.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const openAiKey = process.env.OPENAI_API_KEY || '';

if (!supabaseUrl || !supabaseKey || !openAiKey) {
  console.error("Faltan variables de entorno (Supabase u OpenAI).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openAiKey });

async function main() {
    console.log("Fetching ALL categories...");
    const { data: categories, error } = await supabase.from('categories').select('id, name');
    
    if (error || !categories) {
        console.error("Error fetching categories", error);
        return;
    }
    
    const targetCats = categories;
    console.log(`Found ${targetCats.length} categories to process.`);
    
    const chunkSize = 20;
    const categoryToTitles: Record<string, string[]> = {};
    
    for (let i = 0; i < targetCats.length; i += chunkSize) {
        const chunk = targetCats.slice(i, i + chunkSize);
        console.log(`\nProcessing chunk ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(targetCats.length / chunkSize)}...`);
        
        const catNames = chunk.map(c => c.name).join(", ");
        
        const prompt = `
        Genera 5 frases cortas, directas y punzantes (con humor o ironía fina) para cada una de las siguientes categorías de productos/servicios. 
        Estas frases se usarán como título de una tarjeta (UI) donde el usuario debe elegir entre dos marcas de esa categoría.
        REGLAS ESTRICTAS:
        - NUNCA usar la palabra "batalla", "versus", "combate", "pelea", "duelo" o similares.
        - Las frases deben ser directas y al grano. Preferiblemente afirmaciones o dilemas rápidos, no necesariamente preguntas.
        - Mantenlo corto (máximo 4-8 palabras).
        - NUNCA incluyas marcadores de posición tipo [Marca A] o [Marca B].
        - Las frases deben tener variedad.
        - Evita comillas dobles en los textos si no es estrictamente necesario, para no romper el JSON.
        - Ejemplo para categoría "Bebidas": "Para apagar ese incendio", "El verdadero sabor a verano", "Sed de la buena".
        - Ejemplo para categoría "Bancos": "Tu plata, tus reglas", "El mal menor a fin de mes", "Donde duele menos pagar".
        
        Categorías a procesar:
        ${catNames}
        
        Devuelve el resultado ÚNICAMENTE en este formato JSON exacto sin texto adicional:
        {
           "Categoría Exacta 1": ["frase 1", "frase 2", "frase 3", "frase 4", "frase 5"]
        }
        Asegúrate de que las llaves (keys) del JSON sean *exactamente* los nombres de categorías listados arriba.
        `;
        
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.8
            });
            
            const resultText = completion.choices[0].message.content || "{}";
            const parsed = JSON.parse(resultText);
            Object.assign(categoryToTitles, parsed);
        } catch (e) {
            console.error("Error with OpenAI:", e);
        }
    }
    
    console.log("\nGenerated AI titles mapping. Showing preview:");
    console.log(Object.keys(categoryToTitles).slice(0, 3).map(k => `${k}: ${categoryToTitles[k][0]}`).join('\n'));
    console.log("\nNow updating all battles...");
    
    let totalUpdated = 0;
    
    for (const cat of targetCats) {
        const titles = categoryToTitles[cat.name];
        if (!titles || titles.length === 0) continue;
        
        // Fetch ALL battles for this category using pagination
        let allBattles: any[] = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
            const { data: pageData, error } = await supabase
                .from('battles')
                .select('id')
                .eq('category_id', cat.id)
                .range(page * 1000, (page + 1) * 1000 - 1);
                
            if (error) {
                console.error("Error fetching battles page:", error);
                break;
            }
            if (pageData && pageData.length > 0) {
                allBattles = allBattles.concat(pageData);
                page++;
            } else {
                hasMore = false;
            }
        }
        
        if (allBattles.length === 0) continue;
        
        let catUpdatedCount = 0;
        
        // We update in parallel batches of 50 to speed it up
        const parallelLimit = 50;
        for (let i = 0; i < allBattles.length; i += parallelLimit) {
            const batch = allBattles.slice(i, i + parallelLimit);
            await Promise.all(batch.map(async (b) => {
                const randomTitle = titles[Math.floor(Math.random() * titles.length)];
                await supabase.from('battles').update({
                    title: randomTitle,
                    description: null 
                }).eq('id', b.id);
            }));
            
            catUpdatedCount += batch.length;
            totalUpdated += batch.length;
            process.stdout.write(".");
        }
        console.log(`\n  [OK] Updated ${catUpdatedCount} battles for "${cat.name}"`);
    }
    
    console.log(`\n========================================`);
    console.log(`DONE! Updated ${totalUpdated} battles globally with AI humor.`);
    console.log(`========================================`);
}

main();

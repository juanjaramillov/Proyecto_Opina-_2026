import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openAiKey) {
    console.error('Missing Supabase credentials or OpenAI Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openAiKey });

// Mapa de caché para no preguntar por la misma marca dos veces
const domainCache = new Map<string, string | null>();

async function getDomainWithAI(brandName: string): Promise<string | null> {
    if (domainCache.has(brandName)) {
        return domainCache.get(brandName) || null;
    }

    try {
        const prompt = `Actúas como un sistema experto buscador de marcas formales operando en el mercado chileno. 
Te entregaré el nombre de una marca o entidad y tu único trabajo es devolverme su dominio de sitio web oficial y primario que usa en Chile o internacionalmente (ejemplo: "bancochile.cl", "apple.com", "falabella.com"). No debe incluir "https://www.", SOLO el dominio base. 
Si no existe una web clara o estás absolutamente seguro de que no tiene web dedicada, devuelve un string vacío o 'none'.

Marca a buscar: "${brandName}"

Retorna el resultado en un JSON estricto:
{
  "domain": "dominio.cl"
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that only replies in valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        });

        const rawResult = completion.choices[0].message.content;
        if (!rawResult) return null;

        const result = JSON.parse(rawResult);
        let domain = result.domain;

        if (!domain || domain === 'none' || domain.includes(' ')) {
            domainCache.set(brandName, null);
            return null;
        }

        // Limpiar para asegurar de no arrastrar www o http
        domain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase().trim();

        domainCache.set(brandName, domain);
        return domain;

    } catch (error) {
        console.error(`Error querying OpenAI for ${brandName}:`, error);
        return null; // Return null on error and maybe try again later
    }
}

async function run() {
    console.log('🔄 Init AI-driven Brandfetch Domain Sync...\n');

    // 1. Fetch missing domanis
    const { data: options, error } = await supabase
        .from('battle_options')
        .select('id, label, brand_domain, image_url')
        .is('brand_domain', null)
        .is('image_url', null)
        .order('label', { ascending: true }); // By label to group cache calls easily in logs

    if (error) {
        console.error('Error fetching data:', error);
        process.exit(1);
    }

    if (!options || options.length === 0) {
        console.log('✅ No missing brand domains / image urls found. All good!');
        process.exit(0);
    }

    console.log(`📡 Found ${options.length} options requiring domain fetching...\n`);

    let successCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const brandName = option.label;

        process.stdout.write(`[${i + 1}/${options.length}] "${brandName}"... `);

        // Fetch domain using GPT-4o-mini
        const domain = await getDomainWithAI(brandName);

        if (domain) {
            console.log(`✅ [${domain}]`);
            // Update supabase row
            const { error: updateError } = await supabase
                .from('battle_options')
                .update({ brand_domain: domain })
                .eq('id', option.id);

            if (updateError) {
                console.error(`\n❌ Error saving ${domain} to DB:`, updateError);
            } else {
                successCount++;
            }
        } else {
            console.log(`⚠️ (No domain found)`);
            fallbackCount++;
        }
        
        // Minor delay to respect basic rate limits on OpenAI
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n====================================');
    console.log('🎉 AI Domain Overrides Complete!');
    console.log(`Total DB Updates: ${successCount}`);
    console.log(`Total Fallbacks : ${fallbackCount}`);
    console.log('====================================\n');
}

run().catch(console.error);

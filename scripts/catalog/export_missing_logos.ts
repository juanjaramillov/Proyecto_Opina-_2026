import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // We need battle_options and also their categories. We can join through battle_id -> battles -> categories, or brand_id -> entities
    // Easiest is to fetch brand_id and label from battle_options
    const { data: options, error } = await supabase
        .from('battle_options')
        .select('label, brand_id')
        .is('brand_domain', null)
        .is('image_url', null);

    if (error) {
        console.error('Error fetching data:', error);
        process.exit(1);
    }

    if (!options || options.length === 0) {
        console.log('No missing logos.');
        process.exit(0);
    }

    // Get unique brand_ids
    const brandIds = Array.from(new Set(options.map(o => o.brand_id).filter(Boolean)));

    // Fetch categories for those brand_ids from entities table
    const { data: entities, error: entitiesError } = await supabase
        .from('entities')
        .select('id, name, category')
        .in('id', brandIds);

    if (entitiesError) {
         console.error('Error fetching entities data:', entitiesError);
         process.exit(1);
    }

    // Also let's try to get nice category names. entities.category is usually a slug.
    const { data: categories, error: catsError } = await supabase
        .from('categories')
        .select('slug, name');

    const catSlugToName = new Map();
    if (categories) {
        categories.forEach(c => catSlugToName.set(c.slug, c.name));
    }

    const entityMap = new Map();
    if (entities) {
        entities.forEach(e => {
            const catName = catSlugToName.get(e.category) || e.category;
            entityMap.set(e.id, catName);
        });
    }

    // Map each unique option label to its category
    const brandDataMap = new Map();
    options.forEach(opt => {
         if (!brandDataMap.has(opt.label)) {
              brandDataMap.set(opt.label, entityMap.get(opt.brand_id) || 'Desconocida');
         }
    });

    const uniqueBrands = Array.from(brandDataMap.keys()).sort();

    let mdContent = `# Marcas Sin Dominio / Logo
Por favor, agrega el dominio web justo después del coma para cada marca que conozcas. Si no tiene o no lo sabes, puedes dejarlo vacío o borrar la línea.
Ejemplo: \`ABC, abc.cl\`

\`\`\`csv
Marca, Categoria, Dominio a inyectar (escribelo aquí)
`;
    
    uniqueBrands.forEach(brand => {
        const category = brandDataMap.get(brand);
        // Padding for better readability
        mdContent += `${brand}, [${category}], \n`;
    });
    mdContent += `\`\`\`\n`;

    const outputPath = path.resolve('/Users/juanignaciojaramillo/.gemini/antigravity/brain/df1360cc-955e-4e94-987a-d5aa16d89ba3/missing_logos.md');
    fs.writeFileSync(outputPath, mdContent);
    console.log(`Saved to ${outputPath}`);
    console.log(mdContent);
}

run().catch(console.error);

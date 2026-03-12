import { createClient } from '@supabase/supabase-js';
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
    const { data: options, error } = await supabase
        .from('battle_options')
        .select('label')
        .is('brand_domain', null)
        .is('image_url', null)
        .order('label', { ascending: true });

    if (error) {
        console.error('Error fetching data:', error);
        process.exit(1);
    }

    if (!options || options.length === 0) {
        console.log('✅ No hay marcas sin dominio/logo pendiente.');
        process.exit(0);
    }

    // Remover duplicados por si una marca aparece en varias batallas
    const uniqueBrands = Array.from(new Set(options.map(o => o.label)));

    console.log(`\nMarcas sin dominio asignado (${uniqueBrands.length} únicas):`);
    console.log(uniqueBrands.join('\n'));
}

run().catch(console.error);

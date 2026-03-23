import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const rawData = fs.readFileSync(path.join(__dirname, 'extracted_domains.json'), 'utf-8');
    const domainsToUpdate = JSON.parse(rawData);

    console.log(`Starting update for ${domainsToUpdate.length} brands...`);
    let successCount = 0;
    let errorCount = 0;

    for (const item of domainsToUpdate) {
        const { label, domain } = item;
        
        // Solo actualizar si estaba nulo, para no sobreescribir otros
        // Pero como son los que pasaron por la lista, actualizamos directamente.
        const { data, error } = await supabase
            .from('battle_options')
            .update({ brand_domain: domain })
            .eq('label', label)
            .is('brand_domain', null);

        if (error) {
            console.error(`Error updating '${label}':`, error.message);
            errorCount++;
        } else {
            console.log(`✅ Updated '${label}' -> '${domain}'`);
            successCount++;
        }
    }

    console.log(`\nFinished! Successfully updated: ${successCount}, Errors: ${errorCount}`);
}

run().catch(console.error);

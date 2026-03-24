import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Use ANON_KEY or SERVICE_ROLE if available. Ensure policies allow UPDATE.
// Wait, for bulk updates we prefer service_role if available, but ANON might work if policies are relaxed.
// Usually scripts use SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY or anon if auth is not strictly required for backend tasks.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    console.log('Reading Excel domains...');
    const wb = xlsx.readFile('Listado_Marcas_Consolidado.xlsx');
    const sheetName = wb.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

    // Fetch entities so we can get their IDs
    console.log('Fetching entities from Supabase...');
    const { data: entitiesData, error: entError } = await supabase.from('entities').select('id, name').limit(3000);
    if (entError) { console.error('Error fetching entities:', entError); return; }
    
    const entitiesMap = new Map<string, string>();
    entitiesData.forEach(ent => {
        entitiesMap.set(ent.name.toLowerCase().trim(), ent.id);
    });

    let updatedCount = 0;
    const updatePromises: Promise<any>[] = [];

    data.forEach((row: any) => {
        const brandNameLower = (row.Marca || '').toLowerCase().trim();
        const dominio = (row.Dominio || '').trim();
        const entityId = entitiesMap.get(brandNameLower);

        if (entityId && dominio) {
            // Clean domain
            const cleanDomain = dominio.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
            updatedCount++;
            
            updatePromises.push(
                supabase.from('entities')
                    .update({ 
                        domain: cleanDomain, 
                        website: dominio.startsWith('http') ? dominio : `https://${dominio}` 
                    })
                    .eq('id', entityId)
            );
        }
    });

    console.log(`Sending ${updatePromises.length} update requests to Supabase...`);
    
    // Process in batches of 50 to not overwhelm the database
    const batchSize = 50;
    for (let i = 0; i < updatePromises.length; i += batchSize) {
        const batch = updatePromises.slice(i, i + batchSize);
        await Promise.all(batch);
        console.log(`Processed batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(updatePromises.length/batchSize)}`);
    }

    console.log(`\n✅ Dominios sincronizados en Supabase: ${updatedCount}`);
}

main().catch(console.error);

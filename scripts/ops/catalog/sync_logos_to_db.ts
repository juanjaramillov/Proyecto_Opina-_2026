import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseKey);

const MANIFEST_NEXT = path.resolve(process.cwd(), 'public/logos/entities_next/manifest.json');
const MANIFEST_PROD = path.resolve(process.cwd(), 'public/logos/entities/manifest.json');

async function main() {
    console.log('Sincronizando rutas locales de logos con Supabase (entities)');

    const allRecords = new Map();

    // Load from entities (prod) first (legacy)
    if (fs.existsSync(MANIFEST_PROD)) {
        try {
            const data = JSON.parse(fs.readFileSync(MANIFEST_PROD, 'utf-8'));
            const list = Array.isArray(data) ? data : (data.details ? Object.values(data.details) : []);
            for (const item of list as any[]) {
                if (item.entitySlug && item.localPath) {
                    allRecords.set(item.entitySlug, item);
                }
            }
        } catch (e) {
            console.error('Error reading prod manifest:', e);
        }
    }

    // Load from entities_next (overwrite)
    if (fs.existsSync(MANIFEST_NEXT)) {
        try {
            const data = JSON.parse(fs.readFileSync(MANIFEST_NEXT, 'utf-8'));
            for (const item of data) {
                if (item.entitySlug && item.localPath && item.status !== 'missing') {
                    // Update to point to the prod folder instead of _next if we are going to migrate them
                    // Or keep the _next path if they aren't migrated. For now let's just use the actual path or assume they will be migrated.
                    // The standard path is /logos/entities/slug.ext since migrate-strong will move them.
                    const finalPath = item.localPath.replace('entities_next', 'entities');
                    allRecords.set(item.entitySlug, { ...item, finalLocalPath: finalPath });
                }
            }
        } catch (e) {
            console.error('Error reading next manifest:', e);
        }
    }

    console.log(`Encontrados ${allRecords.size} logos viables en manifiestos locales para sincronizar.`);

    let updated = 0;
    const recordsArray = Array.from(allRecords.values());
    for (let i = 0; i < recordsArray.length; i++) {
        const item = recordsArray[i];
        
        const pathUrl = item.finalLocalPath || item.localPath;
        if (!pathUrl) continue;
        
        // Use Logo.dev URL directly as image_url if it's from logodev, otherwise use the local path
        let fallbackUrl = pathUrl;
        if (item.sourceProvider === 'logodev' && item.sourceUrl) {
           fallbackUrl = item.sourceUrl;
        }

        const { error } = await supabase
            .from('entities')
            .update({ logo_path: pathUrl, image_url: fallbackUrl })
            .eq('slug', item.entitySlug);

        if (error) {
            console.error(`Error updating ${item.entitySlug}:`, error.message);
        } else {
            updated++;
            process.stdout.write(`\rActualizados: ${updated}/${allRecords.size}`);
        }
    }
    console.log(`\n\nSincronización terminada. ${updated} registros actualizados en DB.`);
}

main().catch(console.error);

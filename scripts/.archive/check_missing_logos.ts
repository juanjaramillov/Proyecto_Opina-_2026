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
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching all entities from Supabase...');
    const { data: entitiesData, error: entError } = await supabase.from('entities').select('*').limit(3000);
    if (entError) { console.error(entError); return; }
    
    const entitiesMap = new Map<string, any>();
    (entitiesData || []).forEach(ent => {
        entitiesMap.set(ent.name.toLowerCase().trim(), ent);
    });
    
    const wb = xlsx.readFile('Listado_Marcas_Consolidado.xlsx');
    const sheetName = wb.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

    let sumMissing = 0;
    let missingNotInEntities = 0;
    let missingInEntitiesButNoUrl = 0;
    let missingInEntitiesButHasDomain = 0;
    let missingInEntitiesNoDomain = 0;
    const countTotalEntitiesFetched = entitiesData?.length || 0;

    data.forEach((row: any) => {
        if (row['Calidad de Logo'] === 4) {
            sumMissing++;
            const brandNameLower = (row.Marca || '').toLowerCase().trim();
            const entityRecord = entitiesMap.get(brandNameLower);
            
            if (!entityRecord) {
                missingNotInEntities++;
            } else {
                missingInEntitiesButNoUrl++;
                if (entityRecord.website || entityRecord.domain) {
                    missingInEntitiesButHasDomain++;
                } else {
                    missingInEntitiesNoDomain++;
                }
            }
        }
    });

    console.log(`\n--- DIAGNÓSTICO DE MARCAS SIN LOGO ---`);
    console.log(`Total de Entidades guardadas en BD: ${countTotalEntitiesFetched}`);
    console.log(`Total de marcas SIN LOGO en Excel: ${sumMissing}`);
    console.log(` - No existen en tu tabla 'entities' (No se han subido): ${missingNotInEntities}`);
    console.log(` - Sí existen en 'entities' pero tienen 'image_url' vacía: ${missingInEntitiesButNoUrl}`);
    console.log(`   * De las cuales SÍ tienen un dominio guardado: ${missingInEntitiesButHasDomain}`);
    console.log(`   * De las cuales NO tienen dominio guardado: ${missingInEntitiesNoDomain}`);
}

main().catch(console.error);

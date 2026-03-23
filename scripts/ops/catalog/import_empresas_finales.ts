import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as xlsxLib from 'xlsx';

// Asegurar compatibilidad con ESM/CJS
const xlsx: any = (xlsxLib as any).default || xlsxLib;

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanDomain(rawDomain: string | undefined | null): string | null {
  if (!rawDomain || rawDomain.trim().toUpperCase() === 'ELIMINAR' || rawDomain.trim().toUpperCase() === 'N/A') {
    return null;
  }
  let domain = rawDomain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return domain;
}

async function updateDomains() {
  console.log("Iniciando importación desde Empresas_Finales.xlsx...");
  try {
    const filePath = path.resolve(process.cwd(), 'Empresas_Finales.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    console.log("Archivo leído. Parseando Excel...");
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const utils = xlsx.utils || (xlsx as any).default.utils;
    const rows: any[] = utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`Excel parseado. Encontradas ${rows.length} filas.`);
    
    let updatedOptions = 0;
    let notFoundOptions = 0;
    let updatedEntities = 0;
    let notFoundEntities = 0;

    console.log("Obteniendo todas las entidades de Supabase...");
    const { data: entities, error: fetchErr } = await supabase
      .from('entities')
      .select('id, name, metadata, category');
      
    if (fetchErr) {
      console.error("Error obteniendo entities", fetchErr);
      return;
    }

    const entitiesMap = new Map();
    entities?.forEach(e => {
      entitiesMap.set(e.name.toLowerCase().trim(), e);
    });
    console.log(`Mapeadas ${entitiesMap.size} entidades.`);

    console.log("Iniciando procesamiento de filas (Batching)...");
    
    // Función auxiliar para procesar una sola fila
    const processRow = async (row: any) => {
      const marca = row['Marca'];
      const rawDomain = row['Dominio Web'];
      if (!marca) return;

      const brandName = marca.trim();
      const newDomain = cleanDomain(rawDomain);
      
      // 1. Update battle_options
      const { data: optionsData, error: optsErr } = await supabase
        .from('battle_options')
        .update({ brand_domain: newDomain })
        .ilike('label', brandName)
        .select('id');
        
      if (optsErr) {
        console.error(`Error actualizando battle_options [${brandName}]:`, optsErr);
      } else {
        if (optionsData && optionsData.length > 0) {
          updatedOptions++;
        } else {
          notFoundOptions++;
          // console.warn(`[!] No en battle_options: ${brandName}`);
        }
      }

      // 2. Update entities metadata
      const entity = entitiesMap.get(brandName.toLowerCase());
      if (entity) {
        const currentMetadata = entity.metadata || {};
        if (newDomain) {
          currentMetadata.brand_domain = newDomain;
        } else {
          delete currentMetadata.brand_domain;
        }

        const { error: entUpdErr } = await supabase
          .from('entities')
          .update({ metadata: currentMetadata })
          .eq('id', entity.id);

        if (entUpdErr) {
          console.error(`Error actualizando entity [${brandName}]:`, entUpdErr);
        } else {
          updatedEntities++;
        }
      } else {
        notFoundEntities++;
        // console.warn(`[!] No en entities: ${brandName}`);
      }
    };

    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      await Promise.all(batch.map(r => processRow(r)));
      console.log(`[PROGRESO] Lote completado: ${Math.min(i + batchSize, rows.length)}/${rows.length}...`);
    }

    console.log(`\n============================`);
    console.log(`Resumen battle_options:`);
    console.log(`Marcas actualizadas: ${updatedOptions}`);
    console.log(`Marcas no encontradas: ${notFoundOptions}`);
    console.log(`\nResumen entities:`);
    console.log(`Entidades actualizadas: ${updatedEntities}`);
    console.log(`Entidades no encontradas: ${notFoundEntities}`);
    console.log(`============================\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error en updateDomains:", error);
    process.exit(1);
  }
}

updateDomains();

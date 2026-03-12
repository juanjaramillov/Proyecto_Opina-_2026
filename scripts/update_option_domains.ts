import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDomains() {
  console.log("Iniciando actualización de dominios...");
  try {
    const filePath = path.resolve(process.cwd(), 'scripts/data/brands_domains.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const lines = content.split('\n');
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('##')) continue;
      
      const match = trimmedLine.match(/^- (.+) — (.+)$/);
      if (match) {
        const brandName = match[1].trim();
        const rawDomain = match[2].trim();
        const domain = rawDomain.replace(/^www\./, '');
        
        console.log(`Buscando: ${brandName} -> ${domain}`);
        
        // Actualizar donde label sea igual (ignorando mayúsculas/minúsculas idealmente, pero probemos exacto primero o con ilike)
        const { data, error } = await supabase
          .from('battle_options')
          .update({ brand_domain: domain })
          .ilike('label', brandName)
          .select('id, label');
          
        if (error) {
          console.error(`Error actualizando ${brandName}:`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(` ✅ Actualizado ${data.length} opciones para: ${brandName}`);
          updatedCount++;
        } else {
          console.log(` ❌ No se encontró la opción: ${brandName}`);
          notFoundCount++;
        }
      }
    }
    
    console.log(`\nResumen:`);
    console.log(`Marcas actualizadas: ${updatedCount}`);
    console.log(`Marcas no encontradas: ${notFoundCount}`);
    
  } catch (error) {
    console.error("Error en updateDomains:", error);
  }
}

updateDomains();

import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const url = 'https://neltawfiwpvunkwyvfse.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I';

const supabase = createClient(url, key);

async function importDomains() {
  const filePath = path.join(process.cwd(), 'listado_opciones_unicas.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error(`¡Error! No existe el archivo en la ruta esperada: ${filePath}`);
    return;
  }
  
  const buf = fs.readFileSync(filePath);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  console.log(`Leídos ${data.length} registros del archivo Excel...`);
  
  let totalOptionsUpdated = 0;
  let domainsAdded = 0;
  
  for (const row of data) {
    const label = row["Nombre (Label)"];
    let domain = row["Dominio"];
    
    if (domain && domain.trim() !== '' && domain.trim().toLowerCase() !== 'sin dominio') {
      domain = domain.trim();
      domainsAdded++;
      
      const cleanLabel = (label || '').trim();
      
      // Update BATTLE OPTIONS
      const { data: updatedOpts, error: errOpts } = await supabase
        .from('battle_options')
        .update({ brand_domain: domain })
        .ilike('label', cleanLabel)
        .select('id');
        
      if (errOpts) {
        console.error(`Error actualizando opciones para [${label}]:`, errOpts.message);
      } else if (updatedOpts && updatedOpts.length > 0) {
        totalOptionsUpdated += updatedOpts.length;
        console.log(`✅ Opciones actualizadas: [${label}] => ${domain} (${updatedOpts.length} coincidencias en distintas batallas)`);
      }
    }
  }
  
  console.log(`\nImportación finalizada con éxito.`);
  console.log(`Marcas a las que se les detectó y añadió un dominio desde el Excel: ${domainsAdded}`);
  console.log(`Total de registros individuales afectados en la base de datos: ${totalOptionsUpdated}`);
}

importDomains().catch(console.error);

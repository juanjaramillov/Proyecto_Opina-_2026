import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = 'https://neltawfiwpvunkwyvfse.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I';

const supabase = createClient(url, key);

async function exportOptions() {
  console.log('Descargando opciones...');
  
  const allOptions = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data: options, error } = await supabase
      .from('battle_options')
      .select('id, label, battle_id, image_url, brand_domain')
      .range(from, from + step - 1);
      
    if (error) {
      console.error('Error obteniendo datos', error);
      break;
    }
    
    if (!options || options.length === 0) break;
    
    allOptions.push(...options);
    if (options.length < step) break;
    from += step;
  }
  
  console.log(`Exportando ${allOptions.length} opciones optimizadas para Excel...`);
  
  const headers = ['ID', 'Nombre (Label)', 'ID Batalla', 'Tiene Imagen/Logo', 'Dominio'];
  const rows = allOptions.map(opt => {
    const hasImage = (opt.image_url && opt.image_url.trim() !== '') ? 'SI' : 'NO';
    const domain = opt.brand_domain || 'Sin dominio';
    const cleanLabel = (opt.label || '').replace(/"/g, '""');
    // Excel en español espera punto y coma en lugar de coma para separar columnas
    return `"${opt.id}";"${cleanLabel}";"${opt.battle_id}";"${hasImage}";"${domain}"`;
  });
  
  // Agregar BOM (\uFEFF) para que Excel reconozca correctamente los tildes y el formato UTF-8
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  
  const outputPath = path.join(process.cwd(), 'listado_opciones_excel.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  
  console.log(`Archivo generado en: ${outputPath}`);
}

exportOptions().catch(console.error);

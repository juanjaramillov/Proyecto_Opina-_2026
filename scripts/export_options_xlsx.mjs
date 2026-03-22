import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const url = 'https://neltawfiwpvunkwyvfse.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I';

const supabase = createClient(url, key);

async function exportOptions() {
  console.log('Descargando opciones de la DB...');
  
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
  
  console.log('Depurando nombres duplicados...');
  
  const uniqueOptionsMap = new Map();
  for (const opt of allOptions) {
    const cleanLabel = (opt.label || '').trim().toLowerCase();
    
    if (!uniqueOptionsMap.has(cleanLabel)) {
      uniqueOptionsMap.set(cleanLabel, {
        id: opt.id,
        label: opt.label, // Mantenemos las mayúsculas originales
        battle_ids: new Set([opt.battle_id]),
        hasImage: (opt.image_url && opt.image_url.trim() !== '') ? 'SI' : 'NO',
        domain: opt.brand_domain || 'Sin dominio'
      });
    } else {
      const existing = uniqueOptionsMap.get(cleanLabel);
      existing.battle_ids.add(opt.battle_id);
      // Si otra instancia sí tiene imagen, guardamos que la marca general sí tiene
      if (opt.image_url && opt.image_url.trim() !== '') {
        existing.hasImage = 'SI';
      }
      // Lo mismo para el dominio
      if (opt.brand_domain && existing.domain === 'Sin dominio') {
         existing.domain = opt.brand_domain;
      }
    }
  }

  const uniqueRows = Array.from(uniqueOptionsMap.values()).map(existing => ({
    "Nombre (Label)": existing.label,
    "Cantidad de Veces Repetida": existing.battle_ids.size,
    "ID de Referencia": existing.id,
    "Tiene Imagen/Logo": existing.hasImage,
    "Dominio": existing.domain
  }));
  
  console.log(`De ${allOptions.length} opciones, quedaron ${uniqueRows.length} marcas únicas.`);
  
  const worksheet = XLSX.utils.json_to_sheet(uniqueRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Opciones Únicas");
  
  const outputPath = path.join(process.cwd(), 'listado_opciones_unicas.xlsx');
  XLSX.writeFile(workbook, outputPath);
  
  console.log(`Archivo generado con éxito en: ${outputPath}`);
}

exportOptions().catch(console.error);

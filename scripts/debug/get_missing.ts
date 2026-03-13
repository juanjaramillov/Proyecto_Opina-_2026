import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data: entities, error } = await supabase.from('entities').select('name, slug, metadata, type').eq('type', 'brand');
    if (error) {
      console.error("DB Error:", error);
      return;
    }
    
    if (!entities) {
      console.log("No entities found.");
      return;
    }
    
    const files = fs.readdirSync('./public/logos/entities').map(f => f.split('.')[0]);
    
    const missing = entities.filter(e => e.slug && !files.includes(e.slug));
    console.log(`Faltan ${missing.length} logos de un total de ${entities.length} marcas.`);
    
    const withDomain = missing.filter(m => m.metadata?.domain);
    const withoutDomain = missing.filter(m => !m.metadata?.domain);
    
    console.log(`- Tienen dominio configurado pero falló la descarga: ${withDomain.length}`);
    console.log(`- NO tienen dominio web configurado: ${withoutDomain.length}`);
    
    console.log("\n--- MUESTRA DE LOS QUE FALTAN ---");
    missing.forEach(m => console.log(`- ${m.name} (Slug: ${m.slug}, Dominio: ${m.metadata?.domain || 'N/A'})`));

  } catch (err) {
    console.error("Script Error:", err);
  }
}

check();

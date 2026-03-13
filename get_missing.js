import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: entities, error } = await supabase.from('signal_entities').select('entity_name, entity_slug, brand_domain');
  if (error) {
    console.error(error);
    return;
  }
  
  const files = fs.readdirSync('./public/logos/entities').map(f => f.split('.')[0]);
  
  const missing = entities.filter(e => e.entity_slug && !files.includes(e.entity_slug));
  console.log(`Faltan ${missing.length} logos de un total de ${entities.length} entidades.`);
  console.log("Muestra de los que faltan:");
  missing.slice(0, 30).forEach(m => console.log(`- ${m.entity_name} (Slug: ${m.entity_slug}, Dominio: ${m.brand_domain || 'N/A'})`));
}

check();

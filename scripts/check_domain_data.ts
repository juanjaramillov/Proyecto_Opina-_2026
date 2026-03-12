import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDomains() {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .or('image_url.is.null,image_url.eq.')
    .eq('type', 'brand');

  if (error) {
    console.error(error);
    return;
  }

  let withDomain = 0;
  let withoutDomain = 0;
  const samplesWithDomain: string[] = [];
  
  data.forEach(item => {
    // Also check if domain exists as a top-level property via arbitrary parsing, though we verified it doesn't
    const domain = item.metadata?.domain || item.metadata?.website || item.metadata?.url;
    if (domain) {
      withDomain++;
      if (samplesWithDomain.length < 5) {
        samplesWithDomain.push(`- ${item.name}: ${domain}`);
      }
    } else {
      withoutDomain++;
    }
  });
  
  console.log(`De las ${data.length} marcas sin logo, ${withDomain} tienen el dominio guardado en 'metadata'.`);
  console.log(`Faltan dominios en ${withoutDomain} registros.`);
  
  if (withDomain > 0) {
    console.log(`\nEjemplos con dominio en metadata:`);
    samplesWithDomain.forEach(s => console.log(s));
  }
}

checkDomains();

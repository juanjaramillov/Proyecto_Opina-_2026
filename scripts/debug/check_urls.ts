import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: options } = await supabase.from('options').select('name, brand_domain').order('name').limit(20);
  console.log("=== OPTIONS LOG ===");
  console.log(JSON.stringify(options, null, 2));

  const { data: optionsEntel } = await supabase.from('options').select('name, brand_domain').ilike('name', '%entel%').limit(5);
  console.log("=== OPTIONS ENTEL ===");
  console.log(JSON.stringify(optionsEntel, null, 2));
}

check();

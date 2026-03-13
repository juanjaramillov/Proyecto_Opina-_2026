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
  const { data: entities, error } = await supabase.from('entities').select('name, metadata').eq('name', 'Entel').limit(5);
  console.log("=== ENTEL ===");
  console.log(JSON.stringify(entities, null, 2));

  const { data: options, errorOpt } = await supabase.from('battle_options').select('url, option_name').eq('option_name', 'Entel').limit(5);
  console.log("=== BATTLE OPTIONS ENTEL ===");
  console.log(JSON.stringify(options, null, 2));
}

check();

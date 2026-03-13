import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: cols1 } = await supabase.from('signal_entities').select().limit(1);
  console.log("Cols signal_entities:", cols1 ? Object.keys(cols1[0]) : null);

  const { data: cols2 } = await supabase.from('battle_options').select().limit(1);
  console.log("Cols battle_options:", cols2 ? Object.keys(cols2[0]) : null);

  const { data, error } = await supabase.from('signal_entities').select('slug, image_url').limit(10);
  console.log("Entities sample:", JSON.stringify(data, null, 2));

  const { data: options } = await supabase.from('battle_options').select('label, image_url, entity_slug').limit(5);
  console.log("Options sample:", JSON.stringify(options, null, 2));
}

check();

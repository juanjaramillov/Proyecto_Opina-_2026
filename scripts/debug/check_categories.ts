import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: entities, error } = await supabase.from('entities').select('name, category, vertical, metadata, type').eq('type', 'brand').limit(15);
  console.log(JSON.stringify(entities, null, 2));
}

check();

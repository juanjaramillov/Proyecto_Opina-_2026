import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectEntities() {
  console.log('--- entities Schema Probe ---');
  const { data: sample } = await supabase.from('entities').select('*').limit(1);
  if (sample && sample.length > 0) {
      console.log('Keys in entities:', Object.keys(sample[0]));
  } else {
      console.log('Entities table is empty or inaccessible.');
  }
}

inspectEntities();

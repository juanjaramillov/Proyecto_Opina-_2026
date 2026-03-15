import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findEntities() {
  console.log('--- Finding Entities ---');
  const { data: entities } = await supabase.from('entities').select('id, display_name').limit(10);
  console.log('Entities in table:', entities);

  const { data: signalEntities } = await supabase.from('signal_entities').select('id, display_name').limit(10);
  console.log('Signal Entities in table:', signalEntities);
}

findEntities();

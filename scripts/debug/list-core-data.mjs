import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCoreData() {
  console.log('--- Core Data Listing ---');

  const { data: entities } = await supabase.from('signal_entities').select('id, display_name').limit(10);
  console.log('Signal Entities sample:', entities);

  const { data: options } = await supabase.from('battle_options').select('id, battle_id, brand_id, signal_entity_id').limit(10);
  console.log('Battle Options sample:', options);

  const { data: events } = await supabase.from('signal_events').select('entity_id, option_id').limit(5);
  console.log('Signal Events sample IDs:', events);
}

listCoreData();

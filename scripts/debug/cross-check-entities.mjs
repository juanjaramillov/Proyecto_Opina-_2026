import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function crossCheckEntities() {
  console.log('--- Cross-Table Entity Check ---');

  const { data: events } = await supabase.from('signal_events').select('entity_id').limit(5);
  if (!events || events.length === 0) {
    console.log('No signal events found.');
    return;
  }

  const ids = events.map(e => e.entity_id);
  console.log('Checking IDs from signal_events:', ids);

  const { data: signalEntities } = await supabase.from('signal_entities').select('id, display_name').in('id', ids);
  console.log('Found in signal_entities:', signalEntities?.length || 0);

  const { data: regularEntities } = await supabase.from('entities').select('id, display_name').in('id', ids);
  console.log('Found in regular entities:', regularEntities?.length ||regularEntities);
  if (regularEntities && regularEntities.length > 0) {
      console.log('Sample matches in entities:', regularEntities);
  }
}

crossCheckEntities();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('--- Schema Inspection ---');

  // 1. Describe signal_events
  const { data: cols, error: err } = await supabase.rpc('inspect_table_columns', { p_table_name: 'signal_events' });
  // If RPC doesn't exist, we'll try something else
  if (err) {
      console.log('RPC inspect_table_columns failed, using raw query if possible or just sampling data.');
      const { data: sample } = await supabase.from('signal_events').select('*').limit(1);
      console.log('Signal Event Sample:', sample);
  } else {
      console.log('Signal Events Columns:', cols);
  }

  // 2. Check a few IDs from signal_events in other tables
  const { data: events } = await supabase.from('signal_events').select('entity_id, battle_id, option_id').limit(5);
  console.log('IDs in signal_events:', events);

  if (events && events.length > 0) {
      const entityId = events[0].entity_id;
      const { data: ent } = await supabase.from('signal_entities').select('id, display_name').eq('id', entityId).single();
      console.log(`Checking entity_id ${entityId} in signal_entities:`, ent || 'NOT FOUND');

      const { data: opt } = await supabase.from('battle_options').select('id, brand_id, signal_entity_id').eq('id', events[0].option_id).single();
      console.log(`Checking option_id ${events[0].option_id} in battle_options:`, opt || 'NOT FOUND');
      
      if (opt && opt.signal_entity_id) {
          console.log(`Option points to signal_entity_id: ${opt.signal_entity_id}`);
          const { data: entFromOpt } = await supabase.from('signal_entities').select('id, display_name').eq('id', opt.signal_entity_id).single();
          console.log(`Checking that entFromOpt in signal_entities:`, entFromOpt || 'NOT FOUND');
      }
  }
}

inspectSchema();

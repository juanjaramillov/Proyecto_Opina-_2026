import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEntitiesData() {
  console.log('--- Entities Data Check ---');
  
  // 1. Sample from entities
  const { data: entities, error: eErr } = await supabase.from('entities').select('id, display_name').limit(5);
  if (eErr) console.error('Error fetching entities:', eErr);
  else console.log('Sample entities:', entities);

  // 2. Sample from signal_events
  const { data: events, error: sErr } = await supabase.from('signal_events').select('entity_id').limit(5);
  if (sErr) console.error('Error fetching events:', sErr);
  else {
      console.log('Sample event entity_ids:', events.map(e => e.entity_id));
      if (entities && entities.length > 0 && events.length > 0) {
          const firstEventId = events[0].entity_id;
          const match = entities.find(e => e.id === firstEventId);
          console.log(`Checking if first event ID ${firstEventId} matches any in sample:`, match ? 'YES' : 'NO');
          
          // Precise check
          const { data: directMatch } = await supabase.from('entities').select('id, display_name').eq('id', firstEventId).single();
          console.log(`Direct check for ${firstEventId} in entities:`, directMatch || 'NOT FOUND');
      }
  }
}

checkEntitiesData();

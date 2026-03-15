import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatches() {
  console.log('--- Final Match Check ---');
  
  // 1. Get raw event IDs
  const { data: events } = await supabase.from('signal_events').select('entity_id').limit(10);
  const ids = events?.map(e => e.entity_id) || [];
  
  if (ids.length === 0) {
      console.log('No signal_events found.');
      return;
  }

  // 2. Check if they exist in entities AND are active
  const { data: matches, error } = await supabase
    .from('entities')
    .select('id, name, is_active')
    .in('id', ids);

  if (error) {
      console.error('Error checking entities:', error);
  } else {
      console.log(`Found ${matches?.length || 0} matches in entities for ${ids.length} signals.`);
      if (matches) {
          console.log('Matches status:', matches.map(m => `${m.name}: ${m.is_active ? 'ACTIVE' : 'INACTIVE'}`));
      }
  }
}

checkMatches();

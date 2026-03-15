import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const ids = ['OP-6608571C', 'OP-7264CFF1', 'OP-84D2A174'];
  
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('user_id, nickname')
    .in('nickname', ids);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Profiles found:', JSON.stringify(profiles, null, 2));

  if (profiles && profiles.length > 0) {
     const userIds = profiles.map(p => p.user_id);
     const { data: signals, error: sError } = await supabase
       .from('signal_events')
       .select('id, user_id, battle_id, option_id, signal_type_id, value_json')
       .in('user_id', userIds);

     if (sError) {
        console.error('Error fetching signals:', sError);
     } else {
        console.log(`Found ${signals.length} signals for these users.`);
        const orphans = signals.filter(s => s.signal_type_id === null);
        console.log(`Of those, ${orphans.length} are orphans (no type).`);
        
        // Show a few orphans to verify
        if (orphans.length > 0) {
            console.log('Sample orphans:', JSON.stringify(orphans.slice(0, 3), null, 2));
        }
     }
  }
}

checkUsers();

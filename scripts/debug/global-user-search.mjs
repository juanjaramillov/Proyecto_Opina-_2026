import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function globalSearch() {
  const ids = ['OP-6608571C', 'OP-7264CFF1', 'OP-84D2A174'];
  console.log('Searching for identifiers:', ids);

  // 1. Check user_profiles (nickname)
  const { data: profiles } = await supabase.from('user_profiles').select('*').in('nickname', ids);
  console.log('Profiles found:', profiles?.length || 0);

  // 2. Check invitation_codes (assigned_alias, code)
  const { data: codes } = await supabase.from('invitation_codes').select('*').or(`assigned_alias.in.(${ids.map(id => `"${id}"`).join(',')}),code.in.(${ids.map(id => `"${id}"`).join(',')})`);
  console.log('Invitation codes found:', codes?.length || 0);
  if (codes) console.log('Codes details:', JSON.stringify(codes, null, 2));

  // 3. Check users table (might need raw query if searching metadata)
  // For now let's just search by ID if they happen to be ID (unlikely)
  
  // If we found invitation codes, we can find the users who claimed them
  if (codes && codes.length > 0) {
    const claimedBy = codes.map(c => c.used_by_user_id).filter(id => !!id);
    if (claimedBy.length > 0) {
        console.log('Users linked to these codes:', claimedBy);
        const { data: userStats } = await supabase.from('signal_events').select('id, user_id, signal_type_id').in('user_id', claimedBy);
        console.log(`Found ${userStats?.length || 0} signals for these users.`);
        const orphans = userStats?.filter(s => s.signal_type_id === null);
        console.log(`Orphans: ${orphans?.length || 0}`);
    }
  }
}

globalSearch();

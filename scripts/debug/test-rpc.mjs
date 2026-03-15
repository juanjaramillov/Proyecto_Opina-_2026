import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log('--- RPC Test ---');
  const { data, error } = await supabase.rpc('get_active_battles').range(0, 10);
  
  if (error) {
    console.error('Error calling get_active_battles:', error);
  } else {
    console.log(`RPC returned ${data?.length || 0} battles.`);
    if (data && data.length > 0) {
      console.log('Sample battle:', JSON.stringify(data[0], null, 2));
    }
  }
}

testRpc();

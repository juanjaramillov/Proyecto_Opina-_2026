import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321', 
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function main() {
  const { data, error } = await supabase.rpc('get_active_battles').range(0, 999);
  if (error) {
    console.error('Error fetching battles:', error);
  } else {
    console.log('Got', data?.length, 'battles.');
    if (data?.length > 0) {
      console.log('Sample battle:', JSON.stringify(data[0], null, 2));
    }
  }

  // Check what's in entities table
  const { data: ent, error: errEnt } = await supabase.from('entities').select('*').limit(5);
  console.log('Entities count snippet:', ent?.length);
  if (ent && ent.length > 0) {
    console.log('Sample Entity:', ent[0]);
  }
}
main();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('--- Listing Tables ---');
  // We can use a trick to list tables by querying a system view if the select is allowed
  const { data, error } = await supabase.rpc('inspect_tables'); 
  // If inspect_tables doesn't exist, we'll try a common hack or just check names
  if (error) {
      console.log('inspect_tables RPC failed. Trying manual probing...');
      const commonTables = ['brands', 'entities', 'signal_entities', 'battles', 'battle_options', 'signal_events'];
      for (const table of commonTables) {
          const { data: sample, error: sErr } = await supabase.from(table).select('*').limit(1);
          console.log(`Table '${table}':`, sErr ? `Error: ${sErr.message}` : (sample?.length > 0 ? 'Exists (has data)' : 'Exists (empty)'));
      }
  } else {
      console.log('Tables:', data);
  }
}

listTables();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignal() {
  console.log("Fetching recent battles...");
  // Fetch a recently created battle
  const { data: battles, error: battleError } = await supabase
    .from('battles')
    .select('id, title, category_id, status')
    .order('created_at', { ascending: false })
    .limit(3);

  if (battleError || !battles || battles.length === 0) {
    console.error("Error fetching battles:", battleError);
    return;
  }

  const battle = battles[0];
  console.log(`Testing against battle: ${battle.title} (ID: ${battle.id}, Status: ${battle.status})`);

  // Fetch options for this battle
  const { data: options, error: optsError } = await supabase
    .from('battle_options')
    .select('id, label, brand_id')
    .eq('battle_id', battle.id);

  if (optsError || !options || options.length === 0) {
    console.error("Error fetching options:", optsError);
    return;
  }

  const option = options[0];
  console.log(`Voting for option: ${option.label} (ID: ${option.id})`);

  // Verify battle_instances
  const { data: instances, error: instError } = await supabase
    .from('battle_instances')
    .select('id, version, starts_at')
    .eq('battle_id', battle.id);
  console.log("Instances for battle:", instances);

  const deviceHash = 'debug_device_hash_123';
  const clientId = crypto.randomUUID();

  console.log(`Calling insert_signal_event RPC...`);
  const { data: rpcData, error: rpcError } = await supabase.rpc('insert_signal_event', {
    p_battle_id: battle.id,
    p_option_id: option.id,
    p_client_event_id: clientId,
    p_device_hash: deviceHash
  });

  if (rpcError) {
    console.error("❌ RPC Error:", rpcError);
  } else {
    console.log("✅ RPC Success:", rpcData);
  }
}

testSignal();

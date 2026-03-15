import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function recoverSpecificSignals() {
  const userIds = [
    'e04dacfa-83d1-4cee-ad0c-1ab6bb91e47f',
    'dd2b1ee3-92d8-44e2-89be-d1d9fa016a24',
    '4659a208-3fba-4a5e-8b67-85c76e173791'
  ];

  console.log(`Starting recovery for users: ${userIds.join(', ')}`);

  // 1. Get orphaned signals for these users
  const { data: orphans, error: orphansError } = await supabase
    .from('signal_events')
    .select('id, user_id, battle_id, option_id, created_at')
    .in('user_id', userIds)
    .is('signal_type_id', null);

  if (orphansError) {
    console.error('Error fetching orphans:', orphansError);
    return;
  }

  console.log(`Found ${orphans?.length || 0} orphaned signals to recover.`);
  if (!orphans || orphans.length === 0) return;

  // 2. Resolve VERSUS_SIGNAL type ID
  const { data: typeData } = await supabase
    .from('signal_types')
    .select('id')
    .eq('code', 'VERSUS_SIGNAL')
    .single();
  
  const versusTypeId = typeData?.id;
  if (!versusTypeId) {
    console.error('Could not find VERSUS_SIGNAL type ID');
    return;
  }

  // 3. Cache battle options to avoid too many requests
  const battleOptionsCache = new Map();

  let recoveredCount = 0;
  for (const orphan of orphans) {
    let options = battleOptionsCache.get(orphan.battle_id);
    if (!options) {
      const { data: fetchedOptions } = await supabase
        .from('battle_options')
        .select('id')
        .eq('battle_id', orphan.battle_id);
      options = fetchedOptions;
      battleOptionsCache.set(orphan.battle_id, options);
    }

    if (options && options.length === 2) {
      const loserOption = options.find(o => o.id !== orphan.option_id);
      if (loserOption) {
        // Resolve entity IDs using RPC
        const { data: winnerEntity } = await supabase.rpc('resolve_entity_id', { p_option_id: orphan.option_id });
        const { data: loserEntity } = await supabase.rpc('resolve_entity_id', { p_option_id: loserOption.id });

        const valueJson = {
          source: 'versus',
          loser_option_id: loserOption.id,
          loser_entity_id: loserEntity
        };

        const { error: updateError } = await supabase
          .from('signal_events')
          .update({
            signal_type_id: versusTypeId,
            value_json: valueJson,
            module_type: 'versus'
          })
          .eq('id', orphan.id);

        if (!updateError) {
          recoveredCount++;
        } else {
          console.error(`Error updating signal ${orphan.id}:`, updateError);
        }
      }
    } else {
        // Fallback for non-binary or failed resolution
        const { error: updateError } = await supabase
          .from('signal_events')
          .update({
            signal_type_id: versusTypeId,
            module_type: 'versus'
          })
          .eq('id', orphan.id);
        
        if (!updateError) recoveredCount++;
    }
  }

  console.log(`Successfully recovered ${recoveredCount} signals for the specified users.`);
}

recoverSpecificSignals();

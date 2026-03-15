import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function recoverSignals() {
  console.log('--- Analyzing orphaned signals ---');
  
  // 1. Fetch orphaned signals
  const { data: orphans, error: orphansError } = await supabase
    .from('signal_events')
    .select('id, battle_id, option_id, created_at')
    .is('signal_type_id', null);

  if (orphansError) {
    console.error('Error fetching orphans:', orphansError);
    return;
  }

  console.log(`Found ${orphans?.length || 0} orphaned signals.`);

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

  // 3. Process each orphan
  let recoveredCount = 0;
  for (const orphan of orphans) {
    // Get all options for this battle
    const { data: options } = await supabase
      .from('battle_options')
      .select('id')
      .eq('battle_id', orphan.battle_id);

    if (options && options.length === 2) {
      // It's a binary choice, we can infer the loser
      const loserOption = options.find(o => o.id !== orphan.option_id);
      
      if (loserOption) {
        // Resolve entity IDs (best effort)
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
      // For battles with != 2 options, we just set the type so they count as wins
      // (but won't count as losses for anyone)
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

  console.log(`Successfully recovered ${recoveredCount} signals.`);
}

recoverSignals();

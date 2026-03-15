import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseResults() {
  console.log('--- Diagnostic Report ---');

  // 1. Check if the view returns anything
  const { data: viewData, error: viewError } = await supabase
    .from('v_comparative_preference_summary')
    .select('*')
    .limit(5);

  if (viewError) {
    console.error('Error reading view:', viewError);
  } else {
    console.log(`View returned ${viewData?.length || 0} rows.`);
    if (viewData && viewData.length > 0) {
      console.log('Sample view data:', JSON.stringify(viewData, null, 2));
    }
  }

  // 2. Check signal_events count for VERSUS_SIGNAL
  const { data: typeData } = await supabase.from('signal_types').select('id, code').eq('code', 'VERSUS_SIGNAL').single();
  console.log('VERSUS_SIGNAL Type:', typeData);

  if (typeData) {
    const { count, error: countError } = await supabase
      .from('signal_events')
      .select('*', { count: 'exact', head: true })
      .eq('signal_type_id', typeData.id);
    
    console.log(`Total VERSUS_SIGNAL events in DB: ${count}`);
  }

  // 3. Check if recovered users have active entities
  const userId = 'e04dacfa-83d1-4cee-ad0c-1ab6bb91e47f'; // One of the recovered users
  const { data: userSignals } = await supabase
    .from('signal_events')
    .select('entity_id, value_json')
    .eq('user_id', userId)
    .limit(5);
  
  console.log('Sample user signals:', userSignals);

  if (userSignals && userSignals.length > 0) {
    const entityIds = userSignals.map(s => s.entity_id);
    const { data: entities } = await supabase
      .from('signal_entities')
      .select('id, display_name, is_active')
      .in('id', entityIds);
    
    console.log('Active status of targeted entities:', entities);
  }
}

diagnoseResults();

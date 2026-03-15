import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyNewFeatures() {
  console.log('--- Verifying Demographic Insights & KPIs ---');
  
  // 1. Check KPIs
  const { data: kpis, error: kErr } = await supabase.rpc('get_results_kpis');
  if (kErr) console.error('Error in get_results_kpis:', kErr);
  else console.log('KPIs returned:', kpis);

  // 2. Check Demographic Insights
  const { data: insights, error: iErr } = await supabase
    .from('v_demographic_preference_insights')
    .select('*')
    .limit(5);
    
  if (iErr) console.error('Error in v_demographic_preference_insights:', iErr);
  else console.log('Sample Demographic Insights:', insights);
}

verifyNewFeatures();

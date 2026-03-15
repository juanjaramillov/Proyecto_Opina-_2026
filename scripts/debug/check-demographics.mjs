import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDemographics() {
  console.log('--- Demographic Data Check ---');
  
  // 1. Gender distribution
  const { data: genderData, error: gErr } = await supabase
    .from('signal_events')
    .select('gender')
    .not('gender', 'is', null);
  
  if (gErr) console.error('Error fetching gender data:', gErr);
  else {
      const counts = genderData.reduce((acc, curr) => {
          acc[curr.gender] = (acc[curr.gender] || 0) + 1;
          return acc;
      }, {});
      console.log('Gender distribution in signal_events:', counts);
  }

  // 2. Age bucket distribution
  const { data: ageData, error: aErr } = await supabase
    .from('signal_events')
    .select('age_bucket')
    .not('age_bucket', 'is', null);
    
  if (aErr) console.error('Error fetching age data:', aErr);
  else {
      const counts = ageData.reduce((acc, curr) => {
          acc[curr.age_bucket] = (acc[curr.age_bucket] || 0) + 1;
          return acc;
      }, {});
      console.log('Age bucket distribution in signal_events:', counts);
  }

  // 3. Sample a few events with both entity_id and gender
  const { data: samples } = await supabase
    .from('signal_events')
    .select('entity_id, gender, age_bucket')
    .limit(10);
  console.log('Sample signal events with demographics:', samples);
}

checkDemographics();

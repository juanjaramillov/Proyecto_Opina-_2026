import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  const { data, error } = await supabase
    .from('whatsapp_webhook_logs')
    .select('created_at, payload')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  console.log(`Found ${data.length} logs:`);
  data.forEach((log, index) => {
    console.log(`\n--- Log ${index + 1} at ${log.created_at} ---`);
    console.log(JSON.stringify(log.payload, null, 2));
    
    // Extract exact reason
    if (log.payload.entry?.[0]?.changes?.[0]?.value?.statuses) {
      const statuses = log.payload.entry[0].changes[0].value.statuses;
      for (const status of statuses) {
        if (status.errors) {
          console.log(`\n>>> EXACT ERROR:`, JSON.stringify(status.errors, null, 2));
        }
      }
    }
  });
}

checkLogs();

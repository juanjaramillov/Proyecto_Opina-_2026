import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  console.log("Checking Webhook Statuses in DB for recipient...");
  const { data: statuses, error } = await supabaseAdmin
      .from('whatsapp_inbound_messages')
      .select('message_type, wa_from, body, created_at, raw')
      .like('message_type', 'status_%')
      .order('created_at', { ascending: false })
      .limit(10);

  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log(JSON.stringify(statuses, null, 2));
  }
}

run();

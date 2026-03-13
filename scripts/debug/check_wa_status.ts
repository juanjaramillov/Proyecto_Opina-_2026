import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAdminKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAdminKey);

async function check() {
  const { data, error } = await supabase
    .from('invitation_codes')
    .select('id, code, whatsapp_phone, whatsapp_status, whatsapp_error, whatsapp_sent_at, whatsapp_last_sent_at')
    .order('whatsapp_last_sent_at', { ascending: false, nullsFirst: false })
    .limit(5);

  if (error) {
    console.error("Error fetching:", error);
  } else {
    console.log("Latest WhatsApp attempts:");
    console.table(data);
  }
}

check();

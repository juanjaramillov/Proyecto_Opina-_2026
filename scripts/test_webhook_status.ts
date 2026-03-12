import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log("Triggering Edge Function...");
  const functionUrl = `${supabaseUrl}/functions/v1/send-whatsapp-invite`;

  // Fetch a pending invite
  const { data: invites } = await supabaseAdmin
      .from('invitation_codes')
      .select('id, code, whatsapp_phone, whatsapp_status')
      .eq('whatsapp_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

  if (!invites || invites.length === 0) {
      console.log('No pending invites found.');
      return;
  }

  const inviteId = invites[0].id;
  const phone = '+56991284219'; // hardcoded test number

  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitation_id: inviteId, phone_e164: phone })
  });

  const data = await res.json();
  console.log(`Edge Function response:`, data);
  if (!data.success) return;

  const messageId = data.messageId;
  console.log(`Message API sent with ID: ${messageId}. Waiting 3 seconds for Meta webhook...`);
  
  await new Promise(r => setTimeout(r, 4000));

  console.log("Checking Webhook Statuses in DB...");
  const { data: statuses, error } = await supabaseAdmin
      .from('whatsapp_inbound_messages')
      .select('message_type, body, created_at, raw')
      .like('message_type', 'status_%')
      .order('created_at', { ascending: false })
      .limit(5);

  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log(JSON.stringify(statuses, null, 2));
  }
}

run();

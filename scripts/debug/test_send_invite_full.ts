import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log("Generating a test invite by direct insert...");
  
  // 1. Generate an invite
  const { data: invite, error: genErr } = await supabaseAdmin.from('invitation_codes').insert([{
    code: 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    status: 'pending'
  }]).select();
  
  if (genErr) {
    console.error("Generator error:", genErr);
    return;
  }
  
  const inviteId = invite[0].id;
  const testPhone = "56991284219"; // User test phone
  
  console.log(`Generated invite: ${invite[0].code} (ID: ${inviteId})`);
  console.log(`Triggering edge function for phone ${testPhone}...`);
  
  // 2. Trigger edge function using anon key (the edge function checks nothing or checks anon?)
  // Wait, edge function uses anonKey but doesn't check auth.
  const functionUrl = `${supabaseUrl}/functions/v1/send-whatsapp-invite`;
  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invitation_id: inviteId,
        phone_e164: testPhone
      })
    });

    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

run();

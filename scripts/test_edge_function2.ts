import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testFunction() {
  const functionUrl = `${supabaseUrl}/functions/v1/send-whatsapp-invite`;
  console.log('Hitting:', functionUrl);

  const { data: invites } = await supabaseAdmin
      .from('invitation_codes')
      .select('id, code, whatsapp_phone, whatsapp_status')
      .eq('whatsapp_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

  let inviteId = '123e4567-e89b-12d3-a456-426614174000';
  let phone = '+56991284219'; // hardcoded test number
  
  if (invites && invites.length > 0) {
      inviteId = invites[0].id;
      console.log(`Testing with real invite (status ${invites[0].whatsapp_status}): ${invites[0].code} for ${phone}`);
  } else {
      console.log('No invites found, using dummy UUID');
  }

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invitation_id: inviteId,
        phone_e164: phone
      })
    });

    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testFunction();

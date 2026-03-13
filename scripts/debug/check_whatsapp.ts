import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: 'supabase/.env.local' }); // Try to load from supabase folder too
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("No SUPABASE_SERVICE_ROLE_KEY found in .env.local or supabase/.env.local");
  // we will execute a raw query via a proxy function if needed, or ask user.
} else {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  async function checkWhatsApp() {
    const { data, error } = await supabaseAdmin
      .from('invitation_codes')
      .select('code, whatsapp_phone, whatsapp_status, whatsapp_error, whatsapp_sent_at, whatsapp_last_sent_at, created_at')
      .not('whatsapp_status', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('Recent WhatsApp Activity:');
      console.log(JSON.stringify(data, null, 2));
    }
  }

  checkWhatsApp();
}

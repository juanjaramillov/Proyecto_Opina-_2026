import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInvites() {
  const { data, error } = await supabase
    .from('invitation_codes')
    .select('id, status, whatsapp_message_id, created_at, whatsapp_phone')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching invites:', error);
    return;
  }

  console.log(`\n============ ÚLTIMAS ${data.length} INVITACIONES ============`);
  
  const statusCounts: Record<string, number> = {};
  data.forEach((invite: any) => {
    statusCounts[invite.status] = (statusCounts[invite.status] || 0) + 1;
    console.log(`- ${invite.whatsapp_phone}: Estado=${invite.status}, ID_Mensaje=${invite.whatsapp_message_id ? invite.whatsapp_message_id : 'NO'}, Creado=${invite.created_at}`);
  });
  
  console.log('\n============ RESUMEN ============');
  console.log(statusCounts);
  console.log('=================================\n');
}

checkInvites();

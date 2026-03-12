import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://neltawfiwpvunkwyvfse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking invite codes ---');
  const codes = ['OP-80EB9D35', '80EB9D35'];
  for (const c of codes) {
      const { data, error } = await supabase.from('invitation_codes').select('*').eq('code', c);
      console.log(`Code ${c}:`, data, error?.message || '');
  }
  
  console.log('--- Checking generic recently created users ---');
  const { data: u1 } = await supabase.from('users').select('user_id, email, invitation_code_id, created_at').order('created_at', { ascending: false }).limit(5);
  console.log(u1);
}

check();

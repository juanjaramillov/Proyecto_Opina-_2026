const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const juan = authUsers.users.find(u => u.email === 'juanjaramillov@gmail.com');

    if (!juan) {
        console.log('User missing!');
        return;
    }

    console.log('Testing RPC failure for user:', juan.id);

    const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
      DO $$
      DECLARE
        v_uid uuid := '${juan.id}'::uuid;
        v_code text := 'OP-6D107ED4';
        v_nick text := 'JuanJ';
        v_invite_id uuid;
      BEGIN
        SELECT id INTO v_invite_id FROM public.invitation_codes WHERE code = v_code;
        
        UPDATE public.invitation_codes SET used_by_user_id = v_uid WHERE id = v_invite_id;
        
        INSERT INTO public.users (user_id, invitation_code_id)
        VALUES (v_uid, v_invite_id)
        ON CONFLICT (user_id) DO UPDATE
          SET invitation_code_id = EXCLUDED.invitation_code_id;
      
        INSERT INTO public.user_profiles (user_id, nickname, profile_stage, signal_weight)
        VALUES (v_uid, v_nick, 0, 1.0)
        ON CONFLICT (user_id) DO UPDATE
          SET nickname = EXCLUDED.nickname;
          
      END;
      $$;
      `
    });

    console.log('Result:', data);
    console.log('Error:', error);
}

run();

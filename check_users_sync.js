const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
    const { data: users } = await supabase.from('users').select('user_id');
    const { data: authUsers } = await supabase.auth.admin.listUsers();

    console.log('public.users count:', users?.length);
    console.log('auth.users count:', authUsers.users.length);

    for (const au of authUsers.users) {
        if (au.email === 'juanjaramillov@gmail.com') {
            console.log('Found Juan in auth.users:', au.id);
            const inPublic = users?.find(u => u.user_id === au.id);
            console.log('Is Juan in public.users?', !!inPublic);
            break;
        }
    }
}

run();

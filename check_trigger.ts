import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: users } = await supabase.auth.admin.listUsers();
    console.log("Found users in auth.users:", users.users.length);

    for (const u of users.users) {
        if (u.email === 'juanjaramillov@gmail.com') {
            const { data: userRow } = await supabase.from('users').select('*').eq('user_id', u.id).single();
            const { data: profileRow } = await supabase.from('user_profiles').select('*').eq('user_id', u.id).single();

            console.log(`User ${u.email}:`);
            console.log("  - In public.users:", !!userRow);
            console.log("  - In public.user_profiles:", !!profileRow);
        }
    }
}

main();

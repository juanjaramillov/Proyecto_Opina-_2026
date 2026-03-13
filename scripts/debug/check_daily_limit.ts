import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkUserStatus() {
    const { data, error } = await supabase
        .from('users')
        .select('user_id, is_identity_verified, role')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching users:", error);
        return;
    }
    console.log("Latest users:", JSON.stringify(data, null, 2));
}

checkUserStatus();

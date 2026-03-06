import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'env.server.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function factoryReset() {
    console.log('--- starting deep cleanup ---');

    // 1. Purge Activity Tables
    console.log('Purging signal_events...');
    try {
        const { error: e1 } = await supabase.from('signal_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (e1) console.error('Error purging signal_events:', e1);
    } catch (err) { console.error(err); }

    console.log('Purging invite_redemptions...');
    try {
        const { error: e2 } = await supabase.from('invite_redemptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (e2) console.error('Error purging invite_redemptions:', e2);
    } catch (err) { console.error(err); }

    console.log('Purging user_activity...');
    try {
        const { error: e3 } = await supabase.from('user_activity').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (e3) console.error('Error purging user_activity:', e3);
    } catch (err) { console.error(err); }

    // 2. Reset Invitation Codes
    console.log('Resetting invitation codes...');
    try {
        const { error: e4 } = await supabase.from('invitation_codes').update({
            used_at: null,
            used_by_user_id: null,
            claimed_at: null,
            claimed_by: null,
            current_uses: 0
        }).neq('id', '00000000-0000-0000-0000-000000000000');
        if (e4) console.warn('Note: Resetting invitation codes had some issues (might be columns):', e4.message);
    } catch (err) { console.error(err); }

    // 3. Delete Non-Admin Users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    for (const user of users) {
        const isAdmin = user.email === 'juanignaciojaramillo@gmail.com' || user.email?.includes('admin');

        if (isAdmin) {
            console.log(`Resetting admin profile stage: ${user.email}`);
            // Set to stage 1 to allow fresh testing
            const resetPayload: any = {
                profile_stage: 1,
                birth_year: null,
                gender: null,
                region: null,
                comuna: null,
                education_level: null,
                employment_status: null,
                income_range: null
            };

            const { error: upError } = await supabase.from('user_profiles').update(resetPayload).eq('user_id', user.id);
            if (upError) console.error(`Error resetting admin ${user.email}:`, upError);
            continue;
        }

        console.log(`Deleting user: ${user.email}`);
        const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
        if (delError) console.error(`Error deleting ${user.email}:`, delError);
    }

    console.log('--- factory reset finished ---');
}

factoryReset();

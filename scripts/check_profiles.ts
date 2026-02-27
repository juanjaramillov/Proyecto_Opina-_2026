import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" // Service Role Key
);

async function run() {
    const { data, error } = await sb.rpc('get_table_columns_by_name_test', { t_name: 'profiles' });
    if (error) console.error("RPC Error:", error.message);

    const { data: rows, error: rErr } = await sb.from('users').select('*').limit(1);
    if (rErr) {
        console.error("Select Error:", rErr);
    } else {
        console.log("Profile columns:", Object.keys(rows && rows.length > 0 ? rows[0] : {}));
    }
}
run();

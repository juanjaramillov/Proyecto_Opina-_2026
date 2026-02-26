import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!; // use service role to bypass RLS and act as admin
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    const { data: invites } = await supabase.rpc('admin_list_invites', { p_limit: 10 });
    if (!invites || invites.length === 0) { console.log("No invites"); return; }
    
    const invite = invites[0];
    console.log("Before delete, exists:", invite.code);
    
    const { error } = await supabase.rpc('admin_delete_invitation', { p_invite_id: invite.id });
    console.log("Delete error:", error);
    
    const { data: invitesAfter } = await supabase.rpc('admin_list_invites', { p_limit: 10 });
    const stillExists = invitesAfter.find(i => i.id === invite.id);
    console.log("After delete, exists:", stillExists ? "YES" : "NO");
}
testDelete();

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" // Service Role Key
);

async function run() {
    console.log("Creating default admin user...");
    const { data: { user }, error } = await sb.auth.admin.createUser({
        email: 'admin@opina.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
            first_name: 'Admin',
            last_name: 'Local',
            nickname: 'Administrador',
            role: 'admin'
        }
    });

    if (error) {
        if (error.message.includes('already been registered')) {
            console.log("User already exists, seeking their ID...");
            const { data: { users } } = await sb.auth.admin.listUsers();
            const u = users.find(u => u.email === 'admin@opina.com');
            if (u) {
                // Update auth metadata
                await sb.auth.admin.updateUserById(u.id, {
                    user_metadata: {
                        first_name: 'Admin',
                        last_name: 'Local',
                        nickname: 'Administrador',
                        role: 'admin'
                    }
                });
                await promoteUser(u.id);
            }
        } else {
            console.error("Error creating user:", error);
            return;
        }
    } else if (user) {
        console.log(`User created: ${user.email} (ID: ${user.id})`);
        await promoteUser(user.id);
    }

    async function promoteUser(id: string) {
        // Promote and set verified in the underlying physical tables
        const { error: updateErr1 } = await sb.from('users').update({
            role: 'admin',
            is_identity_verified: true
        }).eq('user_id', id);

        // Update nickname in user_profiles
        const { error: updateErr2 } = await sb.from('user_profiles').update({
            nickname: 'Administrador'
        }).eq('user_id', id);

        if (updateErr1 || updateErr2) {
            console.error(`Failed to promote:`, updateErr1 || updateErr2);
        } else {
            console.log(`Successfully promoted to admin and set nickname!`);
        }
    }
}
run();

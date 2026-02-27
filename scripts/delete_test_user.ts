import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Superbase URL or Service Key");
    process.exit(1);
}

const authClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function main() {
    console.log("Looking for test user newadmin@test.com...");
    const { data: users, error: listError } = await authClient.auth.admin.listUsers();
    if (listError) {
        console.error("Error listing users", listError);
        return;
    }

    const testUser = users.users.find(u => u.email === "newadmin@test.com");
    if (!testUser) {
        console.log("No test user found.");
        return;
    }

    console.log(`Found test user with ID ${testUser.id}. Deleting...`);
    const { error: delError } = await authClient.auth.admin.deleteUser(testUser.id);
    if (delError) {
        console.error("Failed to delete user", delError);
        return;
    }

    console.log("Successfully deleted the test user.");
}

main().catch(console.error);

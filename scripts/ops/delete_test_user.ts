import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

/**
 * Local-only secrets for admin scripts live in: env.server.local (NOT committed).
 * Copy env.server.example -> env.server.local and fill values.
 */
dotenv.config({ path: "env.server.local" });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type CliArgs = { email?: string };

function parseCliArgs(argv: string[]): CliArgs {
    const out: CliArgs = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--email" && argv[i + 1]) out.email = argv[++i];
    }
    return out;
}

async function main() {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Faltan variables en env.server.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const { email } = parseCliArgs(process.argv.slice(2));
    const targetEmail = email ?? "newadmin@test.com";

    const authClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log(`Buscando usuario: ${targetEmail} ...`);
    const { data: users, error: listError } = await authClient.auth.admin.listUsers();

    if (listError) {
        console.error("Error listing users", listError);
        process.exit(1);
    }

    const user = users.users.find((u) => u.email === targetEmail);
    if (!user) {
        console.log("No se encontró el usuario.");
        return;
    }

    console.log(`Encontrado ID ${user.id}. Eliminando...`);
    const { error: delError } = await authClient.auth.admin.deleteUser(user.id);

    if (delError) {
        console.error("Failed to delete user", delError);
        process.exit(1);
    }

    console.log("Usuario eliminado.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

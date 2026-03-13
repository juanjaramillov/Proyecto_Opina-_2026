import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

/**
 * Local-only secrets for admin scripts live in: env.server.local (NOT committed).
 * Copy env.server.example -> env.server.local and fill values.
 */
dotenv.config({ path: "env.server.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type CliArgs = {
    email?: string;
    password?: string;
};

function parseCliArgs(argv: string[]): CliArgs {
    const out: CliArgs = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--email" && argv[i + 1]) {
            out.email = argv[++i];
            continue;
        }
        if (a === "--password" && argv[i + 1]) {
            out.password = argv[++i];
            continue;
        }
    }
    return out;
}

function usageAndExit(): never {
    console.error("Uso:");
    console.error('  npm run create:admin -- --email "admin@tu-dominio.com" --password "TuPasswordFuerte"');
    process.exit(1);
}

async function main() {
    const args = parseCliArgs(process.argv.slice(2));
    const ADMIN_EMAIL = args.email;
    const ADMIN_PASSWORD = args.password;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        console.error("Faltan variables en env.server.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        usageAndExit();
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    // 1) Crear usuario en Auth
    const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true,
        });

    let userId: string | null = created?.user?.id ?? null;

    if (createErr) {
        // Si ya existe, buscarlo
        const { data: list, error: listErr } =
            await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 500 });

        if (listErr) throw listErr;

        const existing = list.users.find((u) => u.email === ADMIN_EMAIL);
        if (!existing) throw createErr;

        userId = existing.id;
        console.log("Admin ya existe en Auth:", userId);
    } else {
        console.log("Admin creado en Auth:", userId);
    }

    if (!userId) throw new Error("No se obtuvo user id del admin.");

    // 2) Set rol admin en tabla de app
    const { error: upErr } = await supabaseAdmin
        .from("users")
        .update({ role: "admin" })
        .eq("user_id", userId);

    if (upErr) throw upErr;

    console.log("Rol admin seteado en public.users");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

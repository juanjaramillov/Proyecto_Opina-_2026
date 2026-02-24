import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

async function main() {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error(
            "Faltan variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
        );
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

    if (createErr) {
        // Si ya existe, intenta buscarlo
        const { data: list, error: listErr } =
            await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });

        if (listErr) throw listErr;

        const existing = list.users.find((u) => u.email === ADMIN_EMAIL);
        if (!existing) throw createErr;

        console.log("Admin ya existe en Auth:", existing.id);

        // 2) Set rol admin en tabla public.users
        const { error: upErr } = await supabaseAdmin
            .from("users")
            .update({ role: "admin" })
            .eq("user_id", existing.id);

        if (upErr) throw upErr;

        console.log("Rol admin seteado en public.users");
        return;
    }

    const userId = created.user?.id;
    if (!userId) throw new Error("No se obtuvo user id al crear admin.");

    console.log("Admin creado en Auth:", userId);

    // 2) Set rol admin en tabla public.users
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

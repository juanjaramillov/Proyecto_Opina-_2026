import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
    // SUPOSICIÓN: public.users tiene id = auth.user.id y columna role
    // Ajustado a user_id para coincidir con el esquema local
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

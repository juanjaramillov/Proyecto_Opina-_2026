import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load environment variables
if (fs.existsSync(".env.development.local")) {
    dotenv.config({ path: ".env.development.local" });
} else if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else if (fs.existsSync(".env")) {
    dotenv.config({ path: ".env" });
}

// Ensure keys are available
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Faltan variables en .env: (VITE_)SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

/**
 * Email del admin que se PRESERVA durante la purga.
 * Parametrizable por CLI con `--keep <email>` para evitar sorpresas al correr
 * el script contra entornos distintos (dev/staging/prod).
 *
 * Default: admin@opina.com — el único admin oficial del proyecto
 * (id e9ac2e3e-3c13-4b7d-8763-81d8094efe65, creado 2026-03-13).
 */
function parseKeepEmail(argv: string[]): string {
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--keep" && argv[i + 1]) return argv[i + 1];
    }
    return "admin@opina.com";
}

const ADMIN_EMAIL = parseKeepEmail(process.argv.slice(2));

async function purgeUsers() {
    console.log(`Iniciando purga de usuarios. Se mantendrá a: ${ADMIN_EMAIL}`);
    console.log(`(Tip: podés pasar --keep otro@email.com para preservar otro usuario)`);
    
    // Auth user list is paginated
    let hasMore = true;
    let page = 1;
    const usersToDelete: { id: string; email?: string }[] = [];

    while (hasMore) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 1000,
        });

        if (error) {
            console.error("Error al listar usuarios:", error);
            process.exit(1);
        }

        const users = data.users;
        
        if (users.length === 0) {
            hasMore = false;
        } else {
            for (const user of users) {
                if (user.email !== ADMIN_EMAIL) {
                    usersToDelete.push({ id: user.id, email: user.email });
                }
            }
            page++;
        }
    }

    console.log(`Se encontraron ${usersToDelete.length} usuarios para eliminar.`);

    // Delete users
    let deletedCount = 0;
    for (const user of usersToDelete) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (error) {
            console.error(`Error al eliminar usuario ${user.email} (${user.id}):`, error);
        } else {
            console.log(`Eliminado: ${user.email} (${user.id})`);
            deletedCount++;
        }
    }

    console.log(`\nPurga completada. Se eliminaron ${deletedCount} usuarios exitosamente.`);
}

purgeUsers().catch((e) => {
    console.error(e);
    process.exit(1);
});

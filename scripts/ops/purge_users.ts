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

const ADMIN_EMAIL = "admin@opina.com";

async function purgeUsers() {
    console.log(`Iniciando purga de usuarios. Se mantendrá a: ${ADMIN_EMAIL}`);
    
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

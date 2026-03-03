import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "env.server.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function generateInvites(count: number, prefix: string = "BETA") {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        console.error("Faltan variables en env.server.local");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    const newInvites = [];
    for (let i = 0; i < count; i++) {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const code = `${prefix}-${randomStr}`;

        newInvites.push({
            code: code,
            status: 'active',
            assigned_alias: `Beta User ${i + 1}`,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
        });
    }

    console.log(`Generando ${count} códigos en ${SUPABASE_URL}...`);

    const { data, error } = await supabase
        .from('invitation_codes')
        .insert(newInvites)
        .select();

    if (error) {
        console.error("Error insertando códigos:", error);
        process.exit(1);
    }

    console.log("\n✅ Códigos generados con éxito:");
    data?.forEach((row: any) => {
        console.log(`- ${row.code} (Alias: ${row.assigned_alias})`);
    });
}

generateInvites(20);

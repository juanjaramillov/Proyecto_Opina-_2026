import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Debes definir VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

async function main() {
    console.log('Iniciando refresh maestro de motor analítico...');
    
    // Ejecutar el refresh destructivo-reconstructivo de todos los rollups canónicos
    const { data, error } = await supabase.rpc('refresh_analytics_all_rollups');
    
    if (error) {
        console.error('❌ Error de RPC ejecutando refresh_analytics_all_rollups:', error.message);
        
        // Alternativa: Si refresh_analytics_all_rollups no existe, intentar run_analytics_rollups_or_snapshot o algo similar
        // Intentaremos buscar la función exacta a invocar.
        const { error: err2 } = await supabase.rpc('refresh_public_rank_snapshots_3h');
        if (err2) {
             console.error('❌ Error ejecutando refresh_public_rank_snapshots_3h:', err2.message);
             process.exit(1);
        } else {
             console.log('✅ Ejecutado refresh alternativo fallback: refresh_public_rank_snapshots_3h');
        }
    } else {
        console.log('✅ Base de datos refrescada exitosamente (refresh_analytics_all_rollups). Resultados:', data);
    }
    
    console.log('Cierre limpio.');
}

main().catch(console.error);

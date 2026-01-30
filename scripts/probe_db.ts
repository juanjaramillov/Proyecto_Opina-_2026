
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars manually because we are running outside of Vite
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_KEY = envConfig.VITE_SUPABASE_ANON_KEY; // Using anon key, hope user has permissions or we need service role

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runQueries() {
    console.log('--- Verificación de Estado de DB (Hotfix) ---');

    // 1. Verificar Tablas Básicas
    const checkTable = async (table: string) => {
        // Intentamos un select count básico
        const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        // Si no existe, error code 42P01. Si es view, funciona igual.
        return { table, exists: !error || error.code !== '42P01', count };
    };

    console.log('1) Verificando Tablas/Vistas:');
    const t1 = await checkTable('signal_events');
    const t2 = await checkTable('signals_events'); // Debe ser VIEW ahora (o existir como compatibilidad)
    const t3 = await checkTable('signals_events_backup');

    console.log(` - signal_events (Singular): ${t1.exists ? 'OK' : 'MISSING'} (Rows: ${t1.count})`);
    console.log(` - signals_events (Plural/View): ${t2.exists ? 'OK' : 'MISSING'} (Rows: ${t2.count})`);
    console.log(` - signals_events_backup: ${t3.exists ? 'OK' : 'MISSING'} (Rows: ${t3.count})`);

    // 2. Verificar RPCs con Firma Estricta (Hotfix)
    console.log('\n2) Verificando RPCs (Firmas Nuevas):');

    // Obtenemos un battle_id real para probar
    const { data: battles } = await supabase.from('battles').select('id').limit(1);
    const battleId = battles?.[0]?.id;

    if (!battleId) {
        console.error(' [!] No se encontraron batallas para probar los RPCs.');
        return;
    }
    console.log(` Usando battle_id para pruebas: ${battleId}`);

    // A) KPI Share (Acepta fechas opcionales)
    const { error: errShare, data: resShare } = await supabase.rpc('kpi_share_of_preference', {
        p_battle_id: battleId
    });
    console.log(` - kpi_share_of_preference: ${errShare ? '❌ ERROR' : '✅ OK'} ` + (errShare ? `(${errShare.message})` : `(Rows: ${Array.isArray(resShare) ? resShare.length : 0})`));

    // B) KPI Trend (SOLO p_battle_id)
    const { error: errTrend, data: resTrend } = await supabase.rpc('kpi_trend_velocity', {
        p_battle_id: battleId
        //, p_bucket: 'day' // ESTE PARAM YA NO DEBE EXISTIR. Si lo mando y no falla, es que supabase lo ignora o la firma vieja sigue.
    });
    // Verificamos retorno escalar del hotfix: { option_id, delta_weighted_signals }
    const validTrendShape = Array.isArray(resTrend) && (resTrend.length === 0 || 'delta_weighted_signals' in resTrend[0]);

    console.log(` - kpi_trend_velocity: ${errTrend ? '❌ ERROR' : '✅ OK'} ` + (errTrend ? `(${errTrend.message})` : `(Shape Valid: ${validTrendShape})`));
    if (!errTrend && resTrend.length > 0) console.log('   Sample:', resTrend[0]);


    // C) KPI Quality (SOLO p_battle_id)
    const { error: errQuality, data: resQuality } = await supabase.rpc('kpi_engagement_quality', {
        p_battle_id: battleId
    });
    const validQualityShape = Array.isArray(resQuality) && (resQuality.length === 0 || 'weighted_signals' in resQuality[0]);

    console.log(` - kpi_engagement_quality: ${errQuality ? '❌ ERROR' : '✅ OK'} ` + (errQuality ? `(${errQuality.message})` : `(Shape Valid: ${validQualityShape})`));
}

runQueries();

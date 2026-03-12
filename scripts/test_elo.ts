import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testElo() {
    console.log("=== EJECUTANDO TEST DE FLUJO ELO ===");

    // Obtener una batalla existente al azar
    const { data: battles } = await supabase.from('battles').select('id, title').limit(1);
    if (!battles || battles.length === 0) {
        console.log("No hay batallas activas");
        return;
    }
    const battle = battles[0];

    // Obtener la instancia
    const { data: instances } = await supabase.from('battle_instances').select('id').eq('battle_id', battle.id).limit(1);
    const instance_id = instances?.[0]?.id;

    // Obtener las 2 opciones y sus marcas (entities)
    const { data: options } = await supabase.from('battle_options').select('id, brand_id, label').eq('battle_id', battle.id);
    
    if (!options || options.length !== 2) {
        console.log("Batalla sin 2 opciones validas:", options);
        return;
    }

    const optWin = options[0];
    const optLose = options[1];

    console.log(`Batalla: ${battle.title}`);
    console.log(`Opciones: [A] ${optWin.label} vs [B] ${optLose.label}`);

    // Estado antes del voto
    const { data: entWinBefore } = await supabase.from('entities').select('elo_score, battles_played').eq('id', optWin.brand_id).single();
    const { data: entLoseBefore } = await supabase.from('entities').select('elo_score, battles_played').eq('id', optLose.brand_id).single();
    
    console.log(`\nANTIGUO ELO:`);
    console.log(`[A] ${optWin.label}: ${entWinBefore?.elo_score} ELO (Jugadas: ${entWinBefore?.battles_played})`);
    console.log(`[B] ${optLose.label}: ${entLoseBefore?.elo_score} ELO (Jugadas: ${entLoseBefore?.battles_played})`);

    // Inyectar un signal de prueba ganando optWin
    console.log("\nInyectando voto Dummy ganando [A]...");
    
    // NOTA: Como agregamos constraint, necesitamos asegurar q insert_signal_event reciba argumentos correctos, 
    // pero para probar el Postgres Trigger Directamente en la de datos:
    const session_id = crypto.randomUUID();
    const { error: insertErr } = await supabase.rpc('insert_signal_event', {
        p_battle_id: battle.id,
        p_option_id: optWin.id,
        p_session_id: session_id,
        p_attribute_id: optWin.brand_id,
        p_client_event_id: crypto.randomUUID(),
        p_device_hash: 'test_elo_device'
    });

    if (insertErr) {
        console.error("Error insertando signal via RPC:", insertErr);
        return;
    }

    // Delay breve para asegurar triggers 
    await new Promise(r => setTimeout(r, 500));

    // Estado despues del voto
    const { data: entWinAfter } = await supabase.from('entities').select('elo_score, battles_played').eq('id', optWin.brand_id).single();
    const { data: entLoseAfter } = await supabase.from('entities').select('elo_score, battles_played').eq('id', optLose.brand_id).single();

    console.log(`\nNUEVO ELO:`);
    console.log(`[A] ${optWin.label}: ${entWinAfter?.elo_score} ELO (Jugadas: ${entWinAfter?.battles_played})`);
    console.log(`[B] ${optLose.label}: ${entLoseAfter?.elo_score} ELO (Jugadas: ${entLoseAfter?.battles_played})`);
    
    let diffWin = Number(entWinAfter?.elo_score) - Number(entWinBefore?.elo_score);
    let diffLose = Number(entLoseBefore?.elo_score) - Number(entLoseAfter?.elo_score);
    
    console.log(`\n=> [A] ganó +${diffWin.toFixed(2)} puntos.`);
    console.log(`=> [B] perdió -${diffLose.toFixed(2)} puntos.`);
    
    if (diffWin > 0 && diffLose > 0 && Number(entWinAfter?.battles_played) > Number(entWinBefore?.battles_played)) {
        console.log("✅ TEST MATHEMATICO ELO EXITOSO: ¡Trigger funcionando a nivel DataBase!");
    } else {
        console.log("❌ TEST FALLIDO: ELO no se movio.");
    }
}

testElo();

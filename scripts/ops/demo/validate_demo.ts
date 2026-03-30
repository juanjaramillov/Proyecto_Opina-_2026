import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { DEMO_DATASETS } from './datasets';
import { DEMO_THRESHOLDS } from '../../../src/config/demoProtocol';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const scenarioKey = process.argv[2];
if (!scenarioKey || !(scenarioKey in DEMO_DATASETS)) {
    console.error(`🚨 [ERROR] Escenario no válido. Disponibles: ${Object.keys(DEMO_DATASETS).join(', ')}`);
    process.exit(1);
}

const scenarioData = DEMO_DATASETS[scenarioKey as keyof typeof DEMO_DATASETS];
const { MIN_SIGNALS: MIN_SIGNALS_THRESHOLD, MIN_DEMOGRAPHICS: MIN_DEMOGRAPHICS_THRESHOLD, MIN_ENTITIES: MIN_ENTITIES_THRESHOLD } = DEMO_THRESHOLDS;

async function validateDemo() {
    console.log("==================================================");
    console.log(`🔎 OPINA+ DEMO VALIDATOR: [${scenarioKey.toUpperCase()}]`);
    console.log("==================================================\n");

    let isGo = true;

    try {
        // 1. Verificar Categoría Principal
        const { data: catData, error: catErr } = await supabase
            .from('categories')
            .select('id, name')
            .eq('slug', scenarioData.category.slug)
            .single();

        if (catErr || !catData) {
            console.log(`[FAIL] Hub B2C: Categoría '${scenarioData.category.slug}' no existe.`);
            isGo = false;
            return concluding(isGo);
        }

        // 2. Validación de Superficie: Signals Hub (Entidades y Battles)
        const { data: entData, error: entErr } = await supabase
            .from('signal_entities')
            .select('id, name')
            .eq('category_id', catData.id)
            .eq('status', 'active');
            
        if (entErr || !entData || entData.length < MIN_ENTITIES_THRESHOLD) {
            console.log(`[FAIL] Módulo Signals Hub: Faltan entidades. Se requieren al menos ${MIN_ENTITIES_THRESHOLD}. (Encontradas: ${entData?.length || 0})`);
            isGo = false;
        } else {
            console.log(`[PASS] Módulo Signals Hub: ${entData.length} entidades disponibles, el Hub y el Versus renderizarán opciones válidas.`);
        }

        const entityIds = entData?.map(e => e.id) || [];
        if (entityIds.length === 0) return concluding(false);

        // 3. Validación de Superficie: Resultados B2C (Signals Totales > Umbral)
        const { data: sigData, error: sigErr } = await supabase
            .from('signal_events')
            .select('id, user_id, entity_id')
            .in('entity_id', entityIds)
            .eq('module_type', 'versus');

        const signalsCount = sigData?.length || 0;
        
        if (sigErr || signalsCount < MIN_SIGNALS_THRESHOLD) {
            console.log(`[FAIL] Módulo Resultados B2C: Votos insuficientes (N=${signalsCount}. Requerido: ${MIN_SIGNALS_THRESHOLD}) para superar la Volatilidad Estadística.`);
            isGo = false;
        } else {
            console.log(`[PASS] Módulo Resultados B2C: Threshold estadístico superado (N=${signalsCount}). Módulo operable sin advertencia de Volatilidad.`);
        }

        // 4. Validación de Superficie: Intelligence / B2B visible (Demografías Cruzadas)
        const uniqueUserIds = [...new Set(sigData?.map(s => s.user_id) || [])];
        if (uniqueUserIds.length === 0) {
             console.log(`[FAIL] Módulo Intelligence B2B: 0 usuarios únicos. Radares y Paneles Corporativos colapsarán vacíos.`);
             isGo = false; 
        } else {
             const { data: demoData, error: demoErr } = await supabase
                 .from('user_demographics')
                 .select('id')
                 .in('user_id', uniqueUserIds);

             const demographicCount = demoData?.length || 0;
             if (demoErr || demographicCount < MIN_DEMOGRAPHICS_THRESHOLD) {
                 console.log(`[FAIL] Módulo Intelligence B2B: Cruces insuficientes. Solo hay ${demographicCount} de ${MIN_DEMOGRAPHICS_THRESHOLD} perfiles con demografía (GSE/Edad) seteados.`);
                 isGo = false;
             } else {
                 console.log(`[PASS] Módulo Intelligence B2B: Radares y Benchmarks listos con ${demographicCount} perfiles demográficos inyectados para cruces.`);
             }
        }

        concluding(isGo);

    } catch (error) {
        console.error("❌ Ocurrió un error inesperado al validar:", error);
        process.exit(1);
    }
}

function concluding(status: boolean) {
    console.log("\n==================================================");
    if (status) {
        console.log("✅ VEREDICTO FINAL: GO");
        console.log("El entorno está listo y sólido para demostración comercial. Todas las superficies pasaron la auditoría de Cold Start.");
        process.exit(0);
    } else {
        console.log("❌ VEREDICTO FINAL: NO-GO");
        console.log(`ABORTAR DEMOSTRACIÓN. Ejecute el comando de seed respectivo:\n   npm run demo:prepare:${scenarioKey} --allow-demo-seed`);
        process.exit(1);
    }
}

validateDemo();

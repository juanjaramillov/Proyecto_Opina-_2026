import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { catalogGovernance } from '../../../src/lib/catalogGovernance';
import { DEMO_DATASETS } from './datasets';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 1. HARD SECURITY CHECK (Anti-Production & Service Role Enforcement)
if (!serviceRoleKey) {
    console.error("🚨 [FATAL ERROR] SUPABASE_SERVICE_ROLE_KEY no encontrado en el entorno.");
    console.error("   ⚠️ Gobernanza: Esta es una herramienta EXCLUSIVAMENTE Server-Side / CLI.");
    console.error("   Dado que interactúa con la tabla canónica 'signal_events', requiere bypass de RLS");
    console.error("   para evitar falsificar datos de sesión JWT desde un Frontend.");
    process.exit(1);
}

const supabaseKey = serviceRoleKey;

const isProductionUrl = supabaseUrl.includes('xzyabc.supabase.co'); // Cambiar por tu project ref de prod si es estricto
const isProductionEnv = process.env.VITE_APP_ENV === 'production' || process.env.NODE_ENV === 'production';
const hasAllowFlag = process.argv.includes('--allow-demo-seed');

console.log("==================================================");
console.log("🛠️ OPINA+ DEMO READINESS SEED LAYER (V15 CANONICAL)");
console.log("==================================================");

if (isProductionEnv || isProductionUrl) {
    console.error("🚨 [FATAL ERROR] Intento de sembrado en entorno de PRODUCCIÓN detectado.");
    process.exit(1);
}

if (!hasAllowFlag) {
    console.error("🚨 [ERROR] Falta el flag obligatorio: --allow-demo-seed");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const scenarioKey = process.argv[2];

if (!scenarioKey || !(scenarioKey in DEMO_DATASETS)) {
    console.error(`🚨 [ERROR] Escenario no válido. Disponibles: ${Object.keys(DEMO_DATASETS).join(', ')}`);
    process.exit(1);
}

const scenarioData = DEMO_DATASETS[scenarioKey as keyof typeof DEMO_DATASETS];

async function seedDemo() {
    console.log(`\n🌱 Iniciando Seed Demo para el escenario: [${scenarioKey.toUpperCase()}]\n`);

    try {
        // A. Insert Category (Hub Definition)
        console.log(`1. Inyectando Categoría Canónica: ${scenarioData.category.name}...`);
        const { data: catData, error: catErr } = await supabase
            .from('categories')
            .upsert({
                name: scenarioData.category.name,
                slug: scenarioData.category.slug,
                active: scenarioData.category.active,
                generation_mode: scenarioData.category.generation_mode,
            }, { onConflict: 'slug' })
            .select('id')
            .single();

        if (catErr) throw catErr;
        const categoryId = catData.id;
        console.log(`   ✅ Categoría lista.`);

        console.log(`\n2. Inyectando Master Entities (${scenarioData.entities.length}) en signal_entities...`);
        const entityIds: string[] = [];
        for (const ent of scenarioData.entities) {
            // Prioridad 1: Revisar si la marca ya existe en el espejo base
            const { data: legacyEnt } = await supabase.from('entities').select('id').eq('slug', ent.slug).single();
            const finalId = legacyEnt?.id || uuidv4();

            const eId = await catalogGovernance.upsertDualCatalogEntity(supabase, {
                id: finalId,
                slug: ent.slug,
                name: ent.name,
                is_active: true,
                category: scenarioData.category.name,
                type: 'brand' // type legacy por defecto
            });

            entityIds.push(eId);
            console.log(`   ✅ ${ent.name} registrada/sincronizada (ID: ${eId})`);
        }

        // C. Crear Battles y Battle_Options (V15 Structure)
        console.log(`\n3. Inyectando Matriz de Batallas y Opciones...`);
        const battleIds: string[] = [];
        for (let i = 0; i < entityIds.length; i++) {
            for (let j = i + 1; j < entityIds.length; j++) {
                 // The Battle
                 const battleSlug = `demo-${scenarioKey}-${i}-${j}`;
                 let bDataRes = await supabase.from('battles').select('id').eq('slug', battleSlug).single();
                 let bId = bDataRes.data?.id;
                 
                 if (!bId) {
                     const insertBattle = await supabase
                         .from('battles')
                         .insert({
                             category_id: categoryId,
                             title: `¿Quién es mejor? ${scenarioData.entities[i].name} vs ${scenarioData.entities[j].name}`,
                             slug: battleSlug,
                             status: 'active'
                         })
                         .select('id')
                         .single();
                     if (insertBattle.data) bId = insertBattle.data.id;
                 }

                 if (bId) {
                      battleIds.push(bId);
                      // Battle Options mapping to signal_entities (select first)
                      const { data: opts } = await supabase.from('battle_options').select('id').eq('battle_id', bId);
                      if (!opts || opts.length === 0) {
                          const boRes = await supabase.from('battle_options').insert([
                              { battle_id: bId, label: scenarioData.entities[i].name, brand_id: entityIds[i], sort_order: 1 },
                              { battle_id: bId, label: scenarioData.entities[j].name, brand_id: entityIds[j], sort_order: 2 }
                          ]);
                          if (boRes.error) {
                              console.error("Error insertando battle_options:", boRes.error.message);
                          }
                      }
                 }
            }
        }
        console.log(`   ✅ ${battleIds.length} batallas y opciones estructuradas.`);

        // D. Sembrado de SIGNAL_EVENTS (The Single Source of Truth V15)
        console.log(`\n4. Escribiendo transacciones en signal_events...`);
        const DUMMY_USERS_COUNT = 15; 
        const dummyUserIds = [];
        const ageRanges = ['18-24', '25-34', '35-44', '45+'];
        const genders = ['Masculino', 'Femenino', 'Otro'];

        for(let i=0; i < DUMMY_USERS_COUNT; i++) {
             const uid = uuidv4();
             dummyUserIds.push(uid);
             await supabase.from('profiles').upsert({ id: uid, username: `demo_user_${i}` });
             await supabase.from('user_demographics').upsert({ user_id: uid, age_range: ageRanges[i % ageRanges.length], gender: genders[i % genders.length] });
        }

        let votesSeeded = 0;
        for (const uid of dummyUserIds) {
             for (const bid of battleIds) {
                  if (Math.random() > 0.3) {
                       // Get options for this battle
                       const { data: options } = await supabase.from('battle_options').select('id, brand_id').eq('battle_id', bid);
                       if (!options || options.length < 2) continue;
                       
                       const chosenOpt = Math.random() > 0.5 ? options[0] : options[1];
                       
                       // CANONICAL INSERT: Mapeado exactamente a las columnas que leen los B2C Read Models (userResultsReadModel)
                       const iRes = await supabase.from('signal_events').insert({
                           anon_id: uid,
                           user_id: uid,
                           battle_id: bid,
                           entity_id: chosenOpt.brand_id,          // THE WINNER (signal_entities.id)
                           option_id: chosenOpt.id,                // THE OPTION (battle_options.id)
                           selected_entity_id: chosenOpt.brand_id,
                           module_type: 'versus',                  // REQUIRED BY userResultsReadModel
                           event_status: 'completed',
                           interaction_outcome: 'selected',
                           metadata: { source: 'demo_seed', signal_type_code: 'VERSUS_SIGNAL' },
                           effective_weight: 1,
                           raw_weight: 1,
                           occurred_at: new Date().toISOString()
                       });
                       if (iRes.error) {
                           console.log("Error insertando signal: ", iRes.error.message);
                       } else {
                           votesSeeded++;
                       }
                  }
             }
        }

        console.log(`   ✅ ${votesSeeded} eventos (signal_events) insertados orgánicamente.`);
        console.log(`\n🎉 Escenario ${scenarioKey.toUpperCase()} listo y canonizado.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Ocurrió un error sembrando:", error);
        process.exit(1);
    }
}

seedDemo();

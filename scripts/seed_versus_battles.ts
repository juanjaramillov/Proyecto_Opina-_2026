import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
// Usamos el Service Role Key si está disponible para saltar RLS, o el Anon Key en su defecto
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// URL de la Edge Function (ajusta si lo corres local o en prod)
// Para producción usar: https://[project-ref].supabase.co/functions/v1/versus-bot
const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/versus-bot`;

async function seedBattles() {
  console.log("=========================================");
  console.log("INICIANDO SEMBRADO MASIVO DE VERSUS (Mín. 5 por categoría)");
  console.log(`Usando Edge Function: ${EDGE_FUNCTION_URL}`);
  console.log("=========================================\n");

  try {
    // 1. Obtener categorías activas (ai_curated_pairs)
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('active', true)
      .eq('generation_mode', 'ai_curated_pairs');

    if (catError) throw catError;
    if (!categories || categories.length === 0) {
      console.log("No hay categorías activas para generar batallas.");
      return;
    }

    // 2. Revisar cada categoría y contar cuántas batallas tiene
    for (const category of categories) {
      console.log(`\nRevisando Categoría: ${category.name} (${category.slug})`);

      const { data: activeBattles, error: battleError } = await supabase
        .from('battles')
        .select('id')
        .eq('category_id', category.id)
        .eq('status', 'active');

      if (battleError) {
        console.error(`Error al obtener batallas de ${category.name}:`, battleError);
        continue;
      }

      const currentCount = activeBattles?.length || 0;
      console.log(`- Batallas activas actuales: ${currentCount}`);

      const targetCount = 5;
      const deficit = targetCount - currentCount;

      if (deficit <= 0) {
        console.log(`✅ Categoría '${category.name}' ya cumple el requisito (${currentCount} >= 5). Saltando.`);
        continue;
      }

      console.log(`⚠️ Faltan ${deficit} batallas para llegar al mínimo. Generando...`);

      let successCount = 0;
      let failureCount = 0;
      const MAX_ATTEMPTS = deficit * 2; // Dar un poco de margen de reintento si OpenAI falla o no hay combinaciones
      let attempts = 0;

      while (successCount < deficit && attempts < MAX_ATTEMPTS) {
        attempts++;
        console.log(`  [Intento ${attempts}/${MAX_ATTEMPTS}] Ejecutando versus-bot para ${category.name}...`);
        
        try {
          const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}` // Simulamos el header de autorización
            },
            body: JSON.stringify({ category_slug: category.slug }) // Forzamos que se ejecute en esta categoría específica
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error(`  ❌ Error de la Edge Function (Status ${response.status}): ${errText}`);
            if (errText.includes("agotado todas las combinaciones únicas")) {
                console.log(`  ⚠️ No se pueden crear más batallas únicas en esta categoría.`);
                break; // Si se acabaron las combinaciones, no seguir intentando
            }
            failureCount++;
          } else {
            const result = await response.json();
            console.log(`  ✅ Creado: ${result.battle.title}`);
            successCount++;
            
            // Pausa breve para evitar Rate Limits de OpenAI si es necesario
            await new Promise(res => setTimeout(res, 1000));
          }
        } catch (fetchError) {
          console.error(`  ❌ Error de conexión al invocar bot:`, fetchError);
          failureCount++;
        }
      }

      console.log(`Resumen para ${category.name}: ${successCount} creadas exitosamente, ${failureCount} errores.`);
    }

    console.log("\n=========================================");
    console.log("🎉 SEMBRADO MASIVO FINALIZADO");
    console.log("=========================================\n");

  } catch (err) {
    console.error("Error fatal en el script:", err);
  }
}

seedBattles();

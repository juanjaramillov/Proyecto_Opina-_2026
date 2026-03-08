import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') + '_' + Math.random().toString(36).substring(2, 7);
}

async function generateAllVersus() {
  console.log("=========================================");
  console.log("INICIANDO GENERACIÓN MASIVA DE VERSUS LOCAL");
  console.log("=========================================\n");

  try {
    // 1. Obtener todas las categorías admitidas
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, active, generation_mode')
      .eq('active', true)
      .eq('generation_mode', 'ai_curated_pairs');

    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      console.log("No hay categorías activas con generation_mode 'ai_curated_pairs'.");
      return;
    }

    let totalCreated = 0;
    
    for (const category of categories) {
      console.log(`\nProcesando categoría: ${category.name} (${category.slug})`);

      // 2. Traer todas las marcas de esta categoría
      let { data: entities, error: entError } = await supabase
          .from('entities')
          .select('*')
          .eq('type', 'brand')
          .ilike('category', category.slug);

      if (!entities || entities.length < 2) {
          const { data: fallbackEntities } = await supabase
              .from('entities')
              .select('*')
              .eq('type', 'brand')
              .ilike('category', category.name);
          entities = fallbackEntities || [];
      }

      if (entError || !entities || entities.length < 2) {
          console.log(`  -> No hay suficientes entidades (marcas) en la categoría ${category.name}.`);
          continue;
      }
      
      console.log(`  -> Encontradas ${entities.length} entidades.`);

      // 3. Traer parejas existentes en esta categoría para no repetirlas
      const { data: existingOptions } = await supabase
          .from('battle_options')
          .select('battle_id, brand_id')
          .in('battle_id', (
              await supabase.from('battles').select('id').eq('category_id', category.id)
          ).data?.map(b => b.id) || []);

      const existingPairs = new Set<string>();
      if (existingOptions) {
          const battlesMap = new Map<string, string[]>();
          existingOptions.forEach(opt => {
              const brands = battlesMap.get(opt.battle_id) || [];
              brands.push(opt.brand_id);
              battlesMap.set(opt.battle_id, brands);
          });
          battlesMap.forEach(brands => {
              if (brands.length === 2) {
                  const pairKey = [brands[0], brands[1]].sort().join('_');
                  existingPairs.add(pairKey);
              }
          });
      }

      const isValidPair = (brandA: any, brandB: any) => {
          if (brandA.name.toLowerCase().trim() === brandB.name.toLowerCase().trim()) return false;
          if (brandA.id === brandB.id) return false;
          const pairKey = [brandA.id, brandB.id].sort().join('_');
          return !existingPairs.has(pairKey);
      };

      // 4. Generar combinaciones y armar batallas
      let createdInProgress = 0;
      for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
              const brandA = entities[i];
              const brandB = entities[j];

              if (isValidPair(brandA, brandB)) {
                  // Crear Batalla
                  const finalTitle = `Batalla: ${brandA.name} vs ${brandB.name}`;
                  const finalDescription = `¿Cuál prefieres entre ${brandA.name} y ${brandB.name}?`;
                  const slug = generateSlug(finalTitle);

                  const { data: newBattle, error: battleError } = await supabase
                      .from('battles')
                      .insert({
                          slug: slug,
                          title: finalTitle,
                          description: finalDescription,
                          category_id: category.id,
                          status: 'active'
                      })
                      .select('*')
                      .single();

                  if (battleError || !newBattle) {
                      console.error(`  [X] Error creando batalla ${finalTitle}:`, battleError);
                      continue;
                  }

                  // Crear opciones
                  const { error: optionsError } = await supabase
                      .from('battle_options')
                      .insert([
                          {
                              battle_id: newBattle.id,
                              label: brandA.name,
                              brand_id: brandA.id,
                              image_url: brandA.image_url,
                              sort_order: 1
                          },
                          {
                              battle_id: newBattle.id,
                              label: brandB.name,
                              brand_id: brandB.id,
                              image_url: brandB.image_url,
                              sort_order: 2
                          }
                      ]);

                  if (optionsError) {
                      console.error(`  [X] Error creando opciones para ${finalTitle}:`, optionsError);
                      continue;
                  }

                  // Crear instancia
                  const { error: instanceError } = await supabase
                      .from('battle_instances')
                      .insert({
                          battle_id: newBattle.id,
                          version: 1,
                          starts_at: new Date().toISOString()
                      });
                  
                  if (instanceError) {
                      console.error(`  [X] Error creando instancia para ${finalTitle}:`, instanceError);
                      continue;
                  }

                  console.log(`  [+] Creada: ${finalTitle}`);
                  createdInProgress++;
                  totalCreated++;
                  
                  // Marcar la pareja como existente
                  existingPairs.add([brandA.id, brandB.id].sort().join('_'));
              }
          }
      }
      
      console.log(`  -> Se crearon ${createdInProgress} batallas nuevas en ${category.name}.`);
    }

    console.log("\n=========================================");
    console.log(`🎉 GENERACIÓN MASIVA FINALIZADA. TOTAL CREADAS: ${totalCreated}`);
    console.log("=========================================\n");
    
  } catch (error) {
    console.error("Error al generar versus:", error);
  }
}

generateAllVersus();

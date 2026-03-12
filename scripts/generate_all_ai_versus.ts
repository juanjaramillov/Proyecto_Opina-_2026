import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const generateTitleWithAI = async (optA: string, optB: string, category: string): Promise<string> => {
    if (!OPENAI_API_KEY) {
        return `Preferencias entre ${optA} y ${optB}`;
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY.trim()}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.7,
                messages: [
                    {
                        role: "system",
                        content: `Eres un copywriter experto creando títulos cortos para encuestas de preferencia A/B entre marcas de una categoría.
Reglas estrictas:
1. NUNCA uses las palabras Guerra, Batalla, Combate, Duelo, Enfrentamiento.
2. NUNCA menciones los nombres de las marcas en el título (los botones ya las tienen).
3. Debe ser un título de máximo 6 palabras. Ej: "¿En cuál confías más?", "¿Cuál prefieres hoy?", "Preferencia de Servicio".
4. Devuelve SOLO el texto del título, nada más.`
                    },
                    {
                        role: "user",
                        content: `Genera el título de la votación limitando en 6 palabras. Categoría: ${category}. Las opciones son ${optA} y ${optB}.`
                    }
                ]
            })
        });
        
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
        }
        return `Preferencias en ${category}`;
    } catch (e) {
        console.error("Error API OpenAI:", e);
        return `Preferencias en ${category}`;
    }
};

function generateSlug(title: string, a: string, b: string) {
    // Para que el slug sea predictivo independientemente del título de AI, usemos las marcas:
    const sorted = [a, b].sort((x, y) => x.localeCompare(y));
    return `${sorted[0]}-vs-${sorted[1]}`
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function generateAllAIVersus() {
  console.log("=========================================");
  console.log("INICIANDO GENERACIÓN MASIVA CON IA (OPENAI)");
  console.log("=========================================\n");

  try {
    // 0. Eliminar versus antiguos / estáticos COMENTADO PARA PERMITIR RESUME
    // console.log("Limpiando batallas anteriores...");
    // const { error: delErr } = await supabase.from('battles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // if (delErr) {
    //     console.warn("No se pudo limpiar batallas anteriores:", delErr.message);
    // } else {
    //     console.log("Directorio de batallas limpio.");
    // }

    // 1. Obtener todas las categorías admitidas
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, active, generation_mode')
      .eq('active', true)
      .eq('generation_mode', 'ai_curated_pairs');

    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      console.log("No hay categorías activas.");
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

      // 4. Generar combinaciones
      let createdInProgress = 0;
      for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
              const brandA = entities[i];
              const brandB = entities[j];

              // Crear Batalla
              const slug = generateSlug('', brandA.name, brandB.name);

              // CHECK IF EXISTS FIRST
              const { count: existsCount } = await supabase
                .from('battles')
                .select('*', { count: 'exact', head: true })
                .eq('slug', slug);

              if (existsCount && existsCount > 0) {
                  // console.log(`  [~] Saltando, ya existe: ${slug}`);
                  continue;
              }

              const aiTitle = await generateTitleWithAI(brandA.name, brandB.name, category.name);
              const finalDescription = `¿Cuál prefieres entre ${brandA.name} y ${brandB.name}?`;

              const { data: newBattle, error: battleError } = await supabase
                  .from('battles')
                  .insert({
                      slug: slug,
                      title: aiTitle,
                      description: finalDescription,
                      category_id: category.id,
                      status: 'active'
                  })
                  .select('*')
                  .single();

              if (battleError || !newBattle) {
                  // Error comun, record ya existe por el slug o algo
                  // console.error(`  [X] Error creando batalla ${aiTitle}:`, battleError);
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
                  console.error(`  [X] Error creando opciones para ${aiTitle}:`, optionsError);
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
                  console.error(`  [X] Error creando instancia para ${aiTitle}:`, instanceError);
                  continue;
              }

              console.log(`  [+] Creada: ${aiTitle} (${brandA.name} vs ${brandB.name})`);
              createdInProgress++;
              totalCreated++;

              // Delay para OpenAI (Rate Limit)
              await new Promise(r => setTimeout(r, 450));
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

generateAllAIVersus();

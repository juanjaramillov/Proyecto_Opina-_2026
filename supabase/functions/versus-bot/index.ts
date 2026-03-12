import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import OpenAI from "https://esm.sh/openai@4.28.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función auxiliar para seleccionar N elementos al azar
function getRandomElements(arr: any[], n: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Función auxiliar para generar un slug seguro
function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') + '_' + Math.random().toString(36).substring(2, 7);
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error("Missing Authorization header");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
        const openAiKey = Deno.env.get('OPENAI_API_KEY');

        if (!openAiKey) {
            throw new Error("OPENAI_API_KEY no está configurada.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const openai = new OpenAI({ apiKey: openAiKey });

        console.log("Iniciando Generador de Versus...");

        // 0. Revisar si hay body category_slug
        let targetCategorySlug = null;
        try {
            // Deno req.json() will throw if body is empty
            const rawBody = await req.text();
            if (rawBody) {
                const body = JSON.parse(rawBody);
                if (body && body.category_slug) {
                    targetCategorySlug = body.category_slug;
                }
            }
        } catch (e) {
            console.log("No valid JSON body, proceeding with random category");
        }

        // 1. Obtener una categoría al azar pero SOLO de las permitidas para IA
        let query = supabase
            .from('categories')
            .select('*')
            .eq('active', true)
            .eq('generation_mode', 'ai_curated_pairs')
            .not('entity_type', 'is', null);

        if (targetCategorySlug) {
            query = query.eq('slug', targetCategorySlug);
        }

        const { data: categories, error: catError } = await query;

        if (catError || !categories || categories.length === 0) {
            throw new Error(`No se pudieron cargar categorías aptas para IA (ai_curated_pairs). Target: ${targetCategorySlug}`);
        }

        const randomCategory = getRandomElements(categories, 1)[0];
        console.log(`Categoría seleccionada: ${randomCategory.name} (${randomCategory.comparison_family})`);

        // 2. Obtener TODAS las entidades de esa categoría
        // La tabla entities guarda la categoría por el nombre (string) o slug
        let { data: entities, error: entError } = await supabase
            .from('entities')
            .select('*')
            .eq('type', 'brand')
            .ilike('category', randomCategory.slug);

        if (!entities || entities.length < 2) {
            // Fallback: intentar coincidencia exacta ignorando mayúsculas con el nombre
            const { data: fallbackEntities } = await supabase
                .from('entities')
                .select('*')
                .eq('type', 'brand')
                .ilike('category', randomCategory.name);
            entities = fallbackEntities || [];
        }

        if (entError || !entities || entities.length < 2) {
            throw new Error(`No hay suficientes entidades (marcas) en la categoría ${randomCategory.name} para crear un versus.`);
        }

        console.log(`Encontradas ${entities.length} entidades en ${randomCategory.name}.`);

        // Obtener historial de batallas activas para evitar duplicados exactos
        const { data: existingOptions } = await supabase
            .from('battle_options')
            .select('battle_id, brand_id')
            .in('battle_id', (
                await supabase.from('battles').select('id').eq('category_id', randomCategory.id)
            ).data?.map(b => b.id) || []);

        // Mapa de parejas existentes: "brandId1_brandId2"
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

        // Separar por Tiers -> Replaced with: Calcular Popularidad Dinámica
        // 1. Obtener conteo de señales históricas para las marcas encontradas
        const brandIds = entities.map(e => e.id);
        const { data: signalsCount } = await supabase
            .from('signals')
            .select('option_id')
            .in('option_id', (
                 await supabase.from('battle_options').select('id').in('brand_id', brandIds)
            ).data?.map(o => o.id) || []);

        // Mapa de conteo de votos por brand_id
        const brandPowerScores = new Map<string, number>();
        brandIds.forEach(id => brandPowerScores.set(id, 0)); // Inicializar en 0

        if (signalsCount) {
             // Tenemos option_id. Necesitamos mapearlos de vuelta a brand_id
             const { data: optionsToBrands } = await supabase
                 .from('battle_options')
                 .select('id, brand_id')
                 .in('id', [...new Set(signalsCount.map(s => s.option_id))]);
                 
             const optionBrandMap = new Map<string, string>();
             optionsToBrands?.forEach(ob => optionBrandMap.set(ob.id, ob.brand_id!));

             signalsCount.forEach(signal => {
                 const brandId = optionBrandMap.get(signal.option_id!);
                 if (brandId) {
                     brandPowerScores.set(brandId, (brandPowerScores.get(brandId) || 0) + 1);
                 }
             });
        }

        console.log(`Calculadas puntuaciones dinámicas para ${entities.length} marcas.`);

        // Helper para comprobar si una pareja es válida (no es duplicada)
        const isValidPair = (brandA_id: string, brandB_id: string) => {
            const pairKey = [brandA_id, brandB_id].sort().join('_');
            return !existingPairs.has(pairKey);
        };

        // Helper para seleccionar pareja priorizando puntajes similares
        let brandA = null;
        let brandB = null;

        const attemptPairing = () => {
             // Generar todas las combinaciones posibles
             const possiblePairs = [];
             
             for(let i=0; i < entities.length; i++) {
                 for(let j=i+1; j < entities.length; j++) {
                     const a = entities[i];
                     const b = entities[j];
                     if(isValidPair(a.id, b.id)) {
                         const scoreA = brandPowerScores.get(a.id) || 0;
                         const scoreB = brandPowerScores.get(b.id) || 0;
                         // Calculamos la DIferencia. Queremos emparejar marcas con popularidad SIMILAR
                         const difference = Math.abs(scoreA - scoreB);
                         // También podemos dar un pequeño bono a las batallas con puntajes ALTOS (mejores marcas peleando)
                         // Weight: (Diferencia media) - (Bono por suma de puntajes / factor)
                         // Queremos minimizar el "weight", así que menor diferencia = mejor. 
                         // Para desempatar emparejamientos con misma diferencia (ej 0-0 vs 100-100), restamos la suma total (dividida p/ no sobreponer).
                         const totalScore = scoreA + scoreB;
                         let weight = difference;
                         if (totalScore > 0) {
                             weight = difference - (totalScore * 0.001); 
                         }
                         
                         possiblePairs.push({ a, b, scoreA, scoreB, weight });
                     }
                 }
             }

             if (possiblePairs.length === 0) return false;

             // Ordenar por nuestro peso calculado (menor weight = mejor emparejamiento)
             possiblePairs.sort((x, y) => x.weight - y.weight);
             
             // Tomar la top (añadimos cierta aleatoriedad entre los mejores 3 para no ser tan predecibles)
             const topCandidates = possiblePairs.slice(0, Math.min(3, possiblePairs.length));
             const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
             
             brandA = selected.a;
             brandB = selected.b;
             console.log(`[Dinámico] Puntajes: ${brandA.name}(${selected.scoreA}) vs ${brandB.name}(${selected.scoreB}) | Diff: ${Math.abs(selected.scoreA-selected.scoreB)}`);
             return true;
        }

        if (!attemptPairing()) {
            console.log(`Combinaciones únicas agotadas en ${randomCategory.name}. Intentando generar una nueva marca (Fallback)...`);
            
            // Fallback generation logic
            const existingNames = entities.map(e => e.name).join(', ');
            const fallbackPrompt = `
Necesito el nombre de UNA (1) marca, servicio o entidad real y conocida en Chile que pertenezca a la categoría "${randomCategory.name}" (${randomCategory.comparison_family}).
DEBE ser diferente a las siguientes marcas que ya tenemos: ${existingNames}.

Devuelve estrictamente un JSON con la siguiente estructura:
{
  "nombre": "Nombre de la Nueva Marca"
}
`;
            
            try {
                const fallbackCompletion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Eres un experto en el mercado chileno y sus marcas." },
                        { role: "user", content: fallbackPrompt }
                    ],
                    response_format: { type: "json_object" },
                });

                const fallbackText = fallbackCompletion.choices[0]?.message?.content;
                if (!fallbackText) throw new Error("No response from OpenAI for fallback entity.");
                
                const fallbackPayload = JSON.parse(fallbackText);
                const newBrandName = fallbackPayload.nombre;
                
                if (!newBrandName || newBrandName.trim() === '') {
                     throw new Error("Invalid brand name from OpenAI.");
                }

                console.log(`OpenAI sugirió nueva marca: ${newBrandName}`);
                
                // Insertar nueva marca
                const newBrandSlug = generateSlug(newBrandName);
                const { data: insertedBrand, error: insertError } = await supabase
                    .from('entities')
                    .insert({
                         type: 'brand',
                         name: newBrandName,
                         category: randomCategory.slug,
                         slug: newBrandSlug,
                         tier: 4, // default
                         description: `Agregada automáticamente por IA para la categoría ${randomCategory.name}`,
                         // image_url: null, (se deja nulo a propósito para que admin lo gestione)
                    })
                    .select('*')
                    .single();
                    
                if (insertError || !insertedBrand) {
                     console.error("Error BD inserting new brand:", insertError);
                     throw new Error("No se pudo insertar la nueva marca.");
                }
                
                console.log(`Nueva marca '${newBrandName}' insertada con éxito. Reintentando emparejamiento...`);
                
                // Add new brand to entities list and scores
                entities.push(insertedBrand);
                brandPowerScores.set(insertedBrand.id, 0);
                
                // Retry pairing
                if (!attemptPairing()) {
                     throw new Error(`Incluso después de generar una marca nueva, no se pudo armar un par en ${randomCategory.name}.`);
                }
                
            } catch (fallbackError: any) {
                console.error("Error en generación Fallback de Entidad:", fallbackError.message);
                throw new Error(`Se han agotado todas las combinaciones y falló la generación automática: ${fallbackError.message}`);
            }
        }

        console.log(`Marcas seleccionadas (Dynamic Score): ${brandA.name} vs ${brandB.name}`);

        // 3. Consultar a OpenAI incorporando las Reglas (AI Curated Engine)
        console.log("Consultando a OpenAI con metadatos de emparejamiento...");
        
        const systemPrompt = `Eres un experto copywriter armando "Batallas" competitivas para una app de votaciones.
Necesitamos crear un evento de votación épico entre dos entidades que compiten en el mercado chileno.

Contexto de la Batalla y Reglas:
- Categoría o Industria: ${randomCategory.name}
- Tipo de Entidad: ${randomCategory.entity_type || 'Marca General'}
- Familia de Comparación: ${randomCategory.comparison_family || 'brand_service'}
- Reglas Especiales / Foco: ${randomCategory.pairing_rules || 'Procurar que ambas opciones sean directamente comparables.'}

Combatiendo hoy:
Opción A: ${brandA.name}
Opción B: ${brandB.name}

Tu Tarea:
Invéntate:
1. Una pregunta corta de "contexto de decisión" (máximo 12 palabras) que sirva como título persuasivo de por qué alguien elegiría una sobre la otra, sin usar lenguaje bélico (evita palabras como Batalla, Guerra, Duelo, Combate). Ejemplos: "¿Cuál prefieres para uso diario?", "Pensando en confianza, ¿cuál eliges?", "¿Cuál recomendarías a un amigo?".
2. Una "descripcion" breve y neutral (1 a 2 líneas máximo) que expanda ligeramente el contexto e invite al usuario a elegir su preferido.

Devuelve estrictamente un JSON con este formato:
{
  "titulo": "...",
  "descripcion": "..."
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt }
            ],
            response_format: { type: "json_object" },
        });

        const completionText = completion.choices[0].message.content || '{"titulo": "¿Cuál de estas opciones prefieres?", "descripcion": "Selecciona la que mejor se adapte a ti"}';
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(completionText);
        } catch {
            parsedPayload = { titulo: "¿Cuál prefieres?", descripcion: "Descubre tu tendencia." };
        }

        const finalTitle = parsedPayload.titulo || `¿Cuál prefieres entre ${brandA.name} y ${brandB.name}?`;
        const finalDescription = parsedPayload.descripcion || `Refleja tu preferencia entre ${brandA.name} y ${brandB.name}.`;
        const slug = generateSlug(finalTitle);

        console.log(`OpenAI Generó: ${finalTitle} - ${finalDescription}`);

        // 4. Insertar la Batalla
        const { data: newBattle, error: battleError } = await supabase
            .from('battles')
            .insert({
                slug: slug,
                title: finalTitle,
                description: finalDescription,
                category_id: randomCategory.id,
                status: 'active'
            })
            .select('*')
            .single();

        if (battleError || !newBattle) {
            console.error("Error BD Battles:", battleError);
            throw new Error("No se pudo insertar la Master Battle.");
        }

        // 5. Insertar las Opciones (Battle Options)
        const commonDomain = (domain: string) => {
            // Helper simple proxy p/ imagen en base al slug, though we can just pull existing image_url if we fetch from entity
            return null;
        };

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
            console.error("Error BD Options:", optionsError);
            throw new Error("No se insertaron las opciones de batalla.");
        }

        // 6. Insertar la Instancia (Battle Instances)
        const { error: instanceError } = await supabase
            .from('battle_instances')
            .insert({
                battle_id: newBattle.id,
                version: 1,
                starts_at: new Date().toISOString()
            });

        if (instanceError) {
            console.error("Error BD Instances:", instanceError);
            throw new Error("No se insertó la instancia de batalla.");
        }

        console.log(`Versus Bot insertó con éxito el escenario de comparación: ${slug}`);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: `Escenario automatizado '${finalTitle}' creado con éxito.`,
                battle: {
                    id: newBattle.id,
                    title: finalTitle,
                    brandA: brandA.name,
                    brandB: brandB.name
                }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error: any) {
        console.error("Error en function versus-bot:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

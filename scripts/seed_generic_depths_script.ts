import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Limpiando depth_definitions...");
  await supabase.from("depth_definitions").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: categories } = await supabase.from('categories').select('name, slug');
  const catMap = new Map();
  categories?.forEach(c => catMap.set(c.name, c.slug));

  const { data: entities } = await supabase.from("entities").select("id, name, category").eq("type", "brand");

  const toInsert = [];

  for (const ent of entities || []) {
    const catSlug = catMap.get(ent.category) || 'unknown';
    const name = ent.name;
    const id = ent.id;

    toInsert.push(
      { entity_id: id, category_slug: catSlug, question_key: 'recomendacion', question_type: 'scale', position: 1, question_text: `Del 0 al 10… ¿qué tan probable es que recomiendes ${name} a tu mejor amigo o peor enemigo?`, options: null },
      { entity_id: id, category_slug: catSlug, question_key: 'q_personaje', question_type: 'choice', position: 2, question_text: `Si ${name} fuera un personaje de tu serie favorita, ¿cuál sería?`, options: '["El protagonista que salva el día","El secundario buena onda","El villano sin corazón","El extra que desaparece rápido","Ese que nadie entiende qué hace ahí"]' },
      { entity_id: id, category_slug: catSlug, question_key: 'q_precio_1_5', question_type: 'scale_1_5', position: 3, question_text: `Precio vs Valor del 1 al 5. ¿Te cobran lo justo o te ven la cara en ${name}?`, options: null },
      { entity_id: id, category_slug: catSlug, question_key: 'q_innovacion_1_5', question_type: 'scale_1_5', position: 4, question_text: `Innovación del 1 al 5. ¿Qué tan al día está ${name} con el siglo XXI?`, options: null },
      { entity_id: id, category_slug: catSlug, question_key: 'q_soporte_1_5', question_type: 'scale_1_5', position: 5, question_text: `Si tienes un problema urgente... del 1 al 5, ¿te ayudan rapidito o te mandan a un bot inútil?`, options: null },
      { entity_id: id, category_slug: catSlug, question_key: 'q_dolor_principal', question_type: 'choice', position: 6, question_text: `¿Qué es lo que más te hace perder la santa paciencia con ${name}?`, options: '["Sus precios de joyería","Atención estilo municipalidad","Se caen o fallan en el peor momento","La burocracia interminable","Me prometen maravillas y no cumplen","Sinceramente, los amo sin cuestionar"]' },
      { entity_id: id, category_slug: catSlug, question_key: 'q_atractivo_principal', question_type: 'choice', position: 7, question_text: `Y a pesar de todo, ¿por qué vuelves a caer con ${name}?`, options: '["El precio me salva la vida","Dentro de todo, funciona","Me da flojera suprema cambiarme","Me atienden como rey/reina","Tienen el monopolio de mi vida","Porque soy fiel por naturaleza"]' },
      { entity_id: id, category_slug: catSlug, question_key: 'q_confianza_1_5', question_type: 'scale_1_5', position: 8, question_text: `¿Cuánta fe ciega le tienes a ${name} a largo plazo? (1 al 5)`, options: null },
      { entity_id: id, category_slug: catSlug, question_key: 'q_fidelidad', question_type: 'choice', position: 9, question_text: `Si mañana desaparece ${name} de la faz de la tierra... tu reacción sería:`, options: '["Lloro lágrimas de sangre","Me duele un rato, pero superable","Me da exactamente lo mismo","Descorcho y hago una fiesta","Ya no los usaba de todas formas"]' },
      { entity_id: id, category_slug: catSlug, question_key: 'q_frecuencia_uso', question_type: 'choice', position: 10, question_text: `Seamos honestos... ¿cada cuánto le rezas o acudes a ${name}?`, options: '["Prácticamente todos los días","Una que otra vez a la semana","Aparezco una vez al mes","Solo para los años bisiestos","Solo cuando no me queda de otra"]' }
    );
  }

  const { error } = await supabase.from("depth_definitions").insert(toInsert);
  if (error) console.error(error);
  else console.log("¡Preguntas de profundidad genéricas re-sembradas exitosamente!");
}
run();

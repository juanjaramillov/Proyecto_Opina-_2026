import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTopics() {
    console.log("Seeding Actualidad topics...");

    // Limpiar topics existentes de prueba para no tener duplicados
    await supabase.from('current_topics').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const dummyTopics = [
        {
            title: "El impacto de la nueva reforma laboral de 40 horas",
            slug: "reforma-laboral-40-horas-impacto",
            short_summary: "Empresas y trabajadores se preparan para la transición hacia una menor jornada laboral. ¿Habrá un impacto real en la productividad y la calidad de vida?",
            category: "País",
            status: "published",
            published_at: new Date().toISOString()
        },
        {
            title: "La inteligencia artificial generativa en agencias de diseño",
            slug: "ia-generativa-agencias-diseno",
            short_summary: "El uso de Midjourney y DALL-E está transformando la forma en que los creativos abordan campañas de marcas masivas. ¿Oportunidad o riesgo laboral?",
            category: "Tendencias y Sociedad",
            status: "published",
            published_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
            title: "El boom del pádel: ¿Deporte pasajero o nueva tradición?",
            slug: "boom-del-padel-deporte-pasajero",
            short_summary: "La apertura explosiva de cientos de canchas a lo largo del país ha masificado este deporte. ¿Llegó para quedarse o veremos un eventual declive?",
            category: "Deportes y Cultura",
            status: "published",
            published_at: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
            title: "Aumento sostenido en el precio de los planes de salud",
            slug: "aumento-precio-planes-de-salud",
            short_summary: "El regulador autorizó una nueva alza promedio en el costo base de las Isapres. Usuarios levantan críticas por la relación precio-calidad del servicio.",
            category: "Economía",
            status: "published",
            published_at: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
            title: "Despachos en el mismo día: El nuevo estándar del retail",
            slug: "despachos-sameday-retail-estandar",
            short_summary: "Las principales tiendas del país están compitiendo por entregar productos en menos de 12 horas. ¿Qué tan sostenible es esta exigencia logística?",
            category: "Marcas y Consumo",
            status: "published",
            published_at: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
            title: "Peajes urbanos dinámicos en la capital",
            slug: "peajes-urbanos-dinamicos-capital",
            short_summary: "El ministerio propone cambiar la tarifa de las autopistas calculando el valor minuto a minuto según el tráfico real. Ciudadanos dudan de la medida.",
            category: "Ciudad / Vida diaria",
            status: "published",
            published_at: new Date(Date.now() - 3600000 * 72).toISOString()
        },
        {
            title: "Prohibición de publicidad de comida rápida en redes sociales",
            slug: "prohibicion-publicidad-comida-rapida-rrss",
            short_summary: "Un nuevo proyecto de ley busca que influencers y marcas de comida ultraprocesada no puedan pautar anuncios dirigidos a menores de 18 años.",
            category: "País",
            status: "draft",
            published_at: null
        }
    ];

    const { data: topics, error } = await supabase
        .from('current_topics')
        .insert(dummyTopics)
        .select();

    if (error) {
        console.error("Error inserting topics:", error);
        return;
    }

    console.log(`Inserted ${topics.length} topics.`);

    // Crear preguntas para el primero
    const firstTopicId = topics.find(t => t.slug === 'reforma-laboral-40-horas-impacto')?.id;
    if (firstTopicId) {
        const { data: set1 } = await supabase.from('topic_question_sets').insert({ topic_id: firstTopicId }).select().single();

        if (set1) {
            const questions = [
                {
                    set_id: set1.id,
                    question_order: 1,
                    question_text: "En tu rubro, ¿crees que la reducción a 40 horas mantendrá la misma productividad?",
                    answer_type: "yes_no"
                },
                {
                    set_id: set1.id,
                    question_order: 2,
                    question_text: "¿Qué tanto crees que esta medida mejorará tu calidad de vida personal?",
                    answer_type: "scale_1_5",
                    options_json: ["Nada", "Poco", "Neutral", "Bastante", "Mucho"]
                },
                {
                    set_id: set1.id,
                    question_order: 3,
                    question_text: "Ante el cambio, ¿qué adaptación te parece más lógica para tu empresa?",
                    answer_type: "single_choice",
                    options_json: ["Trabajar 4 días (10 hrs c/u)", "Salir más temprano todos los días", "Turnos rotativos", "No requiere mayor adaptación"]
                }
            ];

            const { error: qError } = await supabase
                .from('topic_questions')
                .insert(questions);

            if (qError) {
                console.error("Error inserting questions:", qError);
            } else {
                console.log("Inserted questions for the first topic.");
            }
        }
    }

    // Y para el boom del padel
    const padelTopicId = topics.find(t => t.slug === 'boom-del-padel-deporte-pasajero')?.id;
    if (padelTopicId) {
        const { data: set2 } = await supabase.from('topic_question_sets').insert({ topic_id: padelTopicId }).select().single();

        if (set2) {
            const pQuestions = [
                {
                    set_id: set2.id,
                    question_order: 1,
                    question_text: "¿Has jugado pádel o te han invitado a jugar en el último año?",
                    answer_type: "yes_no"
                },
                {
                    set_id: set2.id,
                    question_order: 2,
                    question_text: "¿Crees que el boom de las canchas se sostendrá en 5 años más?",
                    answer_type: "single_choice_polar",
                    options_json: ["Sí, es permanente", "No, pasarán de moda"]
                },
                {
                    set_id: set2.id,
                    question_order: 3,
                    question_text: "A nivel comparativo, ¿prefieres el modelo social del pádel al de salir a un bar?",
                    answer_type: "yes_no"
                }
            ];
            await supabase.from('topic_questions').insert(pQuestions);
        }
    }

    console.log("Done seeding!");
}

seedTopics();

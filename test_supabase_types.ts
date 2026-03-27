import { supabase } from './src/supabase/client';

async function testSelect() {
    const res = await supabase.from('actualidad_topics').select(`
        *,
        topic_questions (
            id,
            content,
            options
        )
    `);

    // El tipo infierido para res.data[0]
    const row = res.data?.[0];
    row?.slug; // Si es {} fallará aquí.
}

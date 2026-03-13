import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAndPublishTopics() {
  console.log('Iniciando limpieza de temas...');

  // 1. Archivar temas actualmente 'published' (los antiguos de prueba)
  const { data: publishedTopics, error: fetchPublishedError } = await supabase
    .from('current_topics')
    .select('id, title')
    .eq('status', 'published');

  if (fetchPublishedError) {
    console.error('Error al obtener temas publicados:', fetchPublishedError);
    return;
  }

  console.log(`Encontrados ${publishedTopics?.length || 0} temas publicados para archivar.`);

  for (const topic of publishedTopics || []) {
    const { error: archiveError } = await supabase
      .from('current_topics')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', topic.id);
      
    if (archiveError) {
        console.error(`Error archivando tema ${topic.id} (${topic.title}):`, archiveError);
    } else {
        console.log(`Archivado: ${topic.title}`);
    }
  }

  // 2. Publicar temas actualmente 'approved' (los nuevos que el usuario aprobó)
  const { data: approvedTopics, error: fetchApprovedError } = await supabase
    .from('current_topics')
    .select('id, title')
    .eq('status', 'approved');

  if (fetchApprovedError) {
    console.error('Error al obtener temas aprobados:', fetchApprovedError);
    return;
  }

  console.log(`Encontrados ${approvedTopics?.length || 0} temas aprobados para publicar.`);

  for (const topic of approvedTopics || []) {
    const { error: publishError } = await supabase
      .from('current_topics')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', topic.id);
      
    if (publishError) {
        console.error(`Error publicando tema ${topic.id} (${topic.title}):`, publishError);
    } else {
        console.log(`Publicado: ${topic.title}`);
    }
  }

  console.log('Proceso finalizado.');
}

cleanAndPublishTopics();

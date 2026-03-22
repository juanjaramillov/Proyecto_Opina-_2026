import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Asegurar que se cargue el archivo .env o .env.local correcto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan credenciales de Supabase en las variables de entorno.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllActualidad() {
  console.log('Iniciando borrado total de noticias de Actualidad...');

  // Deletions in Supabase with cascading or explicit deletion
  // Obtener todos los temas sin importar el estado
  const { data: topics, error: fetchError } = await supabase
    .from('current_topics')
    .select('id, title, status');

  if (fetchError) {
    console.error('Error al obtener temas:', fetchError);
    return;
  }

  console.log(`Encontrados en BD: ${topics?.length || 0} temas totales.`);

  // Filtrar los que tengan source_url en metadata, lo que confirmaría que son noticias RSS
  const rssTopics = topics.filter(t => true); // Borrar todos para hacer un reset completo

  if (!topics || topics.length === 0) {
    console.log('No se encontraron temas para borrar.');
    return;
  }

  const topicIds = topics.map(t => t.id);
  console.log(`Borrando ${topicIds.length} temas y todos sus datos en cascada...`);

  // Borrar de 'current_topics'
  const { error: deleteError } = await supabase
    .from('current_topics')
    .delete()
    .in('id', topicIds);

  if (deleteError) {
    console.error('Error al borrar los temas:', deleteError);
  } else {
    console.log('¡Borrado exitoso! La tabla está limpia para extraer nuevas noticias.');
  }
}

deleteAllActualidad();

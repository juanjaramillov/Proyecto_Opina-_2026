import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTopics() {
  const { data, error } = await supabase
    .from('current_topics')
    .select('id, title, status, created_by_ai')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching topics:', error);
  } else {
    console.table(data);
  }
}

checkTopics();

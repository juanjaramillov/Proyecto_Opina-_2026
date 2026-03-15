import { createClient } from '@supabase/supabase-js';

const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');

async function test() {
  const { data, error } = await supabase
    .from('entities')
    .select('id, name, slug, category, is_active, elo_score, elo_modifier_pct, logo_path')
    .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);
}

test();

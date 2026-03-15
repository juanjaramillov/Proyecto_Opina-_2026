import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://neltawfiwpvunkwyvfse.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHRhd2Zpd3B2dW5rd3l2ZnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ2NzYsImV4cCI6MjA4NzY1NDY3Nn0.RUszyzGL4Hb8Sa30_GJwYOVWVFHtbtUMm9J4mP_Ox2I'
);

async function test() {
  const { data, error } = await supabase
    .from('entities')
    .select('id, name, is_active, elo_score, elo_modifier_pct')
    .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);
}

test();

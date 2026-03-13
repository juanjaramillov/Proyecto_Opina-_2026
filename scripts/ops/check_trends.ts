import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno locales
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrends() {
  console.log("Verificando vista v_trend_week_over_week...");
  const { data, error } = await supabase.from('v_trend_week_over_week').select('*').limit(1);
  if (error) {
     console.log("Error consultando v_trend_week_over_week:", error.message);
  } else {
    console.log("Vista encontrada:", data);
  }
}

checkTrends().catch(console.error);

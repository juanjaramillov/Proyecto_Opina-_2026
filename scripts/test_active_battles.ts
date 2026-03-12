import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBattles() {
  const { data, error } = await supabase.rpc('get_active_battles').limit(3000);
  if (error) {
    console.error("Error fetching battles:", error);
  } else {
    console.log(`Actualmente hay ${data?.length || 0} batallas activas disponibles.`);
    if (data && data.length > 0) {
      console.log("Muestra de la primera batalla:");
      console.log(JSON.stringify(data[0], null, 2));
    }
  }
}

checkBattles();

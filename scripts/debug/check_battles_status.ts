import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBattles() {
  console.log("Consultando conteo de battles agrupados por status...");

  // Supabase Rest JS doesn't have group by easily for simple client, let's fetch counts using JS or RPC
  // Wait, I can just fetch the counts by querying equal status
  
  const { count: activeCount, error: err1 } = await supabase
    .from('battles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
    
  if (err1) console.error("Error active:", err1);

  const { count: draftCount, error: err2 } = await supabase
    .from('battles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');

  if (err2) console.error("Error draft:", err2);

  const { count: totalCount, error: err3 } = await supabase
    .from('battles')
    .select('*', { count: 'exact', head: true });

  if (err3) console.error("Error total:", err3);

  console.log({
    active: activeCount,
    draft: draftCount,
    total: totalCount
  });

}

checkBattles();

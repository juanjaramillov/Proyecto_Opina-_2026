import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectBattles() {
  const { count: total, error: err1 } = await supabase
    .from('battles')
    .select('*', { count: 'exact', head: true });

  const { count: manual, error: err2 } = await supabase
    .from('battles')
    .select('*', { count: 'exact', head: true })
    .ilike('title', 'Preferencia en%');

  console.log(`Total batallas en DB: ${total}`);
  console.log(`Batallas iniciales sembradas ('Preferencia en...'): ${manual}`);
  console.log(`Batallas creadas por IA: ${(total || 0) - (manual || 0)}`);
}

inspectBattles();

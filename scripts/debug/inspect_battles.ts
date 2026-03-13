import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectBattles() {
  const { data: battles } = await supabase
    .from('battles')
    .select('*, options:battle_options(*), instances:battle_instances(*)')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log(JSON.stringify(battles, null, 2));
}

inspectBattles();

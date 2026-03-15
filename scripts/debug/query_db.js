import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('signal_entities').select('name, slug, image_url, brand_domain').limit(10);
  console.log("Entities:", JSON.stringify(data, null, 2));

  const { data: options, error: err2 } = await supabase.rpc('get_progressive_tournament', { p_stage_slug: 'brand-champions' }).limit(5).catch(() => ({data: []}));
  console.log("Progressive:", JSON.stringify(options, null, 2));
}

check();

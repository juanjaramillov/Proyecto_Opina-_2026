import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { MOCK_PLACES } from '../../src/features/feed/components/mockLugares';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.vercel.prod') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.vercel.prod");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function seedLugares() {
  console.log(`Starting migration of ${MOCK_PLACES.length} places to Supabase 'entities' table...`);
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const place of MOCK_PLACES) {
      const slug = generateSlug(place.name);
      
      // Check if it already exists
      const { data: existing, error: checkError } = await supabase
        .from('entities')
        .select('id')
        .eq('slug', slug)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking ${place.name}:`, checkError);
          errors++;
          continue;
      }

      if (existing) {
          console.log(`⏩ Skipped: ${place.name} (already exists)`);
          skipped++;
          continue;
      }

      // Prepare basic record
      const record = {
          name: place.name,
          type: 'brand', // Required constraint for entities
          slug: slug,
          category: place.category, // e.g. "Hamburguesas", "Chilena", etc.
          is_active: true,
          elo_score: 1500, // starting ELO
          logo_path: place.image, // Temporarily saving the unsplash image URL into logo_path if possible, or null
      };

      const { error: insertError } = await supabase
        .from('entities')
        .insert([record]);

      if (insertError) {
          console.error(`❌ Error inserting ${place.name}:`, insertError);
          errors++;
      } else {
          console.log(`✅ Inserted: ${place.name}`);
          inserted++;
      }
  }

  console.log(`\nMigration complete. Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
}

seedLugares().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});

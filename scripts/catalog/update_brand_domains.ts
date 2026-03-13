import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDomains() {
  const content = fs.readFileSync(resolve(process.cwd(), 'scripts/data/brands_domains.txt'), 'utf-8');
  const lines = content.split('\n');

  let currentCategory = '';
  let updatedCount = 0;
  let notFoundCount = 0;

  // fetch all brands without images to minimize DB calls
  const { data: entities, error } = await supabase
    .from('entities')
    .select('id, name, metadata, category')
    .eq('type', 'brand');

  if (error || !entities) {
    console.error("Error fetching entities", error);
    return;
  }

  const entitiesByNameAndCategory = new Map();
  // Name could be slightly different? Hopefully exact match.
  entities.forEach(e => {
    // we use a combination of lowercase name and category
    entitiesByNameAndCategory.set(`${e.name.toLowerCase().trim()}|${e.category}`, e);
  });

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentCategory = line.replace('## ', '').trim();
    } else if (line.startsWith('- ')) {
      const match = line.match(/^- (.*) — (.*)$/);
      if (match) {
        const brandName = match[1].trim();
        let domain = match[2].trim();

        // Extra cleanup: "McDonald's" was sent, might be "McDonald's" or somewhat encoded
        // clean domain (remove www., https://, etc)
        domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        // Find entity
        const key = `${brandName.toLowerCase()}|${currentCategory}`;
        let entity = entitiesByNameAndCategory.get(key);
        
        // Try fallback if not found by name+category, just try by name
        if (!entity) {
             const potential = entities.filter(e => e.name.toLowerCase().trim() === brandName.toLowerCase());
             if (potential.length === 1) {
                 entity = potential[0];
             }
        }

        if (entity) {
          const newMetadata = {
            ...(entity.metadata || {}),
            brand_domain: domain
          };

          const { error: updateError } = await supabase
            .from('entities')
            .update({ metadata: newMetadata })
            .eq('id', entity.id);

          if (updateError) {
            console.error(`Error updating ${brandName}:`, updateError);
          } else {
            updatedCount++;
            console.log(`Updated ${brandName} -> ${domain}`);
          }
        } else {
          console.warn(`Could not find entity for ${brandName} in ${currentCategory}`);
          notFoundCount++;
        }
      } else {
          // just in case it's formatted differently
          console.log("Unmatched line: ", line);
      }
    }
  }

  console.log(`\nDone. Updated: ${updatedCount}. Not found: ${notFoundCount}`);
}

updateDomains();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  try {
    const { data: entities, error } = await supabase.from('entities').select('id, name, slug, type').eq('type', 'brand');
    
    if (error) {
      console.error("DB Error:", error);
      return;
    }
    
    if (!entities) {
      console.log("No entities found.");
      return;
    }

    const nameCounts: Record<string, any[]> = {};
    const slugCounts: Record<string, any[]> = {};

    entities.forEach(e => {
        const lowerName = e.name.toLowerCase().trim();
        if (!nameCounts[lowerName]) nameCounts[lowerName] = [];
        nameCounts[lowerName].push(e);

        if (!slugCounts[e.slug]) slugCounts[e.slug] = [];
        slugCounts[e.slug].push(e);
    });

    const duplicateNames = Object.entries(nameCounts).filter(([_, items]) => items.length > 1);
    const duplicateSlugs = Object.entries(slugCounts).filter(([_, items]) => items.length > 1);

    console.log(`\n=== MARCAS DUPLICADAS ===`);
    
    if (duplicateNames.length === 0 && duplicateSlugs.length === 0) {
        console.log("¡Excelente! No se encontraron marcas repetidas por nombre ni por slug.");
    } else {
        if (duplicateNames.length > 0) {
            console.log(`\nNombres Repetidos (${duplicateNames.length}):`);
            duplicateNames.forEach(([name, items]) => {
                console.log(`- "${name}":`);
                items.forEach(i => console.log(`   -> ID: ${i.id} | Slug: ${i.slug}`));
            });
        }
        
        if (duplicateSlugs.length > 0) {
            console.log(`\nSlugs Repetidos (${duplicateSlugs.length}):`);
            duplicateSlugs.forEach(([slug, items]) => {
                console.log(`- Slug "${slug}":`);
                items.forEach(i => console.log(`   -> ID: ${i.id} | Nombre: ${i.name}`));
            });
        }
    }

  } catch (err) {
    console.error("Script Error:", err);
  }
}

checkDuplicates();

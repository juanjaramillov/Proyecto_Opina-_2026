import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateTotalVersus() {
  try {
    // 1. Obtener todas las categorías admitidas para "ai_curated_pairs"
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, active, generation_mode')
      .eq('active', true)
      .eq('generation_mode', 'ai_curated_pairs');

    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      console.log("No hay categorías activas con generation_mode 'ai_curated_pairs'.");
      return;
    }

    let totalCombinations = 0;
    const categoryStats = [];

    // 2. Para cada categoría, contar cuántas entidades válidas (brands) existen
    for (const category of categories) {
      // Intentar coincidencia con slug
      const { data: entitiesBySlug, error: slugError } = await supabase
        .from('entities')
        .select('id')
        .eq('type', 'brand')
        .ilike('category', category.slug);
        
      let count = entitiesBySlug?.length || 0;

      // Si no hay con slug, intentar coincidencia con name (mismo fallback que el versus-bot)
      if (count === 0) {
        const { data: entitiesByName, error: nameError } = await supabase
          .from('entities')
          .select('id')
          .eq('type', 'brand')
          .ilike('category', category.name);
          
        count = entitiesByName?.length || 0;
      }

      // Calcular combinaciones n * (n - 1) / 2
      let combinations = 0;
      if (count >= 2) {
        combinations = (count * (count - 1)) / 2;
      }

      totalCombinations += combinations;
      
      categoryStats.push({
        name: category.name,
        slug: category.slug,
        entitiesCount: count,
        possibleVersus: combinations
      });
    }

    console.log("=========================================");
    console.log("REPORTE DE POSIBLES BATALLAS VERSUS (IA)");
    console.log("=========================================\n");

    categoryStats.sort((a, b) => b.possibleVersus - a.possibleVersus).forEach(stat => {
      console.log(`Categoría: ${stat.name} (${stat.slug})`);
      console.log(`  - Entidades (marcas): ${stat.entitiesCount}`);
      console.log(`  - Versus posibles:   ${stat.possibleVersus}`);
      console.log("-----------------------------------------");
    });

    console.log(`\n=> VERSUS TOTALES POSIBLES: ${totalCombinations}`);
    console.log(`(Asumiendo batallas sin duplicados: Marca A vs Marca B)`);
    
  } catch (error) {
    console.error("Error calculando los versus:", error);
  }
}

calculateTotalVersus();

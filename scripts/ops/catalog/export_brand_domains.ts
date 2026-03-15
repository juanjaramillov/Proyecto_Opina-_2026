import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PARENT_INDUSTRIES } from '../../src/features/feed/data/industries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function getCategoryInfo(entityCategorySlug: string | null) {
  if (!entityCategorySlug) return { parentName: 'Desconocido', subcatName: 'Desconocido' };

  for (const parentKey of Object.keys(PARENT_INDUSTRIES)) {
    const parent = PARENT_INDUSTRIES[parentKey];
    const subcat = parent.subcategories.find((s: any) => s.slug === entityCategorySlug);
    if (subcat) {
      return { parentName: parent.title, subcatName: subcat.label };
    }
  }
  return { parentName: 'Desconocido', subcatName: entityCategorySlug };
}

async function exportBrands() {
  try {
    // 1. Fetch entities
    const { data: entities, error: errEnt } = await supabase
      .from('entities')
      .select('name, slug, category, metadata, type')
      .eq('type', 'brand')
      .order('name', { ascending: true });

    if (errEnt) {
      console.error("DB Error (entities):", errEnt);
      return;
    }

    // 2. Fetch options to get legacy domains
    const { data: options, error: errOpt } = await supabase
      .from('battle_options')
      .select('label, brand_domain')
      .not('brand_domain', 'is', null);

    if (errOpt) {
      console.error("DB Error (battle_options):", errOpt);
      return;
    }

    // 3. Create a map of legacy domains
    const legacyDomainsMap = new Map<string, string>();
    options?.forEach(opt => {
      // Normalize names to match entities and options
      if (opt.label) {
          legacyDomainsMap.set(opt.label.toLowerCase().trim(), opt.brand_domain);
      }
    });

    if (!entities) return;

    const localLogos = fs.readdirSync(path.resolve(__dirname, '../../public/logos/entities')).map(f => f.split('.')[0]);

    let csvContent = "Marca,Slug,Categoria,Subcategoria,Dominio Web (LLENAR AQUI),Tiene Logo?\n";

    entities.forEach(e => {
      // Escape commas in names
      const nameStr = e.name;
      const csvName = `"${nameStr.replace(/"/g, '""')}"`;
      
      // Parse domain from metadata (new system)
      let domain = '';
      if (e.metadata && typeof e.metadata === 'object' && !Array.isArray(e.metadata)) {
        domain = (e.metadata as any).domain || '';
      }
      
      // If no domain in metadata, fallback to options table (legacy system)
      if (!domain) {
          const legacyDomain = legacyDomainsMap.get(nameStr.toLowerCase().trim());
          if (legacyDomain) {
              domain = legacyDomain;
          }
      }
      
      const hasLogo = localLogos.includes(e.slug) ? 'SI' : 'NO';
      
      const { parentName, subcatName } = getCategoryInfo(e.category);

      csvContent += `${csvName},${e.slug},${parentName},${subcatName},${domain},${hasLogo}\n`;
    });

    const outputPath = path.resolve(__dirname, '../../docs/catalog/completar_dominios_marcas.csv');
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`\n✅ Archivo CSV regenerado exitosamente en:\n${outputPath}`);

  } catch (err) {
    console.error("Script Error:", err);
  }
}

exportBrands();

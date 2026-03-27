import xlsx from 'xlsx';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching active battles from Supabase...');
  const { data: b1, error: e1 } = await supabase.rpc('get_active_battles').range(0, 999);
  const { data: b2, error: e2 } = await supabase.rpc('get_active_battles').range(1000, 1999);
  const allActiveBattles = [...(b1 || []), ...(b2 || [])];
  
  console.log('Fetching all entities from Supabase...');
  // Max out at a large number to ensure we get all entities
  const { data: entitiesData, error: entError } = await supabase.from('entities').select('*').limit(3000);
  if (entError) console.error('Error fetching entities:', entError);
  
  const entitiesMap = new Map<string, any>();
  (entitiesData || []).forEach(ent => {
    entitiesMap.set(ent.name.toLowerCase().trim(), ent);
  });

  // 1. Read input data from the consolidated list
  let wb;
  try {
    wb = xlsx.readFile('Listado_Marcas_Consolidado.xlsx');
  } catch (e) {
    console.error('No se pudo leer Listado_Marcas_Consolidado.xlsx. Asegúrate de que el archivo exista.');
    return;
  }
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);


  // 2. Pre-process and deduplicate
  const allExcelBrands = data.map((d: any) => (d.Marca || '').trim()).filter(Boolean);
  const parentCandidates = new Set(
    allExcelBrands.filter((b: string) => !b.includes(' ') && b.length > 2)
  );

  parentCandidates.add('La Roche-Posay');
  parentCandidates.add('L\'Oréal');

  const uniqueBrands = new Map<string, any>();

  data.forEach((row: any) => {
    if (!row.Marca) return;
    const rawBrand = row.Marca.trim();

    let rootBrand = rawBrand;
    for (const parent of parentCandidates) {
      if (rawBrand !== parent && rawBrand.toLowerCase().startsWith(parent.toLowerCase() + ' ')) {
        rootBrand = parent;
        break;
      }
    }

    const brandLower = rootBrand.toLowerCase();
    if (brandLower.startsWith('samsung')) rootBrand = 'Samsung';
    else if (brandLower.startsWith('apple')) rootBrand = 'Apple';
    else if (brandLower.startsWith('honda')) rootBrand = 'Honda';
    else if (brandLower.startsWith('toyota')) rootBrand = 'Toyota';
    else if (brandLower.startsWith('ford')) rootBrand = 'Ford';
    else if (brandLower.startsWith('chevrolet')) rootBrand = 'Chevrolet';

    const key = rootBrand.toLowerCase();

    if (!uniqueBrands.has(key)) {
      uniqueBrands.set(key, {
        Categoria: row.Categoria || '',
        Subcategoria: row.Subcategoria || '',
        Marca: rootBrand,
        Dominio: row.Dominio || row['Dominio Web'] || '',
        'Logo (SI o NO)': 'NO',
        'Calidad de Logo': '',
        'Medio Captura Imagen': '',
        'Versus (Count)': 0,
        'Participa en Torneo': 'NO',
        'Participa en Profundidad': 'NO'
      });
    } else {
      // If we already have it, but the new row has a domain and the stored one doesn't, update it
      const existing = uniqueBrands.get(key);
      if (!existing.Dominio && (row.Dominio || row['Dominio Web'])) {
        existing.Dominio = row.Dominio || row['Dominio Web'];
      }

    }
  });

  Array.from(uniqueBrands.values()).forEach(brandInfo => {
    const brandNameLower = brandInfo.Marca.toLowerCase();
    
    let versusCount = 0;
    let participaTorneo = false;
    let participaProfundidad = false;
    let imageUrlFromBattle: string | null = null;
    let domainFromBattle: string | null = null;

    allActiveBattles.forEach((battle: any) => {
      const options = battle.options || [];
      const isBrandInBattle = options.some((opt: any) => {
         const optLabelLower = (opt.label || '').toLowerCase();
         if (optLabelLower === brandNameLower || optLabelLower.startsWith(brandNameLower + ' ')) {
           if (opt.image_url) imageUrlFromBattle = opt.image_url;
           if (opt.brand_domain) domainFromBattle = opt.brand_domain;
           return true; // Stop searching this options array
         }
         return false;
      });

      if (isBrandInBattle) {
        versusCount++;
        participaProfundidad = true;
        
        const catSlug = typeof battle.category === 'object' ? battle.category?.slug : battle.category;
        if (catSlug !== 'vida_diaria' && battle.industry !== 'vida_diaria') {
          participaTorneo = true;
        }
      }
    });

    // Check entity table directly for logo if it's not in an active battle or didn't get caught
    const entityRecord = entitiesMap.get(brandNameLower);
    const finalImageUrl = imageUrlFromBattle || (entityRecord && (entityRecord.image_url || entityRecord.logo_path));
    
    // Fallbacks for domains
    if (!brandInfo.Dominio && domainFromBattle) {
      brandInfo.Dominio = domainFromBattle;
    }

    let quality = 4;
    if (finalImageUrl) {
        brandInfo['Logo (SI o NO)'] = 'SI';
        if (finalImageUrl.includes('logo.dev')) {
            brandInfo['Medio Captura Imagen'] = 'API Logo.dev';
            quality = 1;
        } else if (finalImageUrl.includes('brandfetch')) {
            brandInfo['Medio Captura Imagen'] = 'API Brandfetch';
            quality = 2;
        } else if (finalImageUrl.includes('clearbit')) {
            brandInfo['Medio Captura Imagen'] = 'API Clearbit';
            quality = 2;
        } else if (finalImageUrl.includes('google')) {
            brandInfo['Medio Captura Imagen'] = 'Google Favicon';
            quality = 3;
        } else {
            brandInfo['Medio Captura Imagen'] = 'Archivo Subido Localmente';
            quality = 1; // Assumed good if uploaded manually
        }
    } else {
        brandInfo['Logo (SI o NO)'] = 'NO';
        brandInfo['Medio Captura Imagen'] = 'Sin Imagen';
        quality = 4;
    }

    brandInfo['Calidad de Logo'] = quality;
    brandInfo['Versus (Count)'] = versusCount;
    brandInfo['Participa en Torneo'] = participaTorneo ? 'SI' : 'NO';
    brandInfo['Participa en Profundidad'] = participaProfundidad ? 'SI' : 'NO';
  });

  const outputData = Array.from(uniqueBrands.values()).sort((a, b) => {
    if (a.Categoria !== b.Categoria) return a.Categoria.localeCompare(b.Categoria);
    if (a.Subcategoria !== b.Subcategoria) return a.Subcategoria.localeCompare(b.Subcategoria);
    return a.Marca.localeCompare(b.Marca);
  });

  // 4. Write Excel
  const newWb = xlsx.utils.book_new();
  const newWs = xlsx.utils.json_to_sheet(outputData);

  const colWidths = [
    { wch: 25 }, // Categoria
    { wch: 30 }, // Subcategoria
    { wch: 30 }, // Marca
    { wch: 25 }, // Dominio
    { wch: 15 }, // Logo (SI o NO)
    { wch: 25 }, // Calidad de Logo
    { wch: 30 }, // Medio Captura Imagen
    { wch: 15 }, // Versus (Count)
    { wch: 20 }, // Torneo
    { wch: 25 }, // Profundidad
  ];
  newWs['!cols'] = colWidths;

  xlsx.utils.book_append_sheet(newWb, newWs, 'Marcas Consolidadas');
  xlsx.writeFile(newWb, 'Listado_Marcas_Consolidado.xlsx');

  console.log(`Generated Listado_Marcas_Consolidado.xlsx. Reduced to ${outputData.length} unique brands, populated logo fields, and game participation rules applied.`);
}

main().catch(console.error);

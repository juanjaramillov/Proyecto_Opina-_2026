import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''; // Use Service Role Key for Admin Upserts
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = path.resolve(__dirname, '../../docs/catalog/partial_dominios_v2.csv');

// Subcategory definitions so we can infer the category slug from the label provided in the CSV
import { PARENT_INDUSTRIES } from '../../src/features/feed/data/industries.js';
function findSubcategorySlug(labelName: string): string | null {
  for (const parentKey of Object.keys(PARENT_INDUSTRIES)) {
    const parent = PARENT_INDUSTRIES[parentKey];
    for (const subcat of parent.subcategories) {
       if (subcat.label.toLowerCase().trim() === labelName.toLowerCase().trim()) {
           return subcat.slug;
       }
    }
  }
  return null;
}

// Normalized slug generation per User's rules
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ & /g, "-and-")
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-") // Replaces spaces and special chars with hyphens
        .replace(/^-+|-+$/g, "") // Trims hyphens on edges
        .replace(/-+/g, "-"); // Replaces double hyphens
}

async function processDomains() {
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`🚀 Iniciando importación V2: Reglas Nativas de Slug...`);
  
  // 1. Precalculate slugs and check for duplicates to apply the "-subcategory" rule
  type PrecalcRecord = { marca: string, subcatStr: string, autoSlug: string, domain: string, finalSlug: string, subcatSlug: string | null };
  const allRecords: PrecalcRecord[] = [];
  const slugCounts = new Map<string, number>();

  for (const record of records) {
      const marca = record['Marca'];
      const subcatStr = record['Subcategoria'];
      const domain = record['Dominio Web (LLENAR AQUI)'];
      
      const autoSlug = generateSlug(marca);
      slugCounts.set(autoSlug, (slugCounts.get(autoSlug) || 0) + 1);
      
      allRecords.push({
          marca,
          subcatStr,
          autoSlug,
          domain,
          finalSlug: '',
          subcatSlug: findSubcategorySlug(subcatStr)
      });
  }

  // 2. Assign final slugs based on conflict rules
  for (const rec of allRecords) {
      if (slugCounts.get(rec.autoSlug)! > 1) {
          rec.finalSlug = `${rec.autoSlug}-${generateSlug(rec.subcatStr)}`;
      } else {
          rec.finalSlug = rec.autoSlug;
      }
      
      // Override manual exceptions from user
      if (rec.marca === 'H&M') rec.finalSlug = 'hm';
      if (rec.marca === 'TV+') rec.finalSlug = 'tv-plus';
      if (rec.marca === 'X') rec.finalSlug = 'x-social';
      if (rec.marca === 'ABC') rec.finalSlug = 'abc';
      if (rec.marca === 'DGO') rec.finalSlug = 'dgo';
      if (rec.marca === 'MAX') rec.finalSlug = 'max-streaming';
  }

  let successCount = 0;

  // 3. Process into Database & Scrape Logos
  for (let i = 0; i < allRecords.length; i++) {
    const rec = allRecords[i];
    if (!rec.domain) continue;

    console.log(`\n[${i + 1}/${allRecords.length}] 🔄 Procesando: ${rec.marca} -> Slug: ${rec.finalSlug} (${rec.domain})`);

    // Upsert Entity
    const { error: upsertErr } = await supabase
      .from('entities')
      .upsert({
         name: rec.marca,
         slug: rec.finalSlug,
         type: 'brand',
         category: rec.subcatSlug || rec.subcatStr,
         metadata: { domain: rec.domain }
      }, { onConflict: 'slug' });
      
     if (upsertErr) {
         console.error(`❌ Error guardando en DB: ${upsertErr.message}`);
         continue;
     }

    // Scrape Logo
    try {
      console.log(`  🌐 Scrapeando logo de ${rec.domain}...`);
      const { stdout } = await execPromise(`npx tsx scripts/catalog/scrape_website_logos.ts ${rec.domain} ${rec.finalSlug}`);
      if (stdout.includes('Logo guardado satisfactoriamente')) {
        console.log('  🎉 ¡Logo guardado!');
        successCount++;
      } else if (stdout.includes('No se encontró ningún logo')) {
        console.log('  ❌ No se encontró ningún logo en la página web.');
      } else {
        console.log('  ❌ Falló la descarga o conversión.');
      }
    } catch (e: any) {
      console.log(`  ❌ Error ejecutando scraper.`);
    }
  }

  console.log(`\n================================`);
  console.log(`✅ ¡Completado!`);
  console.log(`Nuevos logos guardados: ${successCount}`);
  console.log(`================================\n`);
}

processDomains();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { PARENT_INDUSTRIES } from '../../src/features/feed/data/industries.js';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = path.resolve(__dirname, '../../docs/catalog/partial_dominios_v2.csv');

const logoSelectors = [
    'img[src*="logo"]', 'img[alt*="logo" i]', 'a.logo img', 'a.navbar-brand img',
    'header img', 'img.brand', 'svg[class*="logo"]', 'link[rel="apple-touch-icon"]',
    'link[rel*="icon"]'
];

async function extractLogoFromHtml(html: string, baseUrl: string): Promise<string | null> {
    try {
        const $ = cheerio.load(html);
        let bestUrl: string | null = null; let bestScore = -1;
        for (const selector of logoSelectors) {
             $(selector).each((_, el) => {
                 let src = $(el).attr('src') || $(el).attr('href');
                 if (!src && el.tagName === 'svg') return; 
                 if (src) {
                     try { src = new URL(src, baseUrl).href; } catch(e) { return; }
                     let score = 0; const lowerSrc = src.toLowerCase();
                     if (lowerSrc.includes('.svg')) score += 50; 
                     if (lowerSrc.includes('logo')) score += 30;
                     if (lowerSrc.includes('header') || lowerSrc.includes('nav')) score += 10;
                     if (lowerSrc.includes('favicon') || lowerSrc.includes('16x16') || lowerSrc.includes('32x32')) score -= 20;
                     if (lowerSrc.includes('apple-touch-icon') || lowerSrc.includes('180x180')) score += 20; 
                     if (lowerSrc.includes('.png')) score += 10;
                     if (score > bestScore) { bestScore = score; bestUrl = src; }
                 }
             });
        }
        return bestUrl;
    } catch { return null; }
}

async function scrapeSingleLogo(domain: string): Promise<string | null> {
    const urlsToTry = [`https://www.${domain}`, `https://${domain}`];
    for (const url of urlsToTry) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); 
            const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
            clearTimeout(timeoutId);
            if (!response.ok) continue;
            const logoUrl = await extractLogoFromHtml(await response.text(), url);
            if (logoUrl) return logoUrl;
        } catch (e) { /* ignore */ }
    }
    return null;
}

function findSubcategorySlug(labelName: string): string | null {
  for (const parentKey of Object.keys(PARENT_INDUSTRIES)) {
    const parent = PARENT_INDUSTRIES[parentKey];
    for (const subcat of parent.subcategories) {
       if (subcat.label.toLowerCase().trim() === labelName.toLowerCase().trim()) return subcat.slug;
    }
  }
  return null;
}

function generateSlug(name: string): string {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ & /g, "-and-").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
}

async function processDomains() {
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = fileContent.split('\n').filter(l => l.trim() !== '');
  const records: any[] = [];
  for (let i = 1; i < lines.length; i++) {
     const cols = lines[i].split(',');
     if(cols.length >= 5) {
         records.push({
             marca: cols[0].trim(), subcatStr: cols[3].trim(), domain: cols[4].trim(),
             autoSlug: generateSlug(cols[0].trim()), subcatSlug: findSubcategorySlug(cols[3].trim()), finalSlug: ''
         });
     }
  }

  const slugCounts = new Map<string, number>();
  for (const rec of records) slugCounts.set(rec.autoSlug, (slugCounts.get(rec.autoSlug) || 0) + 1);

  for (const rec of records) {
      if (slugCounts.get(rec.autoSlug)! > 1) rec.finalSlug = `${rec.autoSlug}-${generateSlug(rec.subcatStr)}`;
      else rec.finalSlug = rec.autoSlug;
      if (rec.marca === 'H&M') rec.finalSlug = 'hm';
      if (rec.marca === 'TV+') rec.finalSlug = 'tv-plus';
      if (rec.marca === 'X') rec.finalSlug = 'x-social';
      if (rec.marca === 'ABC') rec.finalSlug = 'abc';
      if (rec.marca === 'DGO') rec.finalSlug = 'dgo';
      if (rec.marca === 'MAX') rec.finalSlug = 'max-streaming';
  }

  let sqlStatements = `SET session_replication_role = 'replica';\n`;
  for (const rec of records) {
      if (!rec.domain || rec.domain === 'NO') continue;
      const category = rec.subcatSlug || rec.subcatStr;
      sqlStatements += `INSERT INTO entities (name, slug, type, category, metadata) VALUES ('${rec.marca.replace(/'/g, "''")}', '${rec.finalSlug}', 'brand', '${category}', '{"domain": "${rec.domain}"}') ON CONFLICT (slug) DO UPDATE SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;\n`;
  }
  sqlStatements += `SET session_replication_role = 'origin';\n`;

  const sqlPath = path.resolve(__dirname, 'temp_insert.sql');
  fs.writeFileSync(sqlPath, sqlStatements);
  
  console.log(`📌 Inyectando ${records.length} marcas usando PSQL...`);
  try {
     execSync('PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/catalog/temp_insert.sql');
     console.log('✅ Base de datos poblada de marcas con éxito.\n');
  } catch(e) { console.error('Error DB:', (e as any).message); return; }

  let successCount = 0;
  for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (!rec.domain || rec.domain === 'NO') continue;
      process.stdout.write(`[${i + 1}/${records.length}] Buscando logo para ${rec.domain}... `);
      
      const logoUrl = await scrapeSingleLogo(rec.domain);
      if (logoUrl) {
          // Update via HTTP bypassed keys just in case, or we use SQL
          const { error } = await supabase.from('entities').update({ image_url: logoUrl }).eq('slug', rec.finalSlug);
          if(error) {
             console.log(`❌ DB Error: ${error.message}`);
          } else {
             console.log(`🎉 Encontrado! (${logoUrl})`);
             successCount++;
          }
      } else {
          console.log(`❌ No encontrado.`);
      }
  }
  console.log(`\n✅ Terminó Batch 6. Nuevos logos guardados: ${successCount}`);
}

processDomains();

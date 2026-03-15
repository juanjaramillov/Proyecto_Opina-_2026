import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : path.resolve(__dirname, '../../docs/catalog/import_v3.csv');

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
    if (!domain || !domain.startsWith('http')) return null;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); 
        const response = await fetch(domain, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
        clearTimeout(timeoutId);
        if (!response.ok) return null;
        const logoUrl = await extractLogoFromHtml(await response.text(), domain);
        if (logoUrl) return logoUrl;
    } catch (e) { /* ignore */ }
    return null;
}

async function startImport() {
  if (!fs.existsSync(CSV_PATH)) {
      console.log('Error: Cargar archivo docs/catalog/import_v3.csv');
      return;
  }

  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = fileContent.split('\n').filter(l => l.trim() !== '');
  const records: any[] = [];
  
  // Format: Industria,Categoria,Subcategoria,Marca,Slug,Dominio
  for (let i = 1; i < lines.length; i++) {
     const line = lines[i].trim();
     if (!line) continue;
     const cols = line.split(',');
     if(cols.length >= 6) {
         records.push({
             industry: cols[0].trim(),
             category: cols[1].trim(),
             subcategory: cols[2].trim(),
             brandName: cols[3].trim(),
             slug: cols[4].trim(),
             domain: cols[5].trim()
         });
     }
  }

  if (records.length === 0) {
      console.log('No hay registros iterables en el CSV.');
      return;
  }

  let sqlStatements = `SET session_replication_role = 'replica';\n`;
  for (const rec of records) {
      if (!rec.slug || !rec.brandName) continue;
      
      const metadata = JSON.stringify({
          industry: rec.industry,
          category: rec.category,
          subcategory: rec.subcategory,
          domain: rec.domain === 'NO' ? null : rec.domain
      });
      
      sqlStatements += `
      INSERT INTO entities (name, slug, type, category, metadata) 
      VALUES ('${rec.brandName.replace(/'/g, "''")}', '${rec.slug}', 'brand', '${rec.subcategory.replace(/'/g, "''")}', '${metadata}') 
      ON CONFLICT (slug) DO UPDATE 
      SET metadata = excluded.metadata, category = excluded.category, name = excluded.name;
      `;
  }
  sqlStatements += `SET session_replication_role = 'origin';\n`;

  const sqlPath = path.resolve(__dirname, 'temp_insert_v3.sql');
  fs.writeFileSync(sqlPath, sqlStatements);
  
  console.log(`📌 Inyectando ${records.length} marcas usando PSQL (Catálogo V3)...`);
  try {
     execSync('PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/catalog/temp_insert_v3.sql');
     console.log('✅ Base de datos poblada de marcas con éxito.\n');
  } catch(e) { 
      console.error('Error DB:', (e as any).message); 
      return; 
  }

  // Logo Scraping Base
  let successCount = 0;
  for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (!rec.domain || rec.domain === 'NO') continue;
      process.stdout.write(`[${i + 1}/${records.length}] Buscando logo para ${rec.domain}... `);
      
      const logoUrl = await scrapeSingleLogo(rec.domain);
      if (logoUrl) {
          const { error } = await supabase.from('entities').update({ image_url: logoUrl }).eq('slug', rec.slug);
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
  console.log(`\n✅ Terminó Importación V3. Nuevos logos guardados: ${successCount}`);
}

startImport();

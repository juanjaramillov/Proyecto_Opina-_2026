import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = path.resolve(__dirname, '../../docs/catalog/partial_dominios.csv');
const LOGOS_DIR = path.resolve(__dirname, '../../public/logos/entities');

// Selectors for finding logos in HTML
const logoSelectors = [
    'img[src*="logo"]',
    'img[alt*="logo" i]',
    'a.navbar-brand img',
    'header img',
    'img.brand',
    'link[rel="apple-touch-icon"]',
    'link[rel*="icon"]'
];

async function extractLogoFromHtml(html: string, baseUrl: string): Promise<string | null> {
    try {
        const $ = cheerio.load(html);
        let bestUrl: string | null = null;
        let bestScore = -1;

        for (const selector of logoSelectors) {
             const elements = $(selector);
             elements.each((_, el) => {
                 let src = $(el).attr('src') || $(el).attr('href');
                 if (!src && el.tagName === 'svg') return; 

                 if (src) {
                     try { src = new URL(src, baseUrl).href; } catch(e) { return; }
                     if (src.includes('data:image')) return; // Skip inline for now

                     let score = 0;
                     const lowerSrc = src.toLowerCase();
                     
                     if (lowerSrc.includes('.svg')) score += 50;
                     if (lowerSrc.includes('logo')) score += 30;
                     if (lowerSrc.includes('apple-touch-icon')) score += 20;
                     if (lowerSrc.includes('favicon') && !lowerSrc.includes('apple-touch-icon')) score -= 20;

                     if (score > bestScore) {
                         bestScore = score;
                         bestUrl = src;
                     }
                 }
             });
        }
        return bestUrl;
    } catch { return null; }
}

async function scrapeLogoUrl(domain: string): Promise<string | null> {
    const urlsToTry = [`https://www.${domain}`, `https://${domain}`];

    for (const url of urlsToTry) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(url, { 
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const html = await response.text();
            const logoUrl = await extractLogoFromHtml(html, url);
            if (logoUrl) return logoUrl;
        } catch (error) { /* Ignore */ }
    }
    return null;
}

async function downloadAndSaveLogo(logoUrl: string, slug: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(logoUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) return false;

        const contentType = response.headers.get('content-type') || '';
        const buffer = await response.arrayBuffer();
        const destPath = path.join(LOGOS_DIR, `${slug}.svg`);

        if (contentType.includes('svg') || logoUrl.toLowerCase().endsWith('.svg')) {
            // Already SVG, save directly
            fs.writeFileSync(destPath, Buffer.from(buffer));
            return true;
        } else {
            // Bitmap image. Wrap it in SVG to maintain system compatibility
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = contentType || 'image/png';
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <image href="data:${mimeType};base64,${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
</svg>`;
            fs.writeFileSync(destPath, svgContent);
            return true;
        }
    } catch (e) {
        return false;
    }
}

async function run() {
    console.log('🚀 Iniciando escaneo desde CSV...');
    if (!fs.existsSync(CSV_PATH)) {
        console.error('El archivo CSV no existe:', CSV_PATH);
        return;
    }

    const csvData = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = csvData.split('\n').filter(l => l.trim().length > 0);
    
    // Header is line 0
    let processed = 0;
    let scrapedLogos = 0;

    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length < 5) continue;
        
        const name = columns[0].replace(/"/g, '');
        const slug = columns[1];
        const domainUrlStr = columns[4].trim();
        
        if (!domainUrlStr) continue; // No domain filled
        
        let domain = domainUrlStr;
        try { domain = new URL(domainUrlStr).hostname.replace('www.', ''); } 
        catch { domain = domainUrlStr.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]; }

        console.log(`\n[${i}/${lines.length-1}] 🔄 Procesando: ${name} (${domain})`);

        // 1. Update DB Domain
        const { data: entityData } = await supabase.from('entities').select('metadata').eq('slug', slug).single();
        if (entityData) {
            const newMetadata = { ...((entityData.metadata as any) || {}), domain };
            await supabase.from('entities').update({ metadata: newMetadata }).eq('slug', slug);
            console.log(`  ✅ Dominio guardado en base de datos.`);
        }

        // 2. Scrape Logo if missing
        const logoExists = fs.existsSync(path.join(LOGOS_DIR, `${slug}.svg`));
        if (!logoExists) {
            console.log(`  🌐 Scrapeando logo de ${domain}...`);
            const logoUrl = await scrapeLogoUrl(domain);
            if (logoUrl) {
                console.log(`  ⬇️ Descargando ${logoUrl}...`);
                const success = await downloadAndSaveLogo(logoUrl, slug);
                if (success) {
                    console.log(`  🎉 ¡Logo guardado!`);
                    scrapedLogos++;
                } else {
                    console.log(`  ❌ Falló la descarga.`);
                }
            } else {
                console.log(`  ❌ No se encontró ningún logo en la página web.`);
            }
        } else {
            console.log(`  🆗 Logo ya existe localmente.`);
        }
        processed++;
    }

    console.log(`\n================================`);
    console.log(`✅ ¡Completado!`);
    console.log(`Marcas procesadas: ${processed}`);
    console.log(`Nuevos logos guardados: ${scrapedLogos}`);
    console.log(`================================`);
}

run();

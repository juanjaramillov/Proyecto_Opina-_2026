import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.development.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Common logo class names or IDs
const logoSelectors = [
    'img[src*="logo"]',
    'img[alt*="logo" i]',
    'a.logo img',
    'a.navbar-brand img',
    'header img',
    'img.brand',
    'svg[class*="logo"]',
    'link[rel="apple-touch-icon"]',
    'link[rel*="icon"]'
];

async function extractLogoFromHtml(html: string, baseUrl: string): Promise<string | null> {
    try {
        const $ = cheerio.load(html);
        
        let bestUrl: string | null = null;
        let bestScore = -1;

        // Find meta tags first (og:image can be good sometimes, but often it's a generic banner)
        // Let's stick to explicit logos
        
        for (const selector of logoSelectors) {
             const elements = $(selector);
             
             elements.each((_, el) => {
                 let src = $(el).attr('src') || $(el).attr('href');
                 
                 // If it's an inline SVG without a src, we could technically extract it, but it's hard to host.
                 // Skip inline SVGs for now unless they have a data:image/svg+xml src
                 if (!src && el.tagName === 'svg') return; 

                 if (src) {
                     // Resolve relative URLs
                     try {
                         src = new URL(src, baseUrl).href;
                     } catch(e) { /* ignore invalid urls */ return; }

                     let score = 0;
                     const lowerSrc = src.toLowerCase();
                     
                     // Scoring heuristics
                     if (lowerSrc.includes('.svg')) score += 50; // SVGs are perfect
                     if (lowerSrc.includes('logo')) score += 30;
                     if (lowerSrc.includes('header') || lowerSrc.includes('nav')) score += 10;
                     // Deprioritize tiny favicons if we can
                     if (lowerSrc.includes('favicon') || lowerSrc.includes('16x16') || lowerSrc.includes('32x32')) score -= 20;
                     if (lowerSrc.includes('apple-touch-icon') || lowerSrc.includes('180x180')) score += 20; // High res icon
                     if (lowerSrc.includes('.png')) score += 10;

                     if (score > bestScore) {
                         bestScore = score;
                         bestUrl = src;
                     }
                 }
             });
        }

        return bestUrl;

    } catch (error) {
        return null; // Silent fail on parsing
    }
}

async function scrapeLogo(domain: string): Promise<string | null> {
    const urlsToTry = [
        `https://www.${domain}`,
        `https://${domain}`,
        `http://www.${domain}`,
        `http://${domain}`,
    ];

    for (const url of urlsToTry) {
        try {
            console.log(`   🌐 Trying ${url}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            const response = await fetch(url, { 
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const html = await response.text();
            const logoUrl = await extractLogoFromHtml(html, url);
            
            if (logoUrl) {
                console.log(`   ✅ Best matching logo extracted: ${logoUrl}`);
                return logoUrl;
            }

        } catch (error: any) {
            // Ignore fetch errors (timeout, SSL issues, etc) and try next protocol
            if (error.name !== 'AbortError') {
                 // console.log(`   ⚠️ Error with ${url}`);
            }
        }
    }
    
    console.log(`   ❌ Could not extract any valid logo from ${domain}`);
    return null;
}

async function run() {
    console.log('🚀 Starting Intelligent Website Scraper for Logos...\n');

    const { data: options, error } = await supabase
        .from('battle_options')
        .select('id, label, brand_domain, image_url')
        .not('brand_domain', 'is', null)
        .is('image_url', null)
        .order('label', { ascending: true });

    if (error) {
        console.error('Failed to fetch options from Supabase:', error);
        process.exit(1);
    }

    if (!options || options.length === 0) {
        console.log('✅ All options with a domain already have an image_url! Nothing to do.');
        process.exit(0);
    }

    // Group by domain
    const processQueue: any[] = [];
    const seenDomains = new Set();
    for(const opt of options) {
         if(!seenDomains.has(opt.brand_domain)) {
             seenDomains.add(opt.brand_domain);
             const group = options.filter((o: any) => o.brand_domain === opt.brand_domain);
             processQueue.push(group);
         }
    }

    console.log(`Found ${options.length} brands (${processQueue.length} unique domains) ready to be scraped.\n`);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < processQueue.length; i++) {
        const group = processQueue[i];
        const domain = group[0].brand_domain;
        const brandName = group[0].label;
        if (!domain) continue;

        console.log(`\n[${i+1}/${processQueue.length}] 🏢 Scraping "${brandName}" (${domain})...`);
        const extractedUrl = await scrapeLogo(domain);

        if (extractedUrl) {
             for(const opt of group) {
                 const { error: updateError } = await supabase
                    .from('battle_options')
                    .update({ image_url: extractedUrl })
                    .eq('id', opt.id);

                if (updateError) {
                    console.error(`   ❌ Failed to save to DB for ${opt.label}:`, updateError);
                    failedCount++;
                } else {
                    console.log(`   💾 DB updated for ${opt.label}.`);
                    successCount++;
                }
             }
        } else {
             failedCount += group.length;
        }
        
        // Politeness wait
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n====================================');
    console.log('🎉 Scraping & Sync Complete!');
    console.log(`Total Success : ${successCount}`);
    console.log(`Total Failed  : ${failedCount}`);
    console.log('====================================\n');
}

run().catch(console.error);

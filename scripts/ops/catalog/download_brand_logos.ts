import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.BRANDFETCH_API_KEY;

if (!supabaseUrl || !supabaseKey || !API_KEY) {
    console.error('Missing Supabase credentials or Brandfetch API Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadAndUploadLogo(brandDomain: string, brandName: string): Promise<string | null> {
    try {
        const cleanDomain = brandDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase().trim();
        console.log(`\n🔍 Fetching ${cleanDomain} from Brandfetch API...`);
        const response = await fetch(`https://api.brandfetch.io/v2/brands/${cleanDomain}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) {
            console.warn(`   ⚠️ API returned ${response.status} for ${cleanDomain}`);
            return null;
        }

        const data = await response.json();
        const logos = data.logos;
        if (!logos || logos.length === 0) {
            console.warn(`   ⚠️ No logos found for ${cleanDomain}`);
            return null;
        }

        // Try to find the best logo (preferably icon/symbol, then anything)
        const bestLogo = logos.find((l: any) => l.type === 'icon' || l.type === 'symbol') || logos[0];
        
        // Prefer SVG, then PNG, then fallback
        const format = bestLogo.formats.find((f: any) => f.format === 'svg') 
            || bestLogo.formats.find((f: any) => f.format === 'png') 
            || bestLogo.formats[0];

        if (!format || !format.src) {
            console.warn(`   ⚠️ No valid image format found for ${cleanDomain}`);
            return null;
        }

        const imageUrl = format.src;
        console.log(`   ✅ Found high-res logo: ${imageUrl}`);
        return imageUrl;

    } catch (error) {
        console.error(`   ❌ Error processing ${brandDomain}:`, error);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Brandfetch High-Res Logo Syncer (Direct URLs)...\n');

    // Fetch options that have a brand_domain but NO image_url
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

    // Try grouping by identical domain to avoid duplicates
    const processQueue: any[] = [];
    const seenDomains = new Set();
    for(const opt of options) {
         if(!seenDomains.has(opt.brand_domain)) {
             seenDomains.add(opt.brand_domain);
             // find all options sharing this domain
             const group = options.filter((o: any) => o.brand_domain === opt.brand_domain);
             processQueue.push(group);
         }
    }

    console.log(`Found ${options.length} brands (${processQueue.length} unique domains) ready for fetching.\n`);

    let successCount = 0;
    let failedCount = 0;

    for (const group of processQueue) {
        const domain = group[0].brand_domain;
        const brandName = group[0].label;
        if (!domain) continue;

        const publicUrl = await downloadAndUploadLogo(domain, brandName);

        if (publicUrl) {
            // Update the database for all matching options
             for(const opt of group) {
                 const { error: updateError } = await supabase
                    .from('battle_options')
                    .update({ image_url: publicUrl })
                    .eq('id', opt.id);

                if (updateError) {
                    console.error(`   ❌ Failed to save ${publicUrl} to DB for ${opt.label}:`, updateError);
                    failedCount++;
                } else {
                    console.log(`   💾 DB updated for ${opt.label}.`);
                    successCount++;
                }
             }
        } else {
             failedCount += group.length;
        }
        
        // Wait a bit to avoid hitting API limits
        await new Promise(r => setTimeout(r, 600));
    }

    console.log('\n====================================');
    console.log('🎉 Download & Sync Complete!');
    console.log(`Total Success : ${successCount}`);
    console.log(`Total Failed  : ${failedCount}`);
    console.log('====================================\n');
}

run().catch(console.error);

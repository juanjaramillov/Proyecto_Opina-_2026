import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('🚀 Starting Brandfetch Logo Syncer (No API Key)...\n');

    const { data: options, error } = await supabase
        .from('battle_options')
        .select('id, label, brand_domain')
        .not('brand_domain', 'is', null)
        .is('image_url', null);

    if (error) {
        console.error('Failed to fetch options from Supabase:', error);
        process.exit(1);
    }

    if (!options || options.length === 0) {
        console.log('✅ All options with a domain already have an image_url! Nothing to do.');
        process.exit(0);
    }

    console.log(`Found ${options.length} brands missing image_urls. Fetching public redirects...\n`);

    let successCount = 0;
    let failedCount = 0;

    for (const opt of options) {
        const domain = opt.brand_domain;
        if (!domain) continue;

        try {
            // asset.brandfetch.io redirects to the actual CDN if logo exists
            const url = `https://asset.brandfetch.io/${domain}/logo`;
            const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
            
            if (response.ok && response.url && response.url !== url) {
                // If the redirect gives a real CDN URL or something other than a generic 404 image
                // We'll trust the response URL unless it's their generic placeholder (we'd have to check hash, but for now just use it)
                const finalUrl = response.url;
                
                const { error: updateError } = await supabase
                    .from('battle_options')
                    .update({ image_url: finalUrl })
                    .eq('id', opt.id);

                if (updateError) {
                    console.error(`   ❌ Failed to save to DB for ${opt.label}:`, updateError);
                    failedCount++;
                } else {
                    console.log(`   ✅ DB updated for ${opt.label} -> ${finalUrl}`);
                    successCount++;
                }

            } else {
                console.warn(`   ⚠️ No valid redirect for ${domain}`);
                failedCount++;
            }
        } catch (err) {
            console.error(`   ❌ Error fetching for ${domain}:`, err);
            failedCount++;
        }
        await new Promise(r => setTimeout(r, 400));
    }

    console.log('\n====================================');
    console.log('🎉 Sync Complete!');
    console.log(`Total Success : ${successCount}`);
    console.log(`Total Failed  : ${failedCount}`);
    console.log('====================================\n');
}

run().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const BRANDFETCH_CLIENT_ID = '1XbJ9XN7f7y8h0B6P3t';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchBrandfetch(brandName: string): Promise<string | null> {
    try {
        const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(brandName)}?c=${BRANDFETCH_CLIENT_ID}`);
        if (!response.ok) {
            console.warn(`[API Error] Brandfetch returned ${response.status} for ${brandName}`);
            return null;
        }

        const data = await response.json();

        // Brandfetch returns an array of matches. Get the highest quality one.
        if (Array.isArray(data) && data.length > 0) {
            // We take the first one as it is sorted by best score usually
            return data[0].domain;
        }
        return null;
    } catch (error) {
        console.error(`[Network Error] Failed to search for ${brandName}:`, error);
        return null;
    }
}

async function run() {
    console.log('🔄 Starting full Brandfetch domain synchronization...\n');

    // 1. Fetch all battle options that are missing a domain
    const { data: options, error } = await supabase
        .from('battle_options')
        .select('id, label, brand_domain')
        .is('brand_domain', null)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Failed to fetch options from Supabase:', error);
        process.exit(1);
    }

    if (!options || options.length === 0) {
        console.log('✅ All options already have a brand_domain filled in! Nothing to do.');
        process.exit(0);
    }

    console.log(`Found ${options.length} brands missing a domain. Starting lookups...\n`);

    let successCount = 0;
    let failedCount = 0;

    // 2. Loop through them and ask Brandfetch
    for (const option of options) {
        const brandName = option.label;
        console.log(`🔍 Searching for: "${brandName}"...`);

        const domain = await searchBrandfetch(brandName);

        if (domain) {
            console.log(`   ✅ Found domain: ${domain} -> Saving to Supabase`);

            const { error: updateError } = await supabase
                .from('battle_options')
                .update({ brand_domain: domain })
                .eq('id', option.id);

            if (updateError) {
                console.error(`   ❌ Failed to save ${domain} in Supabase:`, updateError);
                failedCount++;
            } else {
                successCount++;
            }
        } else {
            console.log(`   ❌ No domain found on Brandfetch for "${brandName}"`);
            failedCount++;
        }

        // Sleep gently to respect rate limits
        await sleep(400);
    }

    console.log('\n====================================');
    console.log('🎉 Synchronization Complete!');
    console.log(`Total Success : ${successCount}`);
    console.log(`Total Failed  : ${failedCount}`);
    console.log('====================================\n');
}

run().catch(console.error);

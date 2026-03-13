import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: options, error } = await supabase
        .from('battle_options')
        .select('id, label, brand_domain')
        .order('label', { ascending: true });

    if (error) {
        console.error('Failed to fetch options', error);
        process.exit(1);
    }

    let md = '# Brand Domains currently in Database\n\n';
    md += '| Label | Domain |\n';
    md += '|---|---|\n';

    options.forEach(opt => {
        md += `| ${opt.label} | ${opt.brand_domain || '❌ (Missing)'} |\n`;
    });

    const outPath = '/Users/juanignaciojaramillo/.gemini/antigravity/brain/9d74e09d-ae8a-4c8e-b18b-fb5d1f46b364/current_domains.md';
    fs.writeFileSync(outPath, md);
    console.log(`Exported domains to ${outPath}`);
}

run().catch(console.error);

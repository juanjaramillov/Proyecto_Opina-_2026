import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../../docs/catalog/master-entity-catalog-curated.csv');
const SEEDS_DIR = path.join(__dirname, '../../supabase/seeds');

if (!fs.existsSync(SEEDS_DIR)) fs.mkdirSync(SEEDS_DIR, { recursive: true });

function escapeSql(str: string | null | undefined): string {
    if (str === null || str === undefined || str === '') return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
}

function run() {
    console.log(`Reading curated CSV: ${CSV_PATH}`);
    const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });

    // Write seed SQL for entities
    let sqlContent = `-- Seed master entities from curated catalog CSV\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n\n`;
    
    let injectedCount = 0;

    for (const r of records) {
        // Skip duplicate check, we assume CSV is already deduplicated by normalize_entities.ts
        if (!r.entity_slug) continue;

        const typeIdQuery = `(SELECT id FROM public.entity_types WHERE code = '${(r.entity_type || 'brand').toUpperCase()}')`;
        
        const metadata = {
            original_category: r.category,
            original_subcategory: r.subcategory,
            original_domain: r.domain,
            catalog_source: 'excel',
            curation_status: r.curation_status || 'curated',
            notes: r.notes || ''
        };
        
        sqlContent += `INSERT INTO public.signal_entities (entity_type_id, slug, display_name, normalized_name, canonical_code, country_code, primary_category, primary_subcategory, metadata) VALUES (\n`;
        sqlContent += `  ${typeIdQuery},\n`;
        sqlContent += `  ${escapeSql(r.entity_slug)},\n`;
        sqlContent += `  ${escapeSql(r.entity_name)},\n`;
        sqlContent += `  ${escapeSql(r.normalized_name)},\n`;
        sqlContent += `  ${escapeSql(r.canonical_code)},\n`;
        sqlContent += `  ${escapeSql(r.country_code)},\n`;
        sqlContent += `  ${escapeSql(r.primary_category)},\n`;
        sqlContent += `  ${escapeSql(r.primary_subcategory)},\n`;
        sqlContent += `  '${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb\n`;
        // Instead of ON CONFLICT DO NOTHING, we want to update the rows if they changed (like name/slug)
        // But the constraint is on canonical_code. Wait, we changed the canonical_code for entities,
        // so they will be NEW rows as far as `ON CONFLICT (canonical_code)` is concerned.
        // Wait, if it's new rows, we will have 'BRAND_APPLE' instead of 'BRAND_APPLE_IPHONE'.
        // So the old 'BRAND_APPLE_IPHONE' will remain!
        // We probably should DELETE everything or let the next script handle legacy options mapping
        // For now let's just do ON CONFLICT DO UPDATE so it overwrites metadata if anything changed
        sqlContent += `) ON CONFLICT (canonical_code) WHERE canonical_code IS NOT NULL DO UPDATE SET\n`;
        sqlContent += `  display_name = EXCLUDED.display_name,\n`;
        sqlContent += `  normalized_name = EXCLUDED.normalized_name,\n`;
        sqlContent += `  slug = EXCLUDED.slug,\n`;
        sqlContent += `  metadata = EXCLUDED.metadata;\n\n`;
        
        injectedCount++;
    }
    
    const outPath = path.join(SEEDS_DIR, 'master_entities_from_catalog.sql');
    fs.writeFileSync(outPath, sqlContent);
    console.log(`✅ File generated: ${outPath} with ${injectedCount} records.`);
}

run();

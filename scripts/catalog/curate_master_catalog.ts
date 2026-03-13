import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = path.join(__dirname, '../../Catalogo Madre/Catalogo Categorias - Final .xlsx');
const OUT_DIR = path.join(__dirname, '../docs/catalog');
const SEEDS_DIR = path.join(__dirname, '../supabase/seeds');

// Ensure dirs exist
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(SEEDS_DIR)) fs.mkdirSync(SEEDS_DIR, { recursive: true });

function toSlug(str: string): string {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeEntityName(name: string): string {
    if (!name) return '';
    let n = name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    n = n.replace(/[^A-Z0-9 ]/g, '');
    return n.trim().replace(/\s+/g, ' ');
}

function cleanDomain(domain: string): string | null {
    if (!domain || typeof domain !== 'string') return null;
    let d = domain.trim().toLowerCase();
    d = d.replace(/^https?:\/\//, '').replace(/^www\./, '');
    d = d.split('/')[0];
    if (d.includes(' ') || d.includes(',')) return null;
    if (d.endsWith('.cl') || d.endsWith('.com') || d.endsWith('.net') || d.endsWith('.org')) {
        return d;
    }
    return null; // For safety, only obvious domains
}

function escapeSql(str: string | null): string {
    if (str === null) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
}

function escapeCsv(str: string | null): string {
    if (str === null) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

function run() {
    console.log(`Reading Excel: ${EXCEL_PATH}`);
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });

    const headers = rows[0] as string[];
    const dataRows = rows.slice(1).filter(r => r.length > 0 && r[0]);

    const curatedRows: any[] = [];
    
    // Stats
    const stats = {
        totalRows: dataRows.length,
        curated: 0,
        domainsRespected: 0,
        domainsAutoCompleted: 0,
        domainsEmptyLowConfidence: 0,
        duplicatesConsolidated: 0,
        needsReview: 0,
        entityTypeDistribution: {} as Record<string, number>,
        categoryDistribution: {} as Record<string, number>
    };

    const seenKeys = new Map<string, any>();
    
    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rawCategory = row[0] || '';
        const rawSubcategory = row[1] || '';
        const rawName = row[2] || '';
        const rawDomain = row[3] || '';

        const category = String(rawCategory).trim();
        const subcategory = String(rawSubcategory).trim();
        let entity_name = String(rawName).trim();
        
        if (!entity_name) continue;

        // Clean trailing spaces and normalize common errors
        entity_name = entity_name.replace(/\s+/g, ' ');

        const entity_slug = toSlug(entity_name);
        const normalized_name = normalizeEntityName(entity_name);
        
        let entity_type = 'BRAND';
        
        // Example overrides if evident based on category
        const catLower = category.toLowerCase();
        if (catLower.includes('gobierno') || catLower.includes('institucion') || catLower.includes('municipal')) {
            entity_type = 'INSTITUTION';
        }
        
        stats.entityTypeDistribution[entity_type] = (stats.entityTypeDistribution[entity_type] || 0) + 1;
        stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;

        const canonical_code = `${entity_type}_${normalized_name.replace(/ /g, '_')}`;
        
        const extractedDomain = cleanDomain(rawDomain);
        const domain = extractedDomain;
        
        if (rawDomain && extractedDomain) {
            stats.domainsRespected++;
        } else if (rawDomain && !extractedDomain) {
            stats.domainsEmptyLowConfidence++;
        } else {
            stats.domainsEmptyLowConfidence++;
        }

        const country_code = domain?.endsWith('.cl') ? 'CL' : null;
        
        let curation_status = 'curated';
        let notes = '';

        const dedupKey = `${category}_${subcategory}_${normalized_name}`;
        
        if (seenKeys.has(dedupKey)) {
            stats.duplicatesConsolidated++;
            notes = 'Consolidated duplicate from Excel. ';
            continue; // Skip duplicate entirely
        }
        
        if (rawDomain && !extractedDomain) {
            curation_status = 'needs_review';
            notes += 'Domain review needed. ';
            stats.needsReview++;
        }
        
        const curatedRecord = {
            category,
            subcategory,
            entity_name,
            entity_slug,
            entity_type,
            domain,
            normalized_name,
            canonical_code,
            country_code,
            primary_category: category,
            primary_subcategory: subcategory,
            source_row_label: `Excel Row ${i+2}`,
            curation_status,
            notes: notes.trim()
        };
        
        seenKeys.set(dedupKey, curatedRecord);
        curatedRows.push(curatedRecord);
        stats.curated++;
    }

    // 1. Write master-entity-catalog-curated.csv
    const curatedCsvHeaders = ['category', 'subcategory', 'entity_name', 'entity_slug', 'entity_type', 'domain', 'normalized_name', 'canonical_code', 'country_code', 'primary_category', 'primary_subcategory', 'source_row_label', 'curation_status', 'notes'];
    let curatedCsvContent = curatedCsvHeaders.join(',') + '\n';
    curatedRows.forEach(r => {
        curatedCsvContent += curatedCsvHeaders.map(h => escapeCsv(r[h])).join(',') + '\n';
    });
    fs.writeFileSync(path.join(OUT_DIR, 'master-entity-catalog-curated.csv'), curatedCsvContent);

    // 2. Write seed SQL for entities
    let sqlContent = `-- Seed master entities from curated catalog Excel\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n\n`;
    
    curatedRows.forEach(r => {
        const typeIdQuery = `(SELECT id FROM public.entity_types WHERE slug = '${r.entity_type.toLowerCase()}')`;
        
        const metadata = {
            original_category: r.category,
            original_subcategory: r.subcategory,
            original_domain: r.domain,
            catalog_source: 'excel',
            curation_status: r.curation_status,
            notes: r.notes
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
        sqlContent += `) ON CONFLICT (canonical_code) DO NOTHING;\n\n`;
    });
    fs.writeFileSync(path.join(SEEDS_DIR, 'master_entities_from_catalog.sql'), sqlContent);

    // 3. Write alias sql draft (optional, minimal for now if useful)
    let aliasSql = `-- Master entity aliases (opcional)\n-- ON CONFLICT ignore to be safe\n\n`;
    aliasSql += `-- Example: Some names might have useful aliases\n`;
    aliasSql += `/* \nINSERT INTO public.entity_aliases (entity_id, alias_name, alias_normalized, confidence_score) \n`;
    aliasSql += `SELECT id, 'Short Name', 'SHORT NAME', 1.0 FROM public.signal_entities WHERE canonical_code = 'BRAND_LONG_NAME' ON CONFLICT DO NOTHING;\n*/\n`;
    fs.writeFileSync(path.join(SEEDS_DIR, 'master_entity_aliases_from_catalog.sql'), aliasSql);

    // 4. Write mapping draft
    const mappingCsvHeaders = ['source_table', 'source_id', 'source_label', 'matched_canonical_code', 'matched_entity_name', 'mapping_status', 'confidence_score', 'notes'];
    let mappingCsv = mappingCsvHeaders.join(',') + '\n';
    curatedRows.forEach(r => {
        const mr = {
            source_table: 'opciones (legacy)',
            source_id: 'unknown_yet',
            source_label: r.entity_name,
            matched_canonical_code: r.canonical_code,
            matched_entity_name: r.entity_name,
            mapping_status: 'predicted',
            confidence_score: '1.0',
            notes: 'Exact match from Excel generation'
        };
        mappingCsv += mappingCsvHeaders.map(h => escapeCsv((mr as any)[h])).join(',') + '\n';
    });
    fs.writeFileSync(path.join(OUT_DIR, 'legacy-to-master-mapping-draft.csv'), mappingCsv);

    // 5. Write Summary
    let summaryMd = `# Catalog Curation Summary\n\n`;
    summaryMd += `- **Total de filas analizadas:** ${stats.totalRows}\n`;
    summaryMd += `- **Total de registros curados:** ${stats.curated}\n`;
    summaryMd += `- **Total de dominios respetados:** ${stats.domainsRespected}\n`;
    summaryMd += `- **Total de dominios autocompletados:** ${stats.domainsAutoCompleted}\n`;
    summaryMd += `- **Total de dominios vacíos por baja confianza:** ${stats.domainsEmptyLowConfidence}\n`;
    summaryMd += `- **Total de duplicados consolidados:** ${stats.duplicatesConsolidated}\n`;
    summaryMd += `- **Total de registros needs_review:** ${stats.needsReview}\n`;
    
    summaryMd += `\n## Distribución por Entity Type\n`;
    for (const [k, v] of Object.entries(stats.entityTypeDistribution)) {
        summaryMd += `- ${k}: ${v}\n`;
    }
    
    summaryMd += `\n## Distribución por Categoría\n`;
    const sortedCategories = Object.entries(stats.categoryDistribution).sort((a,b) => b[1] - a[1]);
    for (const [k, v] of sortedCategories) {
        summaryMd += `- ${k}: ${v}\n`;
    }

    fs.writeFileSync(path.join(OUT_DIR, 'catalog-curation-summary.md'), summaryMd);
    console.log("Done generating all curated data.");
}

run();

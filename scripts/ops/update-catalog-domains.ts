import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const CATALOG_FILE = path.resolve(process.cwd(), 'docs/catalog/master-entity-catalog-curated.csv');
const EXCEL_FILE = path.resolve(process.cwd(), 'Listado_Marcas_Consolidado.xlsx');

async function main() {
    console.log('Reading Excel domains...');
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error('No Excel file found');
        return;
    }
    const wb = xlsx.readFile(EXCEL_FILE);
    const sheetName = wb.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

    const domainMap = new Map<string, string>();
    data.forEach((row: any) => {
        const brand = (row.Marca || '').toLowerCase().trim();
        const dom = (row.Dominio || '').trim();
        if (brand && dom) {
            domainMap.set(brand, dom);
        }
    });

    console.log('Updating CSV domains...');
    const csvContent = fs.readFileSync(CATALOG_FILE, 'utf-8');
    const lines = csvContent.split('\n');
    let updated = 0;
    
    // Headers: category,subcategory,entity_name,entity_slug,entity_type,domain,normalized_name,canonical_code,country_code,primary_category,primary_subcategory,source_row_label,curation_status,notes
    const newLines = lines.map((line, i) => {
        if (i === 0 || !line.trim()) return line;
        
        const cols = line.split(',');
        // Some columns might have quotes, but this csv seems basic without internal commas for name usually, but let's be careful.
        // As seen in the preview, names like "Bruno Fritsch" don't have quotes.
        
        const entityName = cols[2]?.toLowerCase().trim();
        if (entityName && domainMap.has(entityName)) {
            const newDomain = domainMap.get(entityName) as string;
            // ONLY clean the `http://www` part for this CSV as per convention
            const cleanDomain = newDomain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
            if (cols[5] !== cleanDomain) {
                cols[5] = cleanDomain;
                updated++;
            }
        }
        return cols.join(',');
    });

    fs.writeFileSync(CATALOG_FILE, newLines.join('\n'));
    console.log(`Updated domains in CSV: ${updated}`);
}

main().catch(console.error);

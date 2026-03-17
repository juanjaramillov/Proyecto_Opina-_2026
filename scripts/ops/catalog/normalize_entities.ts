import * as fs from 'fs';
import * as path from 'path';

// Mapping of detailed names to parent brands
const normalizations: Record<string, string> = {
  'Pampers Premium Care': 'Pampers',
  'La Roche-Posay Anthelios': 'La Roche-Posay',
  'Vichy Capital Soleil': 'Vichy',
  'Apple AirPods': 'Apple',
  'Apple iPhone': 'Apple',
  'Apple MacBook': 'Apple',
  'Apple Watch': 'Apple',
  'Apple iPad': 'Apple',
  'Samsung Galaxy': 'Samsung',
  'Samsung Galaxy Buds': 'Samsung',
  'Samsung Galaxy Watch': 'Samsung',
  'Samsung Galaxy Tab': 'Samsung',
  'Samsung Odyssey': 'Samsung',
  'ASUS ROG': 'ASUS',
  'ASUS ROG Ally': 'ASUS',
  'Acer Predator': 'Acer',
  'LG UltraGear': 'LG',
  'Lenovo Legion Go': 'Lenovo',
  'Lenovo Tab': 'Lenovo',
  'Xiaomi Pad': 'Xiaomi',
  'Xiaomi Watch': 'Xiaomi',
  'Huawei MatePad': 'Huawei',
  'Huawei Watch': 'Huawei',
  'Honor Pad': 'Honor',
  'Nintendo Switch': 'Nintendo',
  'Claro Hogar': 'Claro',
  'Claro video': 'Claro',
  'Claro TV': 'Claro',
  'Entel Fibra': 'Entel',
  'Movistar Fibra': 'Movistar',
  'Movistar TV': 'Movistar',
  'Movistar TV App': 'Movistar',
  'RedSalud Centros Médicos': 'RedSalud'
};

// Standard slugify function matching Opina+ logic
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   
    .replace(/[\u0300-\u036f]/g, '')   
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')          
    .replace(/[^a-z0-9 -]/g, '')     
    .replace(/\s+/g, '-')            
    .replace(/-+/g, '-');            
}

function normalizeName(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "");
}

function generateCanonicalCode(name: string): string {
    const cleanName = normalizeName(name).replace(/\s+/g, '_');
    return `BRAND_${cleanName}`;
}

async function processCatalog() {
  const catalogPath = path.resolve('docs/catalog/master-entity-catalog-curated.csv');
  const mappingDraftPath = path.resolve('docs/catalog/legacy-to-master-mapping-draft.csv');
  
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog not found at ${catalogPath}`);
  }

  const lines = fs.readFileSync(catalogPath, 'utf8').split('\n');
  const newLines = [];
  const header = lines[0];
  newLines.push(header);

  const seenSlugs = new Set<string>();
  let replacedCount = 0;
  let deletedDupsCount = 0;
  
  // Keep track of canonical code changes to update the mapping file later
  // Map of old canonical code -> new canonical code
  const codeChanges = new Map<string, string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Quick split by simple comma (assuming no quoted commas in these specific fields for now based on data)
    const parts = line.split(',');
    if (parts.length < 14) continue;
    
    // Fields: category,subcategory,entity_name,entity_slug,entity_type,domain,normalized_name,canonical_code,...
    let entityName = parts[2];
    const oldCanonicalCode = parts[7];
    
    if (normalizations[entityName]) {
      const parentName = normalizations[entityName];
      entityName = parentName;
      
      const newSlug = slugify(parentName);
      const newNormalized = normalizeName(parentName);
      const newCanonical = generateCanonicalCode(newNormalized);
      
      codeChanges.set(oldCanonicalCode, newCanonical);
      
      parts[2] = entityName;
      parts[3] = newSlug;
      parts[6] = newNormalized;
      parts[7] = newCanonical;
      
      replacedCount++;
    }

    const currentSlug = parts[3];
    if (seenSlugs.has(currentSlug)) {
      deletedDupsCount++;
      // Do not push this to newLines (effectively deduplicating)
    } else {
      seenSlugs.add(currentSlug);
      newLines.push(parts.join(','));
    }
  }

  fs.writeFileSync(catalogPath, newLines.join('\n'));
  console.log(`✅ Updated master catalog: Replaced ${replacedCount} detailed names, removed ${deletedDupsCount} resulting duplicates.`);

  // Now update the mapping draft
  if (fs.existsSync(mappingDraftPath)) {
    const mappingLines = fs.readFileSync(mappingDraftPath, 'utf8').split('\n');
    let mappingUpdates = 0;
    
    for (let i = 1; i < mappingLines.length; i++) {
      const line = mappingLines[i];
      if (!line.trim()) continue;
      
      // We look for the exact old canonical code and replace it
      for (const [oldCode, newCode] of codeChanges.entries()) {
        if (line.includes(oldCode)) {
          mappingLines[i] = line.replace(oldCode, newCode);
          mappingUpdates++;
          break; // Stop checking this line if replaced
        }
      }
    }
    
    fs.writeFileSync(mappingDraftPath, mappingLines.join('\n'));
    console.log(`✅ Updated mapping draft: ${mappingUpdates} rows repointed to new canonical codes.`);
  } else {
    console.log(`⚠️ Mapping draft not found at ${mappingDraftPath}`);
  }
}

processCatalog().catch(console.error);

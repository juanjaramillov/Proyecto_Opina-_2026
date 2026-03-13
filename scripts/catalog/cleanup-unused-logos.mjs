import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.resolve(__dirname, '../../docs/catalog/master-entity-catalog-curated.csv');
const LOGOS_DIR = path.resolve(__dirname, '../../public/logos/entities');

function getValidSlugs() {
  const content = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const lines = content.split('\n');
  const slugs = new Set();
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Naive CSV parse
    const cols = line.split(',');
    if (cols.length > 3) {
      const slug = cols[3].trim(); 
      slugs.add(slug);
    }
  }
  return slugs;
}

const validSlugs = getValidSlugs();
const files = fs.readdirSync(LOGOS_DIR);
let deletedCount = 0;

console.log(`Valid slugs count: ${validSlugs.size}`);
console.log(`Files count: ${files.length}`);

for (const file of files) {
  if (file === '.gitkeep' || file === '.DS_Store') continue;
  
  const ext = path.extname(file);
  const baseName = path.basename(file, ext);
  
  if (!validSlugs.has(baseName)) {
    fs.unlinkSync(path.join(LOGOS_DIR, file));
    console.log(`Deleted unused logo: ${file}`);
    deletedCount++;
  }
}

console.log(`\nCleanup complete. Deleted ${deletedCount} unused logos.`);

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const dir = path.join(process.cwd(), 'public/logos/entities');

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (e) {
    return 0;
  }
}

function run() {
  const cmd = `PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT slug, display_name, metadata->>'original_domain' FROM signal_entities WHERE entity_type_id = 1 AND is_active = true;"`;
  const result = execSync(cmd, { encoding: 'utf-8' });

  // Correct split by newline character
  const lines = result.split('\n').filter(l => l.trim().length > 0);
  const brands = lines.map(l => {
    const parts = l.split('|').map(p => p.trim());
    return { slug: parts[0], display_name: parts[1], domain: parts[2] };
  });

  let noLogoCount = 0;
  let noDomainCount = 0;
  let pixelatedLogos = 0;
  let fileHashes = new Map();

  const getHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  };

  const exts = ['.svg', '.png', '.jpg', '.webp', '.jpeg'];
  const missingLogosList = [];
  const lowQualityList = [];

  for (const b of brands) {
    if (!b.slug) continue;

    if (!b.domain || b.domain === '') {
      noDomainCount++;
    }

    let logoFound = false;
    let foundPath = '';
    
    for (const ext of exts) {
      const p = path.join(dir, `${b.slug}${ext}`);
      if (fs.existsSync(p)) {
        logoFound = true;
        foundPath = p;
        break;
      }
    }

    if (!logoFound) {
      noLogoCount++;
      missingLogosList.push(b.display_name);
    } else {
      const hash = getHash(foundPath);
      if (!fileHashes.has(hash)) {
        fileHashes.set(hash, []);
      }
      fileHashes.get(hash).push(b.display_name);

      const size = getFileSize(foundPath);
      // Rough heuristic: if PNG/JPG and very small (<3KB), might be pixelated
      if (!foundPath.endsWith('.svg') && size < 3072) {
        pixelatedLogos++;
        lowQualityList.push(`${b.display_name} (${Math.round(size/1024)} KB)`);
      }
      // If it's a fallback or empty file (e.g. 0 bytes)
      if (size === 0) {
        // ...
      }
    }
  }

  console.log(`1. Total Brands: ${brands.length}`);
  console.log(`2. Marcas sin logo local: ${noLogoCount}`);
  console.log(`3. Marcas sin dominio: ${noDomainCount}`);
  console.log(`4. Marcas con logo JPG/PNG sospechoso (< 3KB): ${pixelatedLogos}`);
  if (pixelatedLogos > 0) {
    console.log(`   Ejemplos: ${lowQualityList.slice(0,10).join(', ')}`);
  }
  
  console.log("\\n5. Casos de mismo logo exacto (archivo identico):");
  let foundDupes = false;
  for (const [hash, names] of fileHashes.entries()) {
    if (names.length > 1) {
      const isBeverage = names.some(n => n.toLowerCase().includes('coca') || n.toLowerCase().includes('fanta') || n.toLowerCase().includes('sprite'));
      if (isBeverage || true) { // Just show all exact matches
        console.log(`- Logo compartido: ${names.join(', ')}`);
        foundDupes = true;
      }
    }
  }
  if (!foundDupes) console.log("- Ninguno.");
}

run();

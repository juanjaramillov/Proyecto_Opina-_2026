import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const NEXT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const LEGACY_DIR = path.resolve(process.cwd(), 'public/logos/entities_legacy');
const OVERRIDES_FILE = path.resolve(process.cwd(), 'docs/catalog/logo-overrides.csv');

const HIGHPRIO_CSV = path.resolve(process.cwd(), 'docs/catalog/logo-overrides-medium-priority.csv');
const HIGHPRIO_JSON = path.join(NEXT_DIR, 'medium-priority-review.json');
const HIGHPRIO_HTML = path.join(NEXT_DIR, 'medium-priority-gallery.html');

interface OverrideItem {
  entitySlug: string;
  entityName: string;
  domain: string;
  currentStatus: string;
  qualityTier: string;
  currentSourceProvider: string;
  currentSourceUrl: string;
  manualOverridePath: string;
  manualOverrideDomain: string;
  manualNotes: string;
  approvedForNextMigration: string | boolean;
  manualPriority: string;
  [key: string]: any;
}

async function loadCsv<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    if (!fs.existsSync(filePath)) return resolve([]);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function checkLegacyAsset(slug: string): string | null {
  const exts = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
  for (const ext of exts) {
    const p = path.join(LEGACY_DIR, `${slug}${ext}`);
    if (fs.existsSync(p)) {
      return `/logos/entities_legacy/${slug}${ext}`;
    }
  }
  return null;
}

function guessProblemType(item: OverrideItem): string {
  const url = (item.currentSourceUrl || '').toLowerCase();
  
  if (url.includes('favicon.ico') || url.includes('apple-touch')) {
    return 'weak_favicon';
  }
  if (item.qualityTier === 'missing') {
    if (!item.domain) return 'missing_domain';
    return 'no_reliable_candidate';
  }
  if (item.qualityTier === 'weak') {
    return 'poor_quality_resolution';
  }
  return 'no_reliable_candidate';
}

async function main() {
  console.log('🚀 Preparando Paquete de Alta Prioridad...');

  const overrides = await loadCsv<OverrideItem>(OVERRIDES_FILE);
  
  // 1. Filtrar solo prioridad 'media'
  const highPrio = overrides.filter(o => o.manualPriority === 'media');

  const reviewItems: any[] = [];
  
  // 2. Enriquecer
  for (const item of highPrio) {
    const legacyAsset = checkLegacyAsset(item.entitySlug) || '';
    const problemType = guessProblemType(item);

    let suggestedDomain = '';
    let suggestedPath = '';

    if (legacyAsset) {
      suggestedPath = legacyAsset;
    } else if (item.domain) {
      suggestedDomain = item.domain;
    }

    item.suggestedOverrideDomain = suggestedDomain;
    item.suggestedOverridePath = suggestedPath;
    item.problemType = problemType; // Not part of CSV to be saved, but for JSON/HTML

    reviewItems.push({
      ...item,
      legacyAsset,
    });
  }

  // 3. Generar JSON
  fs.writeFileSync(HIGHPRIO_JSON, JSON.stringify(reviewItems, null, 2));

  // 4. Generar CSV exclusivo
  const requiredHeaders = [
    'entitySlug', 'entityName', 'manualPriority', 'currentStatus', 'qualityTier',
    'currentSourceProvider', 'currentSourceUrl', 
    'suggestedOverrideDomain', 'suggestedOverridePath',
    'manualOverrideDomain', 'manualOverridePath', 
    'manualNotes', 'approvedForNextMigration'
  ];

  const csvLines = [requiredHeaders.join(',')];
  for (const item of reviewItems) {
    const row = requiredHeaders.map(h => {
      const val = item[h] !== undefined ? String(item[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvLines.push(row.join(','));
  }
  fs.writeFileSync(HIGHPRIO_CSV, csvLines.join('\n'));

  // 5. Generar HTML Gallery
  const htmlStart = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>High Priority Logos Review</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .card h3 { margin-top: 0; }
    .assets { display: flex; gap: 10px; margin-top: 10px; }
    .asset-box { background: #eee; flex: 1; text-align: center; border-radius: 4px; padding: 10px;}
    .asset-box img { max-width: 100px; max-height: 100px; object-fit: contain; }
    .pill { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .pill.weak { background: #ffebee; color: #c62828; }
    .pill.needs_review { background: #fff3e0; color: #ef6c00; }
    .pill.missing { background: #eceff1; color: #546e7a; }
    pre { background: #f0f0f0; padding: 5px; font-size: 11px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Revisión de Prioridad Media (${reviewItems.length} assets)</h1>
  <p>Edite <code>docs/catalog/logo-overrides-medium-priority.csv</code> para aprobar los casos listados aquí.</p>
  <div class="grid">
`;

  let htmlMid = '';
  for (const item of reviewItems) {
    const currentImg = `<img src="${item.currentSourceUrl}" onerror="this.src=''" alt="Current" />`;
    const legacyImg = item.legacyAsset ? `<img src="${item.legacyAsset}" alt="Legacy" />` : '<i>(No legacy asset)</i>';

    htmlMid += `
    <div class="card">
      <h3>${item.entityName} <span class="pill ${item.qualityTier}">${item.qualityTier}</span></h3>
      <div><small><strong>Problema detectado:</strong> ${item.problemType}</small></div>
      <div class="assets">
        <div class="asset-box">
          <small>Actual</small><br/>
          ${currentImg}
        </div>
        <div class="asset-box">
          <small>Legacy</small><br/>
          ${legacyImg}
        </div>
      </div>
      <div>
        <p><small><strong>Dominio:</strong> ${item.domain}</small></p>
      </div>
    </div>
    `;
  }

  const htmlEnd = `
  </div>
</body>
</html>
`;

  fs.writeFileSync(HIGHPRIO_HTML, htmlStart + htmlMid + htmlEnd);

  console.log(`\n--- PAQUETE DE PRIORIDAD ALTA CREADO ---`);
  console.log(`🔴 Casos procesados: ${reviewItems.length}`);
  console.log(`📂 CSV exclusivo para edición: docs/catalog/logo-overrides-medium-priority.csv`);
  console.log(`📂 Galería visual: public/logos/entities_next/medium-priority-gallery.html`);
  console.log(`📂 Reporte JSON: public/logos/entities_next/medium-priority-review.json`);
  console.log(`\n✏️ Ya puedes revisar visualmente y rellenar el CSV.`);
}

main().catch(console.error);

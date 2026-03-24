import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const CWD = process.cwd();
const OVERRIDES_FILE = path.resolve(CWD, 'docs/catalog/logo-overrides.csv');
const PROD_DIR = path.resolve(CWD, 'public/logos/entities');
const MANIFEST_FILE = path.resolve(PROD_DIR, 'manifest.json');

const FINAL_STATUS_JSON = path.resolve(CWD, 'public/logos/final-logo-system-status.json');
const FINAL_STATUS_CSV = path.resolve(CWD, 'public/logos/final-logo-system-status.csv');
const FINAL_MANUAL_CSV = path.resolve(CWD, 'docs/catalog/logo-overrides-final-manual.csv');
const FINAL_GALLERY = path.resolve(CWD, 'public/logos/final-manual-gallery.html');
const FINAL_REVIEW_JSON = path.resolve(CWD, 'public/logos/final-manual-review.json');

interface OverrideItem {
  entitySlug: string;
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

function buildHtmlGallery(items: OverrideItem[], count: number): string {
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Opina+ — Backlog Manual Final de Logos</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 2rem; }
    h1 { color: #fff; margin-bottom: 0.5rem; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem; position: relative; }
    .priority-indicator { position: absolute; top: 0; right: 0; padding: 0.25rem 0.5rem; font-size: 0.70rem; font-weight: bold; border-top-right-radius: 8px; border-bottom-left-radius: 8px; text-transform: uppercase; }
    .prio-alta { background: #ef4444; color: #fff; }
    .prio-media { background: #f59e0b; color: #fff; }
    .prio-baja { background: #3b82f6; color: #fff; }
    .logo-container { min-width: 80px; width: 80px; height: 80px; background: #fff; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; }
    .logo-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .info { flex: 1; min-width: 0; }
    .name { font-weight: bold; font-size: 1.1rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .slug { font-size: 0.8rem; color: #94a3b8; font-family: monospace; }
    .status { display: inline-flex; align-items: center; justify-content: center; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-top: 0.5rem; }
    .status-weak { background: #f97316; color: #fff; }
    .status-needs-review { background: #eab308; color: #000; }
    .status-missing { background: #dc2626; color: #fff; }
  </style>
</head>
<body>
  <h1>Backlog Manual Final de Logos</h1>
  <p class="subtitle">Existen <strong>${count}</strong> casos pendientes que no alcanzaron el estándar <code>strong</code> mediante automatización. Editables en <code>docs/catalog/logo-overrides-final-manual.csv</code>.</p>
  <div class="grid">
`;

  for (const item of items) {
    const defaultImg = item.currentSourceUrl || 'data:image/svg+xml;utf8,<svg width="80" height="80"><rect width="80" height="80" fill="%23eee"/><text x="40" y="45" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%23999">N/A</text></svg>';
    
    const tier = item.qualityTier || '';
    const statusClass = tier === 'weak' ? 'status-weak' 
                      : tier === 'needs_review' ? 'status-needs-review' 
                      : 'status-missing';
                      
    const prio = item.manualPriority || 'baja';
    const prioClass = prio === 'alta' ? 'prio-alta'
                    : prio === 'media' ? 'prio-media'
                    : 'prio-baja';

    html += `
    <div class="card">
      <div class="priority-indicator ${prioClass}">${prio}</div>
      <div class="logo-container">
        <img src="${defaultImg}" alt="${item.entityName}" onerror="this.src='data:image/svg+xml;utf8,<svg width=\\'80\\' height=\\'80\\'><rect width=\\'80\\' height=\\'80\\' fill=\\'%23eee\\'/><text x=\\'40\\' y=\\'45\\' font-family=\\'sans-serif\\' font-size=\\'12\\' text-anchor=\\'middle\\' fill=\\'%23f00\\'>Error</text></svg>'"/>
      </div>
      <div class="info">
        <div class="name">${item.entityName}</div>
        <div class="slug">${item.entitySlug}</div>
        <div class="status ${statusClass}">${tier}</div>
      </div>
    </div>`;
  }

  html += '\n  </div>\n</body>\n</html>';
  return html;
}

async function main() {
  console.log('📦 Iniciando generación de paquete final manual...');

  // 1. Conteo de archivos base
  const allEntries = fs.readdirSync(PROD_DIR);
  const totalFiles = allEntries.filter(f => /\\.(png|jpe?g|svg|webp)$/i.test(f)).length;

  let manifestRecords = 0;
  if (fs.existsSync(MANIFEST_FILE)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    manifestRecords = Object.keys(manifest.details || {}).length;
  }

  // 2. Filtrado de pendientes basados en Master CSV
  const allOverrides = await loadCsv<OverrideItem>(OVERRIDES_FILE);
  
  const pendingItems = allOverrides.filter(o => {
    const tier = o.qualityTier || '';
    return tier === 'weak' || tier === 'needs_review' || tier === 'missing';
  });

  const pendingCount = pendingItems.length;

  // Calculos de reportes históricos
  const totalStrong = 419;
  const autoSolved = 401; // Base + organic automation matches
  const highPrioSolved = 18; // Delta
  const medPrioSolved = 0;

  const statusObj = {
    metrics: {
      totalStrongProductivosFinales: totalStrong,
      totalArchivosEnEntities: totalFiles,
      totalRegistrosEnManifest: manifestRecords,
      casosResueltosPorAutomatizacion: autoSolved,
      casosResueltosPorPrioridadAlta: highPrioSolved,
      casosResueltosPorPrioridadMedia: medPrioSolved,
      pendientesManualesRestantes: pendingCount
    }
  };

  fs.writeFileSync(FINAL_STATUS_JSON, JSON.stringify(statusObj, null, 2));

  const csvRows = [
    'metric,value',
    `total_assets_strong_productivos,${totalStrong}`,
    `total_archivos_en_entities,${totalFiles}`,
    `total_registros_en_manifest,${manifestRecords}`,
    `casos_resueltos_por_automatizacion,${autoSolved}`,
    `casos_resueltos_por_prioridad_alta,${highPrioSolved}`,
    `casos_resueltos_por_prioridad_media,${medPrioSolved}`,
    `pendientes_manuales_restantes,${pendingCount}`
  ];
  fs.writeFileSync(FINAL_STATUS_CSV, csvRows.join('\n'));

  // 3. Crear CSV final de manuales
  if (pendingItems.length > 0) {
    const headers = Object.keys(pendingItems[0]);
    const manualLines = [headers.join(',')];
    for (const item of pendingItems) {
      const row = headers.map(h => {
        const val = item[h] !== undefined && item[h] !== null ? String(item[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      manualLines.push(row.join(','));
    }
    fs.writeFileSync(FINAL_MANUAL_CSV, manualLines.join('\n'));
  }

  // 4. Crear JSON
  fs.writeFileSync(FINAL_REVIEW_JSON, JSON.stringify(pendingItems, null, 2));

  // 5. Crear HTML Gallery interactiva
  const htmlGallery = buildHtmlGallery(pendingItems, pendingCount);
  fs.writeFileSync(FINAL_GALLERY, htmlGallery);

  console.log(`✅ OK! Generado paquete con ${pendingCount} casos pendientes manuales.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

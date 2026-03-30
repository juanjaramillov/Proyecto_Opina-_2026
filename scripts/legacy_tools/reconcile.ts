import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const AUDIT_FILE = path.join(OUTPUT_DIR, 'quality-audit.json');

const RECONCILIATION_REPORT_JSON = path.join(OUTPUT_DIR, 'reconciliation-report.json');
const RECONCILIATION_REPORT_CSV = path.join(OUTPUT_DIR, 'reconciliation-report.csv');
const EXCLUDED_GALLERY_HTML = path.join(OUTPUT_DIR, 'excluded-gallery.html');

const OVERRIDES_DIR = path.resolve(process.cwd(), 'docs/catalog');
const OVERRIDES_CSV = path.join(OVERRIDES_DIR, 'logo-overrides.csv');

async function main() {
  console.log('🚀 Generando Reporte de Reconciliación y Cola de Curación...');

  // 1. Crear el reporte de reconciliación
  const reconciliationData = {
    previousAudit: {
      strong: 391,
      weak: 20,
      needs_review: 28,
      missing: 2,
      total: 441,
    },
    finalMigration: {
      strong: 387,
      weak: 35,
      needs_review: 13,
      missing: 4,
      total: 439,
    },
    explanations: [
      {
        factor: "Cambio en cantidad total de opciones",
        details: "El total bajó de 441 a 439 (-2 entidades). Estas 2 entidades fueron eliminadas o unificadas en el origen (listado_opciones_unicas.xlsx / base de datos) antes de la migración final."
      },
      {
        factor: "Limpieza de logos de baja resolución (Low-Res Clean)",
        details: "Se eliminaron logos locales de baja calidad (PNGs y JPGs pequeños). Al correr el pipeline nuevamente, esos assets tuvieron que buscar nuevos orígenes (ej. fallbacks remotos) que muchas veces resultan 'weak' o derechamente 'missing', explicando el aumento de 2 a 4 en missing y el traslado de strong a weak."
      },
      {
        factor: "Nueva regla estricta de Fallback para Productos",
        details: "Se agregó una validación estricta en 'audit-logos.ts': 'if (record.entityKind === \"product\" && record.usedBrandFallback) tier = \"weak\"'. Esto forzó a que varios productos que antes se tildaban como 'strong' por tener un buen logo de la marca paraguas, ahora se cataloguen honestamente como 'weak' porque no es el logo exacto del producto."
      },
      {
        factor: "Mejora en HtmlMetadataProvider",
        details: "El pipeline ahora captura más favicons. Sin embargo, la regla indica que cualquier origen '.ico' o 'favicon' se clasifica forzosamente como 'needs_review' o 'weak' dependiendo del tamaño, lo que reclasificó casos conflictivos."
      }
    ]
  };

  fs.writeFileSync(RECONCILIATION_REPORT_JSON, JSON.stringify(reconciliationData, null, 2));

  const csvContent = [
    "Factor,Detalle",
    `"Cambio en total", "${reconciliationData.explanations[0].details}"`,
    `"Limpieza Low-Res", "${reconciliationData.explanations[1].details}"`,
    `"Regla Fallback Productos", "${reconciliationData.explanations[2].details}"`,
    `"Captura Favicons", "${reconciliationData.explanations[3].details}"`
  ].join('\n');
  fs.writeFileSync(RECONCILIATION_REPORT_CSV, csvContent);
  console.log('✅ Archivos de reconciliación creados.');

  // 2. Leer auditoría para armar los excluidos
  if (!fs.existsSync(AUDIT_FILE)) {
    console.error('❌ No se encontró quality-audit.json.');
    process.exit(1);
  }

  const auditRecords = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  
  // Incluir 'missing' desde el manifest.json, porque auditRecords solo tiene 'approved'
  const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
  const missingRecords = manifest.filter((m: any) => m.status === 'missing').map((m: any) => ({
    entityName: m.entityName,
    entitySlug: m.entitySlug,
    domain: m.domain || '',
    status: 'missing',
    qualityTier: 'missing',
    sourceProvider: 'none',
    sourceUrl: '',
    localPath: null
  }));

  const excludedRecords = [
    ...auditRecords.filter((r: any) => ['weak', 'needs_review'].includes(r.qualityTier)),
    ...missingRecords
  ];

  // 3. Crear archivo maestro de curación (logo-overrides.csv)
  if (!fs.existsSync(OVERRIDES_DIR)) {
    fs.mkdirSync(OVERRIDES_DIR, { recursive: true });
  }

  if (!fs.existsSync(OVERRIDES_CSV)) {
    const overridesHeader = [
      'entitySlug',
      'entityName',
      'domain',
      'currentStatus',
      'qualityTier',
      'currentSourceProvider',
      'currentSourceUrl',
      'manualOverridePath',
      'manualOverrideDomain',
      'manualNotes',
      'approvedForNextMigration'
    ].join(',');

    const overridesRows = excludedRecords.map(r => {
      // Intentar conseguir el domain desde el manifest original para los que están en auditRecords
      const original = manifest.find((m: any) => m.entitySlug === r.entitySlug);
      const domain = original ? original.domain : (r.domain || '');
      
      return `"${r.entitySlug}","${r.entityName}","${domain}","${r.status}","${r.qualityTier}","${r.sourceProvider || ''}","${r.sourceUrl || ''}","","","","false"`;
    }).join('\n');

    fs.writeFileSync(OVERRIDES_CSV, overridesHeader + '\n' + overridesRows);
    console.log('✅ Archivo maestro de curación (logo-overrides.csv) creado.');
  } else {
    console.log('⚠️ El archivo logo-overrides.csv ya existe. No se sobrescribirá para no perder trabajo manual.');
  }

  // 4. Crear galería HTML de excluidos
  const renderItem = (i: any) => `
    <div class="card ${i.qualityTier}">
      <div class="img-container">
        ${i.localPath 
          ? `<img src="${i.localPath.replace('/logos/entities_next/', './')}" alt="${i.entityName}" loading="lazy"/>` 
          : `<div class="no-img">NO IMG (missing)</div>`}
      </div>
      <div class="details">
        <strong>${i.entityName}</strong>
        <small>${i.entitySlug} | ${i.domain || 'N/A'}</small>
        <p>Estado: ${i.status} | Tier: ${i.qualityTier}</p>
        <p>📍 ${i.sourceProvider || 'none'}</p>
        ${i.sourceUrl ? `<a href="${i.sourceUrl}" target="_blank">🔗 URL Origen</a>` : ''}
      </div>
    </div>
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Galería de Excluidos (Curación Manual)</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #111; color: #fff; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .card { background: #222; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #333; }
        .img-container { background: #fff; height: 160px; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .img-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .no-img { color: #f87171; font-weight: bold; }
        .details { padding: 16px; display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #aaa; }
        .details strong { font-size: 16px; color: #fff; }
        .details a { color: #4ade80; text-decoration: none; }
        h1, h2 { color: #fff; }
        .weak { border-color: #facc15; }
        .needs_review { border-color: #ef4444; }
        .missing { border-color: #6b7280; opacity: 0.7; }
        .instructions { background: #333; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .instructions code { color: #4ade80; }
      </style>
    </head>
    <body>
      <h1>Galería de Excluidos (Curación Manual) 🛠️</h1>
      <div class="instructions">
        <p>Esta galería muestra únicamente los casos <strong>weak</strong>, <strong>needs_review</strong> y <strong>missing</strong>.</p>
        <p>Para curar estos logos, abre el archivo <code>docs/catalog/logo-overrides.csv</code> y completa:</p>
        <ul>
          <li><code>manualOverridePath</code>: para obligar a usar un archivo local específico (ej. <code>/logos/overrides/mibanco.svg</code>)</li>
          <li><code>manualOverrideDomain</code>: para forzar la búsqueda en otro dominio distinto antes que los demás</li>
          <li><code>approvedForNextMigration</code>: ponlo en <code>true</code> cuando el caso esté listo.</li>
        </ul>
      </div>
      <p>Total excluidos: ${excludedRecords.length}</p>

      <h2>Weak (${excludedRecords.filter((r:any) => r.qualityTier === 'weak').length})</h2>
      <div class="grid">
        ${excludedRecords.filter((r:any) => r.qualityTier === 'weak').map(renderItem).join('')}
      </div>

      <h2>Needs Review (${excludedRecords.filter((r:any) => r.qualityTier === 'needs_review').length})</h2>
      <div class="grid">
        ${excludedRecords.filter((r:any) => r.qualityTier === 'needs_review').map(renderItem).join('')}
      </div>

      <h2>Missing (${excludedRecords.filter((r:any) => r.qualityTier === 'missing').length})</h2>
      <div class="grid">
        ${excludedRecords.filter((r:any) => r.qualityTier === 'missing').map(renderItem).join('')}
      </div>
    </body>
    </html>
  `;

  fs.writeFileSync(EXCLUDED_GALLERY_HTML, htmlContent);
  console.log('✅ Galería HTML de excluidos creada.');

  console.log('✅ Flujo de curación y reconciliación completado exitosamente.');
}

main().catch(console.error);

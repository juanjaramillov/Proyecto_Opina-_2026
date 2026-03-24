import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');

type QualityTier = 'strong' | 'weak' | 'needs_review';

interface AuditRecord {
  entityName: string;
  entitySlug: string;
  status: string;
  sourceProvider: string | null;
  sourceUrl: string | null;
  score: number | null;
  qualityTier: QualityTier;
  auditReason: string;
  localPath: string | null;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

function evaluateQuality(
  record: any, 
  stats: fs.Stats | null, 
  dimensions: { width?: number; height?: number } | null
): { tier: QualityTier; reason: string } {
  const reasons: string[] = [];
  let tier: QualityTier = 'strong';

  const sourceUrl = (record.sourceUrl || '').toLowerCase();
  const format = (record.format || '').toLowerCase();
  const width = dimensions?.width || 0;
  const height = dimensions?.height || 0;
  const sizeKb = stats ? stats.size / 1024 : 0;

  // 1. Critical Flags -> needs_review
  if (sourceUrl.includes('favicon.ico') || sourceUrl.includes('apple-touch-icon') || sourceUrl.includes('favicon')) {
    tier = 'needs_review';
    reasons.push('Source looks like a favicon/app icon.');
  }

  // Generic fallback checks
  if (record.entityKind === 'product' && record.usedBrandFallback) {
    if (tier !== 'needs_review') tier = 'weak';
    reasons.push('Product resolved using a generic brand fallback.');
  }

  // 2. Weak Flags
  if (tier !== 'needs_review') {
    if (width > 0 && width < 100 && height > 0 && height < 100) {
      tier = 'weak';
      reasons.push(`Dimensions too small (${width}x${height}).`);
    }

    if (format !== 'svg' && sizeKb > 0 && sizeKb < 5) {
      tier = 'weak';
      reasons.push(`Low file size (${sizeKb.toFixed(1)} KB), likely poor quality.`);
    }

    // Square 1:1 icons that are not SVG and somewhat small might behave poorly for horizontal cards
    if (width === height && width > 0 && width < 250 && format !== 'svg') {
      reasons.push(`Small 1:1 aspect ratio (${width}x${height}).`);
      if (tier === 'strong') tier = 'weak';
    }
  }

  if (reasons.length === 0) {
    reasons.push('Looks solid.');
  }

  return { tier, reason: reasons.join(' ') };
}

async function main() {
  console.log('🚀 Iniciando Bloque: Auditoría de Calidad de Assets\n');

  if (!fs.existsSync(MANIFEST_FILE)) {
    console.error('❌ No se encontró manifest.json en entities_next.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
  const approvedOnly = manifest.filter((m: any) => m.status === 'approved');

  console.log(`Analizando ${approvedOnly.length} assets aprobados...`);

  const auditRecords: AuditRecord[] = [];
  const metrics = {
    strong: 0,
    weak: 0,
    needs_review: 0
  };

  for (const record of approvedOnly) {
    let stats: fs.Stats | null = null;
    let dimensions: { width?: number; height?: number } | null = null;
    let fullPath = '';

    if (record.localPath) {
      fullPath = path.join(process.cwd(), 'public', record.localPath);
      if (fs.existsSync(fullPath)) {
        stats = fs.statSync(fullPath);
        if (record.format !== 'unknown') {
          try {
            dimensions = sizeOf(fullPath);
          } catch (e) {
            // Unrecognized or corrupted image format
          }
        }
      }
    }

    const { tier, reason } = evaluateQuality(record, stats, dimensions);
    
    metrics[tier]++;

    auditRecords.push({
      entityName: record.entityName,
      entitySlug: record.entitySlug,
      status: record.status,
      sourceProvider: record.sourceProvider,
      sourceUrl: record.sourceUrl,
      score: record.score,
      qualityTier: tier,
      auditReason: reason,
      localPath: record.localPath,
      width: dimensions?.width,
      height: dimensions?.height,
      sizeBytes: stats?.size
    });
  }

  // Escribir JSON
  const auditJsonPath = path.join(OUTPUT_DIR, 'quality-audit.json');
  fs.writeFileSync(auditJsonPath, JSON.stringify(auditRecords, null, 2));

  // Escribir CSV
  const csvHeader = 'entityName,entitySlug,status,sourceProvider,sourceUrl,score,qualityTier,auditReason,localPath,width,height,sizeBytes\n';
  const csvRows = auditRecords.map(r => `"${r.entityName}","${r.entitySlug}","${r.status}","${r.sourceProvider || ''}","${r.sourceUrl || ''}",${r.score || 0},"${r.qualityTier}","${r.auditReason}","${r.localPath || ''}",${r.width || ''},${r.height || ''},${r.sizeBytes || ''}`);
  const auditCsvPath = path.join(OUTPUT_DIR, 'quality-audit.csv');
  fs.writeFileSync(auditCsvPath, csvHeader + csvRows.join('\n'));

  // Escribir Galería HTML
  const galleryHtmlPath = path.join(OUTPUT_DIR, 'quality-gallery.html');
  
  const renderGroup = (tier: QualityTier, label: string) => {
    const items = auditRecords.filter(r => r.qualityTier === tier);
    if (items.length === 0) return '';
    return `
      <h2>${label} (${items.length})</h2>
      <div class="grid">
        ${items.map(i => `
          <div class="card ${tier}">
            <div class="img-container">
              <img src="${i.localPath?.replace('/logos/entities_next/', './')}" alt="${i.entityName}" loading="lazy"/>
            </div>
            <div class="details">
              <strong>${i.entityName}</strong>
              <small>${i.entitySlug}</small>
              <p>📍 ${i.sourceProvider} | Score: ${i.score}</p>
              <p>📐 ${i.width || '?'}x${i.height || '?'} | ${(i.sizeBytes ? i.sizeBytes/1024 : 0).toFixed(1)} KB</p>
              <p class="reason">${i.auditReason}</p>
              <a href="${i.sourceUrl}" target="_blank">🔗 Source</a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const missingItems = manifest.filter((m: any) => m.status === 'missing');
  const renderMissing = () => {
    if (missingItems.length === 0) return '';
    return `
      <h2>Missing (${missingItems.length})</h2>
      <div class="grid">
        ${missingItems.map((i: any) => `
          <div class="card missing">
            <div class="details">
              <strong>${i.entityName}</strong>
              <small>${i.entitySlug}</small>
              <p class="reason">${i.reason}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Logo Quality Audit</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #111; color: #fff; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .card { background: #222; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #333; }
        .img-container { background: #fff; height: 160px; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .img-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .details { padding: 16px; display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #aaa; }
        .details strong { font-size: 16px; color: #fff; }
        .details a { color: #4ade80; text-decoration: none; }
        .reason { color: #f87171; font-weight: 500; }
        h1, h2 { color: #fff; }
        .strong { border-color: #4ade80; }
        .weak { border-color: #facc15; }
        .needs_review { border-color: #ef4444; }
        .missing { border-color: #6b7280; opacity: 0.7; }
        .strong .reason { color: #4ade80; }
        .weak .reason { color: #facc15; }
        .needs_review .reason { color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>Logo Quality Audit Gallery</h1>
      <p>Total Approved Evaluated: ${auditRecords.length}</p>
      ${renderGroup('needs_review', '🚨 Needs Review')}
      ${renderGroup('weak', '⚠️ Weak / Borderline')}
      ${renderGroup('strong', '✅ Strong')}
      ${renderMissing()}
    </body>
    </html>
  `;

  fs.writeFileSync(galleryHtmlPath, htmlContent);

  console.log('--- RESULTADOS DE AUDITORÍA ---');
  console.log(`✅ Strong       : ${metrics.strong}`);
  console.log(`⚠️ Weak         : ${metrics.weak}`);
  console.log(`🚨 Needs Review : ${metrics.needs_review}`);
  console.log('-------------------------------');
  console.log(`📂 Galería HTML : public/logos/entities_next/quality-gallery.html`);
  console.log(`📂 Reporte JSON : public/logos/entities_next/quality-audit.json`);
  console.log(`📂 Reporte CSV  : public/logos/entities_next/quality-audit.csv\n`);
}

main().catch(console.error);

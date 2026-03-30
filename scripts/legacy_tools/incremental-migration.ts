import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';

const NEXT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const PROD_DIR = path.resolve(process.cwd(), 'public/logos/entities');

const NEXT_AUDIT_FILE = path.join(NEXT_DIR, 'quality-audit.json');
const NEXT_MANIFEST_FILE = path.join(NEXT_DIR, 'manifest.json');
const PROD_MANIFEST_FILE = path.join(PROD_DIR, 'manifest.json');

const REPORT_JSON = path.join(NEXT_DIR, 'incremental-migration-report.json');
const REPORT_CSV = path.join(NEXT_DIR, 'incremental-migration-report.csv');

type QualityTier = 'strong' | 'weak' | 'needs_review' | 'missing';

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
}

interface ReportItem {
  entitySlug: string;
  entityName: string;
  previousProductionStatus: string;
  newProductionStatus: string;
  actionTaken: string;
  localPath: string;
  notes: string;
}

function evaluateQuality(
  record: any, 
  stats: fs.Stats | null, 
  dimensions: { width?: number; height?: number } | null
): QualityTier {
  let tier: QualityTier = 'strong';

  const sourceUrl = (record.sourceUrl || '').toLowerCase();
  const format = (record.format || '').toLowerCase();
  const width = dimensions?.width || 0;
  const height = dimensions?.height || 0;
  const sizeKb = stats ? stats.size / 1024 : 0;

  if (sourceUrl.includes('favicon.ico') || sourceUrl.includes('apple-touch-icon') || sourceUrl.includes('favicon')) {
    tier = 'needs_review';
  }
  if (record.entityKind === 'product' && record.usedBrandFallback) {
    if (tier !== 'needs_review') tier = 'weak';
  }
  if (tier !== 'needs_review') {
    if (width > 0 && width < 100 && height > 0 && height < 100) tier = 'weak';
    if (format !== 'svg' && sizeKb > 0 && sizeKb < 5) tier = 'weak';
    if (width === height && width > 0 && width < 250 && format !== 'svg') {
      if (tier === 'strong') tier = 'weak';
    }
  }

  return tier;
}

function getProdQuality(record: any): QualityTier {
  if (!record || !record.localPath) return 'missing';
  const fullPath = path.join(process.cwd(), 'public', record.localPath);
  if (!fs.existsSync(fullPath)) return 'missing';
  
  const stats = fs.statSync(fullPath);
  let dimensions: { width?: number; height?: number } | null = null;
  if (record.format !== 'unknown') {
    try {
      dimensions = sizeOf(fullPath);
    } catch (e) {}
  }
  return evaluateQuality(record, stats, dimensions);
}

async function main() {
  console.log('🚀 Iniciando Migración Incremental hacia Producción...');

  if (!fs.existsSync(PROD_DIR)) {
    fs.mkdirSync(PROD_DIR, { recursive: true });
  }

  let prodManifestObj: any = { details: {}, summary: {} };
  if (fs.existsSync(PROD_MANIFEST_FILE)) {
    prodManifestObj = JSON.parse(fs.readFileSync(PROD_MANIFEST_FILE, 'utf-8'));
    if (!prodManifestObj.details) prodManifestObj.details = {};
  }
  const prodManifestMap = new Map();
  for (const [slug, data] of Object.entries(prodManifestObj.details)) {
    prodManifestMap.set(slug, Object.assign({}, data, { entitySlug: slug }));
  }

  const nextAudit: AuditRecord[] = JSON.parse(fs.readFileSync(NEXT_AUDIT_FILE, 'utf-8'));
  const nextManifest: any[] = JSON.parse(fs.readFileSync(NEXT_MANIFEST_FILE, 'utf-8'));
  const nextManifestMap = new Map(nextManifest.map((m: any) => [m.entitySlug, m]));

  const reports: ReportItem[] = [];
  
  let preExistingStrong = 0;
  let newMigrated = 0;

  for (const auditItem of nextAudit) {
    if (auditItem.qualityTier !== 'strong') {
      continue; // Solo migramos strongs
    }

    const slug = auditItem.entitySlug;
    const nextRecord = nextManifestMap.get(slug);
    if (!nextRecord || !nextRecord.localPath) continue;

    const prodRecord = prodManifestMap.get(slug);
    let previousTier: QualityTier = 'missing';

    if (prodRecord) {
      previousTier = getProdQuality(prodRecord);
    }

    if (previousTier === 'strong') {
      preExistingStrong++;
      continue; // Regla: No tocar los assets strong ya productivos
    }

    // Proceso de migración: Copiar el asset y actualizar la entrada de manifiesto
    const sourcePath = path.join(process.cwd(), 'public', nextRecord.localPath);
    const fileName = path.basename(nextRecord.localPath);
    const targetLocalPath = `/logos/entities/${fileName}`;
    const targetPath = path.join(PROD_DIR, fileName);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      
      // Update prod record
      const updatedRecord = { ...nextRecord, localPath: targetLocalPath };
      prodManifestMap.set(slug, updatedRecord);
      newMigrated++;

      reports.push({
        entitySlug: slug,
        entityName: auditItem.entityName,
        previousProductionStatus: previousTier,
        newProductionStatus: 'strong',
        actionTaken: 'migrated_to_production',
        localPath: targetLocalPath,
        notes: `Upgraded from ${previousTier} to strong`
      });
    }
  }

  // Escribir el manifiesto productivo actualizado
  prodManifestObj.lastUpdated = new Date().toISOString();
  prodManifestObj.details = {};
  for (const [slug, record] of prodManifestMap.entries()) {
    const { entitySlug, ...rest } = record;
    prodManifestObj.details[slug] = rest;
  }
  
  // Opcional: actualizar summary si se quisiera, pero dejémoslo como está o incrementemos
  if (prodManifestObj.summary && typeof prodManifestObj.summary.migratedStrongCount === 'number') {
    prodManifestObj.summary.migratedStrongCount += newMigrated;
  }

  fs.writeFileSync(PROD_MANIFEST_FILE, JSON.stringify(prodManifestObj, null, 2));

  // Generar Reportes
  fs.writeFileSync(REPORT_JSON, JSON.stringify(reports, null, 2));
  
  const csvLines = ['entitySlug,entityName,previousProductionStatus,newProductionStatus,actionTaken,localPath,notes'];
  for (const r of reports) {
    csvLines.push(`"${r.entitySlug}","${r.entityName}","${r.previousProductionStatus}","${r.newProductionStatus}","${r.actionTaken}","${r.localPath}","${r.notes}"`);
  }
  fs.writeFileSync(REPORT_CSV, csvLines.join('\n'));

  // Resultados Finales
  console.log('\n--- RESULTADOS DE MIGRACIÓN INCREMENTAL ---');
  console.log(`✅ Ya estaban en producción (Strong preexistentes): ${preExistingStrong}`);
  console.log(`🚀 Nuevos Strong migrados (Delta): ${newMigrated}`);
  console.log('---------------------------------------------');
  console.log(`📂 Reporte JSON : public/logos/entities_next/incremental-migration-report.json`);
  console.log(`📂 Reporte CSV  : public/logos/entities_next/incremental-migration-report.csv\n`);
}

main().catch(console.error);

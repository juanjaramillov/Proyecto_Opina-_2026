import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { EntityCatalogItem, AssetManifestRecord } from '../../src/lib/entities/assets/types';
import { ProviderRegistry } from '../../src/lib/entities/assets/providers/ProviderRegistry';
import { LocalProvider } from '../../src/lib/entities/assets/providers/LocalProvider';
import { BrandfetchProvider } from '../../src/lib/entities/assets/providers/BrandfetchProvider';
import { LogoDevProvider } from '../../src/lib/entities/assets/providers/LogoDevProvider';
import { HtmlMetadataProvider } from '../../src/lib/entities/assets/providers/HtmlMetadataProvider';
import { AssetPipeline } from '../../src/lib/entities/assets/pipeline';
import csv from 'csv-parser';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const CATALOG_FILE = path.resolve(process.cwd(), 'docs/catalog/master-entity-catalog-curated.csv');
const OVERRIDES_FILE = path.resolve(process.cwd(), 'docs/catalog/logo-overrides.csv');

async function loadCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Archivo ${filePath} no existe.`);
      return resolve([]);
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 Iniciando Bloque 1: Pipeline de Captura de Assets (Paralelo)\n');

  // Load overrides if they exist
  console.log('0. Cargando cola de curación manual (overrides)...');
  const csvOverrides = await loadCsv(OVERRIDES_FILE);
  const overridesMap = new Map();
  let validOverridesCount = 0;
  for (const row of csvOverrides) {
    if (row.entitySlug) {
      const isApproved = row.approvedForNextMigration === 'true' || row.approvedForNextMigration === true;
      if (isApproved && (row.manualOverridePath || row.manualOverrideDomain)) {
        validOverridesCount++;
      }
      overridesMap.set(row.entitySlug, {
        entitySlug: row.entitySlug,
        manualOverridePath: row.manualOverridePath,
        manualOverrideDomain: row.manualOverrideDomain,
        approvedForNextMigration: row.approvedForNextMigration,
        currentStatus: row.currentStatus
      });
    }
  }
  console.log(`✅ ${csvOverrides.length} registros de overrides leídos (${validOverridesCount} aprobados listos para aplicar).\n`);

  // Load entities from CSV
  console.log('1. Leyendo catálogo de entidades...');
  const csvEntities = await loadCsv(CATALOG_FILE);

  if (csvEntities.length === 0) {
    console.error('❌ No se encontraron entidades en el CSV.');
    process.exit(1);
  }

  const entities: EntityCatalogItem[] = csvEntities.map((row: any, idx: number) => ({
    id: `csv-${idx}`,
    name: row.entity_name || '',
    slug: row.entity_slug || '',
    domain: row.domain || null,
    category: row.category || null,
    sub_category: row.sub_category || null,
    type: row.entity_type || 'brand',
  })).filter(e => e.slug);

  console.log(`✅ ${entities.length} entidades cargadas del CSV.\n`);

  // Setup Registry & Providers
  const registry = new ProviderRegistry();
  registry.register(new LocalProvider());
  registry.register(new BrandfetchProvider());
  registry.register(new LogoDevProvider());
  registry.register(new HtmlMetadataProvider());

  const pipeline = new AssetPipeline(registry, OUTPUT_DIR, overridesMap);
  const manifest: AssetManifestRecord[] = [];

  // Load previous manifest to skip already approved
  let previousManifest: AssetManifestRecord[] = [];
  try {
    const prevManPath = path.join(OUTPUT_DIR, 'manifest.json');
    if (fs.existsSync(prevManPath)) {
      previousManifest = JSON.parse(fs.readFileSync(prevManPath, 'utf-8'));
    }
  } catch {
    // ignore
  }
  
  const previousMap = new Map<string, AssetManifestRecord>();
  previousManifest.forEach(m => previousMap.set(m.entitySlug, m));


  // Report counters
  const report = {
    approved: 0,
    missing: 0,
    rejected: 0,
    manual_review: 0,
  };

  console.log(`2. Procesando ${entities.length} entidades...`);

  // Process sequentially to be nice to Brandfetch initially
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    process.stdout.write(`   [${i + 1}/${entities.length}] Buscando asset para: ${entity.slug}... `);

    // Skip logic for already approved cases, unless it has a manual override!
    const prev = previousMap.get(entity.slug);
    if (prev && prev.status === 'approved' && prev.localPath && !overridesMap.has(entity.slug)) {
      const fullPath = path.join(process.cwd(), 'public', prev.localPath);
      if (fs.existsSync(fullPath)) {
        manifest.push(prev);
        report.approved++;
        process.stdout.write(`⏩ SALTADO (Ya aprobado en ronda anterior)\n`);
        continue;
      }
    }

    try {
      const record = await pipeline.runForEntity(entity, 'brand_logo');
      manifest.push(record);
      
      report[record.status as keyof typeof report]++;
      
      if (record.status === 'approved') {
        process.stdout.write(`✅ OK (${record.format} vía ${record.sourceProvider})\n`);
      } else if (record.status === 'manual_review') {
        process.stdout.write(`🧐 MANUAL_REVIEW (${record.reason})\n`);
      } else {
        process.stdout.write(`⚠️ ${record.status.toUpperCase()} (${record.reason})\n`);
      }
    } catch (err: any) {
      manifest.push({
        entityId: entity.id,
        entitySlug: entity.slug,
        entityName: entity.name,
        domain: entity.domain || null,
        assetType: 'brand_logo',
        entityKind: 'other',
        usedBrandFallback: false,
        status: 'rejected',
        providerType: null,
        sourceProvider: null,
        sourceUrl: null,
        localPath: null,
        format: null,
        contentType: null,
        width: null,
        height: null,
        score: null,
        reason: `Excepción fatal en pipeline: ${err.message}`,
        updatedAt: new Date().toISOString()
      });
      report.rejected++;
      process.stdout.write(`❌ ERROR FATAL\n`);
    }

    // Pequeño delay para no saturar APIs (ej. brandfetch)
    await new Promise((res) => setTimeout(res, 200));
  }

  console.log('\n3. Escribiendo Manifiesto y Reporte...');
  
  // Save manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`   ✅ Manifiesto guardado en: public/logos/entities_next/manifest.json`);

  // Save Report
  const reportOut = {
    generatedAt: new Date().toISOString(),
    totalProcessed: entities.length,
    summary: report,
    // Add missing/requires review items specifically to the report for easy checking
    issuesList: manifest.filter(m => m.status !== 'approved').map(m => ({ slug: m.entitySlug, status: m.status, reason: m.reason }))
  };

  const reportPath = path.join(OUTPUT_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportOut, null, 2));
  console.log(`   ✅ Reporte detallado guardado en: public/logos/entities_next/report.json`);

  // Escribir manual reviews
  const manualReviewItems = manifest.filter(m => m.status === 'manual_review');
  const manualCsvHeader = 'entityName,entitySlug,domain,status,score,sourceProvider,reason,localPath\n';
  const manualCsvRows = manualReviewItems.map(m => {
     return `"${m.entityName}","${m.entitySlug}","${m.domain || ''}","${m.status}","${m.score || 0}","${m.sourceProvider || ''}","${m.reason?.replace(/"/g, '""') || ''}","${m.localPath || ''}"`;
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'manual-review.csv'), manualCsvHeader + manualCsvRows.join('\n'));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'manual-review.json'), JSON.stringify(manualReviewItems, null, 2));
  console.log(`   ✅ Reporte de revisión manual guardado en: public/logos/entities_next/manual-review.json y .csv\n`);

  console.log('--- REPORTE FINAL ---');
  console.log(`Total procesadas : ${entities.length}`);
  console.log(`✅ Aprobadas     : ${report.approved}`);
  console.log(`⚠️ Faltantes      : ${report.missing}`);
  console.log(`❌ Rechazadas    : ${report.rejected}`);
  console.log(`🧐 Rev. Manual   : ${report.manual_review}`);
  console.log('---------------------\n');
}

main().catch(console.error);

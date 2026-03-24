import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const CATALOG_FILE = path.resolve(process.cwd(), 'docs/catalog/master-entity-catalog-curated.csv');
const AUDIT_FILE = path.resolve(process.cwd(), 'public/logos/entities_next/quality-audit.json');
const OVERRIDES_FILE = path.resolve(process.cwd(), 'docs/catalog/logo-overrides.csv');
const LEGACY_DIR = path.resolve(process.cwd(), 'public/logos/entities_legacy');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const AUTO_REPORT_JSON = path.join(OUTPUT_DIR, 'auto-curation-report.json');
const AUTO_REPORT_CSV = path.join(OUTPUT_DIR, 'auto-curation-report.csv');

// Interfaces
interface CatalogItem {
  entity_slug: string;
  entity_name: string;
  domain: string;
  brand_domain: string;
  entity_type: string;
  category: string;
}

interface AuditItem {
  entitySlug: string;
  entityName: string;
  status: string;
  sourceProvider: string;
  sourceUrl: string;
  score: number;
  qualityTier: 'strong' | 'weak' | 'needs_review' | 'missing';
  auditReason: string;
  localPath: string;
}

interface OverrideItem {
  entitySlug: string;
  entityName?: string;
  domain?: string;
  currentStatus?: string;
  qualityTier?: string;
  currentSourceProvider?: string;
  currentSourceUrl?: string;
  manualOverridePath?: string;
  manualOverrideDomain?: string;
  manualNotes?: string;
  approvedForNextMigration?: string | boolean;
}

interface AutoCurationReportItem {
  entitySlug: string;
  entityName: string;
  previousStatus: string;
  actionTaken: string;
  manualOverridePath: string;
  manualOverrideDomain: string;
  confidence: 'high' | 'medium' | 'low';
  approvedForNextMigration: boolean;
  notes: string;
}

async function loadCsv<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    if (!fs.existsSync(filePath)) {
      return resolve([]);
    }
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
      // Return relative path for web
      return `/logos/entities_legacy/${slug}${ext}`;
    }
    const fallbackP = path.join(LEGACY_DIR, `${slug}-logo${ext}`);
    if (fs.existsSync(fallbackP)) {
      // Return relative path for web
      return `/logos/entities_legacy/${slug}-logo${ext}`;
    }
  }
  return null;
}

// Some highly-confident domain corrections based on observing common failures
const KNOWN_DOMAIN_CORRECTIONS: Record<string, string> = {
  'falabella.com': 'falabella.com', // Base case
  // Add specific mappings if we know them. E.g.
  'cocacola.cl': 'coca-cola.com',
  'bancoestado.cl': 'bancoestado.cl', // Keep as is if it fails, fallback to legacy
};

async function main() {
  console.log('🚀 Iniciando Curación Automática de Excluidos...');

  // 1. Read files
  const catalog = await loadCsv<CatalogItem>(CATALOG_FILE);
  const catalogMap = new Map<string, CatalogItem>();
  for (const item of catalog) catalogMap.set(item.entity_slug, item);

  let auditItems: AuditItem[] = [];
  if (fs.existsSync(AUDIT_FILE)) {
    auditItems = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  }

  let overrides = await loadCsv<OverrideItem>(OVERRIDES_FILE);
  
  // If overrides file is from old format, the header might be wrong, so we handle mapping
  const overridesMap = new Map<string, OverrideItem>();
  for (const row of overrides) {
    // Handling possible old schema fallback
    const slug = row.entitySlug || (row as any).entity_slug;
    if (slug) overridesMap.set(slug, row);
  }

  // 2. Filter excluded
  const excluded = auditItems.filter(item => 
    item.qualityTier === 'weak' || 
    item.qualityTier === 'needs_review' || 
    item.qualityTier === 'missing'
  );

  console.log(`\n📋 Encontrados ${excluded.length} casos excluidos en auditoría (weak/needs_review/missing).`);

  const reportItems: AutoCurationReportItem[] = [];
  let resolvedCount = 0;

  for (const item of excluded) {
    const slug = item.entitySlug;
    const catalogData = catalogMap.get(slug);
    
    // Existing override handling
    let overrideRow = overridesMap.get(slug);
    if (!overrideRow) {
      overrideRow = {
        entitySlug: slug,
        entityName: item.entityName,
        currentStatus: item.status,
        qualityTier: item.qualityTier,
        currentSourceProvider: item.sourceProvider,
        currentSourceUrl: item.sourceUrl,
      };
    }
    
    // If it's already manually approved, skip auto-curation
    if (overrideRow.approvedForNextMigration === 'true' || overrideRow.approvedForNextMigration === true) {
      continue;
    }

    let actionTaken = '';
    let manualOverridePath = '';
    let manualOverrideDomain = '';
    let notes = '';
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let isResolved = false;

    // Rule 1: Legacy Asset
    const legacyAsset = checkLegacyAsset(slug);
    const isCategoryProduct = catalogData && catalogData.category && catalogData.category.toLowerCase().includes('producto');
    
    if (legacyAsset) {
      actionTaken = 'legacy_fallback';
      manualOverridePath = legacyAsset;
      notes = 'Found valid exact match in entities_legacy';
      confidence = 'high';
      isResolved = true;
    } 
    // Rule 2: Provide correct domain for products
    else if (catalogData && (catalogData.entity_type === 'product' || catalogData.entity_type === 'PRODUCT' || isCategoryProduct)) {
      if (catalogData.domain && catalogData.domain.trim() !== '') {
        actionTaken = 'product_to_brand_fallback';
        manualOverrideDomain = catalogData.domain;
        notes = 'Product falling back explicitly to umbrella brand domain';
        confidence = 'high';
        isResolved = true;
      }
    }
    // Rule 3: Known domain corrections
    else if (catalogData && catalogData.domain && KNOWN_DOMAIN_CORRECTIONS[catalogData.domain.toLowerCase()]) {
       actionTaken = 'domain_correction';
       manualOverrideDomain = KNOWN_DOMAIN_CORRECTIONS[catalogData.domain.toLowerCase()];
       notes = 'Applied known domain correction';
       confidence = 'high';
       isResolved = true;
    }

    if (isResolved && confidence === 'high') {
      resolvedCount++;
      overrideRow.manualOverridePath = manualOverridePath || '';
      overrideRow.manualOverrideDomain = manualOverrideDomain || '';
      overrideRow.manualNotes = notes;
      overrideRow.approvedForNextMigration = 'true';
      
      reportItems.push({
        entitySlug: slug,
        entityName: item.entityName,
        previousStatus: item.qualityTier,
        actionTaken,
        manualOverridePath,
        manualOverrideDomain,
        confidence,
        approvedForNextMigration: true,
        notes
      });
    }
    
    overridesMap.set(slug, overrideRow);
  }

  console.log(`✅ Creados/actualizados ${resolvedCount} casos con alta confianza.\n`);


  // 3. Write Updated Overrides
  console.log('💾 Escribiendo docs/catalog/logo-overrides.csv...');
  const overrideHeader = 'entitySlug,entityName,domain,currentStatus,qualityTier,currentSourceProvider,currentSourceUrl,manualOverridePath,manualOverrideDomain,manualNotes,approvedForNextMigration\n';
  const allOverrides = Array.from(overridesMap.values());
  const overrideRows = allOverrides.map(r => {
    return [
      `"${r.entitySlug || ''}"`,
      `"${r.entityName || ''}"`,
      `"${r.domain || ''}"`,
      `"${r.currentStatus || ''}"`,
      `"${r.qualityTier || ''}"`,
      `"${r.currentSourceProvider || ''}"`,
      `"${r.currentSourceUrl || ''}"`,
      `"${r.manualOverridePath || ''}"`,
      `"${r.manualOverrideDomain || ''}"`,
      `"${(r.manualNotes || '').replace(/"/g, '""')}"`,
      `"${r.approvedForNextMigration || ''}"`
    ].join(',');
  });
  fs.writeFileSync(OVERRIDES_FILE, overrideHeader + overrideRows.join('\n'));

  // 4. Write Reports
  fs.writeFileSync(AUTO_REPORT_JSON, JSON.stringify(reportItems, null, 2));
  
  const reportHeader = 'entitySlug,entityName,previousStatus,actionTaken,manualOverridePath,manualOverrideDomain,confidence,approvedForNextMigration,notes\n';
  const reportRows = reportItems.map(r => {
    return [
      `"${r.entitySlug || ''}"`,
      `"${r.entityName || ''}"`,
      `"${r.previousStatus || ''}"`,
      `"${r.actionTaken || ''}"`,
      `"${r.manualOverridePath || ''}"`,
      `"${r.manualOverrideDomain || ''}"`,
      `"${r.confidence || ''}"`,
      `"${r.approvedForNextMigration || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });
  fs.writeFileSync(AUTO_REPORT_CSV, reportHeader + reportRows.join('\n'));

  console.log(`✅ Reportes generados en ${AUTO_REPORT_CSV} y .json`);
  console.log('\n--- RESUMEN DE CURACIÓN ---');
  console.log(`Excluidos iniciales: ${excluded.length}`);
  console.log(`Resueltos auto (alta conf): ${resolvedCount}`);
  console.log(`Quedan pendientes manuales: ${excluded.length - resolvedCount}`);
  console.log('-----------------------------\n');
  console.log('Ejecuta reconstrucción de pipeline y auditoría para comprobar impacto.');
}

main().catch(console.error);

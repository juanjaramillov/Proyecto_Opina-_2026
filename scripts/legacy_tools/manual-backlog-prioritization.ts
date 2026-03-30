import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const NEXT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const NEXT_AUDIT_FILE = path.join(NEXT_DIR, 'quality-audit.json');
const CATALOG_FILE = path.resolve(process.cwd(), 'docs/catalog/master-entity-catalog-curated.csv');
const OVERRIDES_FILE = path.resolve(process.cwd(), 'docs/catalog/logo-overrides.csv');

const PRIORITY_JSON = path.join(NEXT_DIR, 'manual-review-priority.json');
const PRIORITY_CSV = path.join(NEXT_DIR, 'manual-review-priority.csv');

interface CatalogItem {
  entity_slug: string;
  category: string;
}

interface AuditRecord {
  entityName: string;
  entitySlug: string;
  status: string;
  sourceProvider: string | null;
  sourceUrl: string | null;
  qualityTier: 'strong' | 'weak' | 'needs_review' | 'missing';
}

interface OverrideItem {
  entitySlug: string;
  [key: string]: any;
}

// Heurísticas parea definir la prioridad según la categoría
const ALTA_PRIORITY_CATEGORIES = [
  'supermercados', 'tecnología', 'bancos', 'telecomunicaciones', 
  'transporte', 'comida rápida', 'retail', 'automotriz', 'consolas',
  'videojuegos', 'tiendas por departamento', 'streaming', 'delivery',
  'farmacias', 'belleza y cuidado personal'
];

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

function getPriority(category: string, slug: string): 'alta' | 'media' | 'baja' {
  if (!category) return 'media';
  
  const catLower = category.toLowerCase();
  for (const highCat of ALTA_PRIORITY_CATEGORIES) {
    if (catLower.includes(highCat)) {
      return 'alta';
    }
  }

  // Marcas core que podrían estar en otras categorías
  const ALTA_SLUGS = ['mac', 'xbox', 'nintendo', 'mercado-libre', 'sodimac', 'cabify', 'mc-donalds', 'burger-king'];
  if (ALTA_SLUGS.includes(slug)) {
    return 'alta';
  }

  // Por simplificación, el resto es media
  return 'media';
}

async function main() {
  console.log('🚀 Iniciando Priorización de Backlog Manual...');

  // 1. Cargar Datos
  const catalog = await loadCsv<CatalogItem>(CATALOG_FILE);
  const catalogMap = new Map<string, string>();
  for (const item of catalog) catalogMap.set(item.entity_slug, item.category || '');

  const nextAudit: AuditRecord[] = JSON.parse(fs.readFileSync(NEXT_AUDIT_FILE, 'utf-8'));
  const overrides = await loadCsv<OverrideItem>(OVERRIDES_FILE);
  
  // 2. Filtrar Excluidos
  const excluded = nextAudit.filter(i => i.qualityTier !== 'strong');
  
  // 3. Procesar y Asignar Prioridades
  const reports: any[] = [];
  const priorityCounts = { alta: 0, media: 0, baja: 0 };
  const headersSet = new Set<string>();
  
  // Collect all existing keys to keep header structure in overrides
  const overridesMap = new Map<string, OverrideItem>();
  for (const o of overrides) {
    overridesMap.set(o.entitySlug || (o as any).entity_slug, o);
    Object.keys(o).forEach(k => headersSet.add(k));
  }
  
  // Make sure manualPriority is part of the header set
  headersSet.delete('manualPriority');
  const finalHeaders = Array.from(headersSet);
  finalHeaders.push('manualPriority');

  for (const item of excluded) {
    const slug = item.entitySlug;
    const category = catalogMap.get(slug) || '';
    const priority = getPriority(category, slug);
    priorityCounts[priority]++;

    // Update report item
    reports.push({
      slug: item.entitySlug,
      nombre: item.entityName,
      statusActual: item.status,
      qualityTier: item.qualityTier,
      manualPriority: priority,
      sourceProvider: item.sourceProvider || '',
      sourceUrl: item.sourceUrl || '',
      requiereDominioOArchivoLocal: true
    });

    // Update overrides item
    let overrideObj = overridesMap.get(slug);
    if (!overrideObj) {
      overrideObj = { entitySlug: slug };
    }
    overrideObj.manualPriority = priority;
    overridesMap.set(slug, overrideObj);
  }

  // 4. Escribir Overrides CSV actualizado
  const overrideLines = [finalHeaders.join(',')];
  for (const o of Array.from(overridesMap.values())) {
    const row = finalHeaders.map(h => {
      const val = o[h] !== undefined ? String(o[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    overrideLines.push(row.join(','));
  }
  fs.writeFileSync(OVERRIDES_FILE, overrideLines.join('\n'));

  // 5. Escribir Reportes de Revisión
  // Sort por prioridad: alta -> media -> baja
  const valMap = { alta: 0, media: 1, baja: 2 };
  reports.sort((a, b) => valMap[a.manualPriority] - valMap[b.manualPriority]);

  fs.writeFileSync(PRIORITY_JSON, JSON.stringify(reports, null, 2));
  
  const reportCsvHeader = 'slug,nombre,statusActual,qualityTier,manualPriority,sourceProvider,sourceUrl,requiereDominioOArchivoLocal\n';
  const reportRows = reports.map(r => 
    `"${r.slug}","${r.nombre}","${r.statusActual}","${r.qualityTier}","${r.manualPriority}","${r.sourceProvider}","${r.sourceUrl}","${r.requiereDominioOArchivoLocal}"`
  );
  fs.writeFileSync(PRIORITY_CSV, reportCsvHeader + reportRows.join('\n'));

  console.log(`\n--- RESUMEN BACKLOG MANUAL ---`);
  console.log(`🔴 Prioridad Alta : ${priorityCounts.alta}`);
  console.log(`🟡 Prioridad Media: ${priorityCounts.media}`);
  console.log(`🟢 Prioridad Baja : ${priorityCounts.baja}`);
  console.log('------------------------------');
  console.log(`📝 Overrides actualizado : docs/catalog/logo-overrides.csv`);
  console.log(`📂 Reporte JSON          : public/logos/entities_next/manual-review-priority.json`);
  console.log(`📂 Reporte CSV           : public/logos/entities_next/manual-review-priority.csv\n`);
}

main().catch(console.error);

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { execSync } from 'child_process';

const HIGHPRIO_CSV = path.resolve(process.cwd(), 'docs/catalog/logo-overrides-high-priority.csv');
const OVERRIDES_FILE = path.resolve(process.cwd(), 'docs/catalog/logo-overrides.csv');

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

async function main() {
  console.log('🚀 Iniciando Aplicación de Overrides de Alta Prioridad...');

  if (!fs.existsSync(HIGHPRIO_CSV)) {
    console.error('❌ Archivo logo-overrides-high-priority.csv no encontrado.');
    process.exit(1);
  }

  const highPrio = await loadCsv<OverrideItem>(HIGHPRIO_CSV);
  
  // 1. Filtrar los aprobados
  const approved = highPrio.filter(o => {
    // Check if approvedForNextMigration is set to 'true' (string or boolean)
    const val = String(o.approvedForNextMigration).toLowerCase().trim();
    return val === 'true' || val === '1' || val === 'yes';
  });

  if (approved.length === 0) {
    console.log('⚠️ No hay items marcados con approvedForNextMigration=true. No se aplicará nada.');
    console.log('Debes editar docs/catalog/logo-overrides-high-priority.csv y establecer esa columna a "true" para los items listos.');
    return;
  }

  console.log(`✅ ${approved.length} casos aprobados encontrados para aplicar.`);

  // 2. Cargar Overrides Maestro
  const overrides = await loadCsv<OverrideItem>(OVERRIDES_FILE);
  const overridesMap = new Map<string, OverrideItem>();
  const headersSet = new Set<string>();

  for (const o of overrides) {
    overridesMap.set(o.entitySlug || o.entity_slug, o);
    Object.keys(o).forEach(k => headersSet.add(k));
  }

  // 3. Aplicar los cambios
  for (const app of approved) {
    const slug = app.entitySlug;
    let overrideObj = overridesMap.get(slug);
    if (!overrideObj) {
      overrideObj = { entitySlug: slug };
      overridesMap.set(slug, overrideObj);
    }
    
    // Solo actualizamos las columnas editadas (rutas, dominios, notas, etc)
    if (app.manualOverrideDomain !== undefined) overrideObj.manualOverrideDomain = app.manualOverrideDomain;
    if (app.manualOverridePath !== undefined) overrideObj.manualOverridePath = app.manualOverridePath;
    if (app.manualNotes !== undefined) overrideObj.manualNotes = app.manualNotes;
    
    // Quitamos la bandera de aprobacion local para evitar accidentes en futuras migraciones o lo dejamos si queremos trazabilidad
    overrideObj.approvedForNextMigration = ''; 
    overrideObj.currentStatus = 'approved';

    Object.keys(overrideObj).forEach(k => headersSet.add(k));
  }

  // 4. Guardar archivo maestro
  const finalHeaders = Array.from(headersSet);
  const overrideLines = [finalHeaders.join(',')];
  for (const o of Array.from(overridesMap.values())) {
    const row = finalHeaders.map(h => {
      const val = o[h] !== undefined && o[h] !== null ? String(o[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    overrideLines.push(row.join(','));
  }
  fs.writeFileSync(OVERRIDES_FILE, overrideLines.join('\n'));
  console.log(`📝 Archivo maestro logo-overrides.csv actualizado con los ${approved.length} casos.`);

  // 5. Ejecutar scripts core del pipeline en secuencia
  console.log('\n🔄 Ejecutando Pipeline Paralelo (entities_next)...');
  try {
    execSync('npx tsx scripts/assets/rebuild-logos.ts', { stdio: 'inherit' });
    
    console.log('\n📊 Ejecutando Auditoría de Calidad...');
    execSync('npx tsx scripts/assets/audit-logos.ts', { stdio: 'inherit' });

    console.log('\n🚀 Ejecutando Migración Incremental hacia Producción...');
    execSync('npx tsx scripts/logos/incremental-migration.ts', { stdio: 'inherit' });

    console.log('\n🎉 Proceso de Alta Prioridad Completado y productivo.');
  } catch (err) {
    console.error('\n❌ Hubo un error ejecutando el pipeline. Revisa los logs de arriba.');
    process.exit(1);
  }
}

main().catch(console.error);

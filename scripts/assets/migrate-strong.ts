import fs from 'fs';
import path from 'path';

const ENTITIES_NEXT_DIR = path.resolve(process.cwd(), 'public/logos/entities_next');
const AUDIT_FILE = path.join(ENTITIES_NEXT_DIR, 'quality-audit.json');

const ENTITIES_PROD_DIR = path.resolve(process.cwd(), 'public/logos/entities');
const ENTITIES_LEGACY_DIR = path.resolve(process.cwd(), 'public/logos/entities_legacy');

async function main() {
  console.log('🚀 Iniciando Migración Controlada de Logos (Solo Strong)\n');

  if (!fs.existsSync(AUDIT_FILE)) {
    console.error('❌ No se encontró quality-audit.json. Ejecuta primero la auditoría.');
    process.exit(1);
  }

  // 1. Leer auditoría
  const auditRecords = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  const strongAssets = auditRecords.filter((r: { qualityTier: string }) => r.qualityTier === 'strong');

  console.log(`📊 Total de assets evaluados : ${auditRecords.length}`);
  console.log(`✅ Assets marcados 'strong'  : ${strongAssets.length}`);
  console.log(`⚠️  Assets 'weak'             : ${auditRecords.filter((r: { qualityTier: string }) => r.qualityTier === 'weak').length}`);
  console.log(`🚨 Assets 'needs_review'     : ${auditRecords.filter((r: { qualityTier: string }) => r.qualityTier === 'needs_review').length}\n`);

  // 2. Backup de carpeta productiva actual
  if (fs.existsSync(ENTITIES_PROD_DIR)) {
    console.log('📦 Realizando backup de la carpeta productiva actual...');
    
    // Si entities_legacy existe, podríamos querer añadir timestamp o simplemente sobrescribirlo/combinarlo.
    // Para simplificar, si no existe la creamos y movemos todo. Si existe, no la destruimos, pero no queremos machacar si el user la necesita.
    // Aquí el requerimiento dice: "Crear una copia completa de public/logos/entities, guardarla como .../entities_legacy".
    
    if (fs.existsSync(ENTITIES_LEGACY_DIR)) {
      console.log('⚠️ La carpeta entities_legacy ya existe. Conservando su contenido actual.');
    } else {
      fs.mkdirSync(ENTITIES_LEGACY_DIR, { recursive: true });
    }

    // Copiamos todo lo de entities a entities_legacy, no movemos para evitar perder si algo falla a medias.
    // Usamos cpSync
    fs.cpSync(ENTITIES_PROD_DIR, ENTITIES_LEGACY_DIR, { recursive: true });
    console.log(`✅ Backup completado a: public/logos/entities_legacy`);
  } else {
    console.log('⚠️ No se encontró la carpeta productiva original. Se creará una nueva.');
  }

  // 3. Limpiar y reconstruir carpeta productiva
  console.log('\n🧹 Limpiando la carpeta productiva (public/logos/entities)...');
  if (fs.existsSync(ENTITIES_PROD_DIR)) {
    fs.rmSync(ENTITIES_PROD_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(ENTITIES_PROD_DIR, { recursive: true });

  console.log('✨ Migrando activos \'strong\' a producción...');
  
  // 4. Copiar assets validados y documentar manifiesto productivo
  let copiedCount = 0;
  const newManifest = [];

  for (const record of strongAssets) {
    if (!record.localPath) continue;

    const sourcePath = path.join(process.cwd(), 'public', record.localPath);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`[WARNING] Archivo físico no encontrado para ${record.entitySlug} en ${sourcePath}`);
      continue;
    }

    const filename = path.basename(sourcePath);
    const destPath = path.join(ENTITIES_PROD_DIR, filename);

    fs.copyFileSync(sourcePath, destPath);

    newManifest.push({
      ...record,
      localPath: `/logos/entities/${filename}` // Actualizar localPath para el nuevo directorio
    });
    copiedCount++;
  }

  // Escribir el nuevo manifiesto productivo
  const manifestDest = path.join(ENTITIES_PROD_DIR, 'manifest.json');
  fs.writeFileSync(manifestDest, JSON.stringify(newManifest, null, 2));

  console.log(`\n🎉 Migración exitosa.`);
  console.log(`✅ ${copiedCount} imágenes 'strong' migradas a producción.`);
  console.log(`✅ Nuevo manifest.json productivo escrito.`);
  console.log(`\nRecomendación: Validar visualmente en frontend que los nuevos logos 'strong' cargan bien y fallback heredado reacciona correctamente para los faltantes.`);
}

main().catch(console.error);

import p from 'path';
import { fileURLToPath } from 'url';
import fsPromises from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = p.dirname(__filename);

const PROJECT_ROOT = p.join(__dirname, '..');
const PUBLIC_DIR = p.join(PROJECT_ROOT, 'public', 'logos');

const ENTITIES_DIR = p.join(PUBLIC_DIR, 'entities');
const ENTITIES_LEGACY_DIR = p.join(PUBLIC_DIR, 'entities_legacy');
const ENTITIES_NEXT_DIR = p.join(PUBLIC_DIR, 'entities_next');

const REPORT_PATH = p.join(PROJECT_ROOT, 'migration_report.md');

async function migrate() {
    console.log("Starting controlled migration of strong logos...");

    // 1. Create backup of current production
    try {
        await fsPromises.access(ENTITIES_LEGACY_DIR);
        console.log(`Legacy directory ${ENTITIES_LEGACY_DIR} already exists. Skipping backup.`);
    } catch (e) {
        // Legacy dir doesn't exist, we must back it up
        try {
            await fsPromises.access(ENTITIES_DIR);
            // Move it to _legacy
            await fsPromises.rename(ENTITIES_DIR, ENTITIES_LEGACY_DIR);
            console.log(`Success: Backed up ${ENTITIES_DIR} -> ${ENTITIES_LEGACY_DIR}`);
        } catch (err) {
            console.log(`Note: ${ENTITIES_DIR} does not exist yet. No backup needed.`);
        }
    }

    // 2. Create the new production directory
    await fsPromises.mkdir(ENTITIES_DIR, { recursive: true });

    // 3. Read the audited manifest from _next
    const nextManifestPath = p.join(ENTITIES_NEXT_DIR, 'quality-audit.json');
    let auditedData;
    try {
        const raw = await fsPromises.readFile(nextManifestPath, 'utf-8');
        auditedData = JSON.parse(raw);
    } catch (e) {
        console.error("FATAL ERROR: Could not read audited manifest from entities_next. Have you run the pipeline?", e);
        process.exit(1);
    }

    // We only care about `strong` quality items.
    // In our pipeline, auditedData is an array of objects representing assets.
    // Each asset has a 'score' parameter from which we deduce the quality.

    const strongAssets = [];
    let weakCount = 0;
    let needsReviewCount = 0;
    let missingCount = 0;

    const strongDetails = {};

    for (const item of auditedData) {
        const domain = item.domain || item.entitySlug || "unknown";
        const meta = {
           localPath: item.localPath,
           format: item.format,
           qualityTier:
               item.score >= 50 ? 'strong' :
               item.score >= 30 ? 'weak' :
               item.score >= 10 ? 'needs_review' : 'missing'
        };

        if (meta.qualityTier === 'strong') {
            strongAssets.push({ domain, meta });
            strongDetails[domain] = meta;
        } else if (meta.qualityTier === 'weak') {
            weakCount++;
        } else if (meta.qualityTier === 'needs_review') {
            needsReviewCount++;
        } else if (meta.qualityTier === 'missing' || !meta.resolved) {
            missingCount++;
        }
    }

    // 4. Copy absolute strong assets to the new entities
    console.log(`Found ${strongAssets.length} strong assets. Copying images...`);
    let copiedCount = 0;

    for (const { domain, meta } of strongAssets) {
        if (!meta.localPath) {
            console.log(`Warning: Strong asset but no localPath for ${domain}`);
            continue;
        }
        
        // meta.localPath should be relative, e.g. "/logos/entities_next/..."
        const fileName = p.basename(meta.localPath);
        const sourcePath = p.join(ENTITIES_NEXT_DIR, fileName);
        const destPath = p.join(ENTITIES_DIR, fileName);

        try {
            await fsPromises.copyFile(sourcePath, destPath);
            // Update local path in the new manifest, now points to entities/
            strongDetails[domain].localPath = `/logos/entities/${fileName}`;
            copiedCount++;
        } catch (e) {
            console.error(`Error copying ${sourcePath} -> ${destPath}`, e);
        }
    }

    const newManifest = {
        lastUpdated: new Date().toISOString(),
        summary: {
            totalAttempted: auditedData.length,
            migratedStrongCount: copiedCount,
            excludedWeak: weakCount,
            excludedNeedsReview: needsReviewCount,
            excludedMissing: missingCount,
        },
        items: strongDetails 
    };

    const newManifestObj = {
        lastUpdated: newManifest.lastUpdated,
        summary: newManifest.summary,
        details: newManifest.items
    };

    const prodManifestPath = p.join(ENTITIES_DIR, 'manifest.json');
    await fsPromises.writeFile(prodManifestPath, JSON.stringify(newManifestObj, null, 2));
    console.log(`Wrote production manifest to ${prodManifestPath}`);

    // 6. Generate final report
    const reportMd = `# Reporte Final de Migración de Logos

**Fecha:** ${new Date().toISOString()}

Esta migración ha tomado **únicamente los assets consolidados y fuertes (strong)** de la fase de captura paralela, y ha reemplazado productivo con ellos, creando un backup previo.

### Resultados de Migración

- **Assets \`strong\` migrados exitosamente:** ${copiedCount}
- **Assets \`weak\` ignorados:** ${weakCount}
- **Assets \`needs_review\` ignorados:** ${needsReviewCount}
- **Assets \`missing\` ignorados:** ${missingCount}

### Acciones Físicas en Archivos
1. Creado backup directorio: \`/public/logos/entities_legacy\` (con el estado productivo previo exacto).
2. Carpeta \`/public/logos/entities\` limpiada y reconstruida exclusivamente con **${copiedCount}** archivos gráficos de calidad.
3. Se generó un nuevo \`manifest.json\` productivo alojado en \`/public/logos/entities/manifest.json\`.

Toda la lógica del fallback permanecerá en el frontend para no degradar las tarjetas de entidades ignoradas en esta pasada.
`;

    await fsPromises.writeFile(REPORT_PATH, reportMd);
    console.log(`Migration complete. Report saved natively to ${REPORT_PATH}`);
}

migrate().catch(console.error);

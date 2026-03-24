import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const HIGHPRIO_CSV = path.resolve(process.cwd(), 'docs/catalog/logo-overrides-high-priority.csv');

interface OverrideItem {
  [key: string]: any;
}

async function loadCsv<T>(filePath: string): Promise<{ rows: T[], headers: string[] }> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    let headers: string[] = [];
    const isFirst = true;

    if (!fs.existsSync(filePath)) return resolve({ rows, headers });
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (hdrList) => {
        headers = hdrList;
      })
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve({ rows, headers }))
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 Iniciando Auto-Aprobación de Casos Editados...');

  if (!fs.existsSync(HIGHPRIO_CSV)) {
    console.error('❌ Archivo logo-overrides-high-priority.csv no encontrado.');
    process.exit(1);
  }

  const { rows, headers } = await loadCsv<OverrideItem>(HIGHPRIO_CSV);
  
  let totalApproved = 0;
  let approvedByDomain = 0;
  let approvedByPath = 0;

  for (const row of rows) {
    if (row.manualPriority === 'alta') {
      const hasDomain = row.manualOverrideDomain && row.manualOverrideDomain.trim() !== '';
      const hasPath = row.manualOverridePath && row.manualOverridePath.trim() !== '';
      
      if (hasDomain || hasPath) {
        row.approvedForNextMigration = 'true';
        if (!row.manualNotes || row.manualNotes.trim() === '') {
          row.manualNotes = hasPath ? 'override path provided' : 'override domain provided';
        }
      }

      // Count the final state for reporting
      if (String(row.approvedForNextMigration).toLowerCase() === 'true') {
        totalApproved++;
        if (hasPath) {
          approvedByPath++;
        } else if (hasDomain) {
          approvedByDomain++;
        }
      }
    }
  }

  const csvLines = [headers.join(',')];
  for (const item of rows) {
    const rowCsv = headers.map(h => {
      const val = item[h] !== undefined ? String(item[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvLines.push(rowCsv.join(','));
  }
  
  fs.writeFileSync(HIGHPRIO_CSV, csvLines.join('\n'));

  console.log(`\n--- RESULTADOS DE AUTO-APROBACIÓN ---`);
  console.log(`✅ Total filas con approvedForNextMigration=true: ${totalApproved}`);
  console.log(`🌐 Aprobadas por manualOverrideDomain: ${approvedByDomain}`);
  console.log(`📁 Aprobadas por manualOverridePath: ${approvedByPath}`);
  console.log(`📝 Archivo guardado correctamente: docs/catalog/logo-overrides-high-priority.csv\n`);
}

main().catch(console.error);

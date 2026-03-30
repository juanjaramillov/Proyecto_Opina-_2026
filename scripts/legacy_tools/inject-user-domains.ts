import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const HIGHPRIO_CSV = path.resolve(process.cwd(), 'docs/catalog/logo-overrides-high-priority.csv');

// List from user
const rawUrls = [
  "https://jetourchile.cl/",
  "https://www.maccosmetics.cl/",
  "https://www.mercadolibre.cl/",
  "https://www.chilemat.cl/",
  "https://www.construmart.cl/",
  "https://www.sodimac.cl/sodimac-cl",
  "https://www.santaisabel.cl/",
  "https://www.acuenta.cl/",
  "https://www.maconline.com/",
  "https://www.nintendo.com/es-cl/",
  "https://www.xbox.com/es-ES/",
  "https://hisense.cl/",
  "https://tvnplay.cl/",
  "https://www.directvgo.com/cl/home",
  "https://www.tuves.cl/",
  "https://cabify.com/cl"
];

// Extract hostnames correctly, stripping 'www.'
const overrideDomains = rawUrls.map(url => {
  try {
    const parsed = new URL(url);
    let host = parsed.hostname;
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }
    return host;
  } catch (e) {
    return url;
  }
});

interface OverrideItem {
  [key: string]: any;
}

async function loadCsv<T>(filePath: string): Promise<{ rows: T[], headers: string[] }> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    let headers: string[] = [];
    
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
  const { rows, headers } = await loadCsv<OverrideItem>(HIGHPRIO_CSV);
  
  let urlIndex = 0;
  for (const row of rows) {
    if (row.manualPriority === 'alta') {
      // Skip if it is falabella which is already approved
      if (row.entitySlug === 'falabella') {
        continue;
      }
      
      const domain = overrideDomains[urlIndex];
      if (domain) {
        row.manualOverrideDomain = domain;
        row.approvedForNextMigration = 'true';
        row.manualNotes = 'Domain provided by user via chat';
      }
      urlIndex++;
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
  console.log(`✅ CSV actualizado con ${urlIndex} dominios inyectados.`);
}

main().catch(console.error);

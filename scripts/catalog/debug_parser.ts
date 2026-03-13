import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, '../../docs/catalog/partial_dominios_v2.csv');

const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

console.log('Parsed total records:', records.length);
if (records.length > 40) {
    console.log('Record 40:', records[39]);
    console.log('Record 41:', records[40]);
    console.log('Record 42:', records[41]);
}

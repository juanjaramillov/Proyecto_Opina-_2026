import * as fs from 'fs';
import * as path from 'path';

const catalogPath = path.resolve('docs/catalog/master-entity-catalog-curated.csv');
const lines = fs.readFileSync(catalogPath, 'utf8').split('\n');

const normalizations: Record<string, string> = {
  'Pampers Premium Care': 'Pampers',
  'La Roche-Posay Anthelios': 'La Roche-Posay',
  'Vichy Capital Soleil': 'Vichy',
  'Apple AirPods': 'Apple',
  'Apple iPhone': 'Apple',
  'Apple MacBook': 'Apple',
  'Apple Watch': 'Apple',
  'Apple iPad': 'Apple',
  'Samsung Galaxy': 'Samsung',
  'Samsung Galaxy Buds': 'Samsung',
  'Samsung Galaxy Watch': 'Samsung',
  'Samsung Galaxy Tab': 'Samsung',
  'Samsung Odyssey': 'Samsung',
  'ASUS ROG': 'ASUS',
  'ASUS ROG Ally': 'ASUS',
  'Acer Predator': 'Acer',
  'LG UltraGear': 'LG',
  'Lenovo Legion Go': 'Lenovo',
  'Lenovo Tab': 'Lenovo',
  'Xiaomi Pad': 'Xiaomi',
  'Xiaomi Watch': 'Xiaomi',
  'Huawei MatePad': 'Huawei',
  'Huawei Watch': 'Huawei',
  'Honor Pad': 'Honor',
  'Nintendo Switch': 'Nintendo',
  'Claro Hogar': 'Claro',
  'Claro video': 'Claro',
  'Claro TV': 'Claro',
  'Entel Fibra': 'Entel',
  'Movistar Fibra': 'Movistar',
  'Movistar TV': 'Movistar',
  'Movistar TV App': 'Movistar',
  'RedSalud Centros Médicos': 'RedSalud'
};

const existingBrands = new Set();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(',');
  existingBrands.add(parts[2]); // index 2 is entity_name
}

const missingParents = new Set();
for (const parent of Object.values(normalizations)) {
  if (!existingBrands.has(parent)) {
    missingParents.add(parent);
  }
}

console.log("Missing Parent Brands in Catalog:", Array.from(missingParents));

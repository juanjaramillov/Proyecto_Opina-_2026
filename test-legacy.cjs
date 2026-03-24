const fs = require('fs');
const audit = JSON.parse(fs.readFileSync('public/logos/entities_next/quality-audit.json'));
const excluded = audit.filter(x => x.qualityTier !== 'strong');
const slugs = excluded.map(x => x.entitySlug);

const catalog = fs.readFileSync('docs/catalog/master-entity-catalog-curated.csv', 'utf-8').split('\n');
const catalogHeaders = catalog[0].split(',');
const typeIdx = catalogHeaders.indexOf('entity_type');
const slugIdx = catalogHeaders.indexOf('entity_slug');

console.log("Excluded items by type:");
for (const line of catalog) {
  const parts = line.split(',');
  if (parts.length > slugIdx) {
    const slug = parts[slugIdx];
    if (slugs.includes(slug)) {
      console.log(slug, "->", parts[typeIdx]);
    }
  }
}

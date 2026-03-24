const fs = require('fs');
const audit = JSON.parse(fs.readFileSync('public/logos/entities_next/quality-audit.json'));
const excluded = audit.filter(x => x.qualityTier !== 'strong');
console.log("Total excluded:", excluded.length);

const exts = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
let found = 0;
for (const item of excluded) {
  let matched = false;
  for (const ext of exts) {
    if (fs.existsSync('public/logos/entities_legacy/' + item.entitySlug + ext)) {
      console.log('Match legacy:', item.entitySlug + ext);
      matched = true;
      found++;
      break;
    }
  }
}
console.log("Total found in legacy:", found);

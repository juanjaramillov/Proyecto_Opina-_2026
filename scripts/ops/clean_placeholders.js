import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = path.join(process.cwd(), 'public/logos/entities');

const getHash = (p) => {
  const hash = crypto.createHash('md5');
  hash.update(fs.readFileSync(p));
  return hash.digest('hex');
};

const hashesToZap = [
  '25a2dfbd88a38ae9e55b1fce6fcdd245',
  '61adddcce049bf69ecbb291c94411135',
];

let deleted = 0;
const files = fs.readdirSync(dir);
for (const f of files) {
  const p = path.join(dir, f);
  if (fs.statSync(p).isFile()) {
      const h = getHash(p);
      if (hashesToZap.includes(h)) {
        fs.unlinkSync(p);
        deleted++;
        console.log(`Deleted placeholder: ${f}`);
      }
  }
}

console.log(`\nTotal removed: ${deleted}`);

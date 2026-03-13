import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const seedFilePath = path.join(process.cwd(), 'supabase', 'seed.sql');

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.includes('seed') || f.includes('catalog'))
  .sort();

console.log('Found seed files:', files);

let allContent = '-- Consolidated Seed Data from prior migrations\n\n';

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
  allContent += `-- Source: ${file}\n`;
  allContent += content + '\n\n';
}

fs.writeFileSync(seedFilePath, allContent);
console.log('Successfully wrote to', seedFilePath);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../../');

const files = [
    'src/features/home/pages/Home.tsx',
    'src/features/home/sections/InteractiveHeroSection.tsx',
    'src/features/home/sections/LiveTrendsSection.tsx',
    'src/features/home/sections/ChallengesMenuSection.tsx',
    'src/features/home/sections/CommunityPulseSection.tsx',
    'src/features/home/sections/GamifiedCTASection.tsx'
];

let output = `/* =========================================================\n`;
output += `   OPINA+ HOME B2C - SOURCE CODE PARA NOTEBOOKLM\n`;
output += `   FECHA ACTUALIZADA: ${new Date().toISOString()}\n`;
output += `   ========================================================= */\n\n`;

for (const file of files) {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        output += `\n/* ------------------ ${file} ------------------ */\n\n`;
        output += fs.readFileSync(fullPath, 'utf8');
        output += `\n`;
    } else {
        console.warn(`File not found: ${file}`);
    }
}

fs.writeFileSync(path.join(projectRoot, 'HOME_SOURCE_CODE_PARA_NOTEBOOKLM.txt'), output);
console.log('File updated successfully!');

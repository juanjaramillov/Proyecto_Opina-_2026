import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../../');

const files = [
    'src/features/feed/pages/SignalsHub.tsx',
    'src/features/feed/components/HubMenuSimplified.tsx',
    'src/features/feed/components/VersusView.tsx',
    'src/features/feed/components/TorneoView.tsx',
    'src/features/feed/components/ProfundidadView.tsx',
    'src/features/feed/components/ActualidadHubManager.tsx',
    'src/features/signals/components/TorneoRunner.tsx',
    'src/features/signals/components/VersusGame.tsx',
    'src/features/signals/components/DepthGame.tsx'
];

let output = `/* =========================================================\n`;
output += `   OPINA+ SEÑALES - SOURCE CODE PARA NOTEBOOKLM\n`;
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

fs.writeFileSync(path.join(projectRoot, 'SIGNALS_SOURCE_CODE_PARA_NOTEBOOKLM.txt'), output);
console.log('File updated successfully!');

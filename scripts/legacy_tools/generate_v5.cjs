const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const destBase = path.join(process.cwd(), 'opina-results-context-export-v5-final-real');

const explicitEntryPoints = [
  'src/features/results/pages/Results.tsx',
  'src/features/home/pages/Home.tsx',
  'src/features/feed/pages/SignalsHub.tsx',
  'src/features/access/pages/AccessGate.tsx',
  'src/features/access/components/Gate.tsx',
  'src/App.tsx'
];

const globalFiles = [
  'src/index.tsx',
  'src/main.tsx',
  'src/index.css',
  'tailwind.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'package.json'
];

const exclusions = [
  'src/features/admin',
  'src/features/b2b'
];

const extensions = ['.tsx', '.ts', '.css', '.js', '.jsx'];

let closureReportLines = [
  '# Reporte de Cierre de Imports (Import Closure Report)',
  '',
  '| Entry Point | Total Imports Detectados | Resueltos | Faltantes | Detalle Faltantes |',
  '|-------------|--------------------------|-----------|-----------|------------------|'
];

const allFoundFiles = new Set();
const routeExclusions = new Set();

function shouldExclude(targetPath) {
  return exclusions.some(ex => targetPath.includes(ex));
}

function resolveFile(importPath, currentDir) {
  let targetPath;

  if (importPath.startsWith('.')) {
    targetPath = path.resolve(currentDir, importPath);
  } else if (importPath.startsWith('src/') || importPath.startsWith('@/')) {
    targetPath = path.resolve(process.cwd(), importPath.replace(/^@\//, 'src/'));
  } else {
    return null; // external package
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return targetPath;
  }
  
  for (const ext of extensions) {
    if (fs.existsSync(targetPath + ext)) return targetPath + ext;
  }
  
  const indexPaths = extensions.map(ext => path.join(targetPath, `index${ext}`));
  for (const p of indexPaths) {
    if (fs.existsSync(p)) return p;
  }
  
  return null;
}

function analyzeEntryPoint(ep) {
  const visited = new Set();
  const found = new Set();
  let totalImports = 0;
  let missing = [];

  function scan(filePath) {
    if (visited.has(filePath)) return;
    visited.add(filePath);
    
    if (!fs.existsSync(filePath)) {
      missing.push(filePath);
      return;
    }
    
    found.add(filePath);
    allFoundFiles.add(filePath);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    // FIXED: Using [\\s\\S]*? to catch multi-line imports
    const importRegex = /(?:import|export)\s+[\s\S]*?from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2] || match[3];
      if (importPath.startsWith('.') || importPath.startsWith('src/') || importPath.startsWith('@/')) {
        totalImports++;
        const resolved = resolveFile(importPath, path.dirname(filePath));
        if (resolved) {
          if (shouldExclude(resolved)) {
            routeExclusions.add(`Import: ${importPath} -> Resolved: ${path.relative(process.cwd(), resolved)}`);
          } else {
            scan(resolved);
          }
        } else {
          missing.push(`\`${importPath}\` (desde \`${path.relative(process.cwd(), filePath)}\`)`);
        }
      }
    }
  }

  const epAbs = path.resolve(process.cwd(), ep);
  if (fs.existsSync(epAbs)) {
    scan(epAbs);
  }

  const faltantesCount = missing.length;
  const resueltos = totalImports - faltantesCount;
  const detalle = faltantesCount > 0 ? missing.join('<br>') : 'Ninguno';
  const repoName = ep.split('/').pop();
  
  closureReportLines.push(`| \`${repoName}\` | ${totalImports} | ${resueltos} | ${faltantesCount} | ${detalle} |`);
}

// 1. Analyze requested entry points
explicitEntryPoints.forEach(ep => analyzeEntryPoint(ep));

// Add global structural files to allFoundFiles explicitly if they exist
globalFiles.forEach(gf => {
  const absPath = path.resolve(process.cwd(), gf);
  if (fs.existsSync(absPath)) {
    allFoundFiles.add(absPath);
  }
});

fs.rmSync(destBase, { recursive: true, force: true });
fs.mkdirSync(destBase, { recursive: true });

// 2. Perform Physical Copy
let copiedFilesCount = 0;
allFoundFiles.forEach(absPath => {
  const relativeFromRoot = path.relative(process.cwd(), absPath);
  const destPath = path.join(destBase, relativeFromRoot);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(absPath, destPath);
  copiedFilesCount++;
});

// 3. Copy Public Assets
const publicDirs = ['public/logos/entities', 'public/logos/entities_legacy', 'public/images'];
publicDirs.forEach(pd => {
  const srcDir = path.join(process.cwd(), pd);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, path.join(destBase, pd), { recursive: true });
  }
});
const pubFiles = fs.readdirSync('public').filter(f => fs.statSync(path.join('public', f)).isFile());
pubFiles.forEach(f => {
    const dest = path.join(destBase, 'public', f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join('public', f), dest);
});

// 4. Copy screenshots
if (fs.existsSync('opina-results-context-export-v4-true-100/screenshots')) {
  fs.cpSync('opina-results-context-export-v4-true-100/screenshots', path.join(destBase, 'screenshots'), { recursive: true });
}

fs.mkdirSync(path.join(destBase, '_context_export'), { recursive: true });

// 5. Write 10_IMPORT_CLOSURE_REPORT.md
fs.writeFileSync(path.join(destBase, '_context_export', '10_IMPORT_CLOSURE_REPORT.md'), closureReportLines.join('\n'));

// Write EXCLUSIONS
fs.writeFileSync(path.join(destBase, '_context_export', '08_ROUTE_EXCLUSIONS.md'), Array.from(routeExclusions).join('\n'));

console.log(`V5 Copied! Extracted ${copiedFilesCount} source files. (Added multi-line import resolution)`);

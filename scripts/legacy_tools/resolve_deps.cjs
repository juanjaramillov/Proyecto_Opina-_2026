const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');
const entryPoints = [
  'src/features/results/pages/Results.tsx',
  'src/features/home/pages/Home.tsx',
  'src/features/feed/pages/SignalsHub.tsx',
  'src/App.tsx'
];

const visited = new Set();
const missing = new Set();
const found = new Set();
const excludedRoutes = new Set();
const excludedLocalDeps = new Set();

const exclusions = [
  'src/features/admin',
  'src/features/b2b'
];

function shouldExclude(targetPath) {
  return exclusions.some(ex => targetPath.includes(ex));
}

function resolveFile(importPath, currentDir) {
  let targetPath;
  if (importPath.startsWith('.')) {
    targetPath = path.resolve(currentDir, importPath);
  } else if (importPath.startsWith('src/')) {
    targetPath = path.resolve(process.cwd(), importPath);
  } else {
    return null;
  }

  const extensions = ['.tsx', '.ts', '.css', '.js', '.jsx'];
  
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

function scan(filePath) {
  if (visited.has(filePath)) return;
  visited.add(filePath);
  
  if (!fs.existsSync(filePath)) {
    missing.add(filePath);
    return;
  }
  
  found.add(filePath);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2];
    if (importPath.startsWith('.') || importPath.startsWith('src/')) {
      const resolved = resolveFile(importPath, path.dirname(filePath));
      if (resolved) {
        if (shouldExclude(resolved)) {
            if (filePath.includes('App.tsx')) {
                excludedRoutes.add(`Import: ${importPath} -> Resolved: ${path.relative(process.cwd(), resolved)}`);
            } else {
                excludedLocalDeps.add(`Import: ${importPath} (from ${path.relative(process.cwd(), filePath)}) -> Resolved: ${path.relative(process.cwd(), resolved)}`);
            }
        } else {
            scan(resolved);
        }
      } else {
        missing.add(`${importPath} (from ${filePath})`);
      }
    }
  }
}

entryPoints.forEach(ep => scan(path.resolve(process.cwd(), ep)));

console.log("=== EXCLUDED ROUTES FROM APP.TSX ===");
excludedRoutes.forEach(r => console.log(r));

console.log("=== EXCLUDED LOCAL DEPS ===");
excludedLocalDeps.forEach(r => console.log(r));

const toInclude = Array.from(found).map(f => path.relative(process.cwd(), f));
fs.writeFileSync('v3_files_to_include.json', JSON.stringify(toInclude, null, 2));
console.log(`Saved ${toInclude.length} files to v3_files_to_include.json`);

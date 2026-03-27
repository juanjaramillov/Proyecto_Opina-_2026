const fs = require('fs');
const path = require('path');

const destBase = path.join(process.cwd(), 'opina-results-context-export-v3-perfect');
const files = JSON.parse(fs.readFileSync('v3_files_to_include.json', 'utf-8'));

// Add explicit required root files
files.push('tailwind.config.ts', 'postcss.config.js', 'package.json', 'index.html', 'src/vite-env.d.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'vite.config.ts');

files.forEach(file => {
  const src = path.join(process.cwd(), file);
  if (fs.existsSync(src)) {
    const dest = path.join(destBase, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
});

// Copy assets
const publicDirs = ['public/logos/entities', 'public/logos/entities_legacy', 'public/images'];
publicDirs.forEach(pd => {
  const srcDir = path.join(process.cwd(), pd);
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, path.join(destBase, pd), { recursive: true });
  }
});

// Copy standalone public files
const pubFiles = fs.readdirSync('public').filter(f => fs.statSync(path.join('public', f)).isFile());
pubFiles.forEach(f => {
    const dest = path.join(destBase, 'public', f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join('public', f), dest);
});

// Copy screenshots
fs.cpSync('opina-results-context-export-v2/screenshots', path.join(destBase, 'screenshots'), { recursive: true });

console.log('Copy complete!');

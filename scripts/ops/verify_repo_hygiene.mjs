import fs from 'node:fs';
import path from 'node:path';

// verify_repo_hygiene.mjs
// Falla con exit code 1 si hay archivos o directorios sucios en la raíz

const forbiddenDirs = ['node_modules', 'dist', 'build', '.vercel', '.next', '.vite', 'coverage', '__MACOSX', '.git'];
const forbiddenFilePatterns = [
  /^reset\.log$/,
  /^test-lock\.ts$/,
  /^test_fix\.ts$/,
  /^validacion_bloque_.*\.txt$/,
  /\.log$/,
  /\.zip$/,
  /\.tmp$/,
  /\.bak$/,
  /\.swp$/
];

let dirty = false;

if (!fs.existsSync(process.cwd())) {
  console.error("No se pudo leer el directorio actual.");
  process.exit(1);
}

const rootFiles = fs.readdirSync(process.cwd());

for (const file of rootFiles) {
  const stat = fs.statSync(file);
  const isDir = stat.isDirectory();
  
  if (isDir && forbiddenDirs.includes(file)) {
    let category = "DIRECTORIO PROHIBIDO";
    if (['node_modules', 'dist', 'build', '.vercel', '.next', '.vite', 'coverage'].includes(file)) category = "BUILD CACHE";
    if (['.git', '__MACOSX'].includes(file)) category = "SISTEMA/CONTROL DE VERSIONES";
    console.error(`\x1b[31m[ERROR] Repo sucio -> [${category}] encontrado: ${file}/\x1b[0m`);
    dirty = true;
  }
  
  if (!isDir) {
    if (file.startsWith('.env') && file !== '.env.example') {
       console.error(`\x1b[31m[ERROR] Repo sucio -> [SECRETO] encontrado: ${file}\x1b[0m`);
       dirty = true;
    }
    for (const pattern of forbiddenFilePatterns) {
      if (pattern.test(file)) {
        let category = "ARCHIVO PROHIBIDO";
        if (/\.log$|\.zip$|\.tmp$|\.bak$|\.swp$/.test(file)) category = "TEMPORAL/BASURA";
        console.error(`\x1b[31m[ERROR] Repo sucio -> [${category}] encontrado: ${file}\x1b[0m`);
        dirty = true;
      }
    }
  }
}

if (dirty) {
  console.error("\x1b[33m\nPor favor, limpia el repositorio antes de auditar/exportar.\nRecuerda no incluir node_modules, dist, ni variables de entorno locales en los zips de auditoria.\x1b[0m");
  process.exit(1);
}

console.log("\x1b[32m[OK] Higiene del repositorio verificada. Listo para exportar.\x1b[0m");

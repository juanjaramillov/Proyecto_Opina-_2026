#!/usr/bin/env node
/**
 * Fix-Tailwind-Palette
 * =====================
 * Cierra la deuda que dejó el script temporal `replace_primary.js`:
 *
 *   1) Repara las clases con DOBLE OPACIDAD introducidas accidentalmente
 *      (p.ej. `bg-brand/20/50`, `ring-brand/50/20`, `bg-accent/10/80`).
 *      La raíz del problema fue mapear `primary-N` -> `brand/N'` cuando el
 *      autor ya había escrito un sufijo de opacidad. Aquí restauramos la
 *      forma con SHADE: `bg-brand-100/50`, `ring-brand-500/20`, etc.
 *      Esto preserva el color original porque `brand` extiende `colors.blue`
 *      y `accent` extiende `colors.emerald`.
 *
 *   2) Migra el remanente `primary-*` / `secondary-*` que el script
 *      anterior no tocó (vivían fuera de `src/features/admin/**`).
 *      Reemplazo directo a la forma `brand-*` / `accent-*` preservando shade.
 *
 * Uso:
 *   node scripts/repo/fix-tailwind-palette.mjs        # aplica cambios
 *   node scripts/repo/fix-tailwind-palette.mjs --dry  # solo reporta
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const DRY = process.argv.includes('--dry');

const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (EXTS.has(path.extname(entry.name))) out.push(full);
    }
    return out;
}

// Reverse map from the old replace_primary.js decisions.
// First opacity -> original shade.
const BRAND_REVERSE = {
    '10': '50',   // bg-primary-50  -> bg-brand/10
    '20': '100',  // bg-primary-100 -> bg-brand/20
    '30': '200',  // bg-primary-200 -> bg-brand/30
    '40': '300',  // border-primary-300 -> border-brand/40
    '50': '500',  // ring-primary-500 -> ring-brand/50
};
const ACCENT_REVERSE = {
    '10': '50',   // bg-emerald-50 -> bg-accent/10
    '20': '100',  // implícito en algunos componentes
    '50': '500',  // ring-emerald-500 -> ring-accent/50
};

const files = walk(SRC);
const report = [];
let filesChanged = 0;
let doubleFixes = 0;
let primaryFixes = 0;

// Double-opacity pattern:
//   <util>-<brand|accent>/<N>/<M>
// Example: `bg-brand/20/50`, `focus:ring-brand/50/10`, `hover:bg-accent/10/80`.
const DOUBLE_OPACITY = /\b([a-z-]+-(?:brand|accent))\/(\d+)\/(\d+)\b/g;

// Remaining legacy primary-*/secondary-* pattern.
//   <util>-<primary|secondary>-<N>
// Preserves any trailing opacity suffix (`/20`) automatically via the
// non-greedy surrounding match — regex stops at -<digits> so the `/suffix`
// is left in place by the replacer string.
const LEGACY_PALETTE = /\b([a-z-]+)-(primary|secondary)-(\d+)\b/g;

for (const file of files) {
    const rel = path.relative(ROOT, file);
    const original = fs.readFileSync(file, 'utf8');
    let content = original;
    let localDouble = 0;
    let localPrimary = 0;

    // Pass 1: fix double opacity
    content = content.replace(DOUBLE_OPACITY, (match, util, firstOp, secondOp) => {
        const family = util.endsWith('accent') ? 'accent' : 'brand';
        const table = family === 'accent' ? ACCENT_REVERSE : BRAND_REVERSE;
        const shade = table[firstOp];
        if (!shade) {
            // No hay reversa conocida: fallback a colapsar a la segunda opacidad.
            report.push(`  ! ${rel}: desconocido ${match}, colapsando a ${util}/${secondOp}`);
            localDouble++;
            return `${util}/${secondOp}`;
        }
        localDouble++;
        return `${util}-${shade}/${secondOp}`;
    });

    // Pass 2: legacy primary-*/secondary-*
    content = content.replace(LEGACY_PALETTE, (match, util, family, shade) => {
        const newFamily = family === 'primary' ? 'brand' : 'accent';
        localPrimary++;
        return `${util}-${newFamily}-${shade}`;
    });

    if (content !== original) {
        filesChanged++;
        doubleFixes += localDouble;
        primaryFixes += localPrimary;
        report.push(`  ~ ${rel}  (double:${localDouble}  legacy:${localPrimary})`);
        if (!DRY) fs.writeFileSync(file, content, 'utf8');
    }
}

console.log(`\nFix-Tailwind-Palette ${DRY ? '(DRY RUN)' : ''}`);
console.log('='.repeat(50));
for (const line of report) console.log(line);
console.log('-'.repeat(50));
console.log(`Archivos modificados: ${filesChanged}`);
console.log(`Doble-opacidad reparadas: ${doubleFixes}`);
console.log(`Legacy primary/secondary migradas: ${primaryFixes}`);
if (DRY) console.log('\n(DRY RUN — ningún archivo fue escrito.)');

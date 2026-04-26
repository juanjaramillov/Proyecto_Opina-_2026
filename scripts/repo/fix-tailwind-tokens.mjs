#!/usr/bin/env node
/**
 * DEBT-009 · Migración final de aliases legacy primary/secondary → brand/accent.
 *
 * Este script hace find-and-replace quirúrgico sobre los tokens Tailwind
 * sobrevivientes que aún referencian los scalars `primary` / `secondary`
 * del `tailwind.config.js`. El color resultante es idéntico (primary=brand,
 * secondary=accent); sólo cambia el nombre canónico.
 *
 * Reglas:
 *  - `bg-primary(\/\d+)?` → `bg-brand(\/\d+)?`, idem text/border/ring/shadow/from/to/via/fill/stroke/divide/outline/decoration/border-[lrtb]
 *  - `bg-primary-dark`/`bg-primary-hover` → `bg-brand-700` (no existían como aliases, eran clases muertas)
 *  - `text-text-secondary` → `text-slate-600` (semántico honesto, coincide con el valor legacy #475569)
 *  - `text-text-muted` → `text-slate-500` (coincide con ink-muted #64748B)
 *  - NO toca: `btn-primary` / `btn-secondary` / `badge-primary` (nombres de componentes CSS),
 *    `var(--primary)` / `var(--secondary)` / `var(--accent-primary)` (CSS variables),
 *    `border-theme-primary` / `[var(--accent-primary)]` (arbitrary values que no se resuelven via alias).
 *
 * Uso: `node scripts/repo/fix-tailwind-tokens.mjs` (desde la raíz del repo).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html']);

/**
 * Recorre el árbol de `src/` recolectando archivos relevantes.
 */
function collectFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
            collectFiles(full, out);
        } else if (EXTENSIONS.has(path.extname(entry.name))) {
            out.push(full);
        }
    }
    return out;
}

// Utilities que aceptan una escala de color. Cada una genera un par de
// reglas (primary→brand, secondary→accent). Incluimos variantes de borde
// direccional (border-l, border-t, etc.) porque sí aparecen en el código.
const COLOR_UTILITY_PREFIXES = [
    'bg', 'text', 'border', 'ring', 'shadow', 'fill', 'stroke', 'divide', 'outline', 'decoration',
    'from', 'to', 'via',
    'border-l', 'border-r', 'border-t', 'border-b',
    'border-x', 'border-y',
];

/**
 * Construye un regex global que matchea `utility-primary` con modificadores
 * opcionales (`/N`, variantes state, responsive), y devuelve la clase con
 * el alias migrado. Se ejecuta una vez por par utility+colorKey.
 */
function buildRegexes() {
    const regexes = [];

    for (const util of COLOR_UTILITY_PREFIXES) {
        // Palabra previa puede ser cualquier prefijo de variante separado por `:`
        // (p.ej. `hover:`, `focus:`, `group-hover:`, `md:`, `dark:`). Aceptamos
        // cualquier caracter alfanumérico/`-`/`_` antes del utility.
        // Guard: el utility y el color deben estar rodeados de NON-word chars
        // para no romper cosas como `btn-primary` o `card-interactive`.
        regexes.push({
            // bg-primary, bg-primary/20
            pattern: new RegExp(`(^|[\\s"'\\\`\\{])(${escape(util)})-primary(?![\\w-])((?:/\\d+)?)`, 'g'),
            replacement: '$1$2-brand$3',
        });
        regexes.push({
            pattern: new RegExp(`(^|[\\s"'\\\`\\{])(${escape(util)})-secondary(?![\\w-])((?:/\\d+)?)`, 'g'),
            replacement: '$1$2-accent$3',
        });
        // Variante con modificador de estado/responsive: (hover|focus|...):util-primary
        regexes.push({
            pattern: new RegExp(`([\\w-]+:)(${escape(util)})-primary(?![\\w-])((?:/\\d+)?)`, 'g'),
            replacement: '$1$2-brand$3',
        });
        regexes.push({
            pattern: new RegExp(`([\\w-]+:)(${escape(util)})-secondary(?![\\w-])((?:/\\d+)?)`, 'g'),
            replacement: '$1$2-accent$3',
        });
    }

    // bg-primary-dark / bg-primary-hover → bg-brand-700 (shade más oscuro
    // de la misma familia). No existían como aliases válidos, eran clases
    // huérfanas que no pintaban nada.
    regexes.push({
        pattern: /\b(bg|text|border|ring|shadow)-primary-(dark|hover)\b/g,
        replacement: '$1-brand-700',
    });

    // text-text-secondary → text-slate-600 (valor literal del alias legacy)
    regexes.push({ pattern: /\btext-text-secondary\b/g, replacement: 'text-slate-600' });
    regexes.push({ pattern: /\bbg-text-secondary\b/g,   replacement: 'bg-slate-600' });
    // text-text-muted → text-slate-500 (= ink.muted)
    regexes.push({ pattern: /\btext-text-muted\b/g, replacement: 'text-slate-500' });

    return regexes;
}

function escape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const REGEXES = buildRegexes();
const files = collectFiles(SRC);

let changedFiles = 0;
let totalSubs = 0;
const changeSummary = [];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let localSubs = 0;

    for (const { pattern, replacement } of REGEXES) {
        const matches = content.match(pattern);
        if (matches) {
            localSubs += matches.length;
            content = content.replace(pattern, replacement);
        }
    }

    if (localSubs > 0) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        totalSubs += localSubs;
        changeSummary.push({ file: path.relative(ROOT, file), subs: localSubs });
    }
}

console.log(`[fix-tailwind-tokens] changed ${changedFiles} files, ${totalSubs} substitutions`);
for (const c of changeSummary.sort((a, b) => b.subs - a.subs).slice(0, 20)) {
    console.log(`  ${c.subs.toString().padStart(4)}  ${c.file}`);
}

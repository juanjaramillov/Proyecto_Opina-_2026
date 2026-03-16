import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const rawText = fs.readFileSync('/tmp/raw_catalog.txt', 'utf-8');

function slugify(text: string) {
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const iconsMap: Record<string, { icon: string, color: string }> = {
    "Salud": { icon: "health_and_safety", color: "#be185d" },
    "Finanzas": { icon: "account_balance", color: "#0f766e" },
    "Telecomunicaciones": { icon: "settings_input_antenna", color: "#2563eb" },
    "Retail": { icon: "shopping_bag", color: "#f59e0b" },
    "Moda": { icon: "checkroom", color: "#ec4899" },
    "Comida": { icon: "restaurant", color: "#ef4444" },
    "Transporte": { icon: "commute", color: "#64748b" },
    "Entretenimiento": { icon: "movie", color: "#a855f7" },
    "Bebidas": { icon: "local_bar", color: "#1d4ed8" },
    "Medios": { icon: "campaign", color: "#8b5cf6" },
    "Social / Plataformas": { icon: "share", color: "#06b6d4" },
    "Educación": { icon: "school", color: "#0369a1" },
    "Deportes": { icon: "sports_soccer", color: "#f97316" },
    "Vino": { icon: "wine_bar", color: "#7f1d1d" },
    "Mascotas": { icon: "pets", color: "#ea580c" },
    "Cuidado personal e higiene": { icon: "wash", color: "#0891b2" },
    "Belleza": { icon: "face_retouching_natural", color: "#f43f5e" },
    "Hogar y electrodomésticos": { icon: "home", color: "#65a30d" },
    "Tecnología de consumo": { icon: "devices", color: "#10b981" },
    "Gaming": { icon: "sports_esports", color: "#d946ef" },
    "Bebés y maternidad": { icon: "child_care", color: "#f472b6" },
};

async function run() {
    console.log("🚀 Parsing raw catalog to SQL...");
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);

    const catalog: any[] = [];
    let currentCat: any = null;
    let currentSub: any = null;

    let idx = 0;
    while (idx < lines.length) {
        const line = lines[idx];
        if (line.startsWith('Categoría:')) {
            const title = line.replace('Categoría:', '').trim();
            currentCat = {
                title,
                id: `cat-${slugify(title)}`,
                slug: slugify(title),
                theme: iconsMap[title] || { icon: 'star', color: '#64748b' },
                subcategories: []
            };
            catalog.push(currentCat);
            idx++;
        } else if (line.startsWith('Subcategoría:')) {
            const label = line.replace('Subcategoría:', '').trim();
            currentSub = {
                id: slugify(label),
                label,
                slug: slugify(label),
                icon: 'label',
                options: []
            };
            currentCat.subcategories.push(currentSub);
            idx++;
        } else if (line.startsWith('Opciones:')) {
            idx++;
            while (idx < lines.length && !lines[idx].startsWith('Categoría:') && !lines[idx].startsWith('Subcategoría:')) {
                const optLine = lines[idx];
                const parts = optLine.split(' ');
                const domain = parts.pop();
                const optName = parts.join(' ');
                currentSub.options.push({ name: optName, domain });
                idx++;
            }
        } else {
            idx++;
        }
    }

    let code = `export const PARENT_INDUSTRIES: Record<string, any> = {\n`;
    for (const cat of catalog) {
        code += `    "${cat.slug}": {\n`;
        code += `        "id": "${cat.id}",\n`;
        code += `        "title": "${cat.title}",\n`;
        code += `        "subtitle": "Descubre las tendencias en ${cat.title}.",\n`;
        code += `        "theme": {\n`;
        code += `            "primary": "${cat.theme.color}",\n`;
        code += `            "accent": "${cat.theme.color}",\n`;
        code += `            "bgGradient": "from-[${cat.theme.color}]/10 to-white",\n`;
        code += `            "icon": "${cat.theme.icon}"\n`;
        code += `        },\n`;
        code += `        "subcategories": [\n`;
        cat.subcategories.forEach((sub: any, sIdx: number) => {
            code += `            {\n`;
            code += `                "id": "${sub.id}",\n`;
            code += `                "label": "${sub.label}",\n`;
            code += `                "slug": "${sub.slug}",\n`;
            code += `                "icon": "auto_awesome"\n`;
            code += `            }${sIdx < cat.subcategories.length - 1 ? ',' : ''}\n`;
        });
        code += `        ]\n`;
        code += `    },\n`;
    }
    code += `};\n`;
    
    fs.writeFileSync(path.resolve(__dirname, '../src/features/feed/data/industries.ts'), code);

    // SQL GENERATION
    let sql = `
-- Nuevo catálogo migratorio
DELETE FROM signal_events WHERE id IS NOT NULL;
DELETE FROM battle_options WHERE id IS NOT NULL;
DELETE FROM battles WHERE id IS NOT NULL;
DELETE FROM entities WHERE name != 'none_xyz_fake';
UPDATE categories SET active = false;

`;
    const entitiesToInsert: any[] = [];
    const allOptionsBySubcat: Record<string, any[]> = {};
    const seenSlugs = new Set<string>();
    const categoriesToInsert: any[] = [];
    const subcatIdMap: Record<string, string> = {};

    for (const cat of catalog) {
        for (const sub of cat.subcategories) {
            const catDbId = uuidv4();
            subcatIdMap[sub.slug] = catDbId;
            categoriesToInsert.push({
                id: catDbId,
                name: sub.label,
                slug: sub.slug,
                comparison_family: 'product',
                entity_type: 'brand_service',
                generation_mode: 'ai_curated_pairs',
                pairing_rules: 'same_entity_type_only'
            });

            allOptionsBySubcat[sub.slug] = [];
            for (const opt of sub.options) {
                const baseSlug = slugify(opt.name);
                let finalSlug = baseSlug;
                let counter = 1;
                while (seenSlugs.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${sub.slug}`;
                    if (seenSlugs.has(finalSlug)) {
                        finalSlug = `${baseSlug}-${sub.slug}-${counter}`;
                        counter++;
                    }
                }
                seenSlugs.add(finalSlug);

                const ent = {
                    id: uuidv4(),
                    name: opt.name,
                    slug: finalSlug,
                    type: 'brand',
                    category: sub.slug,
                    domain: opt.domain
                };
                entitiesToInsert.push(ent);
                allOptionsBySubcat[sub.slug].push(ent);
            }
        }
    }

    if (categoriesToInsert.length > 0) {
        sql += `INSERT INTO categories (id, name, slug, comparison_family, entity_type, generation_mode, pairing_rules) VALUES\n`;
        sql += categoriesToInsert.map(c => `('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.slug}', '${c.comparison_family}', '${c.entity_type}', '${c.generation_mode}', '${c.pairing_rules}')`).join(',\n') + '\nON CONFLICT (slug) DO UPDATE SET active = true, id = EXCLUDED.id;\n\n';
    }

    if (entitiesToInsert.length > 0) {
        sql += `INSERT INTO entities (id, name, slug, type, category) VALUES\n`;
        sql += entitiesToInsert.map(e => `('${e.id}', '${e.name.replace(/'/g, "''")}', '${e.slug}', '${e.type}', '${e.category}')`).join(',\n') + ';\n\n';
    }

    const battlesToInsert: any[] = [];
    const battleOptionsToInsert: any[] = [];

    for (const [subSlug, entities] of Object.entries(allOptionsBySubcat)) {
        if (entities.length < 2) continue;

        const shuffled = [...entities].sort(() => 0.5 - Math.random());
        const parentCat = catalog.find(c => c.subcategories.some((s:any) => s.slug === subSlug));
        const subCatLabel = parentCat?.subcategories.find((s:any)=>s.slug===subSlug)?.label || subSlug;

        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 >= shuffled.length) break;

            const A = shuffled[i];
            const B = shuffled[i + 1];

            const battleId = uuidv4();
            battlesToInsert.push({
                id: battleId,
                title: `Enfrentamiento en ${subCatLabel}`,
                category_id: subcatIdMap[subSlug],
                status: 'active'
            });

            battleOptionsToInsert.push({ battle_id: battleId, brand_id: A.id, label: A.name, brand_domain: A.domain || null });
            battleOptionsToInsert.push({ battle_id: battleId, brand_id: B.id, label: B.name, brand_domain: B.domain || null });
        }
    }

    if (battlesToInsert.length > 0) {
        sql += `INSERT INTO battles (id, title, category_id, status) VALUES\n`;
        sql += battlesToInsert.map(b => `('${b.id}', '${b.title.replace(/'/g, "''")}', '${b.category_id}', '${b.status}')`).join(',\n') + ';\n\n';
    }

    if (battleOptionsToInsert.length > 0) {
        sql += `INSERT INTO battle_options (battle_id, brand_id, label, brand_domain) VALUES\n`;
        sql += battleOptionsToInsert.map(bo => `('${bo.battle_id}', '${bo.brand_id}', '${bo.label.replace(/'/g, "''")}', ${bo.brand_domain ? `'${bo.brand_domain}'` : 'NULL'})`).join(',\n') + ';\n\n';
    }

    const migrationFileName = path.resolve(__dirname, '../supabase/migrations/20260309130000_update_full_catalog.sql');
    fs.writeFileSync(migrationFileName, sql);
    console.log(`✅ File generated: ${migrationFileName}`);
    console.log(`✅ Front-end config industries.ts updated.`);
}

run().catch(console.error);

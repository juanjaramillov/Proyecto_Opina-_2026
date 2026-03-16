import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const rawText = fs.readFileSync('/tmp/raw_catalog.txt', 'utf-8');

function slugify(text: string) {
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
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
    console.log("🚀 Parsing raw catalog...");
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
                // last part is domain
                const domain = parts.pop();
                const optName = parts.join(' ');
                currentSub.options.push({ name: optName, domain });
                idx++;
            }
        } else {
            idx++; // skip unknown lines
        }
    }

    console.log("🧹 Erasing current data via RPC or raw calls...");

    // We do sequential delete. Supabase limits delete to chunks or we need match. 
    // It's safer to delete where id is not null
    
    console.log("- Deleting signal events...");
    await supabase.from('signal_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("- Deleting battle options...");
    await supabase.from('battle_options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("- Deleting battles...");
    await supabase.from('battles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("- Deleting entities...");
    await supabase.from('entities').delete().neq('name', 'none_xyz_fake');

    console.log("✅ DB Cleared.");

    console.log("📝 Generating industries.ts...");
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

    const destPath = path.resolve(__dirname, '../src/features/feed/data/industries.ts');
    fs.writeFileSync(destPath, code);
    console.log("✅ industries.ts updated.");

    console.log("🌱 Seeding entities and battles...");
    
    // Convert to flat list for entities
    const entitiesToInsert: any[] = [];
    const allOptionsBySubcat: Record<string, any[]> = {};

    for (const cat of catalog) {
        for (const sub of cat.subcategories) {
            allOptionsBySubcat[sub.slug] = [];
            for (const opt of sub.options) {
                const ent = {
                    id: uuidv4(),
                    name: opt.name,
                    slug: slugify(opt.name),
                    type: 'brand',
                    category: sub.slug, // Subcategory slug represents the "category" in DB
                    metadata: { brand_domain: opt.domain } // stash domain here temporarily
                };
                entitiesToInsert.push(ent);
                allOptionsBySubcat[sub.slug].push(ent);
            }
        }
    }

    // Insert entities in batches
    for (let i = 0; i < entitiesToInsert.length; i += 100) {
        const batch = entitiesToInsert.slice(i, i + 100).map(e => ({ name: e.name, slug: e.slug, type: e.type, category: e.category }));
        const { error } = await supabase.from('entities').insert(batch);
        if (error) { 
            console.error("Error inserting entities:", error);
            process.exit(1);
        }
    }

    // Must fetch them back to get DB-generated IDs if our manual UUID isn't accepted (but it is if we used the generated ones? actually wait DB generates UUIDs)
    // Actually our entity insert doesn't provide IDs. Let's provide IDs.
    await supabase.from('entities').delete().neq('name', ''); // clean again to be safe
    for (let i = 0; i < entitiesToInsert.length; i += 100) {
        const batch = entitiesToInsert.slice(i, i + 100);
        // We will insert with IDs directly to know them
        const { error } = await supabase.from('entities').insert(batch.map(e => ({ id: e.id, name: e.name, slug: e.slug, type: e.type, category: e.category })));
        if(error) console.error("Error batch:", error);
    }

    console.log("⚔️ Generating versus battles per subcategory...");
    // For each subcategory, we create round-robin all vs all (or shuffle to create pairs)
    const battlesToInsert: any[] = [];
    const battleOptionsToInsert: any[] = [];

    for (const [subSlug, entities] of Object.entries(allOptionsBySubcat)) {
        if (entities.length < 2) continue;

        // Shuffle entities
        const shuffled = [...entities].sort(() => 0.5 - Math.random());
        
        const subcatLabel = subSlug;
        // find parent to get proper titles
        const parentCat = catalog.find(c => c.subcategories.some((s:any) => s.slug === subSlug));
        
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 >= shuffled.length) break;

            const A = shuffled[i];
            const B = shuffled[i + 1];

            const battleId = uuidv4();
            battlesToInsert.push({
                id: battleId,
                title: `Enfrentamiento en ${parentCat?.subcategories.find((s:any)=>s.slug===subSlug)?.label || subSlug}`,
                industry: subSlug,
                category: subSlug, // We use subcat slug for routing ease
                status: 'active'
            });

            battleOptionsToInsert.push({
                battle_id: battleId,
                entity_id: A.id,
                label: A.name,
                brand_domain: A.metadata.brand_domain // Inject domain for AI/Brandfetch
            });

            battleOptionsToInsert.push({
                battle_id: battleId,
                entity_id: B.id,
                label: B.name,
                brand_domain: B.metadata.brand_domain
            });
        }
    }

    // Insert Battles
    for (let i = 0; i < battlesToInsert.length; i += 100) {
        const batch = battlesToInsert.slice(i, i + 100);
        await supabase.from('battles').insert(batch);
    }

    // Insert Options
    for (let i = 0; i < battleOptionsToInsert.length; i += 100) {
        const batch = battleOptionsToInsert.slice(i, i + 100);
        await supabase.from('battle_options').insert(batch);
    }

    console.log("🎉 All done! New catalog is deployed. You can now run the Brandfetch sync script.");
}

run().catch(console.error);


import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" // Service Role Key
);

async function run() {
    const { data: allOpts, error } = await sb.from('battle_options').select('battle_id, label');
    if (error) console.error("Error:", error);
    else {
        const dupes: Record<string, string[]> = {};
        const map = new Map<string, Set<string>>();
        allOpts?.forEach(o => {
            if (!map.has(o.battle_id)) map.set(o.battle_id, new Set());
            if (map.get(o.battle_id)?.has(o.label)) {
                if (!dupes[o.battle_id]) dupes[o.battle_id] = [];
                dupes[o.battle_id].push(o.label);
            }
            map.get(o.battle_id)?.add(o.label);
        });
        console.log("Found duplications:", Object.keys(dupes).length > 0 ? dupes : "None");
    }
}
run();

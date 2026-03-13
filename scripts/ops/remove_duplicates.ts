import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
  console.log("Iniciando eliminación de duplicados y batallas inválidas...");
  try {
    // Obtener TODAS las batallas activas con sus opciones
    const { data: options, error: optError } = await supabase
      .from('battle_options')
      .select('id, battle_id, brand_id, label');

    if (optError) throw optError;
    if (!options) return;

    // Agrupar opciones por batalla
    const battleMap = new Map<string, any[]>();
    for (const opt of options) {
      if (!battleMap.has(opt.battle_id)) battleMap.set(opt.battle_id, []);
      battleMap.get(opt.battle_id)!.push(opt);
    }

    const battlesToDelete = new Set<string>();
    const seenPairs = new Set<string>();

    for (const [battleId, opts] of battleMap.entries()) {
      if (opts.length !== 2) continue; // Si no tiene exactamente 2 opciones, la ignoramos o la borramos? Mejor la dejamos.

      const labelA = opts[0].label.toLowerCase().trim();
      const labelB = opts[1].label.toLowerCase().trim();

      // Regla 1: Mismo nombre "Coca Cola vs Coca Cola"
      if (labelA === labelB) {
        battlesToDelete.add(battleId);
        continue;
      }

      // Regla 2: Duplicada en general (mismo par de brand_ids o labels)
      // Usar labels para ser más estrictos
      const pairKey = [labelA, labelB].sort().join('_|_');
      if (seenPairs.has(pairKey)) {
        battlesToDelete.add(battleId);
      } else {
        seenPairs.add(pairKey);
      }
    }

    console.log(`Encontradas ${battlesToDelete.size} batallas para eliminar (duplicados o igual marca).`);

    if (battlesToDelete.size > 0) {
      const idsToDelete = Array.from(battlesToDelete);
      
      // Borrar instancias primero
      const { error: err1 } = await supabase.from('battle_instances').delete().in('battle_id', idsToDelete);
      if (err1) console.error("Error borrando inst", err1);
      
      // Borrar opciones
      const { error: err2 } = await supabase.from('battle_options').delete().in('battle_id', idsToDelete);
      if (err2) console.error("Error borrando opts", err2);

      // Borrar batalla
      const { error: err3 } = await supabase.from('battles').delete().in('id', idsToDelete);
      if (err3) console.error("Error borrando bats", err3);

      console.log(`Se eliminaron con éxito las ${idsToDelete.length} batallas duplicadas/inválidas.`);
    }

  } catch (error) {
    console.error("Error en removeDuplicates:", error);
  }
}

removeDuplicates();

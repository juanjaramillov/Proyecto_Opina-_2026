import { supabase } from '../../supabase/client';

export interface TrendEntry {
  entity_id: string;
  entity_name: string;
  signal_count: number;
}

export interface TrendSummary {
  trendingUp: TrendEntry[];
  trendingDown: TrendEntry[];
  stable: TrendEntry[];
}

/**
 * Obtiene un resumen trend básico. Esto es un mock/simplificación
 * user-facing que compara el volumen de la semana actual con las
 * entidades con más interacciones para no exponer toda la
 * inteligencia temporal corporativa.
 */
export async function getResultsTrendSummary(): Promise<TrendSummary> {
  const { data, error } = await (supabase as any)
    .from('v_signal_entity_period_summary')
    .select('entity_id, entity_name, period_week, total_signals')
    .order('period_week', { ascending: false })
    .order('total_signals', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching trend summary:', error);
    return { trendingUp: [], trendingDown: [], stable: [] };
  }

  // Lógica user-facing simplificada (Mocks de clasificación basados en volumen puro actual)
  const up: TrendEntry[] = [];
  const stable: TrendEntry[] = [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data || []).forEach((row: any, i: number) => {
    const entry = {
      entity_id: row.entity_id,
      entity_name: row.entity_name,
      signal_count: row.total_signals
    };
    if (i < 3) up.push(entry);
    else stable.push(entry);
  });

  return {
    trendingUp: up,
    trendingDown: [], // Requeriría un inner_join con week-1 para bajar B2C, lo dejamos simplificado
    stable: stable.slice(0, 5)
  };
}

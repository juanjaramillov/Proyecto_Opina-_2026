import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

// ----------------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------------

export interface LeaderboardEntry {
  entity_id: string;
  entity_name: string;
  wins_count: number;
  losses_count: number;
  total_comparisons: number;
  preference_share: number;
  win_rate: number;
}

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

export interface ComparisonSummary {
  message: string;
  isMajority: boolean;
  scoreMessage?: string;
}

export interface ModuleHighlight {
  module: 'Versus' | 'Progressive' | 'Depth' | 'Actualidad' | 'Pulse';
  title: string;
  description: string;
  value?: string;
}

// ----------------------------------------------------------------------------
// Central Metrics Service
// ----------------------------------------------------------------------------
// Capa analítica central que sirve como única fuente de verdad para componentes visulaes (B2C)
// Las consultas aquí emanan EXCLUSIVAMENTE de read_models oficiales.

export const metricsService = {
  
  /**
   * Obtiene el top de entidades mejor valoradas basándose en la vista
   * v_comparative_preference_summary limitando a las que tienen suficiente data.
   */
  async getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await (supabase as any)
      .from('v_comparative_preference_summary')
      .select('entity_id, entity_name, wins_count, losses_count, preference_share, win_rate, total_comparisons')
      .order('win_rate', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching results leaderboard', { domain: 'b2b_intelligence', origin: 'metricsService', action: 'fetch_leaderboard', state: 'failed' }, error);
      return [];
    }

    return (data as LeaderboardEntry[]) || [];
  },

  /**
   * Calcula el TrendSummary (Tracción) verificando el delta Week over Week.
   * Utiliza la vista SQL construida para este propósito.
   */
  async getTrendSummary(): Promise<TrendSummary> {
    const { data, error } = await (supabase as any)
      .from('v_trend_week_over_week')
      .select('entity_id, entity_name, current_signal_count, trend_status')
      .order('current_signal_count', { ascending: false });

    if (error || !data) {
      logger.error('Error fetching trend summary', { domain: 'b2b_intelligence', origin: 'metricsService', action: 'fetch_trend_summary', state: 'failed' }, error);
      return { trendingUp: [], trendingDown: [], stable: [] };
    }

    const summary: TrendSummary = { trendingUp: [], trendingDown: [], stable: [] };

    for (const row of data) {
      const entry: TrendEntry = {
        entity_id: row.entity_id,
        entity_name: row.entity_name,
        signal_count: row.current_signal_count
      };

      if (row.trend_status === 'acelerando') {
        summary.trendingUp.push(entry);
      } else if (row.trend_status === 'bajando') {
        summary.trendingDown.push(entry);
      } else if (row.trend_status === 'estable') {
        summary.stable.push(entry);
      }
      // Omitimos 'insuficiente' para no generar falsos positivos en pantallas B2C
    }

    return summary;
  },

  /**
   * Muestra al usuario cómo se compara su señal temporal actual o estática
   * con la agregación general B2C.
   */
  async getComparisonSummary(entityId?: string): Promise<ComparisonSummary | null> {
    if (!entityId) {
      return null;
    }

    const { data } = await (supabase as any)
      .from('v_comparative_preference_summary')
      .select('preference_share, wins_count, losses_count')
      .eq('entity_id', entityId)
      .single();

    if (!data) {
      return {
        message: "Aún estamos recopilando suficientes señales sobre tu entidad reciente.",
        isMajority: false
      };
    }

    const isMaj = data.preference_share > 50;
    
    return {
      message: isMaj 
        ? `Tu elección coincide con la mayoría (${data.preference_share}% de las veces prefiere esta opción).` 
        : `Tu preferencia fue minoritaria (sólo elegida un ${data.preference_share}% de las veces).`,
      isMajority: isMaj
    };
  },

  /**
   * Obtiene highlights resumidos por familia de señales para mostrar en Resultados B2C.
   */
  async getModuleHighlights(): Promise<ModuleHighlight[]> {
    const highlights: ModuleHighlight[] = [];

    // Highlight de Versus
    const { data: versusData } = await (supabase as any)
      .from('v_comparative_preference_summary')
      .select('entity_name, win_rate, preference_share')
      .order('win_rate', { ascending: false })
      .limit(1)
      .single();

    if (versusData) {
      highlights.push({
        module: 'Versus',
        title: 'Dominio de Preferencia',
        description: `${versusData.entity_name} lidera las comparaciones cruzadas.`,
        value: `${versusData.preference_share}% Win Share`
      });
    }

    // Highlight de Depth 
    const { data: depthData } = await (supabase as any)
      .from('v_depth_entity_question_summary')
      .select('entity_name, question_label, average_score')
      .not('average_score', 'is', null)
      .order('average_score', { ascending: false })
      .limit(1)
      .single();

    if (depthData) {
      highlights.push({
        module: 'Depth',
        title: 'Mejor Evaluado en Profundidad',
        description: `${depthData.entity_name} obitiene los promedios numéricos más altos.`,
        value: `Score: ${depthData.average_score}`
      });
    }

    return highlights;
  }
};

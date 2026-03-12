import { supabase } from '../../supabase/client';

export interface LeaderboardEntry {
  entity_id: string;
  entity_name: string;
  wins_count: number;
  losses_count: number;
  total_comparisons: number;
  preference_share: number;
  win_rate: number;
}

/**
 * Obtiene el top de entidades mejor valoradas basándose en la vista
 * v_comparative_preference_summary limitando a las que tienen suficiente data.
 */
export async function getResultsLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await (supabase as any)
    .from('v_comparative_preference_summary')
    .select('entity_id, entity_name, wins_count, losses_count, preference_share, win_rate, total_comparisons')
    .order('win_rate', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching results leaderboard:', error);
    return [];
  }

  return (data as LeaderboardEntry[]) || [];
}

import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';

export type UserLoyaltyStats = Database['public']['Tables']['user_loyalty_stats']['Row'] & {
  loyalty_levels: Database['public']['Tables']['loyalty_levels']['Row'] | null;
};
export type UserWallet = Database['public']['Tables']['user_wallets']['Row'];
export type WeeklyMission = Database['public']['Tables']['weekly_missions']['Row'];
export type UserMissionProgress = Database['public']['Tables']['user_weekly_mission_progress']['Row'];

/**
 * Retrieves the loyalty statistics for a given user, including their current level details.
 */
export async function getUserLoyaltyStats(userId: string): Promise<UserLoyaltyStats | null> {
  const { data, error } = await supabase
    .from('user_loyalty_stats')
    .select(`
      *,
      loyalty_levels (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    console.error('Error fetching loyalty stats:', error);
    return null;
  }

  return data as UserLoyaltyStats;
}

/**
 * Retrieves the current wallet balance for a given user.
 */
export async function getUserWallet(userId: string): Promise<UserWallet | null> {
  const { data, error } = await supabase
    .from('user_wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    console.error('Error fetching user wallet:', error);
    return null;
  }

  return data;
}

/**
 * Retrieves the active missions for the week and the user's progress against them.
 */
export async function getWeeklyMissionsProgress(userId: string) {
  // First, get all active missions
  const { data: missions, error: missionsError } = await supabase
    .from('weekly_missions')
    .select('*')
    .eq('is_active', true);

  if (missionsError || !missions) {
    console.error('Error fetching active missions:', missionsError);
    return [];
  }

  // Get the current week start date logic (same as DB logic)
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 is Monday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Then get user progress for this week
  const { data: progress, error: progressError } = await supabase
    .from('user_weekly_mission_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartStr);

  if (progressError) {
    console.error('Error fetching mission progress:', progressError);
  }

  // Map missions with their progress (defaulting to 0)
  return missions.map((mission) => {
    const userProgress = progress?.find((p) => p.mission_id === mission.id);
    return {
      ...mission,
      current_count: userProgress?.current_count || 0,
      is_completed: userProgress?.is_completed || false,
    };
  });
}

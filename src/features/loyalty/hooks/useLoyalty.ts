import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '../../../supabase/client';
import {
  getUserLoyaltyStats,
  getUserWallet,
  getWeeklyMissionsProgress,
  UserLoyaltyStats,
  UserWallet,
} from '../services/loyaltyService';

export function useLoyalty() {
  const { profile } = useAuth();
  
  const [stats, setStats] = useState<UserLoyaltyStats | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyaltyData = useCallback(async () => {
    // Relying on useAuth's profile to know if lightly authenticated
    if (!profile) {
      setStats(null);
      setWallet(null);
      setMissions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const [statsData, walletData, missionsData] = await Promise.all([
        getUserLoyaltyStats(user.id),
        getUserWallet(user.id),
        getWeeklyMissionsProgress(user.id),
      ]);

      setStats(statsData);
      setWallet(walletData);
      setMissions(missionsData);
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
      setError('Error al cargar la información de recompensas.');
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  return {
    stats,
    wallet,
    missions,
    isLoading,
    error,
    refreshLoyaltyData: fetchLoyaltyData,
  };
}

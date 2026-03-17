import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { ActionType } from '../../../components/ui/NextActionRecommendation';

export interface UserSignalActivity {
  id: string;
  module_type: string;
  entity_id?: string;
  entity_name?: string;
  created_at: string;
}

export interface UserComparisonInsight {
  entityName: string;
  userPrefers: boolean;
  majorityPrefers: boolean;
  preferenceShare: number;
}

export interface UserResultsSnapshot {
  totalSignals: number;
  recentActivity: UserSignalActivity[];
  topModules: { module_type: string; count: number }[];
  comparisons: UserComparisonInsight[];
  nextAction: ActionType;
  nextActionParams?: { text: string };
}

export const resultsReadService = {
  /**
   * Obtiene la foto completa de resultados para un usuario específico.
   * Centraliza las lecturas a DB evitando lógicas huérfanas en componentes.
   */
  async getUserResultsSnapshot(userId: string): Promise<UserResultsSnapshot> {
    if (!userId) {
      return this.getEmptySnapshot();
    }

    try {
      // 1. Total signals and top modules
      const { data: userStats, error: statsError } = await supabase
        .from('signal_events')
        .select('module_type', { count: 'exact' })
        .eq('user_id', userId);

      if (statsError) throw statsError;

      const totalSignals = userStats?.length || 0;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const moduleCounts = (userStats || []).reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.module_type] = (acc[curr.module_type] || 0) + 1;
        return acc;
      }, {});

      const topModules = Object.entries(moduleCounts)
        .map(([module_type, count]) => ({ module_type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // 2. Recent activity for Evolution Timeline
      const { data: recentSignals, error: recentError } = await supabase
        .from('signal_events')
        .select('id, module_type, entity_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // Enrich recent signals with names (basic fetch, can be optimized later)
      const entityIds = (recentSignals || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((s: any) => s.entity_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((id: any): id is string => !!id);
        
      let entityNames: Record<string, string> = {};
      if (entityIds.length > 0) {
         const { data: entities } = await supabase
           .from('signal_entities')
           .select('id, display_name')
           .in('id', entityIds);
           
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         entityNames = (entities || []).reduce((acc: Record<string, string>, curr: any) => {
           acc[curr.id] = curr.display_name;
           return acc;
         }, {} as Record<string, string>);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recentActivity: UserSignalActivity[] = (recentSignals || []).map((s: any) => ({
        id: s.id,
        module_type: s.module_type || 'versus',
        entity_id: s.entity_id || undefined,
        entity_name: s.entity_id ? entityNames[s.entity_id] : undefined,
        created_at: s.created_at
      }));

      // 3. Comparisons for the latest Versus signals
      const versusSignals = recentActivity.filter(s => s.module_type === 'versus' && s.entity_id).slice(0, 5);
      const comparisons: UserComparisonInsight[] = [];
      
      if (versusSignals.length > 0) {
        const vEntityIds = versusSignals.map(s => s.entity_id as string);
        const { data: comparisonsData } = await supabase
          .from('v_comparative_preference_summary')
          .select('entity_id, entity_name, preference_share')
          .in('entity_id', vEntityIds);
          
         if (comparisonsData) {
           for (const vs of versusSignals) {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const comp = comparisonsData.find((c: any) => c.entity_id === vs.entity_id);
             if (comp) {
               const prefShare = comp.preference_share || 0;
               comparisons.push({
                 entityName: comp.entity_name || vs.entity_name || 'Opción',
                 userPrefers: true, // Assuming the event signals preference
                 majorityPrefers: prefShare >= 50,
                 preferenceShare: prefShare
               });
             }
           }
         }
      }

      // 4. Next Action logic
      let nextAction: ActionType = 'versus';
      let actionText = 'Volver a Versus';
      
      if (totalSignals === 0) {
        nextAction = 'versus';
        actionText = 'Comienza a opinar';
      } else if (!moduleCounts['actualidad']) {
        nextAction = 'results'; // Route to actualidad / signals
        actionText = 'Prueba Actualidad';
      } else if (!topModules.some(m => m.module_type === 'torneo')) {
         nextAction = 'versus'; // Route to tournament
         actionText = 'Prueba un Torneo';
      } else {
        nextAction = 'profile';
        actionText = 'Completa tu Perfil';
      }

      return {
        totalSignals,
        recentActivity,
        topModules,
        comparisons,
        nextAction,
        nextActionParams: { text: actionText }
      };

    } catch (error) {
      logger.error('Error fetching user results snapshot', { domain: 'b2c_results', origin: 'resultsReadService', action: 'fetch_snapshot', state: 'failed' }, error);
      return this.getEmptySnapshot();
    }
  },

  getEmptySnapshot(): UserResultsSnapshot {
    return {
      totalSignals: 0,
      recentActivity: [],
      topModules: [],
      comparisons: [],
      nextAction: 'versus'
    };
  }
};

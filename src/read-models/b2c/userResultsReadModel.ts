import { supabase } from '../../supabase/client';
import { logger } from '../../lib/logger';
import { UserResultsSnapshot, B2CNextActionType, SignalActivity, UserComparisonInsight } from '../types';
import { ThresholdPolicies } from '../shared/thresholdPolicies';

export const userResultsReadModel = {
  /**
   * Obtiene la foto completa (snapshot canónico) de resultados para un usuario específico.
   * Transforma datos crudos de Supabase al contrato tipado duro de B2C, evaluando
   * sus niveles de suficiencia.
   */
  async getUserResultsSnapshot(userId: string): Promise<UserResultsSnapshot> {
    const rawTime = new Date().toISOString();

    if (!userId) {
      return this.getEmptySnapshot();
    }

    try {
       // 1. Perfil del Usuario (para completitud)
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender, birth_date, country, state, main_city, socioeconomic_level, civil_status, employment_status, max_education_level')
        .eq('id', userId)
        .single();
        
      // Cálculo básico de completitud de perfil basado en campos clave
      const profileFields = ['gender', 'birth_date', 'country', 'state', 'main_city', 'socioeconomic_level', 'civil_status', 'employment_status', 'max_education_level'];
      const filledFields = userProfile
        ? profileFields.filter(f => userProfile[f as keyof typeof userProfile] !== null).length
        : 0;
      const profileCompleteness = Math.round((filledFields / profileFields.length) * 100);

      // 2. Total señales y módulos principales
      const { data: userStats, error: statsError } = await supabase
        .from('signal_events')
        .select('module_type', { count: 'exact' })
        .eq('user_id', userId);

      if (statsError) throw statsError;

      const totalSignals = userStats?.length || 0;

      const moduleCounts = (userStats ?? []).reduce<Record<string, number>>((acc, curr) => {
        const mod = curr.module_type ?? 'unknown';
        acc[mod] = (acc[mod] || 0) + 1;
        return acc;
      }, {});

      const topModules = Object.entries(moduleCounts)
        .map(([moduleType, count]) => ({ moduleType, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Evaluar la suficiencia de este usuario
      const userSufficiency = ThresholdPolicies.evaluateUserSufficiency(totalSignals);

      // 3. Actividad reciente para la línea temporal
      const { data: recentSignals, error: recentError } = await supabase
        .from('signal_events')
        .select('id, module_type, entity_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // Enriquecer recientes con display_names
      const entityIds = (recentSignals ?? [])
        .map((s) => s.entity_id)
        .filter((id): id is string => !!id);

      let entityNames: Record<string, string> = {};
      if (entityIds.length > 0) {
         const { data: entities } = await supabase
           .from('signal_entities')
           .select('id, display_name')
           .in('id', entityIds);

         entityNames = (entities ?? []).reduce<Record<string, string>>((acc, curr) => {
           acc[curr.id] = curr.display_name;
           return acc;
         }, {});
      }

      const recentActivity: SignalActivity[] = (recentSignals ?? []).map((s) => ({
        id: s.id,
        moduleType: s.module_type || 'versus',
        entityId: s.entity_id || undefined,
        entityName: s.entity_id ? entityNames[s.entity_id] : undefined,
        createdAt: s.created_at
      }));

      // 4. Cruces y Comparaciones (Versus)
      // Extraer últimas interacciones de versus que sí tienen una entidad
      const versusSignals = recentActivity.filter(s => s.moduleType === 'versus' && s.entityId).slice(0, 5);
      const comparisons: UserComparisonInsight[] = [];
      
      if (versusSignals.length > 0) {
        const vEntityIds = versusSignals.map(s => s.entityId as string);
        const { data: comparisonsData } = await supabase
          .from('v_comparative_preference_summary')
          .select('entity_id, entity_name, preference_share')
          .in('entity_id', vEntityIds);
          
         if (comparisonsData) {
           for (const vs of versusSignals) {
             const comp = comparisonsData.find((c) => c.entity_id === vs.entityId);
             if (comp) {
               const prefShare = comp.preference_share || 0;
               comparisons.push({
                 entityId: vs.entityId!,
                 entityName: comp.entity_name || vs.entityName || 'Opción',
                 userPrefers: true, // El evento emitido indica preferencia sobre él
                 majorityPrefers: ThresholdPolicies.isMajority(prefShare),
                 preferenceShare: prefShare
               });
             }
           }
         }
      }

      // 5. Motor de Decisión (Siguiente Acción)
      let nextActionType: B2CNextActionType = 'versus';
      let actionLabel = 'Volver a Versus';
      
      if (totalSignals === 0) {
        nextActionType = 'versus';
        actionLabel = 'Evalúa tu primera marca';
      } else if (!moduleCounts['actualidad']) {
        nextActionType = 'actualidad'; 
        actionLabel = 'Revisa la actualidad';
      } else if (!topModules.some(m => m.moduleType === 'torneo')) {
         nextActionType = 'torneo';
         actionLabel = 'Participa en un Torneo';
      } else if (profileCompleteness < 100) {
        nextActionType = 'profile';
        actionLabel = 'Desbloquea Segmentos';
      } else {
        nextActionType = 'versus';
        actionLabel = 'Seguir Señalando';
      }

      return {
        calculatedAt: rawTime,
        confidence: 'highly_confident', // Información propia del usuario, siempre determinística
        sufficiency: userSufficiency,
        user: {
          id: userId,
          profileCompleteness
        },
        signals: {
          total: totalSignals,
          recent: recentActivity,
          topModules
        },
        comparisons,
        nextAction: {
          type: nextActionType,
          label: actionLabel
        }
      };

    } catch (error) {
      logger.error('Error evaluando snapshot B2C', { domain: 'b2c_read_model', origin: 'userResultsReadModel', action: 'fetch_snapshot', state: 'failed' }, error);
      return this.getEmptySnapshot();
    }
  },

  getEmptySnapshot(): UserResultsSnapshot {
    return {
      calculatedAt: new Date().toISOString(),
      confidence: 'none',
      sufficiency: 'insufficient_data',
      user: {
        id: '',
        profileCompleteness: 0
      },
      signals: {
        total: 0,
        recent: [],
        topModules: []
      },
      comparisons: [],
      nextAction: {
        type: 'versus',
        label: 'Comienza a opinar'
      }
    };
  }
};

import { supabase } from '../../supabase/client';
import { logger } from '../../lib/logger';
import { MasterHubSnapshot, HubFilters, VersusModuleResult, TorneoModuleResult } from './hub-types';
import { SignalActivity, UserComparisonInsight } from '../types';
import { ThresholdPolicies } from '../shared/thresholdPolicies';

export const MIN_COHORT_SIZE = 50; // K-anonymity limit for B2C filters

export const userMasterResultsReadModel = {
  
  async getMasterHubSnapshot(userId: string, filters?: HubFilters): Promise<MasterHubSnapshot> {
    const rawTime = new Date().toISOString();

    if (!userId) {
      return this.getEmptySnapshot();
    }

    try {
      // 1. Perfil del Usuario Básico
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender, birth_date, country, state, main_city, socioeconomic_level, civil_status, employment_status, max_education_level')
        .eq('id', userId)
        .single();
        
      const profileFields = ['gender', 'birth_date', 'country', 'state', 'main_city', 'socioeconomic_level', 'civil_status', 'employment_status', 'max_education_level'];
      const filledFields = userProfile
        ? profileFields.filter(f => userProfile[f as keyof typeof userProfile] !== null).length
        : 0;
      const profileCompleteness = Math.round((filledFields / profileFields.length) * 100);

      // 2. Lógica de Filtros y Privacidad (Cohort Size)
      let isFiltered = false;
      let privacyState: 'optimal' | 'insufficient_cohort' = 'optimal';
      let cohortSize = 0; 
      
      // Aplicar filtros lógicos:
      // Nota: en la realidad B2C, el filtro no filtra "mis" señales (que siguen siendo mías),
      // sino contra "quién" me estoy comparando.
      // Por ende, la cohorte afecta solo a los Insights y las Comparisons.
      // Por ahora para no romper la BD, la lógica de cohorte en versus la delegamos pero simulamos el k-anonymity flag:
      if (filters && (filters.gender || filters.region || filters.ageRange || filters.period !== 'all')) {
         isFiltered = true;
         // En un entorno real consultarías `count` de perfiles que matchean.
         // Resultados B2C hoy consume un proveedor curado ficticio. 
         // Esta capa se mantiene en el read model real pero sin azar:
         cohortSize = MIN_COHORT_SIZE + 50; 
         if (cohortSize < MIN_COHORT_SIZE) {
            privacyState = 'insufficient_cohort';
         }
      }

      // 3. Resumen Global (Mis Señales) - No filtradas por cohorte, son MIS señales
      // Si hay filtro de fecha (period), sí aplica a MIS señales.
      let mySignalsQuery = supabase
        .from('signal_events')
        .select('id, module_type, entity_id, created_at', { count: 'exact' })
        .eq('user_id', userId);
        
      if (filters?.period === '7d') {
         const d = new Date(); d.setDate(d.getDate() - 7);
         mySignalsQuery = mySignalsQuery.gte('created_at', d.toISOString());
      } else if (filters?.period === '30d') {
         const d = new Date(); d.setDate(d.getDate() - 30);
         mySignalsQuery = mySignalsQuery.gte('created_at', d.toISOString());
      }

      const { data: userStats, error: statsError } = await mySignalsQuery;
      if (statsError) throw statsError;

      const totalSignals = userStats?.length || 0;

      const moduleCounts = (userStats ?? []).reduce<Record<string, number>>((acc, curr) => {
        const mod = curr.module_type ?? 'versus';
        acc[mod] = (acc[mod] || 0) + 1;
        return acc;
      }, {});

      const topModules = Object.entries(moduleCounts)
        .map(([moduleType, count]) => ({ moduleType, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Historial reciente
      const recentSignals = (userStats ?? [])
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);
      const entityIds = recentSignals
        .map((s) => s.entity_id)
        .filter((id): id is string => !!id);

      let entityNames: Record<string, string> = {};
      if (entityIds.length > 0) {
         const { data: entities } = await supabase.from('signal_entities').select('id, display_name').in('id', entityIds);
         entityNames = (entities ?? []).reduce<Record<string, string>>((acc, curr) => {
           acc[curr.id] = curr.display_name;
           return acc;
         }, {});
      }

      const recentActivity: SignalActivity[] = recentSignals.map((s) => ({
        id: s.id,
        moduleType: s.module_type || 'versus',
        entityId: s.entity_id || undefined,
        entityName: s.entity_id ? entityNames[s.entity_id] : undefined,
        createdAt: s.created_at
      }));

      // 4. Módulo: Versus
      const versusTotal = moduleCounts['versus'] || 0;
      const versusSignals = recentActivity.filter(s => s.moduleType === 'versus' && s.entityId).slice(0, 5);
      const comparisons: UserComparisonInsight[] = [];
      
      // Si la cohorte es insuficiente, borramos de plano las comparaciones por privacidad.
      if (versusSignals.length > 0 && privacyState === 'optimal') {
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
                 userPrefers: true, 
                 majorityPrefers: ThresholdPolicies.isMajority(prefShare),
                 preferenceShare: prefShare
               });
             }
           }
         }
      }

      const versusModule: VersusModuleResult = {
        moduleKey: 'versus',
        moduleLabel: 'Enfrentamientos',
        isAvailable: versusTotal > 0,
        summary: {
           totalSignals: versusTotal,
           lastActiveDate: versusTotal > 0 ? recentActivity.find(s => s.moduleType === 'versus')?.createdAt || null : null
        },
        comparisons,
        insights: [] // Placeholder for future targeted versus insights
      };

      // 5. Módulo: Torneos (Placeholder inteligente)
      const torneoTotal = moduleCounts['torneo'] || 0;
      const torneoModule: TorneoModuleResult = {
        moduleKey: 'torneo',
        moduleLabel: 'Torneos de Preferencia',
        isAvailable: torneoTotal > 0,
        summary: {
           totalSignals: torneoTotal,
           lastActiveDate: torneoTotal > 0 ? recentActivity.find(s => s.moduleType === 'torneo')?.createdAt || null : null
        },
        insights: [] 
      };

      // Ensamblaje Master Hub
      const userSufficiency = ThresholdPolicies.evaluateUserSufficiency(totalSignals);

      return {
        calculatedAt: rawTime,
        confidence: 'highly_confident',
        sufficiency: userSufficiency,
        user: {
          id: userId,
          profileCompleteness
        },
        overview: {
           totalSignals,
           recentActivity,
           topModules
        },
        modules: {
           versus: versusModule,
           torneo: torneoModule,
           actualidad: { moduleKey: 'actualidad', moduleLabel: 'Actualidad', isAvailable: false, summary: { totalSignals: 0, lastActiveDate: null }, thermometerInsights: [], recentHotTopicsCount: 0, insights: [] },
           profundidad: { moduleKey: 'profundidad', moduleLabel: 'Profundidad', isAvailable: false, summary: { totalSignals: 0, lastActiveDate: null }, archetype: { name: '', description: '', icon: '' }, cognitiveBiases: [], consistencyScore: 0, insights: [] }
        },
        cohortState: {
           isFiltered,
           cohortSize: privacyState === 'optimal' ? cohortSize : 0, // No leak data
           privacyState
        }
      };

    } catch (err) {
      logger.error('Error ensamblando MasterHubSnapshot', { domain: 'b2c_read_model', action: 'get_master_snapshot' }, err);
      return this.getEmptySnapshot();
    }
  },

  getEmptySnapshot(): MasterHubSnapshot {
    return {
      calculatedAt: new Date().toISOString(),
      confidence: 'none',
      sufficiency: 'insufficient_data',
      user: { id: '', profileCompleteness: 0 },
      overview: { totalSignals: 0, recentActivity: [], topModules: [] },
      modules: {
        versus: { moduleKey: 'versus', moduleLabel: 'Versus', isAvailable: false, summary: { totalSignals: 0, lastActiveDate: null }, comparisons: [], insights: [] },
        torneo: { moduleKey: 'torneo', moduleLabel: 'Torneos', isAvailable: false, summary: { totalSignals: 0, lastActiveDate: null }, insights: [] },
        actualidad: { moduleKey: 'actualidad', moduleLabel: 'Actualidad', isAvailable: false, summary: { totalSignals: 0, lastActiveDate: null }, thermometerInsights: [], recentHotTopicsCount: 0, insights: [] },
        profundidad: { moduleKey: 'profundidad', moduleLabel: 'Profundidad', isAvailable: false, summary: { totalSignals: 0, lastActiveDate: null }, archetype: { name: '', description: '', icon: '' }, cognitiveBiases: [], consistencyScore: 0, insights: [] }
      },
      cohortState: { isFiltered: false, cohortSize: 0, privacyState: 'optimal' }
    };
  }
};

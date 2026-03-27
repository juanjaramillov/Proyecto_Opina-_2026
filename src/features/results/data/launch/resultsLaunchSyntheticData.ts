import { MasterHubSnapshot, HubFilters } from '../../../../read-models/b2c/hub-types';
import { WithLaunchSyntheticMeta } from '../../../shared/types/launchSynthetic';

export function getLaunchSyntheticMasterHubSnapshot(userId: string, filters?: HubFilters): WithLaunchSyntheticMeta<MasterHubSnapshot> {
  const rawTime = new Date().toISOString();

  if (!userId) {
    return getEmptySnapshot();
  }

  // 1. Perfil Completo Plausible
  const profileCompleteness = 100;

  // 2. Lógica de Filtros y Privacidad Determinista
  let isFiltered = false;
  let privacyState: 'optimal' | 'insufficient_cohort' = 'optimal';
  let cohortSize = 14500; // Baseline amplio

  if (filters && Object.keys(filters).length > 0) {
    isFiltered = true;
    
    // Reglas deterministas simples para k-anonymity:
    // Contamos cuántas dimensiones de filtro se aplican
    let activeFiltersCount = 0;
    if (filters.gender) activeFiltersCount++;
    if (filters.ageRange) activeFiltersCount++;
    if (filters.region) activeFiltersCount++;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('socioeconomicLevel' in filters && (filters as any).socioeconomicLevel) activeFiltersCount++;
    if (filters.period && filters.period !== 'all') activeFiltersCount++;
    if (filters.generation && filters.generation !== 'ALL') activeFiltersCount++;

    // Reducción sistemática de cohorte
    if (activeFiltersCount === 1) cohortSize = 3200;
    else if (activeFiltersCount === 2) cohortSize = 850;
    else if (activeFiltersCount >= 3) cohortSize = 42; // Cae por debajo del umbral de anonimato

    // Si además el filtro de fecha es restrictivo, se reduce drásticamente
    if (filters.period === '7d' && activeFiltersCount >= 2) {
       cohortSize = 15;
    }

    if (cohortSize < 50) { // MIN_COHORT_SIZE = 50 
      privacyState = 'insufficient_cohort';
    }
  }

  // Si privacyState === 'insufficient_cohort', oculta la data de cohortSize real 
  // (por protección de privacidad k-anonymity)
  const safeCohortSize = privacyState === 'optimal' ? cohortSize : 0;

  // 3. Resumen Global Curado (Mis Señales)
  const totalSignals = 142;
  const topModules = [
    { moduleType: 'versus', count: 85 },
    { moduleType: 'torneo', count: 32 },
    { moduleType: 'actualidad', count: 18 },
    { moduleType: 'profundidad', count: 7 }
  ];

  const recentActivity = [
    { id: '1', moduleType: 'versus', entityName: 'Tesla vs Waymo', createdAt: rawTime },
    { id: '2', moduleType: 'actualidad', entityName: 'Reforma Laboral 2026', createdAt: new Date(Date.now() - 3600000).toISOString() }, // Hace 1h
    { id: '3', moduleType: 'torneo', entityName: 'Top Tech Brands Q1', createdAt: new Date(Date.now() - 86400000).toISOString() }, // Hace 1D
    { id: '4', moduleType: 'profundidad', entityName: 'Sostenibilidad Corporativa', createdAt: new Date(Date.now() - 172800000).toISOString() }, // Hace 2D
    { id: '5', moduleType: 'versus', entityName: 'Apple vs Samsung', createdAt: new Date(Date.now() - 259200000).toISOString() } // Hace 3D
  ];

  // 3.5. Motor Editorial V4.5 (Dinámico según generación/filtros)
  const isGenFilterActive = filters?.generation && filters.generation !== 'ALL';
  const genName = isGenFilterActive ? filters.generation : 'el ecosistema global';
  
  const editorial = {
    mainInsight: {
      headline: isGenFilterActive 
        ? `Tensión crítica en ${genName} frente a nuevas regulaciones.`
        : "Polarización tecnológica marca la tendencia de la semana.",
      subtitle: isGenFilterActive
        ? `Hemos detectado una alineación inusual de posturas en esta generación, divergiendo un 45% del consenso general en temas regulatorios.`
        : "La fricción entre posturas sobre IA y sostenibilidad alcanza un pico histórico de 82% en el nodo de actualidad, re-escribiendo el mapa de preferencias."
    },
    secondaryInsights: [
      {
        type: 'consensus' as const,
        title: 'Estado del Consenso',
        value: isGenFilterActive ? 'Alta Fricción' : 'Fracturado'
      },
      {
        type: 'module' as const,
        title: 'Nodo Dominante',
        value: 'Enfrentamientos'
      }
    ],
    ecosystemTension: isGenFilterActive ? 85 : 68
  };

  // 4. Módulo: Versus
  const versusModule = {
    moduleKey: 'versus' as const,
    moduleLabel: 'Enfrentamientos',
    isAvailable: true,
    summary: {
      totalSignals: 85,
      lastActiveDate: recentActivity[0].createdAt
    },
    comparisons: privacyState === 'optimal' ? [
        {
            entityId: 'e1',
            entityName: 'Apple',
            userPrefers: true,
            majorityPrefers: true,
            preferenceShare: 68
        },
        {
            entityId: 'e2',
            entityName: 'Nike',
            userPrefers: true,
            majorityPrefers: false,
            preferenceShare: 42
        },
        {
            entityId: 'e3',
            entityName: 'Tesla',
            userPrefers: false,
            majorityPrefers: true,
            preferenceShare: 55
        }
    ] : [],
    insights: [] // Opcional
  };

  // 5. Módulo: Torneos
  const torneoModule = {
     moduleKey: 'torneo' as const,
     moduleLabel: 'Torneos de Preferencia',
     isAvailable: true,
     summary: {
       totalSignals: 32,
       lastActiveDate: recentActivity[2].createdAt
     },
     insights: privacyState === 'optimal' ? [
         {
             segmentName: 'Comunidad',
             finding: "Tu perfil valora fuertemente la Innovación Técnica, ubicándola en tus Top 3 criterios de victoria consistentemente.",
             confidence: 'highly_confident' as const,
             relevanceMetric: 82, 
             insightType: 'strength'
         }
     ] : []
  };

  // 6. Módulo: Actualidad
  const actualidadModule = {
      moduleKey: 'actualidad' as const,
      moduleLabel: 'Actualidad Mensual',
      isAvailable: true,
      summary: {
          totalSignals: 18,
          lastActiveDate: recentActivity[1].createdAt
      },
      thermometerInsights: privacyState === 'optimal' ? [
          {
              label: 'Reforma Laboral',
              polarizationScore: 85,
              userPosition: 'A Favor',
              communityPosition: 'Dividido'
          },
          {
              label: 'Impuesto Verde Automotriz',
              polarizationScore: 30,
              userPosition: 'En Contra',
              communityPosition: 'En Contra'
          }
      ] : [],
      recentHotTopicsCount: 2,
      insights: privacyState === 'optimal' ? [
          {
              segmentName: 'Comunidad',
              finding: "Tus posturas en áreas regulatorias son más conservadoras que el 65% de tu cohorte.",
              confidence: 'confident' as const,
              relevanceMetric: 65, 
              insightType: 'divergent'
          }
      ] : []
  };

  // 7. Módulo: Profundidad
  const profundidadModule = {
      moduleKey: 'profundidad' as const,
      moduleLabel: 'Estudio de Casos',
      isAvailable: true,
      summary: {
         totalSignals: 7,
         lastActiveDate: recentActivity[3].createdAt
      },
      archetype: {
         name: "Analista Pragmático",
         description: "Tiendes a priorizar el valor práctico y el rendimiento demostrado antes que las promesas futuras o narrativas idealistas.",
         icon: "psychology"
      },
      cognitiveBiases: [
        { id: "bias_1", name: "Sesgo de Status Quo leve", description: "Preferencia por el estado actual de las cosas.", intensity: 30, type: "primary" as const, icon: "anchor", color: "blue" },
        { id: "bias_2", name: "Aversión al riesgo moderada", description: "Preferencia por evitar pérdidas sobre adquirir ganancias.", intensity: 50, type: "secondary" as const, icon: "shield", color: "orange" }
      ],
      consistencyScore: 88,
      insights: privacyState === 'optimal' ? [
          {
             segmentName: 'Comunidad',
             finding: "Has demostrado una consistencia excepcionalmente alta (88%) entre tus decisiones rápidas (Versus) y tus posturas de fondo argumentadas.",
             confidence: 'highly_confident' as const,
             relevanceMetric: 88, 
             insightType: 'strength'
          }
      ] : []
  };

  return {
    _meta: {
      origin: "launch_synthetic",
      scenarioId: "results_launch_v1",
      removable: true,
      seededBy: "frontend_launch_layer",
      notes: "Capa oficial centralizada para poblar Results en modo launch_synthetic"
    },
    calculatedAt: rawTime,
    confidence: 'highly_confident',
    sufficiency: 'sufficient_data',
    user: {
      id: userId,
      profileCompleteness
    },
    overview: {
      totalSignals,
      recentActivity,
      topModules
    },
    editorial,
    modules: {
      versus: versusModule,
      torneo: torneoModule,
      actualidad: actualidadModule,
      profundidad: profundidadModule
    },
    cohortState: {
      isFiltered,
      cohortSize: safeCohortSize,
      privacyState
    }
  };
}

function getEmptySnapshot(): WithLaunchSyntheticMeta<MasterHubSnapshot> {
    return {
      _meta: {
        origin: "launch_synthetic",
        scenarioId: "results_launch_v1",
        removable: true,
        seededBy: "frontend_launch_layer"
      },
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

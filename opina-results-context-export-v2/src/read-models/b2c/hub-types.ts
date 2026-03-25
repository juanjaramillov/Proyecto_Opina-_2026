import { BaseSnapshot, DemographicInsight, UserComparisonInsight, SignalActivity, TrendSummary } from '../types';

// ---------------------------------------------------------
// Contratos Universales de Módulos (Hub B2C)
// ---------------------------------------------------------

export interface BaseModuleResult {
  moduleKey: string;
  moduleLabel: string;
  isAvailable: boolean; // Si el usuario tiene suficiente data para ver este módulo
  summary: {
    totalSignals: number;
    lastActiveDate: string | null;
  };
  trendStats?: TrendSummary; // Tendencias específicas del módulo (opcional por ahora)
  insights: DemographicInsight[];
}

export interface VersusModuleResult extends BaseModuleResult {
  moduleKey: 'versus';
  comparisons: UserComparisonInsight[];
  // Podríamos añadir más específicas, ej:
  // polarizingMatches: ...
}

export interface TorneoModuleResult extends BaseModuleResult {
  moduleKey: 'torneo';
  // Ejemplo futuro:
  // frequentlyEliminated: string[];
  // consistentWinners: string[];
}

export interface ThermometricInsight {
  topic: string;
  userStance: 'for' | 'against' | 'neutral';
  consensusPercentage: number;
  consensusStance: 'for' | 'against' | 'neutral';
  divergenceLevel: 'high' | 'medium' | 'low';
  description: string;
}

export interface ActualidadModuleResult extends BaseModuleResult {
  moduleKey: 'actualidad';
  thermometerInsights: ThermometricInsight[];
  recentHotTopicsCount: number;
}

export interface CognitiveBias {
  id: string;
  name: string;
  description: string;
  intensity: number; // 0 to 100
  type: 'primary' | 'secondary' | 'low';
  icon: string;
  color: string;
}

export interface ProfundidadModuleResult extends BaseModuleResult {
  moduleKey: 'profundidad';
  archetype: {
    name: string;
    description: string;
    icon: string;
  };
  cognitiveBiases: CognitiveBias[];
  consistencyScore: number; // 0 to 100
}


// ---------------------------------------------------------
// Filtros Demográficos (B2C)
// ---------------------------------------------------------

export interface HubFilters {
  period?: '7d' | '30d' | 'all';
  gender?: 'male' | 'female' | 'other' | null;
  ageRange?: string | null; // e.g., '18-24'
  generation?: 'ALL' | 'BOOMERS' | 'GEN_X' | 'MILLENNIALS' | 'GEN_Z';
  region?: string | null;
}

// ---------------------------------------------------------
// Mega-Snapshot del Hub Maestro
// ---------------------------------------------------------

export interface MasterHubSnapshot extends BaseSnapshot {
  user: {
    id: string;
    profileCompleteness: number;
  };
  
  // Vista General Transversal
  overview: {
    totalSignals: number;
    recentActivity: SignalActivity[];
    topModules: { moduleType: string; count: number }[];
  };

  // Motor Editorial V4.5
  editorial?: {
    mainInsight: {
      headline: string;
      subtitle: string;
    };
    secondaryInsights: {
      type: 'consensus' | 'trend' | 'module';
      title: string;
      value: string;
    }[];
    ecosystemTension: number; // 0 a 100
  };

  // Módulos Individuales
  modules: {
    versus: VersusModuleResult;
    torneo: TorneoModuleResult;
    actualidad: ActualidadModuleResult;
    profundidad: ProfundidadModuleResult;
  };

  // Estado del Filtro y Privacidad
  cohortState: {
    isFiltered: boolean;
    cohortSize: number;
    privacyState: 'optimal' | 'insufficient_cohort'; // k-anonymity
  };
}

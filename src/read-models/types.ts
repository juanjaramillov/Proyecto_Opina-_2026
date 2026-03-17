export type ConfidenceLevel = 'none' | 'exploratory' | 'confident' | 'highly_confident';
export type SufficiencyState = 'insufficient_data' | 'partial_data' | 'sufficient_data';

export interface BaseSnapshot {
  calculatedAt: string;
  confidence: ConfidenceLevel;
  sufficiency: SufficiencyState;
}

// ---------------------------------------------------------
// Tipos de Dominio Comunes
// ---------------------------------------------------------

export interface SignalActivity {
  id: string;
  moduleType: string;
  entityId?: string;
  entityName?: string;
  createdAt: string;
}

export interface UserComparisonInsight {
  entityId: string;
  entityName: string;
  userPrefers: boolean;
  majorityPrefers: boolean; // Computed purely by the policy
  preferenceShare: number;
}

export interface DemographicInsight {
  segmentName: string;
  finding: string;
  confidence: ConfidenceLevel;
}

// ---------------------------------------------------------
// B2C Snapshots (User Results)
// ---------------------------------------------------------

export type CanonicalModuleType = 'versus' | 'torneo' | 'actualidad' | 'profundidad';
export type B2CNextActionType = CanonicalModuleType | 'profile';

export function isCanonicalModuleType(raw: string): raw is CanonicalModuleType {
  return ['versus', 'torneo', 'actualidad', 'profundidad'].includes(raw);
}

export function normalizeModuleType(raw: string): CanonicalModuleType {
  const lower = raw.toLowerCase().trim();
  
  if (lower === 'tournament') return 'torneo';
  if (lower === 'experience' || lower === 'signals') return 'versus';

  if (isCanonicalModuleType(lower)) {
    return lower;
  }
  
  throw new Error(`Invalid module type: ${raw} does not match any CanonicalModuleType`);
}

export interface UserResultsSnapshot extends BaseSnapshot {
  user: {
    id: string;
    profileCompleteness: number; // Porcentaje 0-100
  };
  signals: {
    total: number;
    recent: SignalActivity[];
    topModules: { moduleType: string; count: number }[];
  };
  comparisons: UserComparisonInsight[];
  nextAction: {
    type: B2CNextActionType;
    label: string;
  };
}

// ---------------------------------------------------------
// B2B Snapshots (Platform & Analytics)
// ---------------------------------------------------------

export interface LeaderboardEntry {
  entityId: string;
  entityName: string;
  winRate: number;    // 0.0 - 1.0
  winsCount: number;
  totalComparisons: number;
}

export interface TrendEntry {
  entityId: string;
  entityName: string;
  signalCount: number;
}

export interface TrendSummary {
  trendingUp: TrendEntry[];
  trendingDown: TrendEntry[];
  stable: TrendEntry[];
}

export interface PlatformOverviewSnapshot extends BaseSnapshot {
  globalStats: {
    totalSignalsProcessed: number;
    activeUsers24h: number; // Updated to 24h as per UI needs
  };
  leaderboardTop10: LeaderboardEntry[];
  demographicInsights: DemographicInsight[];
  trendSummary: TrendSummary;
}

// src/domain/entitlements.ts

export type UserRole = 'guest' | 'user' | 'company' | 'admin';

/**
 * Canon v4 (alineado a useVerificationStatus.ts):
 * - unverified: sin identidad
 * - verified_basic: identidad ligera (email + mínimos)
 * - pending: en revisión
 * - verified_strong: CI/ClaveÚnica/DNI verificado => ILIMITADAS
 */
export type VerificationStatus = 'unverified' | 'verified_basic' | 'pending' | 'verified_strong';

export type ProfileCompleteness = {
  hasName: boolean;
  hasBirthdate: boolean;
  hasGender: boolean;
  hasRegion: boolean;
  hasComuna: boolean;
  hasEmail: boolean;
};

export type Entitlements = {
  role: UserRole;

  // Si es unlimited: maxSignalsPerDay = -1, signalsLeftToday = 999999
  maxSignalsPerDay: number;
  signalsLeftToday: number;
  isUnlimitedSignals: boolean;

  canAccessApp: boolean;
  canVote: boolean;

  canAccessMySignal: boolean;
  canAccessRadiografias: boolean;
  canAccessResults: boolean;
  canAccessCompanyDashboard: boolean;

  // compat UI: algunos lugares usan isVerified
  // aquí lo dejamos como “strong”
  isVerified: boolean;

  verificationStatus: VerificationStatus;
  isVerifiedBasic: boolean;
  isVerifiedStrong: boolean;

  profile: ProfileCompleteness;
  profileCompletenessPct: number;

  canEditAnswers: boolean;
  canSeeAdvancedFilters: boolean;

  nextUnlockHint?: string;
  unlocked: string[];
};

type ComputeEntitlementsInput = {
  role: UserRole;
  verificationStatus: VerificationStatus;
  profile: ProfileCompleteness;
  signalsToday: number; // desde signalStore
};

function computeProfilePct(profile: ProfileCompleteness): number {
  const fields: Array<keyof ProfileCompleteness> = [
    'hasName',
    'hasBirthdate',
    'hasGender',
    'hasRegion',
    'hasComuna',
    'hasEmail',
  ];
  const done = fields.reduce((acc, k) => acc + (profile[k] ? 1 : 0), 0);
  return Math.round((done / fields.length) * 100);
}

// Regla de límites (ajustable):
// - unverified: 3
// - verified_basic: 15
// - pending: 20
// - verified_strong: ilimitadas
export const SIGNAL_LIMITS = {
  unverified: 3,
  verified_basic: 15,
  pending: 20,
  verified_strong: -1, // Unlimited
};

export function computeEntitlements(input: ComputeEntitlementsInput): Entitlements {
  const { role, verificationStatus, profile, signalsToday } = input;

  const pct = computeProfilePct(profile);

  const isVerifiedStrong = verificationStatus === 'verified_strong';
  const isVerifiedBasic =
    verificationStatus === 'verified_basic' ||
    verificationStatus === 'pending' ||
    verificationStatus === 'verified_strong';

  const isUnlimitedSignals = isVerifiedStrong;



  const maxSignalsPerDay =
    isUnlimitedSignals ? -1 :
      verificationStatus === 'pending' ? SIGNAL_LIMITS.pending :
        verificationStatus === 'verified_basic' ? SIGNAL_LIMITS.verified_basic :
          SIGNAL_LIMITS.unverified;

  const signalsLeftToday = isUnlimitedSignals
    ? 999999
    : Math.max(0, maxSignalsPerDay - Math.max(0, signalsToday));

  const canAccessApp = true;
  const canVote = true;

  const canAccessMySignal = true;
  const canAccessRadiografias = isVerifiedBasic;
  const canAccessResults = isVerifiedBasic;

  const canAccessCompanyDashboard = role === 'company';

  const canEditAnswers = isVerifiedBasic;

  const canSeeAdvancedFilters = isVerifiedStrong && pct >= 80;

  const unlocked: string[] = [];
  if (verificationStatus === 'verified_basic') unlocked.push('verified-basic');
  if (verificationStatus === 'pending') unlocked.push('pending');
  if (verificationStatus === 'verified_strong') unlocked.push('verified-strong');
  if (pct >= 80) unlocked.push('profile-80');
  if (pct >= 100) unlocked.push('profile-100');
  if (canAccessCompanyDashboard) unlocked.push('company-dashboard');

  let nextUnlockHint: string | undefined;
  if (verificationStatus === 'unverified') {
    nextUnlockHint = 'Verifica (básico) para desbloquear resultados y radiografías.';
  } else if (verificationStatus === 'verified_basic') {
    nextUnlockHint = 'Verifica con CI para señales ilimitadas.';
  } else if (verificationStatus === 'pending') {
    nextUnlockHint = 'Tu verificación está en revisión. Al aprobarse tendrás señales ilimitadas.';
  } else if (pct < 80) {
    nextUnlockHint = 'Completa tu perfil para desbloquear filtros avanzados.';
  }

  return {
    role,

    maxSignalsPerDay,
    signalsLeftToday,
    isUnlimitedSignals,

    canAccessApp,
    canVote,

    canAccessMySignal,
    canAccessRadiografias,
    canAccessResults,
    canAccessCompanyDashboard,

    isVerified: isVerifiedStrong,

    verificationStatus,
    isVerifiedBasic,
    isVerifiedStrong,

    profile,
    profileCompletenessPct: pct,

    canEditAnswers,
    canSeeAdvancedFilters,

    nextUnlockHint,
    unlocked,
  };
}

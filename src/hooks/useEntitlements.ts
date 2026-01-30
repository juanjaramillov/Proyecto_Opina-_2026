
import * as React from 'react';
import {
  computeEntitlements,
  Entitlements,
  ProfileCompleteness,
  VerificationStatus,
  UserRole,
} from '../domain/entitlements';
import { useSignalStore } from '../store/signalStore';

const EMPTY_PROFILE: ProfileCompleteness = {
  hasName: false,
  hasBirthdate: false,
  hasGender: false,
  hasRegion: false,
  hasComuna: false,
  hasEmail: false,
};

function normalizeProfileCompleteness(raw: unknown): ProfileCompleteness {
  if (!raw || typeof raw !== 'object') return EMPTY_PROFILE;
  const r = raw as Record<string, unknown>;
  return {
    hasName: Boolean(r.hasName),
    hasBirthdate: Boolean(r.hasBirthdate),
    hasGender: Boolean(r.hasGender),
    hasRegion: Boolean(r.hasRegion),
    hasComuna: Boolean(r.hasComuna),
    hasEmail: Boolean(r.hasEmail),
  };
}

// v4 + legacy compat
function normalizeVerificationStatus(raw: unknown): VerificationStatus {
  if (raw === 'verified_strong') return 'verified_strong';
  if (raw === 'pending') return 'pending';
  if (raw === 'verified_basic') return 'verified_basic';

  // legacy
  if (raw === 'verified') return 'verified_strong';
  if (raw === 'basic') return 'verified_basic';
  if (raw === 'none') return 'unverified';

  return 'unverified';
}

function normalizeRole(raw: unknown): UserRole {
  if (raw === 'empresa' || raw === 'company') return 'company';
  if (raw === 'admin') return 'admin';
  if (raw === 'guest') return 'guest';
  return 'user';
}


function readAuthInputs(): {
  role: UserRole;
  verificationStatus: VerificationStatus;
  profile: ProfileCompleteness;
} {
  let role: UserRole = 'user';
  let verificationStatus: VerificationStatus = 'unverified';
  let profile: ProfileCompleteness = EMPTY_PROFILE;

  try {
    const rawRole = localStorage.getItem('opina_role');
    if (rawRole) role = normalizeRole(rawRole);

    // KEY canónica v4
    const rawVerV4 = localStorage.getItem('opina_verification_status_v4');
    if (rawVerV4) verificationStatus = normalizeVerificationStatus(rawVerV4);

    // fallback legacy
    const rawVerLegacy = localStorage.getItem('opina_verification');
    if (!rawVerV4 && rawVerLegacy) verificationStatus = normalizeVerificationStatus(rawVerLegacy);

    const rawProfile = localStorage.getItem('opina_profile_completeness');
    if (rawProfile) profile = normalizeProfileCompleteness(JSON.parse(rawProfile));
  } catch {
    // ignore
  }

  return { role, verificationStatus, profile };
}

export function useEntitlements(): Entitlements {
  // 1. Reactive Signal State from Zustand
  const signalsToday = useSignalStore(s => s.signalsToday);

  // 2. Local Storage Auth State (Legacy pattern)
  const [authState, setAuthState] = React.useState(() => readAuthInputs());

  React.useEffect(() => {
    const recompute = () => {
      setAuthState(readAuthInputs());
    };

    // cambios locales de verificación (disparados por useVerificationStatus)
    window.addEventListener('opina:verification_update', recompute);

    // cambios de verificación/perfil por localStorage (otras pestañas)
    window.addEventListener('storage', recompute);

    return () => {
      window.removeEventListener('opina:verification_update', recompute);
      window.removeEventListener('storage', recompute);
    };
  }, []);

  // 3. Compute derived entitlements
  return React.useMemo(() => {
    return computeEntitlements({
      role: authState.role,
      verificationStatus: authState.verificationStatus,
      profile: authState.profile,
      signalsToday
    });
  }, [authState, signalsToday]);
}


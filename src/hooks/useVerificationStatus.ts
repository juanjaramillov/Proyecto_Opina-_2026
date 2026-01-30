import * as React from 'react';

export type VerificationStatus = 'unverified' | 'verified_basic' | 'verified_strong';

// v4: key separada para no mezclar estado con versiones anteriores
const STORAGE_KEY = 'opina_verification_status_v4';

export function readVerificationStatus(): VerificationStatus {
  const raw =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;

  if (raw === 'verified_basic' || raw === 'verified_strong') return raw;
  return 'unverified';
}

export function writeVerificationStatus(status: VerificationStatus) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, status);
  window.dispatchEvent(new Event('opina:verification_update'));
}

export function useVerificationStatus() {
  const [status, setStatus] = React.useState<VerificationStatus>(() => readVerificationStatus());

  React.useEffect(() => {
    const onStorage = () => setStatus(readVerificationStatus());
    window.addEventListener('storage', onStorage);
    // Escuchar también evento custom para reactividad inmediata
    window.addEventListener('opina:verification_update', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('opina:verification_update', onStorage);
    };
  }, []);

  const setVerifiedBasic = React.useCallback(() => {
    writeVerificationStatus('verified_basic');
    setStatus('verified_basic');
  }, []);

  const setVerifiedStrong = React.useCallback(() => {
    writeVerificationStatus('verified_strong');
    setStatus('verified_strong');
  }, []);

  const reset = React.useCallback(() => {
    writeVerificationStatus('unverified');
    setStatus('unverified');
  }, []);

  return {
    status,
    isVerified: status === 'verified_basic' || status === 'verified_strong',
    setVerifiedBasic,
    setVerifiedStrong,
    reset,
  };
}

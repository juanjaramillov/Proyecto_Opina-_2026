import React, { useEffect, useRef } from 'react';
import { supabase } from '../../../supabase/client';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSessionStore } from '../store/sessionStore';
import { logger } from '../../../lib/logger';
import { getAnonId } from '../../auth/services/anonService';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function getOS() {
  const ua = navigator.userAgent;
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Android/.test(ua)) return 'Android';
  if (/iOS|iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { profile, isAuthenticated } = useAuth();
  const { sessionId, setSessionId } = useSessionStore();

  // ----- AUTHENTICATED DB SESSION ANCHOR -----
  useEffect(() => {
    if (!isAuthenticated || !profile?.id || sessionId) return;

    let isMounted = true;
    const createSession = async () => {
      try {
        const platform = navigator.platform || 'Unknown';
        const browser = navigator.userAgent.substring(0, 150);
        const os = getOS();
        const deviceType = getDeviceType();

        const res = await supabase.from('app_sessions')
          .insert({
            user_id: profile.id,
            device_type: deviceType,
            platform: platform,
            os: os,
            browser: browser,
            entry_point: window.location.pathname,
            status: 'active'
          })
          .select('id')
          .single();

        if (res.error) {
           logger.error('[OmniSessionProvider] Error creating app session', res.error);
        } else if (res.data && isMounted) {
           setSessionId(res.data.id);
        }
      } catch (err) {
        logger.error('[OmniSessionProvider] Unexpected error initializing session', err);
      }
    };

    createSession();
    return () => { isMounted = false; };
  }, [profile?.id, isAuthenticated, sessionId, setSessionId]);

  // ----- SESSION GLOBAL TRACKER (DWELL TIME / RPC) -----
  const isFirstMount = useRef(true);
  const lastFlushTime = useRef<number>(Date.now());

  useEffect(() => {
    const flushSessionMetrics = async (secondsSpent: number, isNewSession: boolean) => {
      try {
        let anonId: string | null = null;
        try {
          anonId = await getAnonId();
        } catch { /* ignore */ }

        await supabase.rpc('track_user_session', {
          p_anon_id: anonId ?? undefined,
          p_seconds_spent: secondsSpent,
          p_is_new_session: isNewSession
        });
      } catch (err) {
        logger.warn('[OmniSessionProvider] Session tracker RPC limit/offline', err);
      }
    };

    if (isFirstMount.current) {
      isFirstMount.current = false;
      flushSessionMetrics(0, true);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const accruedMs = Date.now() - lastFlushTime.current;
        const secondsSpent = Math.floor(accruedMs / 1000);
        if (secondsSpent > 0) {
          flushSessionMetrics(secondsSpent, false);
          lastFlushTime.current = Date.now();
        }
      } else if (document.visibilityState === 'visible') {
        lastFlushTime.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      const accruedMs = Date.now() - lastFlushTime.current;
      const secondsSpent = Math.floor(accruedMs / 1000);
      if (secondsSpent > 0) flushSessionMetrics(secondsSpent, false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}

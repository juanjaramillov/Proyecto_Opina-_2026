import React, { useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSessionStore } from '../store/sessionStore';
import { logger } from '../../../lib/logger';

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

  useEffect(() => {
    // Si no hay usuario logueado o ya tenemos la sesión persistida en sessionStorage, salimos.
    if (!isAuthenticated || !profile?.id || sessionId) return;

    let isMounted = true;

    const createSession = async () => {
      try {
        const platform = navigator.platform || 'Unknown';
        const browser = navigator.userAgent.substring(0, 150); // limit length
        const os = getOS();
        const deviceType = getDeviceType();

        // 1. Intentamos crear una `app_sessions` real.
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
           logger.error('[SessionProvider] Error creating app session', res.error);
        } else if (res.data && isMounted) {
           // 2. Guardamos la idea de que la pestaña actual está anclada a esta sesión
           setSessionId(res.data.id);
        }

      } catch (err) {
        logger.error('[SessionProvider] Error inesperado', err);
      }
    };

    createSession();

    return () => {
      isMounted = false;
    };
  }, [profile?.id, isAuthenticated, sessionId, setSessionId]);

  return <>{children}</>;
}

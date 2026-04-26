import { useEffect, useRef } from 'react';
import { supabase } from '../../../supabase/client';
import { typedRpc } from '../../../supabase/typedRpc';
import { logger } from '../../../lib/logger';
import { computeDeterministicDeviceHash } from '../../../lib/deviceFingerprint';

/**
 * useSessionGuard — #5 Media Drimo (multi-session lock).
 *
 * Garantiza "una sola sesión activa por usuario":
 *  1. Al loguearse (onAuthStateChange = SIGNED_IN) registra la sesión en
 *     `public.user_sessions` via `register_user_session`. Esa RPC revoca
 *     TODAS las sesiones previas activas del mismo user → los otros
 *     dispositivos lo descubren en su próximo ping y se cierran solos.
 *  2. Guarda el `session_id` emitido en localStorage (SESSION_ID_KEY).
 *     Es compartido entre pestañas del mismo origin → no se registran
 *     múltiples filas por el mismo navegador.
 *  3. Hace ping cada PING_INTERVAL_MS al RPC `ping_user_session`.
 *     - Si `active=true`: update de last_seen_at en el servidor, nada local.
 *     - Si `active=false`: limpia localStorage, hace signOut() y dispara
 *       el CustomEvent `opina:session_superseded` para que la UI muestre
 *       el banner explicativo.
 *
 * Es tolerante a fallas: si el RPC rompe por red/servidor NO hace signOut
 * (evita patearse al usuario por un blip transitorio).
 *
 * Debe montarse UNA SOLA VEZ en el árbol — típicamente dentro del
 * AuthProvider. Ver `docs/architecture/multi-session-lock.md`.
 *
 * F-10 (auditoría 2026-04-26) reviewed: el `session_id` en localStorage es
 * un UUID custom de la tabla `user_sessions`, NO el JWT de Supabase Auth
 * (que la lib `@supabase/supabase-js` gestiona aparte). Tener este UUID por
 * sí solo no permite autenticarse — la RPC `ping_user_session` valida que
 * el caller tenga sesión Supabase válida y que el session_id le pertenezca.
 * Persistencia en localStorage es necesaria para coordinar pestañas del
 * mismo origin (sessionStorage rompería el invariante "una fila por
 * navegador" del multi-session lock).
 */

const SESSION_ID_KEY = 'opina:session_id';
const PING_INTERVAL_MS = 30_000;  // 30s
const SESSION_SUPERSEDED_EVENT = 'opina:session_superseded';

interface RegisterResult {
    ok: boolean;
    session_id: string;
    superseded_count: number;
}

interface PingResult {
    active: boolean;
    reason?: string;
}

export function useSessionGuard() {
    const intervalRef = useRef<number | null>(null);
    const registeringRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const registerSession = async () => {
            if (registeringRef.current) return;
            registeringRef.current = true;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // Si ya hay un session_id local, lo reutilizamos (otra pestaña ya registró).
                const existing = localStorage.getItem(SESSION_ID_KEY);
                if (existing) return;

                const deviceLabel = typeof navigator !== 'undefined' ? navigator.platform : null;
                const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

                // #9 Media Drimo: device_hash determinístico (no random).
                // Si el cómputo falla por algún motivo, mandamos null y la
                // RPC lo guarda como NULL — no rompemos el login por esto.
                let deviceHash: string | null = null;
                try {
                    deviceHash = await computeDeterministicDeviceHash();
                } catch (err) {
                    logger.error('computeDeterministicDeviceHash falló', {
                        domain: 'auth', origin: 'useSessionGuard', action: 'fingerprint'
                    }, err);
                }
                if (cancelled) return;

                const { data, error } = await typedRpc<RegisterResult>('register_user_session', {
                    p_device_label: deviceLabel,
                    p_user_agent: userAgent,
                    p_device_hash: deviceHash,
                });

                if (cancelled) return;
                if (error) {
                    logger.error('register_user_session falló', {
                        domain: 'auth', origin: 'useSessionGuard', action: 'register'
                    }, error);
                    return;
                }
                if (data?.session_id) {
                    localStorage.setItem(SESSION_ID_KEY, data.session_id);
                }
            } finally {
                registeringRef.current = false;
            }
        };

        const pingSession = async () => {
            const sessionId = localStorage.getItem(SESSION_ID_KEY);
            if (!sessionId) return;

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return; // no logueado, nada que chequear

            const { data, error } = await typedRpc<PingResult>('ping_user_session', {
                p_session_id: sessionId,
            });

            if (cancelled) return;

            // Error de red/servidor: asumir vivo para no patear al usuario por un blip
            if (error) {
                logger.error('ping_user_session falló (se asume activa)', {
                    domain: 'auth', origin: 'useSessionGuard', action: 'ping'
                }, error);
                return;
            }

            if (data && data.active === false) {
                // Sesión superada por otro dispositivo (o revocada por admin)
                localStorage.removeItem(SESSION_ID_KEY);
                window.dispatchEvent(new CustomEvent(SESSION_SUPERSEDED_EVENT, {
                    detail: { reason: data.reason ?? 'unknown' },
                }));
                try {
                    await supabase.auth.signOut();
                } catch (err) {
                    logger.error('signOut tras supersede falló', {
                        domain: 'auth', origin: 'useSessionGuard', action: 'force_signout'
                    }, err);
                }
            }
        };

        // Suscripción a cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (cancelled) return;
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // En SIGNED_IN siempre intentamos registrar (salvo que ya haya session_id local).
                // En TOKEN_REFRESHED es no-op porque session_id ya existe.
                registerSession();
            }
            if (event === 'SIGNED_OUT') {
                localStorage.removeItem(SESSION_ID_KEY);
            }
        });

        // Registro inicial (si ya estaba logueado al montar) + primer ping
        registerSession();
        pingSession();

        // Polling
        intervalRef.current = window.setInterval(pingSession, PING_INTERVAL_MS);

        return () => {
            cancelled = true;
            subscription.unsubscribe();
            if (intervalRef.current != null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);
}

export const SESSION_GUARD_EVENT = SESSION_SUPERSEDED_EVENT;

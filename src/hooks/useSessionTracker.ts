import { useEffect, useRef } from 'react';
import { supabase } from '../supabase/client';
import { getAnonId } from '../features/auth/services/anonService';

/**
 * useSessionTracker
 * 
 * A lightweight hook that mounts at the App array root to track
 * user sessions and time spent on the platform. It calculates time
 * delta and flushes it to the database when the tab becomes hidden
 * or unloads.
 */
export function useSessionTracker() {
    const isFirstMount = useRef(true);
    const lastFlushTime = useRef<number>(Date.now());

    useEffect(() => {
        /**
         * Internal function to call the tracker RPC silently.
         */
        const flushSession = async (secondsSpent: number, isNewSession: boolean) => {
            try {
                // In a real-world edge case anon_id may not be ready immediately, 
                // but getting it from localStorage is synchronous enough.
                let anonId: string | null = null;
                try {
                    anonId = await getAnonId();
                } catch {
                    // ignore
                }

                await (supabase.rpc as any)('track_user_session', {
                    p_anon_id: anonId || null,
                    p_seconds_spent: secondsSpent,
                    p_is_new_session: isNewSession
                });
            } catch (err) {
                // Silently fail, analytics shouldn't crash the app
                console.warn('Session tracker flush failed', err);
            }
        };

        // Report that a new session has started (page load)
        if (isFirstMount.current) {
            isFirstMount.current = false;
            flushSession(0, true);
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Tab is hidden, paused or closing. Flush accrued time.
                const now = Date.now();
                const accruedMs = now - lastFlushTime.current;
                const secondsSpent = Math.floor(accruedMs / 1000);

                if (secondsSpent > 0) {
                    flushSession(secondsSpent, false);
                    lastFlushTime.current = now;
                }
            } else if (document.visibilityState === 'visible') {
                // Tab is active again. Reset the flush timer.
                lastFlushTime.current = Date.now();
            }
        };

        const handleBeforeUnload = () => {
            // Final flush just in case (Browser may or may not guarantee this request goes out)
            const now = Date.now();
            const accruedMs = now - lastFlushTime.current;
            const secondsSpent = Math.floor(accruedMs / 1000);

            if (secondsSpent > 0) {
                flushSession(secondsSpent, false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
}

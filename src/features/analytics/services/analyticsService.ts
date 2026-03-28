import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { useSessionStore } from '../store/sessionStore';
import { logger } from '../../../lib/logger';

// --- TYPINGS ---

export type BehaviorModuleType = 'home' | 'versus' | 'depth' | 'news' | 'progressive' | 'pulse' | 'b2b';
export type BehaviorStatus = 'completed' | 'abandoned' | 'active';
export type TelemetrySeverity = 'info' | 'warn' | 'error';

export interface BehaviorEventPayload {
  event_type: string; // e.g. 'click', 'view', 'scroll', 'modal_open'
  module_type: BehaviorModuleType;
  screen_name: string;
  source_module?: string;
  source_element?: string;
  status: BehaviorStatus;
  duration_ms?: number;
  entity_id?: string;
  context_id?: string;
}

export type QueuedSystemEvent = {
  eventName: string;
  severity: TelemetrySeverity;
  context: Record<string, unknown>;
  clientEventId?: string | null;
  ts: number;
};

// --- SYSTEM TELEMETRY QUEUE LOGIC ---
const LS_QUEUE_KEY = 'opina_telemetry_queue_v2';
const MAX_QUEUE = 50;

function readQueue(): QueuedSystemEvent[] {
  try {
    const raw = localStorage.getItem(LS_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedSystemEvent[]).slice(0, MAX_QUEUE) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedSystemEvent[]) {
  try {
    localStorage.setItem(LS_QUEUE_KEY, JSON.stringify(q.slice(0, MAX_QUEUE)));
  } catch { /* noop */ }
}

function enqueue(ev: QueuedSystemEvent) {
  const q = readQueue();
  q.push(ev);
  writeQueue(q.slice(-MAX_QUEUE));
}

function isAuthOrPermError(err: unknown): boolean {
  const error = err as { message?: string; code?: string } | null;
  const msg = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  return (
    msg.includes('permission denied') ||
    msg.includes('jwt') ||
    msg.includes('not authenticated') ||
    code === '42501'
  );
}

async function sendOneSystemEvent(ev: QueuedSystemEvent) {
  const env = (import.meta as { env?: Record<string, string> }).env;
  const appVersion = env?.VITE_APP_VERSION ?? 'unknown';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

  let safeContext: Record<string, unknown> = ev.context || {};
  try {
    if (JSON.stringify(safeContext).length > 4000) {
      safeContext = { truncated: true, reason: 'payload_too_large' };
    }
  } catch {
    safeContext = { parse_error: true };
  }

  const { error } = await supabase.rpc('log_app_event', {
    p_event_name: ev.eventName,
    p_severity: ev.severity,
    p_context: (safeContext as unknown) as Database['public']['Tables']['app_events']['Row']['context'],
    p_client_event_id: ev.clientEventId || undefined,
    p_app_version: appVersion,
    p_user_agent: userAgent
  });

  if (error) throw error;
}

async function flushSystemQueueBestEffort() {
  const q = readQueue();
  if (!q.length) return;

  const remaining: QueuedSystemEvent[] = [];
  for (const ev of q) {
    try {
      await sendOneSystemEvent(ev);
    } catch (err: unknown) {
      if (isAuthOrPermError(err)) {
        remaining.push(ev, ...q.slice(q.indexOf(ev) + 1));
        break;
      }
      remaining.push(ev, ...q.slice(q.indexOf(ev) + 1));
      break;
    }
  }
  writeQueue(remaining);
}

// --- MAIN OMNI-TRACKER EXPORT ---
export const analyticsService = {
  /**
   * Registra intenciones de comportamiento (UI interactions, flujos).
   * Persiste en la tabla `behavior_events`.
   */
  trackBehavior: async (payload: BehaviorEventPayload): Promise<void> => {
    try {
      const sessionId = useSessionStore.getState().sessionId;
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!sessionId || !userId) return; // Silent skip for guests without session if behavior requires auth.

      const eventRow = {
        session_id: sessionId,
        user_id: userId,
        ...payload
      };

      supabase.from('behavior_events').insert(eventRow).then(({ error }) => {
        if (error) logger.warn('[OmniTracker] Failed inserting behavior event', error);
      });
    } catch (e) {
      logger.error('[OmniTracker] Exception on trackBehavior', e);
    }
  },

  /**
   * Registra eventos transversales de sistema, estado o error.
   * Persiste en la tabla `app_events` usando un stored procedure y colas locales.
   */
  trackSystem: (
    eventName: string,
    severity: TelemetrySeverity = 'info',
    context?: Record<string, unknown>,
    clientEventId?: string
  ): void => {
    try {
      flushSystemQueueBestEffort().catch(() => void 0);

      const ev: QueuedSystemEvent = {
        eventName,
        severity,
        context: {
          path: typeof window !== "undefined" ? window.location.pathname : "unknown",
          search: typeof window !== "undefined" ? window.location.search : "",
          ...(context || {})
        },
        clientEventId: clientEventId || null,
        ts: Date.now()
      };

      sendOneSystemEvent(ev).catch((err: unknown) => {
        if (isAuthOrPermError(err)) {
          enqueue(ev);
          return;
        }
        logger.info('[OmniTracker] Failed to log system event via RPC (silenced offline)', { error: String(err) });
      });
    } catch (err) {
      logger.info('[OmniTracker] Exception queuing local system event', { error: String(err) });
    }
  },

  /**
   * Flush manual para forzar la sincronización de las colas de eventos (ej. on unload).
   */
  flush: (): void => {
    flushSystemQueueBestEffort().catch(() => void 0);
  }
};

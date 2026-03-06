import { supabase } from '../../supabase/client';

type TelemetrySeverity = 'info' | 'warn' | 'error';

type QueuedEvent = {
    eventName: string;
    severity: TelemetrySeverity;
    context: Record<string, any>;
    clientEventId?: string | null;
    ts: number;
};

const LS_QUEUE_KEY = 'opina_telemetry_queue_v1';
const MAX_QUEUE = 50;

function readQueue(): QueuedEvent[] {
    try {
        const raw = localStorage.getItem(LS_QUEUE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.slice(0, MAX_QUEUE);
    } catch {
        return [];
    }
}

function writeQueue(q: QueuedEvent[]) {
    try {
        localStorage.setItem(LS_QUEUE_KEY, JSON.stringify(q.slice(0, MAX_QUEUE)));
    } catch {
        // noop
    }
}

function enqueue(ev: QueuedEvent) {
    const q = readQueue();
    q.push(ev);
    writeQueue(q.slice(-MAX_QUEUE));
}

function isAuthOrPermError(err: any): boolean {
    const msg = String(err?.message || '').toLowerCase();
    const code = String(err?.code || '').toLowerCase();
    return (
        msg.includes('permission denied') ||
        msg.includes('jwt') ||
        msg.includes('not authenticated') ||
        code === '42501'
    );
}

async function sendOne(ev: QueuedEvent) {
    const appVersion = (import.meta as any).env?.VITE_APP_VERSION ?? 'unknown';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

    let safeContext = ev.context || {};
    try {
        const strContext = JSON.stringify(safeContext);
        if (strContext.length > 4000) safeContext = { truncated: true, reason: 'payload_too_large' };
    } catch {
        safeContext = { parse_error: true };
    }

    const { error } = await (supabase.rpc as any)('log_app_event', {
        p_event_name: ev.eventName,
        p_severity: ev.severity,
        p_context: safeContext,
        p_client_event_id: ev.clientEventId || null,
        p_app_version: appVersion,
        p_user_agent: userAgent
    });

    if (error) throw error;
}

async function flushQueueBestEffort() {
    const q = readQueue();
    if (!q.length) return;

    const remaining: QueuedEvent[] = [];
    for (const ev of q) {
        try {
            await sendOne(ev);
        } catch (err: any) {
            // Si aún no hay permisos/sesión, paramos y dejamos el resto.
            if (isAuthOrPermError(err)) {
                remaining.push(ev, ...q.slice(q.indexOf(ev) + 1));
                break;
            }
            // Si fue error de red, también paramos (no insistir en loop)
            remaining.push(ev, ...q.slice(q.indexOf(ev) + 1));
            break;
        }
    }
    writeQueue(remaining);
}

export const telemetryService = {
    /**
     * Log de evento (no PII). Si no hay sesión/permisos, se encola en localStorage y se flushea luego.
     */
    logEvent: (
        eventName: string,
        severity: TelemetrySeverity = 'info',
        context?: Record<string, any>,
        clientEventId?: string
    ): void => {
        try {
            // Flush previo (no bloqueante)
            flushQueueBestEffort().catch(() => void 0);

            const ev: QueuedEvent = {
                eventName,
                severity,
                context: context || {},
                clientEventId: clientEventId || null,
                ts: Date.now()
            };

            // Fire and forget
            sendOne(ev).catch((err: any) => {
                // Si no hay permisos/sesión, encolamos para flush posterior
                if (isAuthOrPermError(err)) {
                    enqueue(ev);
                    return;
                }
                // Silenciar errores (offline, adblockers)
                console.debug('[Telemetry] Failed to log event:', err?.message || err);
            });

        } catch (err) {
            console.debug('[Telemetry] Exception logging event local phase:', err);
        }
    },

    flush: (): void => {
        flushQueueBestEffort().catch(() => void 0);
    }
};

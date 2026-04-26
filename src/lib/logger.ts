/**
 * Taxonomía Oficial de Errores y Eventos en Opina+
 */

type LogDomain =
    | 'auth'
    | 'access_policy'
    | 'signal_write'
    | 'sync_outbox'
    | 'actualidad_editorial'
    | 'admin_actions'
    | 'b2b_intelligence'
    | 'network_api'
    | 'platform_core'
    | 'unexpected_ui_state';

type LogSeverity =
    | 'info'
    | 'warning'
    | 'recoverable_error'
    | 'blocking_error'
    | 'critical_integrity_error';

type LogState =
    | 'confirmed'
    | 'pending'
    | 'failed'
    | 'blocked'
    | 'retrying';

interface LogBaseContext {
    domain: LogDomain;
    severity?: LogSeverity;
    origin?: string; // Nombre de componente, hook o función
    action?: string; // e.g., 'login', 'sync_queue', 'create_topic'
    state?: LogState;
    [key: string]: unknown;
}

const isDev = import.meta.env.DEV;

class OpinaLogger {
    private sanitizePayload(data: unknown): unknown {
        if (!data) return data;
        if (typeof data !== 'object') return data;

        // No destruir instancias nativas como Error o Date
        if (data instanceof Error) {
            return { message: data.message, stack: data.stack, name: data.name };
        }
        if (data instanceof Date) return data.toISOString();

        if (Array.isArray(data)) {
            return data.map(item => this.sanitizePayload(item));
        }

        const sensitiveKeys = ['email', 'password', 'token', 'access_token', 'refresh_token', 'session', 'user', 'user_metadata', 'app_metadata', 'phone', 'identities'];
        const sanitized: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            if (sensitiveKeys.includes(key.toLowerCase())) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = this.sanitizePayload(value);
            }
        }
        return sanitized;
    }

    private logToConsole(
        method: 'log' | 'warn' | 'error' | 'info',
        message: string,
        context?: LogBaseContext,
        error?: unknown
    ) {
        // En producción podríamos omitir logs tipo info/warning, pero por ahora mostramos todos
        // o conectamos a un observability tool (Sentry, Datadog) en el futuro.
        const safeContext = this.sanitizePayload(context) as Record<string, unknown> | undefined;
        const safeError = this.sanitizePayload(error);

        const output = {
            timestamp: new Date().toISOString(),
            message,
            ...(safeContext ?? {}),
            ...(safeError ? { error_details: safeError } : {})
        };

        if (isDev) {
            // Un formato más legible en desarrollo
            const style = method === 'error' ? 'color: red; font-weight: bold;'
                        : method === 'warn' ? 'color: orange;'
                        : 'color: #3b82f6;';
            const icon = method === 'error' ? '❌' : method === 'warn' ? '⚠️' : 'ℹ️';

            console[method](
                `%c${icon} [${context?.domain || 'unknown'}] %c${message}`,
                style,
                'color: inherit;',
                safeContext,
                safeError || ''
            );
        } else {
            // Estructurado para indexadores en server/prod (CloudWatch, etc.)
            console[method](JSON.stringify(output));
        }
    }

    /**
     * Registra un evento informativo o trazabilidad exitosa.
     */
    info(message: string, context?: Partial<LogBaseContext>) {
        const ctx: LogBaseContext = { domain: 'platform_core', origin: 'unknown', action: 'unknown', state: 'pending', ...context } as LogBaseContext;
        this.logToConsole('info', message, { severity: 'info', ...ctx });
    }

    /**
     * Registra un evento que requiere atención pero no bloquea el flujo principal.
     */
    warn(message: string, contextOrError?: Partial<LogBaseContext> | unknown) {
        let ctx: Partial<LogBaseContext> = { domain: 'platform_core', origin: 'unknown', action: 'unknown', state: 'failed' };
        if (contextOrError instanceof Error || (typeof contextOrError === 'object' && contextOrError !== null && !('domain' in contextOrError))) {
            this.logToConsole('warn', message, { severity: 'warning', ...ctx } as LogBaseContext, contextOrError);
            return;
        } else if (contextOrError) {
            ctx = { ...ctx, ...(contextOrError as Partial<LogBaseContext>) };
        }
        this.logToConsole('warn', message, { severity: 'warning', ...ctx } as LogBaseContext);
    }

    /**
     * Registra un error tipificado en el sistema.
     * Soporta recibir el objeto de error (catch) para stacktraces.
     */
    error(message: string, contextOrError?: Partial<LogBaseContext> | unknown, explicitError?: unknown) {
        let ctx: Partial<LogBaseContext> = { domain: 'platform_core', origin: 'unknown', action: 'unknown', state: 'failed' };
        let err: unknown = explicitError;

        if (contextOrError instanceof Error || (typeof contextOrError === 'object' && contextOrError !== null && !('domain' in contextOrError))) {
            err = contextOrError;
        } else if (contextOrError) {
            ctx = { ...ctx, ...(contextOrError as Partial<LogBaseContext>) };
        }

        const severity = ctx.severity || 'recoverable_error';
        this.logToConsole('error', message, { ...ctx, severity } as LogBaseContext, err);
    }
}

export const logger = new OpinaLogger();

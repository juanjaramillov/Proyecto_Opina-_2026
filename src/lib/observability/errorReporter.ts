/**
 * Error Reporter Abstraction (Fase 5.3)
 *
 * Puerto de observabilidad. La aplicación reporta errores y mensajes a través
 * de esta capa; la implementación concreta puede intercambiarse sin tocar
 * consumidores (exactamente el mismo patrón que `narrativeProvider` en Fase 5.1).
 *
 * ## Por qué existe
 *
 * Hasta Fase 5.3, los errores viajaban directamente a `logger.error(...)` y
 * además había un `window.addEventListener('unhandledrejection', ...)` ad-hoc
 * en `index.tsx`. Esto tenía dos problemas:
 *
 *   1. **Sin captura de `window.onerror`**: errores síncronos fuera de React
 *      (event handlers, event listeners imperativos, inicialización temprana
 *      antes del ErrorBoundary) nunca llegaban al logger.
 *   2. **Acoplamiento a `console`**: cuando queramos sumar Sentry/Datadog/
 *      Highlight, hay que editar N sitios. Con este puerto, cambia 1 sink.
 *
 * ## Contrato
 *
 *  - `captureException(err, ctx?)`: para Error objects (o cualquier cosa
 *    tirada por `throw`). El reporter **nunca debe lanzar**: si su backend
 *    falla, loggea a consola y sigue.
 *  - `captureMessage(msg, ctx?)`: para strings intencionales (breadcrumbs,
 *    eventos notables no-error).
 *  - `name`: identificador del sink — útil en tests y para correlacionar
 *    dashboards.
 *
 * ## Ejemplo de sink futuro
 *
 * ```ts
 * class SentryReporter implements ErrorReporter {
 *   name = 'sentry-v1';
 *   captureException(err: unknown, ctx?: ErrorContext) {
 *     try {
 *       Sentry.captureException(err, { extra: ctx });
 *     } catch (sinkErr) {
 *       // Fallback: nunca perder el error original.
 *       logger.error('SentryReporter failed', sinkErr);
 *       logger.error('Original error', ctx, err);
 *     }
 *   }
 *   captureMessage(msg: string, ctx?: ErrorContext) {
 *     try { Sentry.captureMessage(msg, { extra: ctx }); }
 *     catch { logger.warn(msg, ctx); }
 *   }
 * }
 * setErrorReporter(new SentryReporter());
 * ```
 */

import { logger } from "../logger";

export interface ErrorContext {
    /** Dominio de taxonomía (auth, signal_write, b2b_intelligence, etc.) */
    domain?: string;
    /** Componente, hook o función donde se originó */
    origin?: string;
    /** Acción lógica que se estaba ejecutando */
    action?: string;
    /** Datos extra — el reporter debe sanitizar antes de enviarlos. */
    [key: string]: unknown;
}

export interface ErrorReporter {
    readonly name: string;
    captureException(err: unknown, ctx?: ErrorContext): void;
    captureMessage(msg: string, ctx?: ErrorContext): void;
}

/**
 * Reporter por defecto: delega al logger existente. Sin red, sin dependencia
 * externa. Apto para dev, test y prod hasta que se sume un sink real.
 */
export const ConsoleErrorReporter: ErrorReporter = {
    name: "console-v1",
    captureException(err, ctx) {
        // `logger.error` ya sanitiza y formatea según el modo (dev-friendly
        // vs JSON estructurado). Reusamos en vez de re-implementar.
        const message = err instanceof Error ? err.message : "Captured exception";
        logger.error(message, ctx, err);
    },
    captureMessage(msg, ctx) {
        logger.warn(msg, ctx);
    },
};

let activeReporter: ErrorReporter = ConsoleErrorReporter;

/**
 * Devuelve el reporter activo. Los consumidores deben llamar esta función
 * en cada invocación (no cachearla) para respetar swap en runtime.
 */
export function getErrorReporter(): ErrorReporter {
    return activeReporter;
}

/**
 * Inyecta un reporter alternativo. Pensado para:
 *  - Bootstrap: `setErrorReporter(new SentryReporter())` desde `index.tsx`.
 *  - Tests: reporter mock que captura llamadas en un array.
 */
export function setErrorReporter(reporter: ErrorReporter): void {
    activeReporter = reporter;
}

/** Resetea al reporter default. Útil en `afterEach` de tests. */
export function resetErrorReporter(): void {
    activeReporter = ConsoleErrorReporter;
}

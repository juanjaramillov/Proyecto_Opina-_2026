import * as Sentry from '@sentry/react';
import type { ErrorContext, ErrorReporter } from './errorReporter';
import { logger } from '../logger';

/**
 * Reporter de Sentry (Fase 6)
 *
 * Implementa la interfaz ErrorReporter para enviar errores a Sentry de forma segura,
 * previniendo que una falla en Sentry bote la aplicación.
 */
export class SentryReporter implements ErrorReporter {
    readonly name = 'sentry-v1';

    captureException(err: unknown, ctx?: ErrorContext): void {
        try {
            Sentry.captureException(err, {
                extra: ctx,
                tags: {
                    domain: ctx?.domain || 'unknown',
                    origin: ctx?.origin || 'unknown',
                    action: ctx?.action || 'unknown'
                }
            });
        } catch (sinkErr) {
            // Fallback: never lose the original error.
            logger.error('[SentryReporter] failed to capture exception', sinkErr);
            logger.error('Original error', ctx, err);
        }
    }

    captureMessage(msg: string, ctx?: ErrorContext): void {
        try {
            Sentry.captureMessage(msg, {
                extra: ctx,
                tags: {
                    domain: ctx?.domain || 'unknown',
                    origin: ctx?.origin || 'unknown',
                    action: ctx?.action || 'unknown'
                }
            });
        } catch (sinkErr) {
            logger.warn('[SentryReporter] failed to capture message', sinkErr);
            logger.warn(msg, ctx);
        }
    }
}

import { supabase } from '../../supabase/client';

export const telemetryService = {
    /**
     * Reporta un evento a la base de datos de manera anónima y no bloqueante (fire-and-forget).
     * @param eventName Nombre del evento (ej: auth_bootstrap_failed). Máximo 80 caracteres (Truncado silenciosamente por la DB si excede).
     * @param severity Gravedad del evento (info, warn, error). Determina urgencia.
     * @param context Contexto persistible. Excluir PII. Límite virtual: 4KB para evitar sobrecarga del stack de logging. 
     * @param clientEventId Un Client Event ID para correlacionar metadatos en backend.
     */
    logEvent: (
        eventName: string,
        severity: 'info' | 'warn' | 'error' = 'info',
        context?: Record<string, any>,
        clientEventId?: string
    ): void => {
        try {
            const appVersion = (import.meta as any).env?.VITE_APP_VERSION ?? 'unknown';
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

            let safeContext = context || {};
            try {
                const strContext = JSON.stringify(safeContext);
                // Si el log enviado es muy pesado (>4KB max buffer empírico) lo limitamos antes de la llamada de red.
                if (strContext.length > 4000) {
                    safeContext = { truncated: true, reason: 'payload_too_large' };
                }
            } catch (e) {
                safeContext = { parse_error: true };
            }

            // Fire and forget
            (supabase.rpc as any)('log_app_event', {
                p_event_name: eventName,
                p_severity: severity,
                p_context: safeContext,
                p_client_event_id: clientEventId || null,
                p_app_version: appVersion,
                p_user_agent: userAgent
            }).then(({ error }: { error: any }) => {
                if (error) {
                    console.debug('[Telemetry] Failed to log event:', error.message);
                }
            }).catch((networkErr: any) => {
                // Silenciar errores de capa de transporte (Offline, ad blockers) para no enturbiar UI
                console.debug('[Telemetry] Transport exception logging event:', networkErr);
            });

        } catch (err) {
            console.debug('[Telemetry] Exception logging event local phase:', err);
        }
    }
};

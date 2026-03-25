/**
 * Analytics Tracking Service
 * 
 * Capa centralizada y segura para la instrumentación de eventos.
 * Actualmente configurada en modo fallback (consola) para evitar acoplamiento temprano
 * con proveedores externos, pero manteniendo un contrato estricto de tipos.
 */

// --- B2C EVENT CATALOG ---
export type B2CEventName = 
    | 'user_entered_home'
    | 'user_entered_signals'
    | 'user_started_module'
    | 'user_submitted_signal'
    | 'user_opened_results'
    | 'user_clicked_next_action'
    | 'user_returned_session';

export interface B2CEventPayload {
    user_id?: string;
    anon_id?: string;
    session_id?: string;
    module?: string;
    timestamp?: string; // ISO 8601
    source?: string;
    is_authenticated?: boolean;
    profile_completion_state?: number;
    // Propiedades extra específicas
    signal_id?: string;
    target_action?: string;
}

// --- B2B EVENT CATALOG ---
export type B2BEventName =
    | 'b2b_opened_overview'
    | 'b2b_opened_deep_dive'
    | 'b2b_opened_reports'
    | 'b2b_selected_entity'
    | 'b2b_clicked_next_view';

export interface B2BEventPayload {
    entity_id?: string;
    entity_name?: string;
    view_name?: string;
    session_id?: string;
    timestamp?: string; // ISO 8601
    source?: string;
    // Propiedades extra
    destination_view?: string;
}

// --- UNIFIED EVENT BUS ---
export type TrackEventName = B2CEventName | B2BEventName;
export type TrackEventPayload = B2CEventPayload | B2BEventPayload;

/**
 * Registra un evento analítico en el sistema.
 * 
 * @param eventName Nombre del evento del catálogo oficial.
 * @param payload Datos asociados al evento.
 */
export const trackEvent = (eventName: TrackEventName, payload: TrackEventPayload = {}) => {
    // 1. Enriquecer con timestamp automático si no viene provisto
    const enrichedPayload = {
        timestamp: new Date().toISOString(),
        ...payload
    };

    // 2. Persistencia Temporal (Console Fallback)
    // TODO: Reemplazar este bloque cuando exista un backend definitivo de analytics (PostHog, Amplitude, etc.)
    if (import.meta.env.MODE === 'development') {
        console.debug(`[Analytics ⚡] ${eventName}`, enrichedPayload);
    } else {
        // En producción podríamos guardar en un buffer o enviarlo vía fetch fire-and-forget
        // Por ahora, simulamos un envío silencioso si no hay proveedor.
        // console.log para debug temporal productivo si fuera necesario, comúnmente desactivado.
    }
};

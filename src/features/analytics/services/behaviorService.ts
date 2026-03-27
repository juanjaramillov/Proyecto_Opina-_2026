import { supabase } from '../../../supabase/client';
import { useSessionStore } from '../store/sessionStore';

import { logger } from '../../../lib/logger';

export interface BehaviorEventPayload {
  event_type: string; // 'click', 'view', 'scroll', 'modal_open'
  module_type: 'home' | 'versus' | 'depth' | 'news' | 'progressive' | 'pulse' | 'b2b';
  screen_name: string;
  source_module?: string;
  source_element?: string;
  status: 'completed' | 'abandoned' | 'active';
  duration_ms?: number;
  entity_id?: string;
  context_id?: string;
}

export const behaviorService = {
  trackEvent: async (payload: BehaviorEventPayload): Promise<void> => {
    try {
      const sessionId = useSessionStore.getState().sessionId;
      // Para obtener el userId directamente si no estamos en React
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!sessionId || !userId) {
        // Silenciosamente ignoramos eventos si la sesión app_sessions no arrancó o no está loggeado.
        return;
      }

      const eventRow = {
        session_id: sessionId,
        user_id: userId,
        event_type: payload.event_type,
        module_type: payload.module_type,
        screen_name: payload.screen_name,
        source_module: payload.source_module,
        source_element: payload.source_element,
        status: payload.status,
        duration_ms: payload.duration_ms,
        entity_id: payload.entity_id,
        context_id: payload.context_id,
      };

      // Fire & Forget (Best Effort)
      supabase.from('behavior_events').insert(eventRow).then(({ error }) => {
        if (error) {
          logger.warn('[BehaviorService] Failed inserting behavior event', error);
        }
      });

    } catch (e) {
      logger.error('[BehaviorService] Exception on trackEvent', e);
    }
  }
};

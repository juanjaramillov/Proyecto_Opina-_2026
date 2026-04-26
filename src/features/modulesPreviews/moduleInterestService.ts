import { supabase } from '../../supabase/client';
import { logger } from '../../lib/logger';
import type { Database } from '../../supabase/database.types';
import { ModuleEventType, ModuleSignalMetadata } from '../signals/eventTypes';

type TrackModuleInterestArgs = Database['public']['Functions']['track_module_interest']['Args'];

export const moduleInterestService = {
    /**
     * Tracks a module interest event in signal_events table.
     */
    trackModuleInterestEvent: async (
        eventType: ModuleEventType,
        metadata: ModuleSignalMetadata
    ): Promise<void> => {
        try {
            // DG-B02: Telemetría va por RPC, no por signal_events (tabla protegida)
            const clientEventId = crypto.randomUUID();

            const rpcArgs: TrackModuleInterestArgs = {
                p_module_key: metadata.module_slug,
                p_event_type: eventType ?? 'open',
                p_client_event_id: clientEventId,
                p_device_hash: localStorage.getItem('opina_device_hash') || undefined,
                p_metadata: (metadata ?? {}) as unknown as TrackModuleInterestArgs['p_metadata']
            };
            const { error } = await supabase.rpc('track_module_interest', rpcArgs);

            if (error) {
                // No romper UX por telemetría
                console.warn('[moduleInterest] track_module_interest failed', error);
            }
        } catch (err) {
            logger.error(`[ModuleInterestService] Critical error tracking ${eventType}:`, err);
        }
    }
};

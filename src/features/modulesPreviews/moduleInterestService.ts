import { supabase } from '../../supabase/client';
import { logger } from '../../lib/logger';
import { ModuleEventType, ModuleSignalMetadata } from '../signals/eventTypes';

export const moduleInterestService = {
    /**
     * Tracks a module interest event in signal_events table.
     */
    trackModuleInterestEvent: async (
        eventType: ModuleEventType,
        metadata: ModuleSignalMetadata
    ): Promise<void> => {
        try {
            // Get or create device hash for anonymous tracking
            let deviceHash = localStorage.getItem('opina_device_hash');
            if (!deviceHash) {
                deviceHash = crypto.randomUUID();
                localStorage.setItem('opina_device_hash', deviceHash);
            }

            const { error } = await supabase.from('signal_events').insert({
                event_type: eventType,
                entity_type: 'module',
                entity_id: metadata.module_slug,
                meta: metadata as any,
                anon_id: deviceHash,
                signal_id: crypto.randomUUID()
            });

            if (error) {
                logger.error(`[ModuleInterestService] Error tracking ${eventType}:`, error);
            }
        } catch (err) {
            logger.error(`[ModuleInterestService] Critical error tracking ${eventType}:`, err);
        }
    }
};

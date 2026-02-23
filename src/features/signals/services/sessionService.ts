import { getQueuedVotesForSession } from './signalOutbox';
import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface UserSession {
    id: string;
    attributes_shown: string[];
    attributes_completed: string[];
    dominant_clinic_id: string | null;
    depth_completed: boolean;
}

export const sessionService = {
    /**
     * Inicia una nueva sesión para el usuario actual.
     * Selecciona 3 atributos aleatorios de los 5 disponibles.
     */
    startNewSession: async (): Promise<UserSession | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // 1. Obtener todos los atributos disponibles
            const { data: allAttributes } = await (supabase as any)
                .from('attributes')
                .select('id');

            if (!allAttributes || allAttributes.length === 0) return null;

            // 2. Seleccionar 3 aleatorios
            const selected = allAttributes
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map((a: any) => a.id);

            // 3. Crear registro en la DB
            const { data: session, error } = await (supabase as any)
                .from('user_sessions')
                .insert({
                    user_id: user.id,
                    attributes_shown: selected,
                    attributes_completed: [],
                    depth_completed: false
                })
                .select()
                .single();

            if (error) throw error;

            return session as UserSession;
        } catch (error) {
            logger.error('[SessionService] Error starting session:', error);
            return null;
        }
    },

    /**
     * Obtiene la sesión activa actual del usuario.
     */
    getActiveSession: async (): Promise<UserSession | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await (supabase as any)
                .from('user_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('depth_completed', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data as UserSession;
        } catch (error) {
            logger.error('[SessionService] Error fetching active session:', error);
            return null;
        }
    },

    /**
     * Marca un atributo como completado en la sesión.
     */
    completeAttribute: async (sessionId: string, attributeId: string): Promise<void> => {
        const { data: current } = await (supabase as any)
            .from('user_sessions')
            .select('attributes_completed')
            .eq('id', sessionId)
            .single();

        const nextCompleted = [...((current as any)?.attributes_completed || []), attributeId];

        await (supabase as any)
            .from('user_sessions')
            .update({ attributes_completed: nextCompleted })
            .eq('id', sessionId);
    },

    /**
     * Calcula y guarda la clínica dominante al final de los atributos.
     */
    finalizeAttributes: async (sessionId: string): Promise<string | null> => {
        try {
            // 1. Contar votos de la sesión en signal_events
            const { data: votes } = await (supabase as any)
                .from('signal_events')
                .select('option_id')
                .eq('session_id', sessionId);

            // 1a. Añadir los votos en el outbox local
            const queuedVotes = getQueuedVotesForSession(sessionId);

            if ((!votes || votes.length === 0) && queuedVotes.length === 0) return null;

            // 2. Identificar la más votada
            const counts: Record<string, number> = {};

            // Database votes
            if (votes) {
                votes.forEach((v: any) => {
                    if (v.option_id) counts[v.option_id] = (counts[v.option_id] || 0) + 1;
                });
            }

            // Local queued votes
            queuedVotes.forEach(optionId => {
                counts[optionId] = (counts[optionId] || 0) + 1;
            });

            const winnerId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

            // 3. Persistir dominante
            await (supabase as any)
                .from('user_sessions')
                .update({ dominant_clinic_id: winnerId })
                .eq('id', sessionId);

            return winnerId;
        } catch (error) {
            logger.error('[SessionService] Error finalizing attributes:', error);
            return null;
        }
    },

    /**
     * Finaliza la sesión después de la profundidad.
     */
    completeDepth: async (sessionId: string): Promise<void> => {
        await (supabase as any)
            .from('user_sessions')
            .update({
                depth_completed: true,
                finished_at: new Date().toISOString()
            })
            .eq('id', sessionId);
    }
};

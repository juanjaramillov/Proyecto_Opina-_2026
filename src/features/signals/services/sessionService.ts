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
    startNewSession: async (): Promise<UserSession | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data: allAttributes } = await (supabase as any)
                .from('attributes')
                .select('id');

            if (!allAttributes || allAttributes.length === 0) return null;

            const selected = allAttributes
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map((a: any) => a.id);

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

    finalizeAttributes: async (sessionId: string): Promise<string | null> => {
        try {
            // 1) Contar votos de la sesión vía RPC (signal_events no permite SELECT directo por RLS)
            const { data: rows, error } = await supabase.rpc('get_session_vote_counts', {
                p_session_id: sessionId
            });

            if (error) throw error;

            // 1a) Añadir los votos en el outbox local
            const queuedVotes = getQueuedVotesForSession(sessionId);

            const voteRows = (rows || []) as Array<{ option_id: string | null; votes_count: number }>;

            if (voteRows.length === 0 && queuedVotes.length === 0) return null;

            const counts: Record<string, number> = {};

            voteRows.forEach((r) => {
                if (!r.option_id) return;
                const k = String(r.option_id);
                counts[k] = (counts[k] || 0) + Number(r.votes_count || 0);
            });

            queuedVotes.forEach(optionId => {
                const k = String(optionId);
                counts[k] = (counts[k] || 0) + 1;
            });

            const winnerEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            if (!winnerEntry) return null;

            const winnerId = winnerEntry[0];

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

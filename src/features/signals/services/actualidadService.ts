import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export interface ActualidadTopic {
    id: string;
    titulo: string;
    contexto_corto: string;
    categoria: string;
    pregunta_postura: { tipo: string; opciones: string[] };
    pregunta_impacto: { tipo: string; opciones: string[] };
    fecha_inicio: string | null;
    fecha_fin: string | null;
    estado: string;
    created_at: string;
}

export const actualidadService = {
    /**
     * Fetch active topics that the current user has NOT yet answered.
     */
    async getActiveTopicsUnanswered(): Promise<ActualidadTopic[]> {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                logger.error('Error fetching user for actualidad topics', { error: userError });
                return [];
            }

            // Get active topics
            const { data: topics, error: topicsError } = await supabase
                .from('actualidad_topics')
                .select('*')
                .eq('estado', 'activo');

            if (topicsError) {
                logger.error('Error fetching actualidad topics', { error: topicsError });
                return [];
            }

            if (!topics || topics.length === 0) return [];

            // Get user responses to filter out already answered topics
            const { data: responses, error: responsesError } = await supabase
                .from('user_actualidad_responses')
                .select('tema_id')
                .eq('user_id', user.id);

            if (responsesError) {
                logger.error('Error fetching user actualidad responses', { error: responsesError });
                // Fallback: return all active topics if we can't fetch responses
                return topics as ActualidadTopic[];
            }

            const answeredTopicIds = new Set(responses?.map(r => r.tema_id) || []);

            return (topics as ActualidadTopic[]).filter(topic => !answeredTopicIds.has(topic.id));

        } catch (error) {
            logger.error('Unexpected error fetching actualidad topics', { error });
            return [];
        }
    },

    /**
     * Submit a user's response to an Actualidad topic.
     */
    async submitResponse(
        temaId: string,
        categoriaTema: string,
        respuestaPostura: string,
        respuestaImpacto: string
    ): Promise<boolean> {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                logger.error('Error fetching user for actualidad submission', { error: userError });
                return false;
            }

            const { error } = await supabase
                .from('user_actualidad_responses')
                .insert([{
                    user_id: user.id,
                    tema_id: temaId,
                    categoria_tema: categoriaTema,
                    respuesta_postura: respuestaPostura,
                    respuesta_impacto: respuestaImpacto
                }]);

            if (error) {
                logger.error('Error saving user actualidad response', { error });
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Unexpected error tracking user actualidad response', { error });
            return false;
        }
    }
};

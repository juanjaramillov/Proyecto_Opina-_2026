import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { Topic, TopicQuestion, TopicStatus } from '../../signals/types/actualidad';
import { generateTopicSlug, validateTopicForPublication } from '../utils/actualidadHelpers';

export const adminActualidadCrudService = {
  /**
   * Obtener listado de temas filtrado por estado
   */
  async getAdminTopics(status: TopicStatus | 'all' = 'all'): Promise<Topic[]> {
    try {
      let query = supabase
        .from('current_topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        const statusesToQuery = status === 'detected' ? ['detected', 'draft'] : [status];
        query = query.in('status', statusesToQuery);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error al obtener temas de actualidad (Admin)', { error });
        throw error;
      }

      const rawData = data || [];
      return rawData.map((d) => ({
        ...d,
        summary: d.short_summary || '',
        impact_phrase: d.impact_quote || '',
        questions: []
      })) as unknown as Topic[];
    } catch (e) {
      logger.error('Error inesperado en getAdminTopics', { error: e });
      return [];
    }
  },

  /**
   * Obtener un tema por id con sus preguntas (y options)
   */
  async getAdminTopicById(id: string): Promise<Topic | null> {
    try {
      const { data: topic, error: topicError } = await supabase
        .from('current_topics')
        .select('*')
        .eq('id', id)
        .single();

      if (topicError || !topic) return null;

      // Obtener preguntas
      const { data: set } = await supabase
        .from('topic_question_sets')
        .select('id')
        .eq('topic_id', id)
        .single();

      let questions: TopicQuestion[] = [];
      if (set) {
        const { data: qData } = await supabase
          .from('topic_questions')
          .select('*')
          .eq('set_id', set.id)
          .order('question_order', { ascending: true });
        
        if (qData) {
          questions = qData.map(q => ({
            id: q.id,
            order: q.question_order,
            text: q.question_text,
            type: q.answer_type as TopicQuestion['type'],
            options: q.options_json as TopicQuestion['options']
          }));
        }
      }

      const rawTopic = topic as Record<string, unknown>;
      return {
        ...rawTopic,
        summary: rawTopic.short_summary || '',
        impact_phrase: rawTopic.impact_quote || '',
        questions
      } as unknown as Topic;
    } catch (e) {
      logger.error('Error inesperado en getAdminTopicById', { error: e });
      return null;
    }
  },

  /**
   * Guardar tema genérico con preguntas
   */
  async createTopicWithQuestions(topic: Partial<Topic>, questions: TopicQuestion[]): Promise<string | null> {
    try {
      const slug = topic.title ? generateTopicSlug(topic.title) : `tema-${Math.floor(Math.random() * 1000)}`;
      
      const { data: topicData, error: topicError } = await supabase
        .from('current_topics')
        .insert([{
          slug: topic.slug || slug,
          title: topic.title,
          short_summary: topic.summary,
          category: topic.category || 'País',
          status: topic.status || 'detected',
          impact_quote: topic.impact_phrase,
          tags: topic.tags || [],
          actors: topic.actors || [],
          intensity: topic.intensity || 1,
          relevance_chile: topic.relevance_chile || 3,
          confidence_score: topic.confidence_score,
          event_stage: topic.event_stage || 'discussion',
          topic_duration: topic.topic_duration || 'short',
          opinion_maturity: topic.opinion_maturity || 'low',
          source_domain: topic.source_domain,
          metadata: { source_url: topic.source_url } as unknown as Exclude<unknown, undefined>
        } as never])
        .select('id')
        .single();
        
      if (topicError || !topicData) throw topicError;
      
      await this.updateTopicQuestions(topicData.id, questions);
      return topicData.id;
    } catch (e) {
      logger.error('Error al guardar tema genérico', { error: e });
      return null;
    }
  },

  /**
   * Actualizar metadatos editoriales del tema. Marca automáticamente admin_edited=true
   */
  async updateTopicEditorialData(id: string, updates: Partial<Topic>, markAsAdminEdited: boolean = true): Promise<boolean> {
    try {
      const dbUpdates: Record<string, unknown> = { ...updates };
      // Map frontend interface to DB schema if needed
      if (updates.summary !== undefined) {
        dbUpdates.short_summary = updates.summary;
        delete dbUpdates.summary;
      }
      if (updates.impact_phrase !== undefined) {
        dbUpdates.impact_quote = updates.impact_phrase;
        delete dbUpdates.impact_phrase;
      }
      
      if (markAsAdminEdited) {
        dbUpdates.admin_edited = true;
      }

      // Avoid trying to update relations directly
      delete dbUpdates.questions; 
      delete dbUpdates.id;
      delete dbUpdates.created_at;
      delete dbUpdates.updated_at;

      const { error } = await supabase
        .from('current_topics')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      logger.error(`Error al actualizar data editorial del tema ${id}`, { error: e });
      return false;
    }
  },

  /**
   * Actualizar o sobreescribir las preguntas de un tema
   */
  async updateTopicQuestions(topicId: string, questions: TopicQuestion[]): Promise<boolean> {
    try {
      // 1. Obtener o crear setId
      let { data: set } = await supabase
        .from('topic_question_sets')
        .select('id')
        .eq('topic_id', topicId)
        .single();
      
      if (!set) {
        const { data: newSet, error: setError } = await supabase
          .from('topic_question_sets')
          .insert([{ topic_id: topicId }])
          .select('id')
          .single();
        if (setError || !newSet) throw setError || new Error('No se pudo crear Question Set');
        set = newSet;
      }

      // 2. Extraer IDs de las preguntas enviadas que YA existen
      const incomingIds = questions.filter(q => q.id).map(q => q.id!);

      // 3. Eliminar las preguntas que están en la base de datos pero NO en la lista entrante
      if (incomingIds.length > 0) {
        const { error: delError } = await supabase
          .from('topic_questions')
          .delete()
          .eq('set_id', set.id)
          .not('id', 'in', `(${incomingIds.join(',')})`);
        if (delError) throw delError;
      } else {
        // Si no vienen IDs, borrar todo
        const { error: delError } = await supabase
          .from('topic_questions')
          .delete()
          .eq('set_id', set.id);
        if (delError) throw delError;
      }

      // 4. Preparar UPSERT
      const questionsToUpsert = questions.map(q => {
        const payload: Record<string, unknown> = {
          set_id: set!.id,
          question_order: q.order,
          question_text: q.text,
          answer_type: q.type,
          options_json: q.options || []
        };
        // Si tiene un UUID, lo pasamos para UPSERT
        if (q.id) {
          payload.id = q.id;
        }
        return payload;
      });

      if (questionsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('topic_questions')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(questionsToUpsert as any[], { onConflict: 'id' });
        if (upsertError) throw upsertError;
      }

      return true;
    } catch (e: unknown) {
      logger.error(`Error actualizando preguntas para el tema ${topicId}`, { error: e });
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      alert(`[DIAGNÓSTICO OPINA] Error DB Preguntas: ${msg}`);
      return false;
    }
  },

  /**
   * Actualizar estado editorial (Detectado -> Aprobado -> Publicado, Archivación, etc)
   * Incluye defensas críticas para pubicaciones.
   */
  async updateTopicStatus(id: string, nextStatus: TopicStatus): Promise<{ success: boolean; error?: string }> {
    try {
      // Regla estricta antes de aprobar o publicar
      if (nextStatus === 'approved' || nextStatus === 'published') {
        const topic = await this.getAdminTopicById(id);
        if (!topic) return { success: false, error: 'Tema no existe' };
        
        const validation = validateTopicForPublication(topic);
        if (!validation.success) {
            return validation;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      const updates: Record<string, unknown> = { status: nextStatus };
      
      // Tracking editorial
      if (nextStatus === 'review' && user) {
        updates.created_by = user.id;
      }
      if (nextStatus === 'approved' && user) {
        updates.reviewed_by = user.id;
        updates.approved_by = user.id;
      }
      if (nextStatus === 'published') {
        updates.published_at = new Date().toISOString();
      }
      if (nextStatus === 'archived') {
        updates.archived_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('current_topics')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (e) {
      logger.error(`Error al cambiar estado de tema ${id} a ${nextStatus}`, { error: e });
      return { success: false, error: 'Excepción de base de datos' };
    }
  },

  /**
   * Marcar explícitamente si fue editado por admin
   */
  async markAsAdminEdited(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('current_topics')
        .update({ admin_edited: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      logger.error(`Error al marcar editado por admin en tema ${id}`, { error: e });
      return false;
    }
  }
};

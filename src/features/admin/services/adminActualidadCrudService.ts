import { supabase } from '../../../supabase/client';
import { typedRpc } from '../../../supabase/typedRpc';
import { logger } from '../../../lib/logger';
import { Topic, TopicQuestion, TopicStatus } from '../../signals/types/actualidad';

/**
 * Servicio CRUD admin para temas de Actualidad.
 *
 * Toda escritura (y la lectura consolidada por id) pasa por RPCs
 * SECURITY DEFINER definidas en la migración
 * `20260426000100_admin_actualidad_rpcs.sql`. El cliente nunca toca
 * `current_topics`, `topic_question_sets` ni `topic_questions`
 * directamente para escritura — el gate de admin y el audit log
 * viven server-side.
 *
 * El listado plano (`getAdminTopics`) sigue como SELECT directo:
 * está protegido por RLS y no necesita reglas de negocio extra,
 * así que no amerita una RPC dedicada.
 */
export const adminActualidadCrudService = {
  /**
   * Listar temas filtrado por estado. Lectura plana protegida por RLS.
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
   * Obtener tema completo (con preguntas) en un solo round-trip.
   * Backed by RPC admin_actualidad_get_topic_full.
   */
  async getAdminTopicById(id: string): Promise<Topic | null> {
    try {
      const { data, error } = await typedRpc<{
        topic: Record<string, unknown>;
        questions: Array<{
          id: string;
          order: number;
          text: string;
          type: TopicQuestion['type'];
          options: TopicQuestion['options'];
        }>;
      } | null>('admin_actualidad_get_topic_full', { p_id: id });

      if (error) {
        logger.error(`Error en RPC admin_actualidad_get_topic_full(${id})`, { error });
        return null;
      }
      if (!data) return null;

      const topic = data.topic;
      const questions: TopicQuestion[] = (data.questions || []).map((q) => ({
        id: q.id,
        order: q.order,
        text: q.text,
        type: q.type,
        options: q.options
      }));

      return {
        ...topic,
        summary: topic.short_summary || '',
        impact_phrase: topic.impact_quote || '',
        questions
      } as unknown as Topic;
    } catch (e) {
      logger.error('Error inesperado en getAdminTopicById', { error: e });
      return null;
    }
  },

  /**
   * Crear tema atómicamente (topic + question_set + questions).
   * Backed by RPC admin_actualidad_create_topic.
   */
  async createTopicWithQuestions(
    topic: Partial<Topic>,
    questions: TopicQuestion[]
  ): Promise<string | null> {
    try {
      const { data, error } = await typedRpc<string>('admin_actualidad_create_topic', {
        p_topic: {
          title: topic.title,
          slug: topic.slug,
          summary: topic.summary,
          category: topic.category,
          status: topic.status,
          impact_phrase: topic.impact_phrase,
          tags: topic.tags,
          actors: topic.actors,
          intensity: topic.intensity,
          relevance_chile: topic.relevance_chile,
          confidence_score: topic.confidence_score,
          event_stage: topic.event_stage,
          topic_duration: topic.topic_duration,
          opinion_maturity: topic.opinion_maturity,
          source_domain: topic.source_domain,
          source_url: topic.source_url
        },
        p_questions: questions.map((q) => ({
          order: q.order,
          text: q.text,
          type: q.type,
          options: q.options || []
        }))
      });

      if (error) {
        logger.error('Error en RPC admin_actualidad_create_topic', { error });
        return null;
      }
      return data || null;
    } catch (e) {
      logger.error('Error al guardar tema genérico', { error: e });
      return null;
    }
  },

  /**
   * Actualizar metadatos editoriales del tema.
   * Backed by RPC admin_actualidad_update_editorial.
   *
   * NOTA: la whitelist de columnas editables vive server-side. Cualquier
   * campo no whitelist (status, *_by, *_at, admin_edited, id, slug,
   * timestamps) se ignora silenciosamente.
   */
  async updateTopicEditorialData(
    id: string,
    updates: Partial<Topic>,
    markAsAdminEdited: boolean = true
  ): Promise<boolean> {
    try {
      const { data, error } = await typedRpc<boolean>('admin_actualidad_update_editorial', {
        p_id: id,
        p_updates: updates as Record<string, unknown>,
        p_mark_admin_edited: markAsAdminEdited
      });

      if (error) {
        logger.error(`Error en RPC admin_actualidad_update_editorial(${id})`, { error });
        return false;
      }
      return data === true;
    } catch (e) {
      logger.error(`Error al actualizar data editorial del tema ${id}`, { error: e });
      return false;
    }
  },

  /**
   * Sincronizar preguntas de un tema (delete-then-upsert atómico).
   * Backed by RPC admin_actualidad_upsert_questions.
   */
  async updateTopicQuestions(topicId: string, questions: TopicQuestion[]): Promise<boolean> {
    try {
      const payload = questions.map((q) => ({
        id: q.id,
        order: q.order,
        text: q.text,
        type: q.type,
        options: q.options || []
      }));

      const { data, error } = await typedRpc<boolean>('admin_actualidad_upsert_questions', {
        p_topic_id: topicId,
        p_questions: payload
      });

      if (error) {
        logger.error(`Error en RPC admin_actualidad_upsert_questions(${topicId})`, { error });
        return false;
      }
      return data === true;
    } catch (e: unknown) {
      logger.error(`Error actualizando preguntas para el tema ${topicId}`, { error: e });
      return false;
    }
  },

  /**
   * Cambiar estado editorial. Reglas de negocio (validación de
   * transición + tracking editorial) viven server-side.
   * Backed by RPC admin_actualidad_update_status.
   */
  async updateTopicStatus(
    id: string,
    nextStatus: TopicStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await typedRpc<{
        success: boolean;
        error?: string;
        message?: string;
      }>('admin_actualidad_update_status', {
        p_id: id,
        p_next_status: nextStatus
      });

      if (error) {
        logger.error(`Error en RPC admin_actualidad_update_status(${id})`, { error });
        return { success: false, error: 'Excepción de base de datos' };
      }

      if (!data || data.success !== true) {
        return {
          success: false,
          error: data?.message || data?.error || 'No se pudo actualizar el estado'
        };
      }

      return { success: true };
    } catch (e) {
      logger.error(`Error al cambiar estado de tema ${id} a ${nextStatus}`, { error: e });
      return { success: false, error: 'Excepción de base de datos' };
    }
  },

  /**
   * Marcar admin_edited=true. Backed by RPC admin_actualidad_mark_edited.
   */
  async markAsAdminEdited(id: string): Promise<boolean> {
    try {
      const { data, error } = await typedRpc<boolean>('admin_actualidad_mark_edited', {
        p_id: id
      });

      if (error) {
        logger.error(`Error en RPC admin_actualidad_mark_edited(${id})`, { error });
        return false;
      }
      return data === true;
    } catch (e) {
      logger.error(`Error al marcar editado por admin en tema ${id}`, { error: e });
      return false;
    }
  },

  /**
   * Bulk hard delete. Backed by RPC admin_actualidad_delete_topics.
   * Devuelve true solo si se borró al menos una fila (detecta fallos
   * silenciosos por RLS u ids inválidos sin que el frontend tenga que
   * conocer detalles de RLS).
   */
  async deleteTopics(ids: string[]): Promise<boolean> {
    if (!ids.length) return true;
    try {
      const { data, error } = await typedRpc<number>('admin_actualidad_delete_topics', {
        p_ids: ids
      });

      if (error) {
        logger.error('Error en RPC admin_actualidad_delete_topics', { error, ids });
        return false;
      }

      const deleted = data ?? 0;
      if (deleted === 0) {
        logger.warn('admin_actualidad_delete_topics no borró ningún registro', { ids });
        return false;
      }

      return true;
    } catch (e) {
      logger.error('Error al realizar bulk delete de temas', { error: e, ids });
      return false;
    }
  }
};

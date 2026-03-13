import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { Topic, TopicQuestion, TopicStatus, AiTopicPayload, validateAiTopicPayload } from '../../signals/types/actualidad';

export const adminActualidadService = {
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

      return data.map((d: { short_summary?: string | null; impact_quote?: string | null; [key: string]: unknown }) => ({
        ...d,
        summary: d.short_summary,
        impact_phrase: d.impact_quote
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

      return {
        ...(topic as Record<string, unknown>),
        summary: topic.short_summary,
        impact_phrase: topic.impact_quote,
        questions
      } as unknown as Topic;
    } catch (e) {
      logger.error('Error inesperado en getAdminTopicById', { error: e });
      return null;
    }
  },

  /**
   * Crear tema detectado desde Payload IA (Guardando snapshot en metadata)
   */
  async createTopicFromDetectedAiPayload(payload: AiTopicPayload): Promise<string | null> {
    try {
      // 1. Generar slug único básico
      const baseSlug = payload.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
      const slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;

      // 2. Extraer dominio simple para source_domain
      let domain = '';
      try {
        if (payload.source_url) {
          domain = new URL(payload.source_url).hostname.replace('www.', '');
        }
      } catch { /* ignore */ }

      // 3. Crear Topic
      const metadataSnapshot = { raw_ai_payload: payload, source_url: payload.source_url };
      
      const { data: topicData, error: topicError } = await supabase
        .from('current_topics')
        .insert([{
          slug,
          title: payload.title,
          short_summary: payload.summary,
          category: payload.category,
          status: 'detected',
          impact_quote: payload.impact_phrase,
          tags: payload.tags || [],
          actors: payload.actors || [],
          intensity: payload.intensity || 1,
          relevance_chile: payload.relevance_chile || 3,
          confidence_score: payload.confidence_score || 0,
          event_stage: payload.event_stage || 'announcement',
          topic_duration: payload.topic_duration || 'short',
          opinion_maturity: payload.opinion_maturity || 'low',
          source_domain: domain,
          created_by_ai: true,
          admin_edited: false,
          metadata: metadataSnapshot as unknown as Exclude<unknown, undefined>
        } as never])
        .select('id')
        .single();

      if (topicError || !topicData) throw topicError;
      
      const topicId = topicData.id;

      // 4. Asegurar Questions
      if (payload.questions && Array.isArray(payload.questions)) {
        await this.updateTopicQuestions(topicId, payload.questions);
      }

      return topicId;
    } catch (e) {
      logger.error('Error al crear tema detectado a partir del Payload IA', { error: e });
      return null;
    }
  },

  /**
   * Ingesta segura de payload IA.
   * Sanitiza, valida estrictamente, y verifica duplicados.
   */
  async ingestAiTopicPayload(payload: unknown): Promise<{ success: boolean; topicId?: string; errors?: string[] }> {
    try {
      // 1. Validación de estructura base
      const errors = validateAiTopicPayload(payload);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      // Asegurar tipado tras validación
      const cleanPayload = payload as AiTopicPayload;

      // 2. Sanitización (limpiar strings, espacios)
      cleanPayload.title = cleanPayload.title.trim();
      cleanPayload.summary = cleanPayload.summary.trim();
      cleanPayload.impact_phrase = cleanPayload.impact_phrase?.trim() || "Sin impacto definido";
      cleanPayload.source_url = cleanPayload.source_url.trim();

      // 3. Verificación de duplicados estrictos (URL idéntico)
      const { data: dupUrl } = await supabase
        .from('current_topics')
        .select('id')
        .eq('metadata->>source_url', cleanPayload.source_url)
        .limit(1);

      if (dupUrl && dupUrl.length > 0) {
        return { success: false, errors: ['El source_url ya existe en la base de datos (Duplicado exacto).'] };
      }

      // 4. Verificación de duplicados por título (Similar en últimos 3 días)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: dupTitle } = await supabase
        .from('current_topics')
        .select('id')
        .ilike('title', cleanPayload.title)
        .gte('created_at', threeDaysAgo.toISOString())
        .limit(1);

      if (dupTitle && dupTitle.length > 0) {
        return { success: false, errors: ['Un tema con título muy similar fue creado en los últimos 3 días (Posible tema repetido).'] };
      }

      // 5. Persistir usando la capa existente
      const topicId = await this.createTopicFromDetectedAiPayload(cleanPayload);
      
      if (!topicId) {
        return { success: false, errors: ['Error interno al persistir en base de datos.'] };
      }

      return { success: true, topicId };

    } catch (e: unknown) {
      logger.error('Fallo grave en capa de ingestión IA', { error: e });
      return { success: false, errors: [(e as Error).message || 'Excepción desconocida durante ingestión'] };
    }
  },

  /**
   * Guardar tema genérico con preguntas
   */
  async createTopicWithQuestions(topic: Partial<Topic>, questions: TopicQuestion[]): Promise<string | null> {
    try {
      const slug = topic.title?.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
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
          .upsert(questionsToUpsert as any[], { onConflict: 'id' });
        if (upsertError) throw upsertError;
      }

      return true;
    } catch (e) {
      logger.error(`Error actualizando preguntas para el tema ${topicId}`, { error: e });
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
        
        // Simular validación editorial estricta
        if (!topic.title || topic.title.trim() === '') return { success: false, error: 'El tema requiere un título válido.' };
        if (!topic.summary || topic.summary.trim() === '') return { success: false, error: 'Falta un resumen neutral para su publicación.' };
        if (!topic.category) return { success: false, error: 'Falta configurar una categoría válida.' };
        
        // Validación de preguntas asociadas
        if (!topic.questions || topic.questions.length !== 3) {
            return { success: false, error: 'La arquitectura requiere STRICTAMENTE 3 preguntas para ser operado, no ' + (topic.questions?.length || 0) };
        }
        for (const [idx, q] of topic.questions.entries()) {
            if (!q.text || q.text.trim() === '') return { success: false, error: `La pregunta ${idx + 1} no tiene texto.` };
            if (['single_choice', 'single_choice_polar'].includes(q.type) && (!q.options || q.options.length < 2)) {
                return { success: false, error: `La pregunta ${idx + 1} (${q.type}) requiere al menos 2 alternativas establecidas.` };
            }
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

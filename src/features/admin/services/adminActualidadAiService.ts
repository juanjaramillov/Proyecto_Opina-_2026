import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';
import { AiTopicPayload, validateAiTopicPayload } from '../../signals/types/actualidad';
import { generateTopicSlug, extractDomainFromUrl } from '../utils/actualidadHelpers';
import { adminActualidadCrudService } from './adminActualidadCrudService';

export const adminActualidadAiService = {
  /**
   * Crear tema detectado desde Payload IA (Guardando snapshot en metadata)
   */
  async createTopicFromDetectedAiPayload(payload: AiTopicPayload): Promise<string | null> {
    try {
      // 1. Generar slug único básico
      const slug = generateTopicSlug(payload.title);

      // 2. Extraer dominio simple para source_domain
      const domain = extractDomainFromUrl(payload.source_url);

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
        await adminActualidadCrudService.updateTopicQuestions(topicId, payload.questions);
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
  }
};

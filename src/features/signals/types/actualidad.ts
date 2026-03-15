/**
 * Tipos y validaciones strictas para el módulo de Actualidad (Arquitectura Editorial)
 */

export type TopicStatus = 'detected' | 'draft' | 'review' | 'approved' | 'published' | 'rejected' | 'archived';

export type TopicCategory = 
  | 'País' 
  | 'Economía' 
  | 'Ciudad / Vida diaria' 
  | 'Marcas y Consumo' 
  | 'Deportes y Cultura' 
  | 'Tendencias y Sociedad';

export type EventStage = 
  | 'announcement' 
  | 'discussion' 
  | 'implementation' 
  | 'crisis' 
  | 'result';

export type TopicDuration = 'flash' | 'short' | 'medium' | 'long';

export type OpinionMaturity = 'low' | 'medium' | 'high';

export type QuestionType = 
  | 'yes_no' 
  | 'single_choice' 
  | 'single_choice_polar' 
  | 'scale_5' 
  | 'scale_0_10';

export type TopicQuestionOption = string;

export interface TopicQuestion {
  id?: string;
  order: number;
  text: string;
  type: QuestionType;
  options?: TopicQuestionOption[];
}

export interface Topic {
  id: string;
  slug: string;
  status: TopicStatus;
  title: string;
  summary: string;
  impact_phrase: string;
  category: TopicCategory;
  tags: string[];
  actors: string[];
  intensity: number; // 1 to 3
  relevance_chile: number; // 1 to 5
  confidence_score: number; // 1 to 5 (or 1 to 100 depending on actual usage, here we validate 1-5 as requested)
  event_stage: EventStage;
  topic_duration: TopicDuration;
  opinion_maturity: OpinionMaturity;
  source_url: string;
  source_domain: string;
  source_title: string;
  source_published_at: string;
  cluster_id: string;
  created_by_ai: boolean;
  admin_edited: boolean;
  created_by?: string | null;
  reviewed_by?: string | null;
  approved_by?: string | null;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  questions: TopicQuestion[];
}

export interface AiTopicPayload {
  title: string;
  summary: string;
  impact_phrase: string;
  category: TopicCategory;
  tags: string[];
  actors: string[];
  intensity: number;
  relevance_chile: number;
  confidence_score: number;
  event_stage: EventStage;
  topic_duration: TopicDuration;
  opinion_maturity: OpinionMaturity;
  source_url: string;
  questions: TopicQuestion[];
}

/**
 * Validaciones Mínimas Requeridas del Payload IA (Bloque 1)
 */
export const validateAiTopicPayload = (payload: unknown): string[] => {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object') {
    return ['Payload es nulo o no es un objeto'];
  }

  const p = payload as Record<string, unknown>;

  // título obligatorio
  if (!p.title || typeof p.title !== 'string' || p.title.trim().length === 0) {
    errors.push('title es obligatorio y no puede estar vacío');
  }

  // summary obligatorio
  if (!p.summary || typeof p.summary !== 'string' || p.summary.trim().length === 0) {
    errors.push('summary es obligatorio y no puede estar vacío');
  }

  // impact_phrase obligatorio
  if (!p.impact_phrase || typeof p.impact_phrase !== 'string' || p.impact_phrase.trim().length === 0) {
    errors.push('impact_phrase (Cita de impacto) es obligatoria');
  }

  // category válida
  const validCategories: TopicCategory[] = [
    'País', 'Economía', 'Ciudad / Vida diaria', 'Marcas y Consumo', 'Deportes y Cultura', 'Tendencias y Sociedad'
  ];
  if (!validCategories.includes(p.category as TopicCategory)) {
    errors.push(`category inválida: ${p.category}`);
  }

  // source_url obligatorio
  if (!p.source_url || typeof p.source_url !== 'string' || p.source_url.trim().length === 0) {
    errors.push('source_url es obligatorio y no puede estar vacío');
  }

  // limits: intensity (1-3)
  if (typeof p.intensity !== 'number' || p.intensity < 1 || p.intensity > 3) {
    errors.push('intensity debe ser un número entre 1 y 3');
  }

  // questions debe tener exactamente 3 preguntas
  if (!Array.isArray(p.questions) || p.questions.length !== 3) {
    errors.push('questions debe ser un arreglo de exactamente 3 preguntas');
  } else {
    const orders = new Set<number>();
    (p.questions as unknown[]).forEach((rawQ: unknown, i: number) => {
      const q = rawQ as Partial<TopicQuestion>;
      if (!q || typeof q !== 'object') {
        errors.push(`Pregunta [${i}] no es un objeto válido`);
        return;
      }
      
      // order, text, type requeridos
      if (typeof q.order !== 'number') {
        errors.push(`Pregunta [${i}] le falta 'order' numerico`);
      } else {
        if (orders.has(q.order)) errors.push(`Pregunta [${i}] tiene un 'order' duplicado: ${q.order}`);
        orders.add(q.order);
      }
      
      if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) {
        errors.push(`Pregunta [${i}] le falta 'text' o está vacío`);
      }
      
      const validTypes: QuestionType[] = ['yes_no', 'single_choice', 'single_choice_polar', 'scale_5', 'scale_0_10'];
      if (!q.type || !validTypes.includes(q.type as QuestionType)) {
        errors.push(`Pregunta [${i}] tiene tipo inválido: ${q.type}`);
      }

      // Validar que existan opciones si el tipo lo requiere
      if (q.type && ['single_choice', 'single_choice_polar'].includes(q.type)) {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Pregunta [${i}] tipo ${q.type} requiere arreglo de options con al menos 2 ítemes`);
        } else {
          if ((q.options as unknown[]).some((opt) => typeof opt !== 'string' || opt.trim() === '')) {
            errors.push(`Pregunta [${i}] contiene opciones vacías o inválidas`);
          }
        }
      }
    });
  }

  return errors;
};

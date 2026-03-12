import { supabase } from '../../supabase/client';

export interface ModuleHighlight {
  module: 'Versus' | 'Progressive' | 'Depth' | 'Actualidad' | 'Pulse';
  title: string;
  description: string;
  value?: string;
}

/**
 * Obtiene highlights resumidos por familia de señales para mostrar en B2C.
 */
export async function getResultsModuleHighlights(): Promise<ModuleHighlight[]> {
  const highlights: ModuleHighlight[] = [];

  // Highlight de Versus (El que tiene mayor Win Rate)
  const { data: versusData } = await (supabase as any)
    .from('v_comparative_preference_summary')
    .select('entity_name, win_rate, preference_share')
    .order('win_rate', { ascending: false })
    .limit(1)
    .single();

  if (versusData) {
    highlights.push({
      module: 'Versus',
      title: 'Dominio de Preferencia',
      description: `${versusData.entity_name} lidera las comparaciones cruzadas.`,
      value: `${versusData.preference_share}% Win Share`
    });
  }

  // Highlight de Depth (El de mayor Score o volumen)
  const { data: depthData } = await (supabase as any)
    .from('v_depth_entity_question_summary')
    .select('entity_name, question_label, average_score')
    .not('average_score', 'is', null)
    .order('average_score', { ascending: false })
    .limit(1)
    .single();

  if (depthData) {
    highlights.push({
      module: 'Depth',
      title: 'Mejor Evaluado en Profundidad',
      description: `${depthData.entity_name} obitiene los promedios numéricos más altos.`,
      value: `Score: ${depthData.average_score}`
    });
  }

  // Static Insights para los módulos nacientes en UX
  highlights.push({
    module: 'Pulse',
    title: 'Tu Pulso Personal',
    description: 'Tus respuestas emocionales están siendo calibradas.',
    value: 'En Proceso'
  });

  return highlights;
}

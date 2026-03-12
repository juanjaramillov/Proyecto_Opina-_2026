import { supabase } from '../../supabase/client';

export interface ComparisonSummary {
  message: string;
  isMajority: boolean;
  scoreMessage?: string;
}

/**
 * Muestra al usuario cómo se compara su señal temporal actual o estática
 * con la agregación general B2C.
 *
 * @param entityId Opcional UUID de una entidad a revisar
 */
export async function getResultsComparisonSummary(entityId?: string): Promise<ComparisonSummary> {
  // Simularemos logicamente el endpoint si no hay un entity_id (modo anónimo global)
  // Lo ideal en el futuro es cruzar con 'user_id' o 'anon_id'
  
  if (!entityId) {
    return {
      message: "Tus preferencias suelen alinearse con la mayoría de Opina+.",
      isMajority: true
    };
  }

  const { data } = await (supabase as any)
    .from('v_comparative_preference_summary')
    .select('preference_share, wins_count, losses_count')
    .eq('entity_id', entityId)
    .single();

  if (!data) {
    return {
      message: "Aún estamos recopilando suficientes señales sobre tu entidad reciente.",
      isMajority: false
    };
  }

  const isMaj = data.preference_share > 50;
  
  return {
    message: isMaj 
      ? `Tu elección coincide con la mayoría (${data.preference_share}% de las veces prefiere esta opción).` 
      : `Tu preferencia fue minoritaria (sólo elegida un ${data.preference_share}% de las veces).`,
    isMajority: isMaj
  };
}

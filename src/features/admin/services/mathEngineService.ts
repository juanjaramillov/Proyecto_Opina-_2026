import { supabase } from "../../../supabase/client";

/**
 * Servicio para conenctar la vista de Admin (Simulador Numérico)
 * con las RPCs del Motor Estadístico (Canonical Analytics)
 */
export const mathEngineService = {
  /**
   * Simula el Time Decay de una señal
   * @param daysOld Antigüedad de la señal en días (simulado)
   * @param halfLife Vida media configurada
   */
  simulateTimeDecay: async (daysOld: number, halfLife: number = 30): Promise<number> => {
    // Calculamos la fecha que represente esos días en el pasado
    const signalDate = new Date();
    signalDate.setDate(signalDate.getDate() - daysOld);
    
    const { data, error } = await supabase.rpc("opina_math_time_decay", {
      signal_timestamp: signalDate.toISOString(),
      half_life_days: halfLife
    });

    if (error) {
      console.error("Error al calcular Time Decay:", error);
      throw error;
    }

    return Number(data) || 0;
  },

  /**
   * Simula el cálculo del Wilson Score Interval (Límite Inferior)
   */
  simulateWilsonScore: async (positiveVotes: number, totalVotes: number, confidence: number = 1.96): Promise<number> => {
    const { data, error } = await supabase.rpc("opina_math_wilson_score", {
      positive_votes: positiveVotes,
      total_votes: totalVotes,
      z_value: confidence
    });

    if (error) {
      console.error("Error al calcular Wilson Score:", error);
      throw error;
    }

    return Number(data) || 0;
  },

  /**
   * Simula la entropía de Shannon pasándole los "shares" porcentuales o fraccionales (Ej: [0.3, 0.4, 0.3])
   */
  simulateShannonEntropy: async (shares: number[]): Promise<number> => {
    const { data, error } = await supabase.rpc("opina_math_shannon_entropy_json", {
      shares: shares
    });

    if (error) {
      console.error("Error al calcular Entropía:", error);
      throw error;
    }

    return Number(data) || 0;
  },

  /**
   * Obtiene la configuración maestra actual del motor
   */
  getEngineConfig: async () => {
    const { data, error } = await supabase
      .from('analytics_engine_config')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error("Error al obtener config:", error);
      throw error;
    }
    return data;
  },

  /**
   * Actualiza la configuración maestra del motor
   */
  updateEngineConfig: async (configParams: Partial<Record<string, number>>) => {
    const { data: current } = await supabase
      .from('analytics_engine_config')
      .select('id')
      .limit(1)
      .single();

    if (!current?.id) throw new Error("Configuración principal no encontrada");

    const { error } = await supabase
      .from('analytics_engine_config')
      .update(configParams)
      .eq('id', current.id);

    if (error) {
      console.error("Error al actualizar config:", error);
      throw error;
    }
    return true;
  }
};

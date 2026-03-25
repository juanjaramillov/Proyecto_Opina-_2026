import { ConfidenceLevel, SufficiencyState } from '../types';

/**
 * Reglas de negocio rígidas para transformar datos sueltos en determinaciones canónicas de plataforma.
 * Esta capa centraliza todos los umbrales "mágicos" evitando que se esparzan por componentes UI o servicios adhoc.
 */

export const ThresholdPolicies = {
  
  // ----------------------------------------------------------------------
  // 1. COMPARACIONES Y MAYORÍAS
  // ----------------------------------------------------------------------

  /**
   * Determina si una cuota de preferencia (0-100) constituye una mayoría absoluta.
   * Se considera mayoría un apoyo mayor o igual al 50%.
   */
  isMajority(preferenceSharePct: number): boolean {
    return preferenceSharePct >= 50.0;
  },

  /**
   * Determina si una comparación está altamente polarizada basándose en la varianza mínima 
   * permitida entre el share y el empate (50/50).
   * Ej: Un resultado 52% vs 48% es considerado muy competitivo / polarizado.
   */
  isHighlyPolarized(preferenceSharePct: number): boolean {
    const delta = Math.abs(preferenceSharePct - 50);
    return delta <= 5; // Margen de +/- 5% respecto al 50%
  },

  // ----------------------------------------------------------------------
  // 2. SUFICIENCIA DE DATOS DE USUARIO B2C
  // ----------------------------------------------------------------------

  /**
   * Evalúa si el historial del usuario provee datos suficientes para mostrar un 
   * tablero de resultados rico (Evolución temporal y cruces de postura útiles).
   */
  evaluateUserSufficiency(totalSignals: number): SufficiencyState {
    if (totalSignals === 0) return 'insufficient_data';
    if (totalSignals < 5) return 'partial_data';
    return 'sufficient_data';
  },

  // ----------------------------------------------------------------------
  // 3. SUFICIENCIA Y CONFIANZA DE DATOS B2B (Métricas Canónicas)
  // ----------------------------------------------------------------------

  /**
   * Evalúa la confianza global (Confidence Level) de un insight o resultado
   * basado en la robustez estadística de su muestra interactiva.
   */
  evaluateConfidence(sampleSize: number): ConfidenceLevel {
    if (sampleSize < 10) return 'none';           // Muestra basura o casi inexistente
    if (sampleSize < 50) return 'exploratory';    // Muestra indicativa pero muy volátil
    if (sampleSize < 500) return 'confident';     // Intervalos de confianza útiles
    return 'highly_confident';                    // Sample size mayoritario
  },

  /**
   * Evalúa si una entidad califica para aparecer en un leaderboad formal global
   * requiriendo al menos 10 cruces / opiniones directas emitidas para mitigar el ruido estadístico.
   */
  isEligibleForGlobalRanking(totalInteractions: number): boolean {
    return totalInteractions >= 10;
  }
};

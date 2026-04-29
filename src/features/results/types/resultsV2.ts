/**
 * Tipos compartidos para la página V2 de Resultados (/results-v2).
 *
 * Esta nueva página es un dashboard editorial híbrido con:
 *   - 7 vistas seleccionables (Resumen, Tendencias, Versus, Torneos, Profundidad, Noticias, Mapa)
 *   - 5 filtros B2C (generación, sexo, edad, educación, geografía)
 *   - Visualizaciones innovadoras alineadas al sistema V17
 *
 * Estado: en construcción (Sesión 1 — chasis).
 * Validador humano externo pendiente antes de promover sobre /results.
 */

export type ResultsV2View =
  | 'resumen'
  | 'tendencias'
  | 'versus'
  | 'torneos'
  | 'profundidad'
  | 'noticias'
  | 'mapa';

export type GenerationFilter = 'ALL' | 'GEN_Z' | 'MILLENNIAL' | 'GEN_X' | 'BOOMER';

export type SexFilter = 'ALL' | 'FEMENINO' | 'MASCULINO' | 'OTRO';

export type EducationFilter = 'ALL' | 'SECUNDARIA' | 'UNIVERSITARIA' | 'POSTGRADO';

export interface AgeRange {
  min: number; // 16
  max: number; // 80
}

export interface GeoFilter {
  /** ID de región. 'ALL' para todo el país. */
  region: string;
  /** Lista de comunas seleccionadas (vacía = todas las comunas de la región seleccionada). */
  comunas: string[];
}

export interface ResultsV2Filters {
  generation: GenerationFilter;
  sex: SexFilter;
  age: AgeRange;
  education: EducationFilter;
  geo: GeoFilter;
}

export interface ResultsV2State {
  view: ResultsV2View;
  filters: ResultsV2Filters;
}

export const DEFAULT_FILTERS: ResultsV2Filters = {
  generation: 'ALL',
  sex: 'ALL',
  age: { min: 16, max: 80 },
  education: 'ALL',
  geo: { region: 'ALL', comunas: [] },
};

export const DEFAULT_VIEW: ResultsV2View = 'resumen';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ResultsV2View,
  ResultsV2Filters,
  GenerationFilter,
  SexFilter,
  EducationFilter,
  AgeRange,
  GeoFilter,
  DEFAULT_FILTERS,
  DEFAULT_VIEW,
} from '../types/resultsV2';

/**
 * Hook de estado para /results-v2.
 *
 * Persiste vista activa + filtros como URL params, así:
 *   - el usuario puede compartir un link con sus filtros aplicados
 *   - refresh no pierde el estado
 *   - back/forward del browser funciona naturalmente
 *
 * URL formato:
 *   /results-v2?view=tendencias&gen=GEN_Z&sex=ALL&age=18-30&edu=UNIVERSITARIA
 *               &region=RM&comunas=santiago,providencia
 */

const VALID_VIEWS: ResultsV2View[] = [
  'resumen', 'tendencias', 'versus', 'torneos', 'profundidad', 'noticias', 'mapa',
];

const VALID_GENERATIONS: GenerationFilter[] = ['ALL', 'GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];
const VALID_SEX: SexFilter[] = ['ALL', 'FEMENINO', 'MASCULINO', 'OTRO'];
const VALID_EDU: EducationFilter[] = ['ALL', 'SECUNDARIA', 'UNIVERSITARIA', 'POSTGRADO'];

function parseAgeRange(raw: string | null): AgeRange {
  if (!raw) return DEFAULT_FILTERS.age;
  const m = raw.match(/^(\d{1,3})-(\d{1,3})$/);
  if (!m) return DEFAULT_FILTERS.age;
  const min = Math.max(16, Math.min(80, parseInt(m[1], 10)));
  const max = Math.max(16, Math.min(80, parseInt(m[2], 10)));
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

function parseGeo(region: string | null, comunas: string | null): GeoFilter {
  return {
    region: region || 'ALL',
    comunas: comunas ? comunas.split(',').filter(Boolean) : [],
  };
}

export function useResultsV2State() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------- READ from URL ----------
  const view = useMemo<ResultsV2View>(() => {
    const v = searchParams.get('view');
    return (VALID_VIEWS.includes(v as ResultsV2View) ? v : DEFAULT_VIEW) as ResultsV2View;
  }, [searchParams]);

  const filters = useMemo<ResultsV2Filters>(() => {
    const gen = searchParams.get('gen');
    const sex = searchParams.get('sex');
    const edu = searchParams.get('edu');
    return {
      generation: (VALID_GENERATIONS.includes(gen as GenerationFilter) ? gen : 'ALL') as GenerationFilter,
      sex: (VALID_SEX.includes(sex as SexFilter) ? sex : 'ALL') as SexFilter,
      age: parseAgeRange(searchParams.get('age')),
      education: (VALID_EDU.includes(edu as EducationFilter) ? edu : 'ALL') as EducationFilter,
      geo: parseGeo(searchParams.get('region'), searchParams.get('comunas')),
    };
  }, [searchParams]);

  // ---------- WRITE to URL ----------
  const setView = useCallback(
    (next: ResultsV2View) => {
      const sp = new URLSearchParams(searchParams);
      if (next === DEFAULT_VIEW) sp.delete('view');
      else sp.set('view', next);
      setSearchParams(sp, { replace: false });
    },
    [searchParams, setSearchParams],
  );

  const setFilters = useCallback(
    (patch: Partial<ResultsV2Filters>) => {
      const sp = new URLSearchParams(searchParams);
      const next = { ...filters, ...patch };

      // generation
      if (next.generation === 'ALL') sp.delete('gen');
      else sp.set('gen', next.generation);

      // sex
      if (next.sex === 'ALL') sp.delete('sex');
      else sp.set('sex', next.sex);

      // age
      if (next.age.min === DEFAULT_FILTERS.age.min && next.age.max === DEFAULT_FILTERS.age.max) {
        sp.delete('age');
      } else {
        sp.set('age', `${next.age.min}-${next.age.max}`);
      }

      // education
      if (next.education === 'ALL') sp.delete('edu');
      else sp.set('edu', next.education);

      // geo
      if (next.geo.region === 'ALL') {
        sp.delete('region');
        sp.delete('comunas');
      } else {
        sp.set('region', next.geo.region);
        if (next.geo.comunas.length > 0) sp.set('comunas', next.geo.comunas.join(','));
        else sp.delete('comunas');
      }

      setSearchParams(sp, { replace: false });
    },
    [searchParams, setSearchParams, filters],
  );

  const resetFilters = useCallback(() => {
    const sp = new URLSearchParams(searchParams);
    sp.delete('gen');
    sp.delete('sex');
    sp.delete('age');
    sp.delete('edu');
    sp.delete('region');
    sp.delete('comunas');
    setSearchParams(sp, { replace: false });
  }, [searchParams, setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.generation !== 'ALL' ||
      filters.sex !== 'ALL' ||
      filters.age.min !== DEFAULT_FILTERS.age.min ||
      filters.age.max !== DEFAULT_FILTERS.age.max ||
      filters.education !== 'ALL' ||
      filters.geo.region !== 'ALL' ||
      filters.geo.comunas.length > 0
    );
  }, [filters]);

  return {
    view,
    filters,
    setView,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}

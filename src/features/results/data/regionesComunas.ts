/**
 * Datos placeholder de regiones y comunas de Chile.
 *
 * Cobertura: 16 regiones con 4-8 comunas representativas cada una (no exhaustivo).
 * Suficiente para construir UI de filtros geo en /results-v2.
 *
 * Cuando el backend soporte segmentación geo real, reemplazar este dataset por
 * el catálogo oficial INE / SUBDERE.
 */

export interface Region {
  id: string;
  label: string;
  comunas: { id: string; label: string }[];
}

export const REGIONES_CHILE: Region[] = [
  {
    id: 'XV',
    label: 'Arica y Parinacota',
    comunas: [
      { id: 'arica', label: 'Arica' },
      { id: 'putre', label: 'Putre' },
    ],
  },
  {
    id: 'I',
    label: 'Tarapacá',
    comunas: [
      { id: 'iquique', label: 'Iquique' },
      { id: 'alto-hospicio', label: 'Alto Hospicio' },
      { id: 'pozo-almonte', label: 'Pozo Almonte' },
    ],
  },
  {
    id: 'II',
    label: 'Antofagasta',
    comunas: [
      { id: 'antofagasta', label: 'Antofagasta' },
      { id: 'calama', label: 'Calama' },
      { id: 'tocopilla', label: 'Tocopilla' },
      { id: 'mejillones', label: 'Mejillones' },
    ],
  },
  {
    id: 'III',
    label: 'Atacama',
    comunas: [
      { id: 'copiapo', label: 'Copiapó' },
      { id: 'vallenar', label: 'Vallenar' },
      { id: 'caldera', label: 'Caldera' },
    ],
  },
  {
    id: 'IV',
    label: 'Coquimbo',
    comunas: [
      { id: 'la-serena', label: 'La Serena' },
      { id: 'coquimbo', label: 'Coquimbo' },
      { id: 'ovalle', label: 'Ovalle' },
      { id: 'illapel', label: 'Illapel' },
    ],
  },
  {
    id: 'V',
    label: 'Valparaíso',
    comunas: [
      { id: 'valparaiso', label: 'Valparaíso' },
      { id: 'vina-del-mar', label: 'Viña del Mar' },
      { id: 'quilpue', label: 'Quilpué' },
      { id: 'villa-alemana', label: 'Villa Alemana' },
      { id: 'san-antonio', label: 'San Antonio' },
      { id: 'los-andes', label: 'Los Andes' },
    ],
  },
  {
    id: 'RM',
    label: 'Metropolitana',
    comunas: [
      { id: 'santiago', label: 'Santiago' },
      { id: 'providencia', label: 'Providencia' },
      { id: 'las-condes', label: 'Las Condes' },
      { id: 'nunoa', label: 'Ñuñoa' },
      { id: 'maipu', label: 'Maipú' },
      { id: 'puente-alto', label: 'Puente Alto' },
      { id: 'la-florida', label: 'La Florida' },
      { id: 'penalolen', label: 'Peñalolén' },
    ],
  },
  {
    id: 'VI',
    label: "O'Higgins",
    comunas: [
      { id: 'rancagua', label: 'Rancagua' },
      { id: 'san-fernando', label: 'San Fernando' },
      { id: 'rengo', label: 'Rengo' },
    ],
  },
  {
    id: 'VII',
    label: 'Maule',
    comunas: [
      { id: 'talca', label: 'Talca' },
      { id: 'curico', label: 'Curicó' },
      { id: 'linares', label: 'Linares' },
      { id: 'constitucion', label: 'Constitución' },
    ],
  },
  {
    id: 'XVI',
    label: 'Ñuble',
    comunas: [
      { id: 'chillan', label: 'Chillán' },
      { id: 'san-carlos', label: 'San Carlos' },
      { id: 'bulnes', label: 'Bulnes' },
    ],
  },
  {
    id: 'VIII',
    label: 'Biobío',
    comunas: [
      { id: 'concepcion', label: 'Concepción' },
      { id: 'talcahuano', label: 'Talcahuano' },
      { id: 'los-angeles', label: 'Los Ángeles' },
      { id: 'coronel', label: 'Coronel' },
    ],
  },
  {
    id: 'IX',
    label: 'Araucanía',
    comunas: [
      { id: 'temuco', label: 'Temuco' },
      { id: 'angol', label: 'Angol' },
      { id: 'villarrica', label: 'Villarrica' },
      { id: 'pucon', label: 'Pucón' },
    ],
  },
  {
    id: 'XIV',
    label: 'Los Ríos',
    comunas: [
      { id: 'valdivia', label: 'Valdivia' },
      { id: 'la-union', label: 'La Unión' },
      { id: 'panguipulli', label: 'Panguipulli' },
    ],
  },
  {
    id: 'X',
    label: 'Los Lagos',
    comunas: [
      { id: 'puerto-montt', label: 'Puerto Montt' },
      { id: 'osorno', label: 'Osorno' },
      { id: 'castro', label: 'Castro' },
      { id: 'ancud', label: 'Ancud' },
    ],
  },
  {
    id: 'XI',
    label: 'Aysén',
    comunas: [
      { id: 'coyhaique', label: 'Coyhaique' },
      { id: 'puerto-aysen', label: 'Puerto Aysén' },
    ],
  },
  {
    id: 'XII',
    label: 'Magallanes',
    comunas: [
      { id: 'punta-arenas', label: 'Punta Arenas' },
      { id: 'puerto-natales', label: 'Puerto Natales' },
    ],
  },
];

/**
 * Helper: encuentra una región por id.
 */
export function getRegionById(id: string): Region | undefined {
  return REGIONES_CHILE.find((r) => r.id === id);
}

/**
 * Helper: lista de todas las comunas de una región.
 */
export function getComunasByRegion(regionId: string): { id: string; label: string }[] {
  const region = getRegionById(regionId);
  return region ? region.comunas : [];
}

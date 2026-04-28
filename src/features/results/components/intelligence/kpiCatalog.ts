/**
 * KPI CATALOG — Producto B2B "Inteligencia"
 *
 * Mapeo de las 9 capas del Marco Metodológico KPIs Opina+
 * a los tiers comerciales (Basic / Pro / Enterprise).
 *
 * Reglas firmes (decisión Juan 2026-04-27):
 *   - F11 (Salud producto), F12 (Integridad cruda) y F14 (Gamificación) → NUNCA al cliente
 *   - "Tema caliente" excluido (vive en current_topics, no se vende)
 *   - Datos políticos / actualidad / conceptos personales → fuera
 *
 * Source: Matriz_KPIs_OpinaPlus_Estructurada.pdf
 */

export type KPITier = 'basic' | 'pro' | 'enterprise';

export interface KPI {
  /** Nombre humano del KPI */
  name: string;
  /** Descripción corta de qué mide */
  description: string;
  /** Tier mínimo desde el cual se incluye */
  minTier: KPITier;
  /** Si tiene serie temporal graficable */
  hasHistory: boolean;
}

export interface KPILayer {
  /** Código de capa (ej. "13.2") para referencia */
  code: string;
  /** Nombre humano de la capa */
  name: string;
  /** Descripción corta del propósito de la capa */
  description: string;
  /** Lista de KPIs vendibles de esta capa */
  kpis: KPI[];
}

/**
 * Capas comercializables del producto.
 * Las capas 13.6 (F11), 13.7 (F12) y 13.9 (F14) NO aparecen acá por design.
 */
export const KPI_CATALOG: KPILayer[] = [
  {
    code: '13.3',
    name: 'Calidad y frescura',
    description: 'Saber si la lectura está viva, es reciente y tiene base estadística suficiente.',
    kpis: [
      { name: 'Señales activas 24h',     description: 'Pulso de actividad de la plataforma', minTier: 'basic', hasHistory: true },
      { name: 'Frescura (horas)',         description: 'Antigüedad del último dato',          minTier: 'basic', hasHistory: false },
      { name: 'Etiqueta de actividad',    description: 'Estado de tráfico (calma/activa/intensa)', minTier: 'basic', hasHistory: false },
      { name: 'Integridad agregada',      description: 'Cuán confiable es la lectura',        minTier: 'basic', hasHistory: false },
      { name: 'Masa para revertir',       description: 'Cuántos votos cambiarían el resultado', minTier: 'basic', hasHistory: false },
      { name: 'Aceleración de tendencia', description: 'Aceleración de la curva',             minTier: 'basic', hasHistory: true },
      { name: 'Dirección de tendencia',   description: 'Sube / baja / plana',                  minTier: 'basic', hasHistory: true },
    ],
  },
  {
    code: '13.1',
    name: 'Lectura de mercado',
    description: 'Quién lidera, quién sube, quién pierde — visión competitiva del mercado.',
    kpis: [
      { name: 'Líder y participación',     description: 'Quién gana y cuota de mercado',      minTier: 'basic', hasHistory: true },
      { name: 'Categoría más disputada',   description: 'Dónde la opinión está más dividida', minTier: 'basic', hasHistory: false },
      { name: 'Fastest Riser',             description: 'Quién está subiendo más rápido',     minTier: 'basic', hasHistory: true },
      { name: 'Fastest Faller',            description: 'Quién está perdiendo más rápido',    minTier: 'basic', hasHistory: true },
      { name: 'Tu Tendencia (líder)',      description: 'Cambio del share del líder día a día', minTier: 'pro', hasHistory: true },
      { name: 'Aceleración',               description: 'Si la tendencia se intensifica',     minTier: 'pro', hasHistory: true },
      { name: 'Persistencia / Racha',      description: 'Robustez de la tendencia actual',    minTier: 'pro', hasHistory: true },
      { name: 'Hallazgo editorial',        description: 'Lectura humana de la película temporal', minTier: 'pro', hasHistory: true },
      { name: 'Brecha generacional',       description: 'Conflicto entre generaciones',       minTier: 'pro', hasHistory: false },
      { name: 'Brecha territorial',        description: 'Polarización geográfica',            minTier: 'pro', hasHistory: false },
      { name: 'Atributo fuerte / dolor del líder', description: 'Diagnóstico cualitativo',    minTier: 'pro', hasHistory: false },
      { name: 'NPS del líder',             description: 'Lealtad real del líder',             minTier: 'pro', hasHistory: true },
      { name: 'Estabilidad del campeón',   description: 'Solidez del campeón de torneo',      minTier: 'pro', hasHistory: true },
    ],
  },
  {
    code: '13.2',
    name: 'Análisis ejecutivo B2B',
    description: 'Validación estadística, lectura comercial y toma de decisiones.',
    kpis: [
      { name: 'Win rate + volumen de batallas', description: 'Tracción cruda con volumen',    minTier: 'pro', hasHistory: true },
      { name: 'Margen vs. segundo',         description: 'Distancia al competidor inmediato', minTier: 'pro', hasHistory: true },
      { name: 'Etiqueta de estabilidad',    description: 'Estable / en caída / en aceleración', minTier: 'pro', hasHistory: false },
      { name: 'Estructura competitiva (Wilson CI)', description: 'Intervalo de confianza 95%', minTier: 'pro', hasHistory: false },
      { name: 'Tamaño efectivo (n_eff)',    description: 'Muestra estadísticamente útil',     minTier: 'pro', hasHistory: true },
      { name: 'OpinaScore v1',              description: 'KPI maestro 0-100 de la batalla',    minTier: 'pro', hasHistory: true },
      { name: 'Convicción',                 description: 'Fuerza compuesta del score',        minTier: 'pro', hasHistory: false },
      { name: 'Fragilidad',                 description: 'Vulnerabilidad del liderazgo',      minTier: 'pro', hasHistory: false },
      { name: 'Calidad de evidencia',       description: 'Qué tan publicable es el dato',     minTier: 'pro', hasHistory: false },
      { name: 'Decisión real',              description: 'Gate editorial automático',         minTier: 'pro', hasHistory: false },
      { name: 'Índice de volatilidad 30D',  description: 'Estabilidad del score',             minTier: 'pro', hasHistory: true },
      { name: 'Índice de polarización',     description: 'Si hay consenso o disputa',         minTier: 'pro', hasHistory: false },
      { name: 'Evolución de scores',        description: 'Series temporales 7/30/90 días',    minTier: 'pro', hasHistory: true },
      { name: 'Profundidad del segmento',   description: 'Diagnóstico cualitativo cuantificado', minTier: 'pro', hasHistory: false },
      { name: 'Share of preference ponderado', description: 'Cuota real ajustada por calidad', minTier: 'pro', hasHistory: false },
      { name: 'Coherencia (intra-versus)',  description: 'Consistencia interna del versus',   minTier: 'pro', hasHistory: false },
      { name: 'Coherencia cross-módulo',    description: 'Validación cruzada de liderazgo',   minTier: 'pro', hasHistory: false },
      { name: 'Consistencia Torneo vs Versus', description: 'Detección de discrepancia entre formatos', minTier: 'pro', hasHistory: false },
      { name: 'Insight Mágico (IA)',        description: 'Resumen narrativo generado por LLM', minTier: 'enterprise', hasHistory: false },
      { name: 'Motor narrativo (8 categorías)', description: 'Clasificador de status de marca', minTier: 'enterprise', hasHistory: false },
      { name: 'Top influencers (segmentos)', description: 'Demografía que mueve la aguja',    minTier: 'enterprise', hasHistory: false },
      { name: 'Sensibilidad contextual',    description: 'Qué tan distinto se comporta entre segmentos', minTier: 'enterprise', hasHistory: false },
      { name: 'Señal temprana / Momentum 6H', description: 'Detección antes del agregado',    minTier: 'enterprise', hasHistory: true },
    ],
  },
  {
    code: '13.4',
    name: 'Capa predictiva — hacia dónde va',
    description: 'Anticipar escenarios antes de que el cambio sea evidente.',
    kpis: [
      { name: 'Forecast del líder a 7 días', description: 'Share proyectado a 7 días',       minTier: 'pro', hasHistory: true },
      { name: 'Distancia al tipping point',  description: 'Días hasta que el segundo alcance al líder', minTier: 'enterprise', hasHistory: true },
      { name: 'Cambio de régimen de volatilidad', description: 'Detección de quiebre estructural', minTier: 'enterprise', hasHistory: true },
    ],
  },
  {
    code: '13.5',
    name: 'Capa explicativa — por qué se mueve',
    description: 'Conectar cambios de opinión con causas, cohortes o temas relacionados.',
    kpis: [
      { name: 'Lag noticia → voto (horas)', description: 'Cuánto tarda una noticia en mover el voto', minTier: 'pro', hasHistory: true },
      { name: 'Correlación entre temas (top 3)', description: 'Temas que se mueven juntos',  minTier: 'pro', hasHistory: true },
      { name: 'Señal de defección por cohorte', description: 'Quién cambió de bando',         minTier: 'enterprise', hasHistory: true },
    ],
  },
  {
    code: '13.8',
    name: 'Capa comercial accionable',
    description: 'Traducir la data en oportunidades comerciales concretas.',
    kpis: [
      { name: 'Estimador de impacto por conversión', description: 'Cuánto subiría el score si X mejora Y', minTier: 'enterprise', hasHistory: false },
      { name: 'Ventana de vulnerabilidad competitiva', description: 'Calendario de campaña óptimo', minTier: 'enterprise', hasHistory: true },
      { name: 'White space (categoría desatendida)', description: 'Categoría sin liderazgo claro',   minTier: 'enterprise', hasHistory: false },
    ],
  },
];

/** Cuenta KPIs incluidos en un tier dado (acumulativo). */
export function countKPIsInTier(tier: KPITier): number {
  const order: KPITier[] = ['basic', 'pro', 'enterprise'];
  const tierIdx = order.indexOf(tier);
  return KPI_CATALOG.reduce((acc, layer) => {
    return acc + layer.kpis.filter(k => order.indexOf(k.minTier) <= tierIdx).length;
  }, 0);
}

/** Devuelve los KPIs de una capa que están incluidos en un tier dado. */
export function kpisInLayerForTier(layer: KPILayer, tier: KPITier): KPI[] {
  const order: KPITier[] = ['basic', 'pro', 'enterprise'];
  const tierIdx = order.indexOf(tier);
  return layer.kpis.filter(k => order.indexOf(k.minTier) <= tierIdx);
}

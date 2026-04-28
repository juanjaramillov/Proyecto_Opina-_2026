/**
 * TIER × SCOPE MATRIX — Pricing del producto B2B "Inteligencia"
 *
 * Modelo multi-eje (decisión Juan 2026-04-27):
 *   - Eje 1: Tier (capabilities, frescura, formatos)
 *   - Eje 2: Scope (a qué entidades aplica)
 *
 * MVP = Basic + Pro. Enterprise modelado pero requiere conversación con ventas.
 * Sin precios públicos en MVP — todos los CTAs van a "Solicitar cotización".
 */

import { KPITier, countKPIsInTier } from './kpiCatalog';

export type ScopeType = 'entity' | 'category' | 'industry' | 'all';

export interface TierDefinition {
  id: KPITier;
  /** Nombre comercial visible (mantengo identidad de los 3 actuales) */
  displayName: string;
  /** Subtítulo estándar */
  subtitle: string;
  /** Pitch en una frase */
  pitch: string;
  /** Frescura de los datos */
  freshness: string;
  /** Ventana de histórico disponible */
  historyWindow: string;
  /** Formatos de entrega */
  formats: string[];
  /** Rate limit / volumen estimado */
  rateLimit: string;
  /** SLA prometido */
  sla: string;
  /** Highlights para mostrar en card */
  highlights: string[];
}

export interface ScopeDefinition {
  id: ScopeType;
  displayName: string;
  description: string;
  example: string;
  /** Si requiere selector adicional (ej. cuál entidad/categoría) */
  needsTarget: boolean;
}

export const TIERS: TierDefinition[] = [
  {
    id: 'basic',
    displayName: 'Market Pulse',
    subtitle: 'Plan Basic',
    pitch: 'Entendé la dirección del mercado hoy. Ideal para agencias boutique y monitoreo táctico.',
    freshness: 'Diaria',
    historyWindow: '6 meses',
    formats: ['JSON', 'CSV'],
    rateLimit: '10.000 calls/día',
    sla: 'Best effort',
    highlights: [
      'KPIs de calidad y frescura completos',
      'Lectura de mercado: líder, fastest riser/faller',
      'Categoría más disputada',
      'Soporte por email',
    ],
  },
  {
    id: 'pro',
    displayName: 'Deep Analytics',
    subtitle: 'Plan Pro',
    pitch: 'Descubrí quién te prefiere y por qué. Estadística defendible para decisiones tácticas.',
    freshness: 'Cada 6h',
    historyWindow: '24 meses',
    formats: ['JSON', 'CSV', 'Parquet'],
    rateLimit: '100.000 calls/día',
    sla: '99.5% uptime',
    highlights: [
      'Todo Market Pulse +',
      'B2B core completo: OpinaScore, Wilson CI, n_eff, Convicción, Fragilidad',
      'Forecast del líder a 7 días',
      'Lag noticia → voto + correlación entre temas',
      'Profundidad por segmento + NPS',
      'Soporte prioritario en horario hábil',
    ],
  },
  {
    id: 'enterprise',
    displayName: 'Velocity',
    subtitle: 'Plan Enterprise',
    pitch: 'Adelantate al mercado. Acceso completo + accionables comerciales + SLA premium.',
    freshness: 'Real-time + webhooks',
    historyWindow: 'Histórico completo',
    formats: ['JSON', 'CSV', 'Parquet', 'S3 / Snowflake share'],
    rateLimit: 'Negociado',
    sla: '99.9% uptime + soporte 24/7',
    highlights: [
      'Todo Deep Analytics +',
      'Tipping point + cambio de régimen de volatilidad',
      'Estimador de impacto por conversión',
      'Ventana de vulnerabilidad competitiva',
      'White space (categorías desatendidas)',
      'Insight Mágico (IA) + Motor narrativo de marca',
      'Top influencers por segmento',
      'Webhooks + alertas en tiempo real',
      'Customer Success Manager dedicado',
    ],
  },
];

export const SCOPES: ScopeDefinition[] = [
  {
    id: 'entity',
    displayName: 'Una marca',
    description: 'Acceso a toda la data sobre una marca específica.',
    example: 'Solo "Falabella" en todas sus categorías y batallas',
    needsTarget: true,
  },
  {
    id: 'category',
    displayName: 'Una categoría',
    description: 'Todas las marcas dentro de una categoría comercial.',
    example: 'Toda la categoría "Telcos": Entel, Movistar, Claro, WOM…',
    needsTarget: true,
  },
  {
    id: 'industry',
    displayName: 'Una industria',
    description: 'Múltiples categorías agrupadas por industria.',
    example: 'Industria "Retail": multitiendas + supermercados + e-commerce',
    needsTarget: true,
  },
  {
    id: 'all',
    displayName: 'All access',
    description: 'Acceso completo al catálogo comercializable.',
    example: 'Todas las industrias y categorías sellable',
    needsTarget: false,
  },
];

/** Helper: descripción legible de capabilities por tier (para UI). */
export function getTierKpiCount(tier: KPITier): number {
  return countKPIsInTier(tier);
}

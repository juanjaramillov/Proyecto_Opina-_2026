/**
 * Demo store local para pantallas que dependen de datos mock.
 * Objetivo: compilar + dar un fallback consistente.
 *
 * Este archivo DEBE exportar lo que el resto del proyecto importa:
 * - demoStore + métodos (init, getFastVersusSession, getKingOfTheHillPool, etc.)
 * - demoCategories, demoReasons
 * - tipos: DemoSignal, DemoDuel, DemoBrand, DemoInsightQuestion, etc.
 */

// =========================
// TYPES (alineados a los componentes)
// =========================
export type DemoSignalOption = { label: string };

export type DemoSignal = {
  id: string;
  question: string;
  options: DemoSignalOption[];
  category?: string;

  // SignalDetail.tsx lo usa (demoSig.type)
  type?: 'emoji' | 'binary' | 'choice';
};

export type DemoCategory = {
  slug: string;
  name: string;
  emoji: string;
};

export type DemoBrand = {
  id: string;
  name: string;
  emoji: string;
  categorySlug: string;
};

export type DemoDuelStats = {
  percentA: number;
  totalVotes: number;
};

export type DemoDuel = {
  id: string;
  brandA: DemoBrand;
  brandB: DemoBrand;
  categorySlug: string;
  stats: DemoDuelStats;

  // Signals.tsx usa startTime como fallback
  startTime?: number;
};

// DemoInsightModal espera: currentQ.dimension y currentQ.text
export type DemoInsightOption = { id: string; label: string };

export type DemoInsightQuestion = {
  id: string;
  dimension: 'price' | 'quality' | 'trust' | 'experience' | 'value';
  text: string;
  options: DemoInsightOption[];
};

export type DemoStore = {
  // legacy (Pitch / SignalDetail)
  init: () => void;
  getAll: () => DemoSignal[];
  getTrend: (limit?: number) => DemoSignal[];
  vote: (signalId: string, optionIndex: number) => void;

  // Signals.tsx
  getFastVersusSession: () => DemoDuel[];
  getKingOfTheHillPool: (catSlug: string) => DemoBrand[];
  getBrandsByCategory: (catSlug: string) => DemoBrand[];
  getInsightsForBrand: (brandId: string) => DemoInsightQuestion[];
  voteDuel: (duelId: string, winnerId: string, intensity: 'low' | 'high', reason: string) => void;
};

// =========================
// DEMO DATA
// =========================
export const demoCategories: DemoCategory[] = [
  { slug: 'supermercados', name: 'Supermercados', emoji: '🛒' },
  { slug: 'bebidas', name: 'Bebidas', emoji: '🥤' },
  { slug: 'tecnologia', name: 'Tecnología', emoji: '📱' },
  { slug: 'streaming', name: 'Streaming', emoji: '📺' },
];

// Brands para Versus / Insights
const DEMO_BRANDS: DemoBrand[] = [
  // supermercados
  { id: 'brand-lider', name: 'Líder', emoji: '🛒', categorySlug: 'supermercados' },
  { id: 'brand-jumbo', name: 'Jumbo', emoji: '🟢', categorySlug: 'supermercados' },
  { id: 'brand-tottus', name: 'Tottus', emoji: '🟩', categorySlug: 'supermercados' },
  { id: 'brand-santa', name: 'Santa Isabel', emoji: '🔴', categorySlug: 'supermercados' },

  // bebidas
  { id: 'brand-coke', name: 'Coca-Cola', emoji: '🥤', categorySlug: 'bebidas' },
  { id: 'brand-pepsi', name: 'Pepsi', emoji: '🟦', categorySlug: 'bebidas' },

  // tecnologia
  { id: 'brand-iphone', name: 'iPhone', emoji: '🍎', categorySlug: 'tecnologia' },
  { id: 'brand-android', name: 'Android', emoji: '🤖', categorySlug: 'tecnologia' },

  // streaming
  { id: 'brand-netflix', name: 'Netflix', emoji: '🟥', categorySlug: 'streaming' },
  { id: 'brand-disney', name: 'Disney+', emoji: '✨', categorySlug: 'streaming' },
];

// Señales simples (Pitch / SignalDetail)
const DEMO_SIGNALS: DemoSignal[] = [
  {
    id: 'demo-1',
    question: '¿Coca-Cola o Pepsi?',
    options: [{ label: 'Coca-Cola' }, { label: 'Pepsi' }],
    category: 'Bebidas',
    type: 'choice',
  },
  {
    id: 'demo-2',
    question: '¿iPhone o Android?',
    options: [{ label: 'iPhone' }, { label: 'Android' }],
    category: 'Tecnología',
    type: 'choice',
  },
  {
    id: 'demo-3',
    question: '¿Netflix o Disney+?',
    options: [{ label: 'Netflix' }, { label: 'Disney+' }],
    category: 'Streaming',
    type: 'choice',
  },
];

// DemoSignalModal (tu error muestra que r se usa como string: key={r}, handleReason(r), {r})
export const demoReasons: string[] = [
  'Precio',
  'Calidad',
  'Confianza',
  'Experiencia previa',
  'Otro',
];

// Insights: DemoInsightModal espera dimension/text/options{id,label}
const DEFAULT_INSIGHTS: DemoInsightQuestion[] = [
  {
    id: 'ins-1',
    dimension: 'quality',
    text: '¿Qué tan buena es esta marca?',
    options: [
      { id: 'q1-1', label: 'Muy mala' },
      { id: 'q1-2', label: 'Mala' },
      { id: 'q1-3', label: 'Neutra' },
      { id: 'q1-4', label: 'Buena' },
      { id: 'q1-5', label: 'Muy buena' },
    ],
  },
  {
    id: 'ins-2',
    dimension: 'value',
    text: '¿Qué la describe mejor?',
    options: [
      { id: 'q2-1', label: 'Barata' },
      { id: 'q2-2', label: 'Confiable' },
      { id: 'q2-3', label: 'Premium' },
      { id: 'q2-4', label: 'Conveniente' },
    ],
  },
  {
    id: 'ins-3',
    dimension: 'trust',
    text: '¿La recomendarías?',
    options: [
      { id: 'q3-1', label: 'Sí' },
      { id: 'q3-2', label: 'No' },
    ],
  },
  {
    id: 'ins-4',
    dimension: 'experience',
    text: '¿Qué te molesta más?',
    options: [
      { id: 'q4-1', label: 'Precio' },
      { id: 'q4-2', label: 'Calidad' },
      { id: 'q4-3', label: 'Atención' },
      { id: 'q4-4', label: 'Disponibilidad' },
    ],
  },
  {
    id: 'ins-5',
    dimension: 'price',
    text: '¿Qué mejorarías primero?',
    options: [
      { id: 'q5-1', label: 'Precio' },
      { id: 'q5-2', label: 'Calidad' },
      { id: 'q5-3', label: 'Variedad' },
      { id: 'q5-4', label: 'Servicio' },
    ],
  },
];

// Duelos para sesión rápida (Signals.tsx)
function buildFastDuels(): DemoDuel[] {
  const now = Date.now();

  const getBrand = (id: string) => DEMO_BRANDS.find(b => b.id === id);

  const pick = (aId: string, bId: string, cat: string, i: number): DemoDuel => {
    const a = getBrand(aId);
    const b = getBrand(bId);

    const fbA: DemoBrand = { id: `fb-a-${i}`, name: 'Opción A', emoji: '🅰️', categorySlug: cat };
    const fbB: DemoBrand = { id: `fb-b-${i}`, name: 'Opción B', emoji: '🅱️', categorySlug: cat };

    return {
      id: `duel-${cat}-${a?.id ?? fbA.id}-${b?.id ?? fbB.id}`,
      brandA: a ?? fbA,
      brandB: b ?? fbB,
      categorySlug: cat,
      stats: { percentA: 50, totalVotes: 0 },
      startTime: now - i * 500,
    };
  };

  return [
    pick('brand-lider', 'brand-jumbo', 'supermercados', 1),
    pick('brand-tottus', 'brand-santa', 'supermercados', 2),
    pick('brand-coke', 'brand-pepsi', 'bebidas', 3),
    pick('brand-iphone', 'brand-android', 'tecnologia', 4),
    pick('brand-netflix', 'brand-disney', 'streaming', 5),
  ];
}

const state = {
  duels: buildFastDuels(),
};

export const demoStore: DemoStore = {
  init: () => {
    // existe porque el resto del proyecto lo llama
  },

  getAll: () => DEMO_SIGNALS,

  getTrend: (limit = 10) => DEMO_SIGNALS.slice(0, Math.max(0, limit)),

  vote: (_signalId: string, _optionIndex: number) => {
    // noop
  },

  getFastVersusSession: () => state.duels.map(d => ({ ...d, stats: { ...d.stats } })),

  getKingOfTheHillPool: (catSlug: string) => DEMO_BRANDS.filter(b => b.categorySlug === catSlug),

  getBrandsByCategory: (catSlug: string) => DEMO_BRANDS.filter(b => b.categorySlug === catSlug),

  getInsightsForBrand: (_brandId: string) => DEFAULT_INSIGHTS,

  voteDuel: (duelId: string, winnerId: string, _intensity: 'low' | 'high', _reason: string) => {
    const d = state.duels.find(x => x.id === duelId);
    if (!d) return;

    d.stats.totalVotes += 1;

    const winnerIsA = d.brandA.id === winnerId;
    const delta = 5;
    let next = d.stats.percentA + (winnerIsA ? delta : -delta);
    if (next < 5) next = 5;
    if (next > 95) next = 95;
    d.stats.percentA = next;
  },
};

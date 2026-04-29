import { ResultsV2View, ResultsV2Filters } from '../../types/resultsV2';
import { SignalNode } from '../../../../components/ui/foundation';

/**
 * ResultsHeroHybrid — hero editorial + KPI principal con anillos concéntricos.
 *
 * Inspirado en la referencia "Event Value 86" del brief: tres anillos
 * concéntricos que comunican un KPI compuesto por sub-métricas, en formato
 * elegante editorial-dashboard.
 *
 * Estado actual (Sesión 1): placeholder con datos visuales hardcoded para
 * validar la composición. En Sesión 5 conectamos a useResultsExperience real.
 */

interface ResultsHeroHybridProps {
  view: ResultsV2View;
  filters: ResultsV2Filters;
}

const VIEW_TITLES: Record<ResultsV2View, { eyebrow: string; title: string; subtitle: string }> = {
  resumen: {
    eyebrow: 'Vista · Resumen',
    title: 'Lo que la red está mostrando hoy.',
    subtitle: 'Lectura colectiva opt-in con masa, dirección, contexto y vigencia.',
  },
  tendencias: {
    eyebrow: 'Vista · Tendencias',
    title: 'Hacia dónde se mueve la opinión.',
    subtitle: 'Predictiva y explicativa de la red en los próximos 7 días.',
  },
  versus: {
    eyebrow: 'Vista · Versus',
    title: 'Las decisiones más reñidas.',
    subtitle: 'Cómo se inclina la balanza en cada batalla.',
  },
  torneos: {
    eyebrow: 'Vista · Torneos',
    title: 'Los campeones que se cristalizan.',
    subtitle: 'Quién supera todas las rondas con masa suficiente.',
  },
  profundidad: {
    eyebrow: 'Vista · Profundidad',
    title: 'Cinco dimensiones, una marca.',
    subtitle: 'Confianza, innovación, calidad, imagen y servicio en perfil.',
  },
  noticias: {
    eyebrow: 'Vista · Noticias',
    title: 'Lo que está en debate.',
    subtitle: 'Temas calientes, polarización y reacción de la red.',
  },
  mapa: {
    eyebrow: 'Vista · Mapa',
    title: 'El consenso por geografía.',
    subtitle: 'Cómo opina cada región, cada comuna, cada segmento.',
  },
};

export function ResultsHeroHybrid({ view, filters }: ResultsHeroHybridProps) {
  const v = VIEW_TITLES[view];

  // Datos placeholder · vendrán de useResultsExperience en Sesión 5
  const eventValue = 86;
  const subMetrics = [
    { label: 'Masa', value: 78, color: '#10B981' },        // accent
    { label: 'Dirección', value: 64, color: '#2563EB' },   // brand
    { label: 'Vigencia', value: 45, color: '#94A3B8' },    // slate-400
  ];

  const filterCount =
    (filters.generation !== 'ALL' ? 1 : 0) +
    (filters.sex !== 'ALL' ? 1 : 0) +
    (filters.age.min !== 16 || filters.age.max !== 80 ? 1 : 0) +
    (filters.education !== 'ALL' ? 1 : 0) +
    (filters.geo.region !== 'ALL' ? 1 : 0);

  return (
    <section className="relative w-full bg-ink text-white overflow-hidden">
      {/* Decorative ambient orbs · brand+accent · respeta paleta V17 */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 container-ws py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT · editorial */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 mb-6">
              <SignalNode state="validated" size="sm" pulse />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-200">
                {v.eyebrow}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.05] mb-6">
              {v.title}
            </h1>
            <p className="text-base md:text-lg font-medium text-slate-300 leading-relaxed max-w-xl mb-8">
              {v.subtitle}
            </p>

            {/* Active filters indicator */}
            {filterCount > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-200">
                  {filterCount} {filterCount === 1 ? 'filtro activo' : 'filtros activos'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Todos los segmentos · sin filtros
                </span>
              </div>
            )}
          </div>

          {/* RIGHT · concentric rings KPI · referencia "Event Value 86" */}
          <div className="lg:col-span-5 flex justify-center">
            <ConcentricRingsKPI
              centerValue={eventValue}
              centerLabel="Índice de Señal"
              subMetrics={subMetrics}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// ConcentricRingsKPI · primer prototipo del lenguaje V17
// ============================================================
function ConcentricRingsKPI({
  centerValue,
  centerLabel,
  subMetrics,
}: {
  centerValue: number;
  centerLabel: string;
  subMetrics: { label: string; value: number; color: string }[];
}) {
  const size = 320;
  const center = size / 2;
  const baseRadius = 70;
  const ringGap = 28;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Tracks (faded) */}
        {subMetrics.map((_, i) => {
          const r = baseRadius + (i + 1) * ringGap;
          return (
            <circle
              key={`track-${i}`}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
            />
          );
        })}

        {/* Active arcs · valor según subMetric */}
        {subMetrics.map((m, i) => {
          const r = baseRadius + (i + 1) * ringGap;
          const circumference = 2 * Math.PI * r;
          const dashOffset = circumference * (1 - m.value / 100);
          return (
            <circle
              key={`arc-${i}`}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={m.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
          );
        })}

        {/* Center · KPI principal */}
        <circle cx={center} cy={center} r={baseRadius - 6} fill="rgba(255,255,255,0.04)" />
      </svg>

      {/* Centro · valor + label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          {centerLabel}
        </span>
        <span className="text-6xl font-black font-display text-white leading-none">
          {centerValue}
        </span>
      </div>

      {/* Legend · sub-métricas */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
        {subMetrics.map((m) => (
          <div key={m.label} className="flex items-center gap-1.5 text-slate-300">
            <span
              className="block w-2 h-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            {m.label} <span className="text-white font-black">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsHeroHybrid;

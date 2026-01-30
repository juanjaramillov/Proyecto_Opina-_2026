import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register ChartJS locally for this component
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface CardData {
  id: string;
  topic: string;
  category: string;
  chipA: string;
  chipB: string;
  metric: string;
  trend: 'up' | 'down' | 'stable';
  period: string;
  series: number[];
  insight: string;
}

interface HomeCarouselProps {
  cards: CardData[];
  currentIndex: number;
  onGoTo: (index: number) => void;
  onFetchInsight: (cardId: string) => void;
  onCopyInsight: (cardId: string) => void;
}

const getSparkOptions = (): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: { x: { display: false }, y: { display: false } },
});

// ---- Centralización de clases (misma UI, menos repetición) ----
const cx = {
  section: 'py-5 pb-16',
  container: 'max-w-ws mx-auto px-5',
  headerWrap: 'flex items-end justify-between gap-3 mb-3',
  headerTitle: 'm-0 text-base tracking-wide text-muted',
  headerMeta: 'text-xs font-semibold text-muted2',

  frame: 'rounded-2xl border border-stroke bg-card-gradient shadow-home overflow-hidden relative',
  track: 'flex w-full transition-transform duration-[650ms] ease-[cubic-bezier(.2,.8,.2,1)]',
  slide: 'w-full flex-none p-4',

  card: 'rounded-2xl border border-white/12 bg-bg2/55 p-5 pb-4 min-h-[360px] relative overflow-hidden md:min-h-[420px] group',
  accents: 'absolute inset-[-1px] pointer-events-none opacity-85 z-0',
  accA: 'absolute inset-0 bg-[radial-gradient(560px_260px_at_18%_10%,rgba(20,184,166,.16),transparent_55%)]',
  accB: 'absolute inset-0 bg-[radial-gradient(520px_240px_at_88%_15%,rgba(124,255,234,.10),transparent_58%)]',

  header: 'relative z-10 flex items-start justify-between gap-3 mb-3',
  topic: 'text-lg font-black m-0 tracking-tight text-ink',
  chips: 'flex gap-2 flex-wrap mt-2',
  chip: 'text-[11px] px-2.5 py-1.5 rounded-full border border-white/14 bg-white/5 text-muted font-bold',

  grid: 'relative z-10 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-3 items-stretch',
  panel: 'rounded-2xl border border-white/12 bg-white/5 p-3',
  panelTitle: 'text-xs leading-relaxed m-0 mb-2 font-semibold text-muted',
  metric: 'text-3xl font-black tracking-tighter m-0 text-ink',
  desc: 'text-xs leading-relaxed mt-1.5 font-semibold text-muted',
  chartWrap: 'mt-2.5 h-[170px]',

  insightBox:
    'flex-1 min-w-[240px] text-muted text-xs leading-relaxed bg-white/5 border border-white/10 p-2.5 rounded-xl',
  actions: 'mt-2.5 flex gap-2 flex-wrap',

  btnBase:
    'border rounded-xl px-3.5 py-2.5 font-extrabold text-[13px] inline-flex items-center gap-2.5 transition hover:-translate-y-px hover:bg-white/10',
  btnGhost: 'border-stroke bg-white/5 text-ink',
  btnPrimary: 'border-primary/35 bg-gradient-to-b from-primary/20 to-primary/10 shadow-home text-ink',

  footer: 'relative z-10 mt-3 flex gap-2 flex-wrap items-start justify-between',
  tip:
    'flex-1 min-w-[240px] text-muted text-xs leading-relaxed bg-white/5 border border-white/10 p-2.5 rounded-xl opacity-90',

  pagerWrap: 'mt-2.5 flex justify-end',
  pager: 'flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-white/5',
  dotBase: 'w-2 h-2 rounded-full border cursor-pointer transition-all',
};

const trendBadge = (trend: CardData['trend']) => {
  const base = 'text-xs font-black px-2.5 py-1.5 rounded-full border bg-white/5 whitespace-nowrap';
  if (trend === 'up') return `${base} border-ok/25 text-ok/95`;
  if (trend === 'down') return `${base} border-danger/25 text-danger/95`;
  return `${base} border-warn/25 text-warn/95`;
};

const trendLabel = (trend: CardData['trend']) => {
  if (trend === 'up') return '↑ Subiendo';
  if (trend === 'down') return '↓ Bajando';
  return '→ Estable';
};

const HomeCarousel: React.FC<HomeCarouselProps> = ({
  cards,
  currentIndex,
  onGoTo,
  onFetchInsight,
  onCopyInsight,
}) => {
  return (
    <section className={cx.section} id="senal">
      <div className={cx.container}>
        <div className={cx.headerWrap}>
          <h2 className={cx.headerTitle}>Señal en Vivo (1 card a la vez · carrusel automático)</h2>
          <div className={cx.headerMeta}>Cambia cada 5s · click en puntos para navegar</div>
        </div>

        {/* Carousel Container */}
        <div className={cx.frame}>
          <div className={cx.track} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {cards.map((c) => (
              <div className={cx.slide} key={c.id}>
                {/* Individual Card */}
                <div className={cx.card}>
                  {/* Background Accents */}
                  <div className={cx.accents}>
                    <div className={cx.accA} />
                    <div className={cx.accB} />
                  </div>

                  {/* Card Header */}
                  <div className={cx.header}>
                    <div>
                      <p className={cx.topic}>{c.topic}</p>
                      <div className={cx.chips}>
                        <span className={cx.chip}>{c.category}</span>
                        <span className={cx.chip}>{c.chipA}</span>
                        <span className={cx.chip}>{c.chipB}</span>
                      </div>
                    </div>

                    <span className={trendBadge(c.trend)}>{trendLabel(c.trend)}</span>
                  </div>

                  {/* Metric Row */}
                  <div className={cx.grid}>
                    {/* Left Panel */}
                    <div className={cx.panel}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={cx.metric}>{c.metric}</p>
                        <span className={cx.chip}>{c.period}</span>
                      </div>

                      <p className={cx.desc}>
                        Índice sintético (demo). Visualización simple para entender el movimiento.
                      </p>

                      <div className={cx.chartWrap}>
                        <Line
                          data={{
                            labels: c.series.map((_, i) => i + 1),
                            datasets: [
                              {
                                data: c.series,
                                tension: 0.35,
                                borderWidth: 2,
                                pointRadius: 0,
                                borderColor: '#14b8a6',
                                backgroundColor: 'rgba(20,184,166,0.1)',
                              },
                            ],
                          }}
                          options={getSparkOptions()}
                        />
                      </div>
                    </div>

                    {/* Right Panel (Insight) */}
                    <div className={`${cx.panel} flex flex-col`}>
                      <p className={cx.panelTitle}>Insight (IA / Mock)</p>

                      <div className={cx.insightBox}>{c.insight}</div>

                      <div className={cx.actions}>
                        <button
                          className={`${cx.btnBase} ${cx.btnGhost}`}
                          type="button"
                          onClick={() => onFetchInsight(c.id)}
                        >
                          Refrescar insight
                        </button>

                        <button
                          className={`${cx.btnBase} ${cx.btnPrimary}`}
                          type="button"
                          onClick={() => onCopyInsight(c.id)}
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={cx.footer}>
                    <div className={cx.tip}>
                      <b className="text-ink">Tip:</b> Cuando el usuario completa perfil e identidad, desbloquea más
                      detalle (segmentos, comparaciones y series históricas).
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pager Dots */}
        <div className={cx.pagerWrap}>
          <div className={cx.pager}>
            {cards.map((_, i) => (
              <div
                key={i}
                className={`${cx.dotBase} ${i === currentIndex
                  ? 'bg-primary/75 border-primary/35 shadow-[0_0_0_6px_rgba(20,184,166,0.14)]'
                  : 'bg-ink/20 border-white/10'
                  }`}
                onClick={() => onGoTo(i)}
                title={`Ir a ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCarousel;

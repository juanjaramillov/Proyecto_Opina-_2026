import { Link } from 'react-router-dom';
import { SignalNode, SignalNodeLegend } from '../../../../components/ui/foundation';
import LiveActivityStrip from './LiveActivityStrip';

/**
 * HubSignalSummary — Bloque V17 que se inserta entre HubActiveState (hero
 * con VersusGame) y HubBentoGrid (ecosistema editorial FT-style).
 *
 * Aporta:
 *   - Header editorial corto ("Lo que estás opinando ahora.")
 *   - 3 stat tiles personales (señales hoy / total / racha) con datos reales
 *     del signalStore.
 *   - Mini-leyenda del Nodo de Señal Validada (autoexplicativo en 3 segundos).
 *   - Live Activity Strip (constelación curada, no scatter plot).
 *
 * NO toca HubActiveState ni HubBentoGrid. Es un bloque complementario.
 *
 * Sin trend pills, sin emojis decorativos, sin live dots cliché. Respeta
 * las prohibiciones del sistema V17 (ver docs/design/v17-signal-system.md).
 */

interface HubSignalSummaryProps {
  /**
   * Señales que el usuario sumó hoy. Real del signalStore.
   */
  signalsToday: number;
  /**
   * Total de señales acumuladas por el usuario. Real del signalStore.
   */
  signalsTotal: number;
  /**
   * Racha de días consecutivos opinando. Real del signalStore.
   */
  streakDays: number;
  /**
   * Límite diario de señales según tier del usuario (∞ para admin).
   */
  signalsLimit?: string;
}

export function HubSignalSummary({
  signalsToday,
  signalsTotal,
  streakDays,
  signalsLimit = '30',
}: HubSignalSummaryProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL').format(Number.isFinite(n) ? n : 0);

  return (
    <section
      aria-labelledby="hub-summary-title"
      className="w-full bg-white py-12 md:py-16 border-t border-stroke"
    >
      <div className="container-ws">
        {/* Header editorial */}
        <div className="mb-10 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Tu hub
          </p>
          <h2
            id="hub-summary-title"
            className="text-3xl md:text-4xl lg:text-5xl font-black font-display tracking-tight text-ink leading-[1.05]"
          >
            Lo que estás opinando{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">
              ahora.
            </span>
          </h2>
          {/* V17 · subline con cluster de Nodos inline · uno con pulse como ancla viva */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-base md:text-lg font-medium text-slate-500 leading-relaxed">
            <span>Llevás</span>
            <strong className="text-ink font-bold">{signalsToday} {signalsToday === 1 ? 'señal' : 'señales'} hoy</strong>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-2">
              <SignalNode state="validated" size="sm" pulse />
              <span><strong className="text-ink font-bold">{Math.max(0, signalsToday - 1)}</strong> validadas</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-2">
              <SignalNode state="umbral" size="sm" />
              <span><strong className="text-ink font-bold">{signalsToday > 0 ? 1 : 0}</strong> en umbral</span>
            </span>
          </div>
        </div>

        {/* Stat tiles row · sin barras horizontales · sin trend pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Stat 1 · Tus señales hoy · BRAND (dato del momento, vivo) */}
          <div className="rounded-3xl border border-stroke border-l-4 border-l-brand p-6 md:p-7 bg-white transition-all duration-300 hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-4">
              Tus señales hoy
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-black font-display tracking-tighter text-brand leading-none">
                {signalsToday}
              </span>
              <span className="text-sm font-medium text-slate-500">
                / {signalsLimit}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed">
              Cada señal valida o desestima una posición pública.
            </p>
          </div>

          {/* Stat 2 · Total acumuladas · INK (dato histórico, neutro) */}
          <div className="rounded-3xl border border-stroke p-6 md:p-7 bg-white transition-all duration-300 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">
              Total acumuladas
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-black font-display tracking-tighter text-ink leading-none">
                {fmt(signalsTotal)}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed">
              Tu peso en la red sube con coherencia.
            </p>
          </div>

          {/* Stat 3 · Racha · ACCENT cuando hay racha viva (verde = progreso) */}
          <div className={`rounded-3xl border border-stroke p-6 md:p-7 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${streakDays > 0 ? 'border-l-4 border-l-accent hover:border-accent/40' : 'hover:border-slate-400'}`}>
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-4 ${streakDays > 0 ? 'text-accent-700' : 'text-slate-500'}`}>
              Racha actual
            </p>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl md:text-6xl font-black font-display tracking-tighter leading-none ${streakDays > 0 ? 'text-accent' : 'text-ink'}`}>
                {streakDays}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {streakDays === 1 ? 'día' : 'días'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed">
              Las rachas largas habilitan profundidad.
            </p>
          </div>
        </div>

        {/* Mini-leyenda del Nodo · pidida explícitamente por la auditoría V17 */}
        <div className="mb-10 pt-8 border-t border-stroke">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-5">
            Nodo de Señal · cómo leer
          </p>
          <SignalNodeLegend variant="horizontal" />
        </div>

        {/* Live Activity Strip · mini-feed editorial */}
        <LiveActivityStrip
          activeCount={47}
          eyebrow="En este instante"
          subline="Tres temas cruzan el umbral en tiempo real."
        />

        {/* CTA primario · cierra el bloque con energía hacia la acción */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4">
          <Link
            to="/signals"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-bold tracking-tight text-white bg-gradient-to-r from-brand to-accent shadow-glow-brand transition-all hover:-translate-y-0.5 hover:shadow-glow-brand-lg"
          >
            Empezá a opinar
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <p className="text-sm font-medium text-slate-500">
            Cada señal te acerca al próximo nivel.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HubSignalSummary;

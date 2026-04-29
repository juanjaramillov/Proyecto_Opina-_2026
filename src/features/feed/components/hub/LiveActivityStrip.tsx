import { SignalNode, SignalNodeState } from '../../../../components/ui/foundation/SignalNode';

/**
 * LiveActivityStrip — Mini-feed editorial de actividad en vivo del Hub.
 *
 * Reemplaza el formato anterior ("constelación curada de Nodos sueltos")
 * por una lista narrativa de 3 temas reales en validación. Cada item
 * comunica directamente:
 *   - Estado de la señal (Nodo · validated/umbral/insufficient)
 *   - Tema en uppercase (categoría editorial)
 *   - Masa actual (n = ...)
 *   - Descripción del estado en lenguaje natural
 *
 * Auto-explicativo en 3 segundos, no decorativo.
 *
 * Ejemplo:
 *   <LiveActivityStrip
 *     activeCount={47}
 *     headline="47 personas opinando"
 *     subline="Tres temas cruzan el umbral en tiempo real."
 *     topics={[
 *       { topic: 'Streaming', state: 'validated', n: 147, status: 'validándose' },
 *       { topic: 'Marcas Tech', state: 'umbral', n: 82, status: 'en umbral' },
 *       { topic: 'Movilidad', state: 'insufficient', n: 54, status: 'esperando masa' },
 *     ]}
 *   />
 */

interface ActivityTopic {
  topic: string;
  state: SignalNodeState;
  n: number;
  status: string;
}

interface LiveActivityStripProps {
  activeCount?: number;
  headline?: string;
  subline?: string;
  eyebrow?: string;
  topics?: ActivityTopic[];
  className?: string;
}

const DEFAULT_TOPICS: ActivityTopic[] = [
  { topic: 'Streaming', state: 'validated', n: 147, status: 'validándose' },
  { topic: 'Marcas Tech', state: 'umbral', n: 82, status: 'en umbral' },
  { topic: 'Movilidad', state: 'insufficient', n: 54, status: 'esperando masa' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL').format(Number.isFinite(n) ? n : 0);

export function LiveActivityStrip({
  activeCount = 47,
  headline,
  subline = 'Tres temas cruzan el umbral en tiempo real.',
  eyebrow = 'En este instante',
  topics = DEFAULT_TOPICS,
  className = '',
}: LiveActivityStripProps) {
  const computedHeadline = headline ?? `${activeCount} personas opinando`;

  return (
    <section
      aria-labelledby="live-activity-headline"
      className={`relative w-full bg-surface2 rounded-4xl p-6 md:p-8 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:gap-12">
        {/* Bloque editorial · descripción de qué es */}
        <div className="md:max-w-xs shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">
            {eyebrow}
          </p>
          <h3
            id="live-activity-headline"
            className="text-2xl md:text-3xl font-black font-display text-ink tracking-tight leading-tight"
          >
            {computedHeadline}
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed">
            {subline}
          </p>
        </div>

        {/* Mini-feed · 3 temas en validación · auto-explicativo · color según estado */}
        <ul className="flex-1 mt-8 md:mt-0 flex flex-col">
          {topics.map((t, i) => {
            // V17 · color de la masa y del status según estado real
            const massColor =
              t.state === 'validated'
                ? 'text-brand'
                : t.state === 'umbral'
                  ? 'text-slate-700'
                  : 'text-slate-400';
            const statusColor =
              t.state === 'validated'
                ? 'text-accent-700'
                : t.state === 'umbral'
                  ? 'text-slate-600'
                  : 'text-slate-400';
            const topicColor =
              t.state === 'insufficient' ? 'text-slate-500' : 'text-ink';

            return (
              <li
                key={`${t.topic}-${i}`}
                className={`flex items-center gap-4 py-4 ${
                  i < topics.length - 1 ? 'border-b border-stroke' : ''
                }`}
              >
                {/* Estado del tema · Nodo de Señal */}
                <SignalNode state={t.state} size="md" />

                {/* Nombre del tema · color según vigencia */}
                <span className={`text-xs md:text-sm font-bold uppercase tracking-widest flex-1 min-w-0 truncate ${topicColor}`}>
                  {t.topic}
                </span>

                {/* Masa · color brand cuando está viva, slate cuando muerta */}
                <span className={`text-sm md:text-base font-bold whitespace-nowrap ${massColor}`}>
                  n = {fmt(t.n)}
                </span>

                {/* Estado descriptivo · accent verde cuando se está validando */}
                <span className={`hidden md:inline text-xs font-bold uppercase tracking-widest whitespace-nowrap min-w-[120px] text-right ${statusColor}`}>
                  {t.status}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default LiveActivityStrip;

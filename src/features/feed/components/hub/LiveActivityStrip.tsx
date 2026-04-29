import { SignalNode, SignalNodeState } from '../../../../components/ui/foundation/SignalNode';

/**
 * LiveActivityStrip — Strip de actividad en vivo para SignalsHub.
 *
 * Renderiza una "constelación" curada de Nodos que representa el estado
 * agregado de las señales en este momento en la red.
 *
 * NO es un scatter plot. Las posiciones son curadas para crear ritmo visual
 * intencional, no ruido de datos.
 *
 * Convención de uso (ver docs/design/v17-signal-system.md):
 *   - El componente toma datos reales si se le pasan vía `nodes` prop.
 *   - Si no, usa una composición curada de demostración (6 nodos balanceados).
 *   - Mantener el strip con padding generoso · NO recargar.
 *
 * Ejemplo:
 *   <LiveActivityStrip
 *     activeCount={47}
 *     headline="47 personas opinando"
 *     subline="Tres temas cruzan el umbral en tiempo real."
 *   />
 */

interface CuratedNode {
  /** Posición horizontal relativa (0-1) dentro del strip */
  x: number;
  /** Posición vertical relativa (0-1) dentro del strip */
  y: number;
  state: SignalNodeState;
  size?: 'sm' | 'md' | 'lg';
}

interface LiveActivityStripProps {
  /**
   * Cantidad de personas opinando ahora · usado en el contador grande.
   */
  activeCount?: number;
  /**
   * Headline del strip. Default: "{activeCount} personas opinando".
   */
  headline?: string;
  /**
   * Línea editorial bajo el headline.
   */
  subline?: string;
  /**
   * Etiqueta superior (eyebrow) en uppercase. Default: "EN ESTE INSTANTE".
   */
  eyebrow?: string;
  /**
   * Override de la constelación · positions relativas (0-1) y estados.
   * Si no se pasa, usa la composición curada por defecto.
   */
  nodes?: CuratedNode[];
  className?: string;
}

const DEFAULT_NODES: CuratedNode[] = [
  { x: 0.06, y: 0.50, state: 'validated', size: 'lg' },
  { x: 0.20, y: 0.30, state: 'validated', size: 'md' },
  { x: 0.34, y: 0.65, state: 'umbral', size: 'md' },
  { x: 0.54, y: 0.45, state: 'validated', size: 'md' },
  { x: 0.72, y: 0.70, state: 'umbral', size: 'sm' },
  { x: 0.88, y: 0.50, state: 'insufficient', size: 'sm' },
];

export function LiveActivityStrip({
  activeCount = 47,
  headline,
  subline = 'Tres temas cruzan el umbral en tiempo real.',
  eyebrow = 'En este instante',
  nodes = DEFAULT_NODES,
  className = '',
}: LiveActivityStripProps) {
  const computedHeadline = headline ?? `${activeCount} personas opinando`;

  return (
    <section
      aria-labelledby="live-activity-headline"
      className={`relative w-full bg-surface2 rounded-4xl px-8 py-7 overflow-hidden ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:gap-12">
        {/* Texto editorial */}
        <div className="md:max-w-sm shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-2">
            {eyebrow}
          </p>
          <h3
            id="live-activity-headline"
            className="text-2xl md:text-3xl font-black font-display text-ink tracking-tight"
          >
            {computedHeadline}
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed">
            {subline}
          </p>
        </div>

        {/* Constelación de Nodos · curada, no aleatoria */}
        <div
          aria-hidden="true"
          className="relative flex-1 mt-6 md:mt-0 h-32 md:h-28"
        >
          {nodes.map((n, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${n.x * 100}%`,
                top: `${n.y * 100}%`,
              }}
            >
              <SignalNode state={n.state} size={n.size ?? 'md'} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LiveActivityStrip;

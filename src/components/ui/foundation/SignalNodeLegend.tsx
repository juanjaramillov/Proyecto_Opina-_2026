import { SignalNode } from './SignalNode';

/**
 * SignalNodeLegend — Leyenda explicativa del SignalNode.
 *
 * Aparece típicamente una sola vez por pantalla (la primera vez que el usuario
 * ve Nodos en esa vista) para que el sistema sea autoexplicativo en 3 segundos.
 *
 * Variantes:
 *   - horizontal (default): 3 estados en una fila, separados con espacio.
 *   - compact: 3 estados en una fila más densa, ideal para pies de card.
 *
 * Ejemplo:
 *   <SignalNodeLegend />
 *   <SignalNodeLegend variant="compact" />
 */

interface SignalNodeLegendProps {
  variant?: 'horizontal' | 'compact';
  className?: string;
}

const ITEMS = [
  {
    state: 'validated' as const,
    label: 'Validada',
    desc: 'halo accent · cruzó umbral',
  },
  {
    state: 'umbral' as const,
    label: 'En umbral',
    desc: 'punto azul · alcanza masa pronto',
  },
  {
    state: 'insufficient' as const,
    label: 'Insuficiente',
    desc: 'punto tenue · sin masa aún',
  },
];

export function SignalNodeLegend({
  variant = 'horizontal',
  className = '',
}: SignalNodeLegendProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`flex flex-wrap items-center ${
        isCompact ? 'gap-x-6 gap-y-2 text-xs' : 'gap-x-10 gap-y-3'
      } ${className}`}
      aria-label="Leyenda · estados del Nodo de Señal"
    >
      {ITEMS.map((it) => (
        <div
          key={it.state}
          className={`flex items-center ${isCompact ? 'gap-2' : 'gap-3'}`}
        >
          <SignalNode state={it.state} size={isCompact ? 'sm' : 'md'} />
          <div className="flex flex-col leading-tight">
            <span
              className={`font-bold uppercase tracking-widest text-ink ${
                isCompact ? 'text-[10px]' : 'text-[11px]'
              }`}
            >
              {it.label}
            </span>
            <span
              className={`font-medium text-slate-500 ${
                isCompact ? 'text-[10px]' : 'text-[11px]'
              }`}
            >
              {it.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SignalNodeLegend;

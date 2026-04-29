/**
 * SignalNode — Microelemento canónico del sistema visual V17 de Opina+.
 *
 * Spec aprobada (V17 · Signal Visual Language):
 *   - 12 px brand sólido + halo accent 4 px offset · stroke 1.5 px (validated only).
 *   - 3 estados según el avance de la señal en su ciclo de vida.
 *   - 3 tamaños responsivos.
 *
 * Convención de uso (ver docs/design/v17-signal-system.md):
 *   - validated   → la señal cruzó el umbral (k mínimo) y es publicable.
 *   - umbral      → la señal está alcanzando masa pero todavía no fue validada.
 *   - insufficient → ruido sin masa suficiente · NO publicable.
 *
 * NUNCA usar como decoración. Solo aparece donde representa un estado real
 * de una señal colectiva.
 *
 * Ejemplos:
 *   <SignalNode state="validated" />
 *   <SignalNode state="umbral" size="sm" />
 *   <SignalNode state="insufficient" size="lg" aria-label="Tema sin masa suficiente" />
 */

export type SignalNodeState = 'validated' | 'umbral' | 'insufficient';
export type SignalNodeSize = 'sm' | 'md' | 'lg';

interface SignalNodeProps {
  /**
   * Estado actual de la señal. Determina visual y semántica.
   */
  state: SignalNodeState;
  /**
   * Tamaño base del nodo. Default: 'md' (12 px).
   *   - sm:  8 px nodo · 12 px diámetro de halo
   *   - md: 12 px nodo · 20 px diámetro de halo (default)
   *   - lg: 16 px nodo · 28 px diámetro de halo
   */
  size?: SignalNodeSize;
  /**
   * Etiqueta accesible para screen readers. Default: derivada del estado.
   */
  'aria-label'?: string;
  /**
   * Clases adicionales (p.ej. para layout/posicionamiento).
   */
  className?: string;
}

const SIZE_MAP: Record<SignalNodeSize, { node: number; halo: number; stroke: number }> = {
  sm: { node: 8, halo: 16, stroke: 1 },
  md: { node: 12, halo: 20, stroke: 1.5 },
  lg: { node: 16, halo: 28, stroke: 2 },
};

const DEFAULT_LABELS: Record<SignalNodeState, string> = {
  validated: 'Señal validada',
  umbral: 'Señal en umbral',
  insufficient: 'Actividad insuficiente',
};

export function SignalNode({
  state,
  size = 'md',
  'aria-label': ariaLabel,
  className = '',
}: SignalNodeProps) {
  const { node, halo, stroke } = SIZE_MAP[size];

  // Container envuelve el nodo + halo en un wrapper relativo del tamaño del halo.
  // Eso permite que el halo se centre alrededor del nodo sin afectar layout exterior.
  const containerSize = halo;

  // Color del nodo principal según estado
  const nodeColorClass =
    state === 'insufficient'
      ? 'bg-slate-300 opacity-70'
      : state === 'umbral'
        ? 'bg-brand opacity-50'
        : 'bg-brand';

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? DEFAULT_LABELS[state]}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: containerSize, height: containerSize }}
    >
      {/* Halo · solo en estado validated */}
      {state === 'validated' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-accent pointer-events-none"
          style={{ borderWidth: stroke }}
        />
      )}
      {/* Nodo central */}
      <span
        aria-hidden="true"
        className={`block rounded-full ${nodeColorClass}`}
        style={{ width: node, height: node }}
      />
    </span>
  );
}

export default SignalNode;

type Variant = 'hero' | 'section' | 'corner';

interface AmbientOrbsProps {
  /**
   * Variante de composición.
   *   - hero:   dos orbes radiales grandes, una a cada lado, para hero sections.
   *   - section: dos orbes medianas difusas, para secciones intermedias.
   *   - corner: una sola orbe en la esquina superior derecha, para cards grandes.
   */
  variant?: Variant;
  /**
   * Clases adicionales en el wrapper.
   */
  className?: string;
}

/**
 * AmbientOrbs — fondo atmosférico con radiales brand/accent.
 *
 * Drop-in. Colocar DENTRO del contenedor padre con `position: relative`.
 * El componente se posiciona absolute y no captura eventos.
 *
 * Ejemplo:
 *   <section className="relative overflow-hidden">
 *     <AmbientOrbs variant="hero" />
 *     <div className="relative z-10">...</div>
 *   </section>
 */
export function AmbientOrbs({
  variant = 'section',
  className = ''
}: AmbientOrbsProps) {
  if (variant === 'hero') {
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      >
        <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-50/50 via-white to-white blur-3xl opacity-80" />
        <div className="absolute bottom-0 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-50/50 via-white to-white blur-3xl opacity-80" />
      </div>
    );
  }

  if (variant === 'corner') {
    return (
      <div
        aria-hidden="true"
        className={`absolute right-0 top-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10 ${className}`}
      />
    );
  }

  // 'section'
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </div>
  );
}

export default AmbientOrbs;

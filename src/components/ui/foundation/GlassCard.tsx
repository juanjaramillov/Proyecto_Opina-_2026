import { ReactNode, HTMLAttributes } from 'react';

type Intensity = 'subtle' | 'strong';
type Radius = 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface GlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  /**
   * Intensidad del efecto glass.
   *   - subtle: bg-white/70 + backdrop-blur-lg   (ligero)
   *   - strong: bg-white/80 + backdrop-blur-xl   (fuerte)
   */
  intensity?: Intensity;
  /**
   * Radio de las esquinas. Default: '2xl'.
   */
  radius?: Radius;
  /**
   * Si true, añade una sombra suave.
   */
  shadow?: boolean;
  /**
   * Clases adicionales (padding, flex, gap, etc.).
   */
  className?: string;
}

const intensityStyles: Record<Intensity, string> = {
  subtle: 'bg-white/70 backdrop-blur-lg border border-white/80',
  strong: 'bg-white/80 backdrop-blur-xl border border-white/80'
};

const radiusStyles: Record<Radius, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl'
};

/**
 * GlassCard — contenedor glassmorphism oficial de Opina+.
 *
 * Usa la paleta de tintas blancas semitransparentes con blur. No acepta
 * background-color personalizado porque ese es el punto del componente.
 *
 * Ejemplo:
 *   <GlassCard intensity="subtle" radius="2xl" shadow className="p-4">
 *     ...
 *   </GlassCard>
 */
export function GlassCard({
  children,
  intensity = 'subtle',
  radius = '2xl',
  shadow = true,
  className = '',
  ...rest
}: GlassCardProps) {
  // 2026-04-28 · Migrado de shadow-[0_8px_32px_rgba(0,0,0,0.06)] inline a token canónico shadow-glass.
  const shadowClass = shadow ? 'shadow-glass' : '';

  return (
    <div
      className={`${intensityStyles[intensity]} ${radiusStyles[radius]} ${shadowClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlassCard;

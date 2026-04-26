import { ElementType, ReactNode } from 'react';

interface GradientTextProps {
  /**
   * Contenido del texto.
   */
  children: ReactNode;
  /**
   * Elemento HTML renderizado. Default: 'span'.
   * Ej: 'span', 'strong', 'h1', 'p'
   */
  as?: ElementType;
  /**
   * Dirección del gradiente.
   * Por convención Opina+: texto usa `to-r` (horizontal).
   * `to-br` sólo si el diseño lo requiere explícitamente.
   */
  direction?: 'to-r' | 'to-br';
  /**
   * Clases adicionales.
   */
  className?: string;
}

/**
 * GradientText — aplica el gradiente corporativo brand→accent a texto.
 *
 * Convención Opina+:
 *   - Texto: gradient `to-r` (horizontal).
 *   - Formas: gradient `to-br` (diagonal).
 *
 * Uso típico:
 *   <GradientText>señal.</GradientText>
 *   <h1>Convierte tu opinión en una <GradientText>señal</GradientText>.</h1>
 */
export function GradientText({
  children,
  as: Tag = 'span',
  direction = 'to-r',
  className = ''
}: GradientTextProps) {
  const gradientClass = direction === 'to-br'
    ? 'bg-gradient-to-br from-brand to-accent'
    : 'bg-gradient-to-r from-brand to-accent';

  return (
    <Tag className={`text-transparent bg-clip-text ${gradientClass} ${className}`}>
      {children}
    </Tag>
  );
}

export default GradientText;

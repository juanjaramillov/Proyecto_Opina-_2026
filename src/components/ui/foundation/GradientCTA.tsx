import { ReactNode, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'solid' | 'ghost';
type IconPosition = 'leading' | 'trailing';

interface BaseProps {
  /**
   * Texto del botón.
   */
  label: string;
  /**
   * Icono opcional — Material Symbol name (string) o ReactNode.
   */
  icon?: string | ReactNode;
  /**
   * Posición del icono respecto al label. Default: 'trailing'.
   */
  iconPosition?: IconPosition;
  /**
   * Tamaño del botón. Default: 'md'.
   */
  size?: Size;
  /**
   * Variante visual. Default: 'solid'.
   *   - solid: relleno con gradiente brand→accent
   *   - ghost: transparente con borde + texto en gradiente
   */
  variant?: Variant;
  /**
   * Deshabilitado.
   */
  disabled?: boolean;
  /**
   * Clases adicionales.
   */
  className?: string;
  /**
   * Full width.
   */
  fullWidth?: boolean;
}

interface LinkProps extends BaseProps {
  to: string;
  onClick?: never;
  type?: never;
}

interface ButtonProps extends BaseProps {
  to?: never;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

type GradientCTAProps = LinkProps | ButtonProps;

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base sm:text-lg'
};

const iconSizeStyles: Record<Size, string> = {
  sm: 'text-[14px]',
  md: 'text-[16px]',
  lg: 'text-[18px]'
};

/**
 * GradientCTA — botón primario oficial de Opina+.
 *
 * Usa el gradiente corporativo brand→accent (to-r por ser forma pill horizontal,
 * pero visualmente alineado con la convención).
 *
 * Puede renderizar como <Link to=""> (react-router) o <button onClick>.
 *
 * Ejemplos:
 *   <GradientCTA label="Explorar Señales" to="/signals" icon="arrow_forward" />
 *   <GradientCTA label="Guardar" onClick={handleSave} variant="ghost" size="sm" />
 */
export function GradientCTA(props: GradientCTAProps) {
  const {
    label,
    icon,
    iconPosition = 'trailing',
    size = 'md',
    variant = 'solid',
    disabled = false,
    className = '',
    fullWidth = false
  } = props;

  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30';

  const variantStyles: Record<Variant, string> = {
    solid: 'bg-gradient-to-br from-brand to-accent text-white hover:opacity-90 hover:scale-105 hover:shadow-xl hover:shadow-brand/20',
    ghost: 'bg-transparent border-2 border-brand/30 hover:border-brand hover:bg-brand-50/40 active:scale-95'
  };

  const ghostLabel = variant === 'ghost'
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent'
    : '';

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  const composed = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    disabled ? disabledStyles : '',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  const iconNode = icon ? (
    typeof icon === 'string' ? (
      <span className={`material-symbols-outlined ${iconSizeStyles[size]} ${variant === 'ghost' ? 'text-brand' : ''}`}>
        {icon}
      </span>
    ) : (
      icon
    )
  ) : null;

  const labelNode = <span className={ghostLabel}>{label}</span>;

  const content = (
    <>
      {iconPosition === 'leading' && iconNode}
      {labelNode}
      {iconPosition === 'trailing' && iconNode}
    </>
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={composed} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={(props as ButtonProps).type ?? 'button'}
      onClick={(props as ButtonProps).onClick}
      disabled={disabled}
      className={composed}
    >
      {content}
    </button>
  );
}

export default GradientCTA;

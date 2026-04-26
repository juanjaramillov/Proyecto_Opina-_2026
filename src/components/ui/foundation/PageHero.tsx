import { ReactNode } from 'react';
import { GradientText } from './GradientText';
import { GradientCTA } from './GradientCTA';
import { AmbientOrbs } from './AmbientOrbs';

interface CtaConfig {
  /**
   * Texto del CTA.
   */
  label: string;
  /**
   * Ruta interna (react-router). Si se pasa `to`, NO pasar `onClick`.
   */
  to?: string;
  /**
   * Handler onClick. Si se pasa `onClick`, NO pasar `to`.
   */
  onClick?: () => void;
  /**
   * Icono opcional (Material Symbol name).
   */
  icon?: string;
}

interface PageHeroProps {
  /**
   * Pill superior (eyebrow). Ej: "Inteligencia Colectiva en Tiempo Real".
   */
  eyebrow?: string;
  /**
   * Si true, añade un dot pulsante accent a la izquierda del eyebrow.
   */
  eyebrowDot?: boolean;
  /**
   * Título principal. Puede incluir `{highlightedWord}` para destacar una palabra.
   * Se renderiza como h1.
   */
  title: string;
  /**
   * Palabra del `title` que se quiere renderizar en gradiente corporativo.
   * Debe aparecer literalmente dentro de `title`.
   *
   * Ej: title = "Convierte tu opinión en una señal."
   *     highlightedWord = "señal."
   */
  highlightedWord?: string;
  /**
   * Descripción corta bajo el título.
   */
  description?: string;
  /**
   * CTA primario (gradient solid).
   */
  primaryCta?: CtaConfig;
  /**
   * CTA secundario (ghost).
   */
  secondaryCta?: CtaConfig;
  /**
   * Si true, renderiza orbes ambientales de fondo (variant 'hero').
   * Default: true.
   */
  ambient?: boolean;
  /**
   * Slot derecho opcional (visual, mockup, imagen...).
   * Si se pasa, el hero usa layout de 2 columnas; si no, el contenido se centra.
   */
  visual?: ReactNode;
  /**
   * Alineación del texto. Default: 'left' si hay visual, 'center' si no.
   */
  align?: 'left' | 'center';
  /**
   * Clases adicionales para el <section>.
   */
  className?: string;
}

/**
 * PageHero — bloque superior uniforme para páginas de Opina+.
 *
 * Compone: AmbientOrbs + eyebrow + title con palabra-gradiente + descripción + CTAs + visual opcional.
 *
 * Ejemplo uso básico (centrado, sin visual):
 *   <PageHero
 *     eyebrow="Dashboard B2B"
 *     eyebrowDot
 *     title="Convierte señales en decisiones."
 *     highlightedWord="decisiones."
 *     description="Observa cómo tu marca se mueve en la conversación ciudadana."
 *     primaryCta={{ label: 'Ver dashboard', to: '/b2b/dashboard', icon: 'arrow_forward' }}
 *   />
 *
 * Ejemplo con visual a la derecha (estilo Home):
 *   <PageHero
 *     title="Convierte tu opinión en una señal."
 *     highlightedWord="señal."
 *     visual={<PhoneMockup />}
 *   />
 */
export function PageHero({
  eyebrow,
  eyebrowDot = false,
  title,
  highlightedWord,
  description,
  primaryCta,
  secondaryCta,
  ambient = true,
  visual,
  align,
  className = ''
}: PageHeroProps) {
  const resolvedAlign = align ?? (visual ? 'left' : 'center');
  const textAlignClass = resolvedAlign === 'center' ? 'items-center text-center' : 'items-start text-left';
  const ctaWrapAlignClass = resolvedAlign === 'center' ? 'justify-center' : 'justify-start';

  // Parse title with highlighted word.
  let titleNode: ReactNode = title;
  if (highlightedWord && title.includes(highlightedWord)) {
    const parts = title.split(highlightedWord);
    titleNode = (
      <>
        {parts[0]}
        <GradientText>{highlightedWord}</GradientText>
        {parts.slice(1).join(highlightedWord)}
      </>
    );
  }

  const renderCta = (cta: CtaConfig, variant: 'solid' | 'ghost') => {
    const commonProps = {
      label: cta.label,
      icon: cta.icon,
      variant,
      size: 'lg' as const
    };
    if (cta.to) {
      return <GradientCTA key={cta.label} {...commonProps} to={cta.to} />;
    }
    return <GradientCTA key={cta.label} {...commonProps} onClick={cta.onClick} />;
  };

  return (
    <section
      className={`relative min-h-[60vh] lg:min-h-[80vh] flex items-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white ${className}`}
    >
      {ambient && <AmbientOrbs variant="hero" />}

      <div className={`relative z-10 w-full max-w-7xl mx-auto flex flex-col ${visual ? 'lg:flex-row lg:items-center' : ''} gap-12 lg:gap-8`}>
        <div className={`flex-1 flex flex-col ${textAlignClass} max-w-2xl ${resolvedAlign === 'center' ? 'mx-auto' : ''}`}>
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 shadow-sm">
              {eyebrowDot && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              )}
              {eyebrow}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-ink mb-6 leading-[1.1]">
            {titleNode}
          </h1>

          {description && (
            <p className="text-base sm:text-lg lg:text-xl text-slate-500 mb-8 sm:mb-10 max-w-lg leading-relaxed font-medium">
              {description}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div className={`flex flex-col sm:flex-row items-center gap-3 w-full ${ctaWrapAlignClass}`}>
              {primaryCta && renderCta(primaryCta, 'solid')}
              {secondaryCta && renderCta(secondaryCta, 'ghost')}
            </div>
          )}
        </div>

        {visual && (
          <div className="flex-1 w-full flex items-center justify-center relative">
            {visual}
          </div>
        )}
      </div>
    </section>
  );
}

export default PageHero;

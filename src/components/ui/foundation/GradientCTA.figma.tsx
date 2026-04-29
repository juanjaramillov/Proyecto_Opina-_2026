/**
 * Code Connect mapping · Button (Figma ComponentSet) ↔ código real Opina+
 *
 * Figma master: "Button" (node-id 33-38)
 * Variants:
 *   variant=solid|ghost  → componente React `GradientCTA`
 *   variant=secondary    → utility class `.btn-secondary` (src/index.css)
 *   variant=hero         → utility class `.btn-hero` (src/index.css)
 *
 * Cualquier instancia del Button en una pantalla Figma muestra,
 * en Dev Mode, el JSX correspondiente con sus props seteadas.
 *
 * Este archivo NO se importa en runtime. No va al bundle de prod.
 */
import figma from '@figma/code-connect';
import { GradientCTA } from './GradientCTA';

// =====================================================
// variant = "solid"  → <GradientCTA variant="solid" />
// =====================================================
figma.connect(GradientCTA, 'https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=33-38', {
  variant: { variant: 'solid' },
  props: {
    label: figma.string('label'),
    size: figma.enum('size', { sm: 'sm', md: 'md', lg: 'lg' }),
    icon: figma.boolean('iconRight', {
      true: 'arrow_forward',
      false: undefined,
    }),
  },
  example: ({ label, size, icon }) => (
    <GradientCTA
      label={label}
      variant="solid"
      size={size}
      icon={icon}
      iconPosition="trailing"
      to="/signals"
    />
  ),
});

// =====================================================
// variant = "ghost"  → <GradientCTA variant="ghost" />
// =====================================================
figma.connect(GradientCTA, 'https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=33-38', {
  variant: { variant: 'ghost' },
  props: {
    label: figma.string('label'),
    size: figma.enum('size', { sm: 'sm', md: 'md', lg: 'lg' }),
    icon: figma.boolean('iconRight', {
      true: 'arrow_forward',
      false: undefined,
    }),
  },
  example: ({ label, size, icon }) => (
    <GradientCTA
      label={label}
      variant="ghost"
      size={size}
      icon={icon}
      iconPosition="trailing"
      to="/learn-more"
    />
  ),
});

// =====================================================
// variant = "secondary"  → utility class .btn-secondary (index.css)
// =====================================================
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=33-38', {
  variant: { variant: 'secondary' },
  props: {
    label: figma.string('label'),
  },
  example: ({ label }) => (
    <button type="button" className="btn btn-secondary">
      {label}
    </button>
  ),
});

// =====================================================
// variant = "hero"  → utility class .btn-hero (index.css)
// =====================================================
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=33-38', {
  variant: { variant: 'hero' },
  props: {
    label: figma.string('label'),
    icon: figma.boolean('iconRight', { true: '→', false: '' }),
  },
  example: ({ label, icon }) => (
    <button type="button" className="btn btn-hero">
      {label} {icon}
    </button>
  ),
});

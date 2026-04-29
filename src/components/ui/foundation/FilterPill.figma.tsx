/**
 * Code Connect mapping · FilterPill (Figma ComponentSet) ↔ FilterPill.tsx
 *
 * Figma master: "FilterPill" (node-id 35-46)
 * Variantes Figma: variant=default|primary|secondary|soft × selected=true|false
 *
 * Este archivo NO se importa en runtime.
 */
import figma from '@figma/code-connect';
import { FilterPill } from './FilterPill';

figma.connect(FilterPill, 'https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-46', {
  props: {
    label: figma.string('label'),
    variant: figma.enum('variant', {
      default: 'default',
      primary: 'primary',
      secondary: 'secondary',
      soft: 'soft',
    }),
    selected: figma.enum('selected', {
      true: true,
      false: false,
    }),
  },
  example: ({ label, variant, selected }) => (
    <FilterPill
      label={label}
      variant={variant}
      selected={selected}
      onClick={() => {
        /* handler local */
      }}
    />
  ),
});

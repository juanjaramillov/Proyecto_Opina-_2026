/**
 * Code Connect mapping · Badge (Figma ComponentSet) ↔ utility classes (src/index.css)
 *
 * Figma master: "Badge" (node-id 35-29)
 * Tonos:
 *   default → .badge
 *   brand   → .badge .badge-primary
 *   success → tokens accent-50 / accent-700
 *   danger  → tokens danger-50 / danger-700
 *   warning → tokens warning-50 / warning-700
 *
 * Este archivo NO se importa en runtime.
 */
import figma from '@figma/code-connect';

// tone = "default"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-29', {
  variant: { tone: 'default' },
  props: { label: figma.string('label') },
  example: ({ label }) => <span className="badge">{label}</span>,
});

// tone = "brand"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-29', {
  variant: { tone: 'brand' },
  props: { label: figma.string('label') },
  example: ({ label }) => <span className="badge badge-primary">{label}</span>,
});

// tone = "success"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-29', {
  variant: { tone: 'success' },
  props: { label: figma.string('label') },
  example: ({ label }) => (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-100">
      {label}
    </span>
  ),
});

// tone = "danger"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-29', {
  variant: { tone: 'danger' },
  props: { label: figma.string('label') },
  example: ({ label }) => (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-danger-50 text-danger-700 border border-danger-100">
      {label}
    </span>
  ),
});

// tone = "warning"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-29', {
  variant: { tone: 'warning' },
  props: { label: figma.string('label') },
  example: ({ label }) => (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-warning-50 text-warning-700 border border-warning-100">
      {label}
    </span>
  ),
});

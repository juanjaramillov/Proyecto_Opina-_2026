/**
 * Code Connect mapping · Card (Figma ComponentSet) ↔ utility classes (src/index.css)
 *
 * Figma master: "Card" (node-id 35-18)
 * Variantes:
 *   base    → .card .card-pad
 *   kpi     → .card .card-kpi
 *   signal  → .card .card-signal
 *   explore → .card .card-explore
 *
 * Las cards en Opina+ son utility classes Tailwind (capa @components de
 * src/index.css), no un componente React. Code Connect muestra el JSX
 * de referencia con esas clases.
 *
 * Este archivo NO se importa en runtime.
 */
import figma from '@figma/code-connect';

// =====================================================
// variant = "base"
// =====================================================
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-18', {
  variant: { variant: 'base' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    <div className="card card-pad">
      <h3 className="text-lg font-bold font-display text-ink leading-snug">
        {title}
      </h3>
      <p className="text-base text-slate-600 leading-relaxed mt-2">{body}</p>
    </div>
  ),
});

// =====================================================
// variant = "kpi"
// =====================================================
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-18', {
  variant: { variant: 'kpi' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    <div className="card card-kpi">
      <span className="kpi-label">{title}</span>
      <span className="kpi-value">{body}</span>
    </div>
  ),
});

// =====================================================
// variant = "signal"
// =====================================================
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-18', {
  variant: { variant: 'signal' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    <div className="card card-signal">
      <span className="label-sm">Señal</span>
      <h3 className="text-xl font-bold font-display text-ink">{title}</h3>
      <p className="body-caption">{body}</p>
    </div>
  ),
});

// =====================================================
// variant = "explore"
// =====================================================
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-18', {
  variant: { variant: 'explore' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    <div className="card-explore p-6 bg-gradient-to-br from-brand to-accent text-white">
      <span className="text-xs font-bold uppercase tracking-widest opacity-90">
        Explorar
      </span>
      <h3 className="text-2xl font-black font-display mt-2">{title}</h3>
      <p className="text-sm font-medium opacity-90 mt-2">{body}</p>
    </div>
  ),
});

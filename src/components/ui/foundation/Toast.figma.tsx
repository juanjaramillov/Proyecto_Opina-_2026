/**
 * Code Connect mapping · Toast (Figma ComponentSet) ↔ react-hot-toast
 *
 * Figma master: "Toast" (node-id 35-81)
 * Tonos:
 *   success → toast.success(...)
 *   danger  → toast.error(...)
 *   info    → toast(...)
 *
 * En Opina+ los toasts se invocan vía la librería react-hot-toast (montada
 * por el Toaster global en src/components/ui/ToastProvider.tsx).
 *
 * Este archivo NO se importa en runtime.
 */
import figma from '@figma/code-connect';

// tone = "success"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-81', {
  variant: { tone: 'success' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    // Invocación típica:
    // import toast from 'react-hot-toast';
    // toast.success(`${title}\n${body}`);
    <div className="rounded-2xl shadow-lift bg-ink text-white px-4 py-3 max-w-sm">
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-slate-300 mt-1">{body}</p>
    </div>
  ),
});

// tone = "danger"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-81', {
  variant: { tone: 'danger' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    // toast.error(`${title}\n${body}`);
    <div className="rounded-2xl shadow-card bg-danger-50 border border-danger-100 px-4 py-3 max-w-sm">
      <p className="text-sm font-bold text-danger-700">{title}</p>
      <p className="text-xs text-danger-700/80 mt-1">{body}</p>
    </div>
  ),
});

// tone = "info"
figma.connect('https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-81', {
  variant: { tone: 'info' },
  props: {
    title: figma.string('title'),
    body: figma.string('body'),
  },
  example: ({ title, body }) => (
    // toast(`${title}\n${body}`);
    <div className="rounded-2xl shadow-card bg-white border border-slate-200 px-4 py-3 max-w-sm">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{body}</p>
    </div>
  ),
});

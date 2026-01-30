import React from 'react';

interface HeroSignalCardProps {
  title: string;
  description: string;
  category: string;
  responses: number;
  href: string;
}

const HeroSignalCard: React.FC<HeroSignalCardProps> = ({
  title,
  description,
  category,
  responses,
  href,
}) => {
  return (
    <a
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-home"
      aria-label={`Ver señal: ${title}`}
    >
      {/* Accent rail */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary opacity-70" />

      {/* Soft glow */}
      <div className="pointer-events-none absolute -top-20 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
            {category}
          </span>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>{responses.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h3 className="text-xl font-black tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-primary">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2 text-sm font-extrabold text-primary">
          <span className="opacity-80 transition-opacity group-hover:opacity-100">Ver detalle</span>
          <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-[2px]">
            arrow_forward
          </span>
        </div>
      </div>
    </a>
  );
};

export default HeroSignalCard;

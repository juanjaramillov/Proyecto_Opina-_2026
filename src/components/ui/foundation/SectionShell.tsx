import { ReactNode } from 'react';

interface SectionShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionContent?: ReactNode;
  children: ReactNode;
  variant?: 'neutral' | 'highlighted';
  className?: string;
}

export function SectionShell({
  eyebrow,
  title,
  description,
  actionContent,
  children,
  variant = 'neutral',
  className = ''
}: SectionShellProps) {
  const isHighlighted = variant === 'highlighted';

  return (
    <div className={`w-full rounded-[2.5rem] border overflow-hidden flex flex-col relative ${isHighlighted ? 'bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 shadow-sm border-slate-100' : 'bg-white border-stroke'} ${className}`}>
      {/* Container Header */}
      <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between px-8 pt-8 pb-4 ${isHighlighted ? 'border-b border-slate-100/50' : ''}`}>
        <div className="text-center md:text-left mb-4 md:mb-0">
           {eyebrow && (
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
               {eyebrow}
             </span>
           )}
           <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">{title}</h2>
           {description && (
             <p className="text-sm text-slate-500 font-medium mt-1">
               {description}
             </p>
           )}
        </div>
        
        {actionContent && (
          <div className="flex items-center gap-3">
             {actionContent}
          </div>
        )}
      </div>

      {/* Container Body */}
      <div className="relative z-10 p-8 pt-4">
        {children}
      </div>
    </div>
  );
}

import React from 'react';

interface FilterPillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ElementType | string;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FilterPill({
  label,
  selected = false,
  onClick,
  icon: Icon,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = ''
}: FilterPillProps) {
  // Size mapping
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-[11px]',
    md: 'px-3 py-1.5 text-[12px]',
    lg: 'px-4 py-2 text-[13px]'
  };

  // Base transition & layout classes
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all whitespace-nowrap snap-start shrink-0 border';

  // Variant mappings for ACTIVE state
  const activeStyles = {
    default: 'bg-ink text-white border-ink shadow-md scale-105 uppercase tracking-widest',
    primary: 'bg-brand-600 text-white border-brand-600 shadow-md scale-105',
    secondary: 'bg-slate-800 text-white border-slate-800 shadow-sm',
    soft: 'bg-brand-50 text-brand-700 border-brand-200 ring-1 ring-brand-200 shadow-sm'
  };

  // Variant mappings for INACTIVE state
  const inactiveStyles = {
    default: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 uppercase tracking-widest',
    primary: 'bg-transparent text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-100',
    secondary: 'bg-transparent text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-100',
    soft: 'bg-transparent text-slate-400 border-transparent hover:text-slate-700 hover:bg-slate-100/50'
  };

  // Disabled style overrides
  const disabledStyles = 'opacity-50 cursor-not-allowed bg-surface2 border-stroke text-slate-500';

  // Determine current style state
  const currentStyles = disabled 
    ? disabledStyles 
    : selected ? activeStyles[variant] : inactiveStyles[variant];

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${currentStyles} ${className}`}
    >
      {Icon && (
         typeof Icon === 'string' ? (
           <span className="material-symbols-outlined text-[14px] leading-none">{Icon}</span>
         ) : (
           <Icon className="w-3.5 h-3.5" />
         )
      )}
      {label}
    </button>
  );
}

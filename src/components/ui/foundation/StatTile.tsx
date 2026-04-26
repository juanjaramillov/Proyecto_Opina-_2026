import React, { ReactNode } from 'react';

interface StatTileProps {
  label: string;
  value: string | number | ReactNode;
  supportingText?: string;
  icon?: React.ElementType | string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  children?: ReactNode;
}

export function StatTile({
  label,
  value,
  supportingText,
  icon: Icon,
  trend,
  className = '',
  children
}: StatTileProps) {
  return (
    <div className={`p-6 rounded-2xl bg-white border border-stroke shadow-sm flex flex-col relative overflow-hidden group hover:border-brand/20 transition-all duration-300 ${className}`}>
        <div className="mb-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             {Icon && (
                <div className="w-8 h-8 rounded-full bg-brand/5 flex items-center justify-center border border-brand/10">
                    {typeof Icon === 'string' ? (
                      <span className="material-symbols-outlined text-[16px] text-brand">{Icon}</span>
                    ) : (
                      <Icon className="w-4 h-4 text-brand" />
                    )}
                </div>
             )}
             <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600">{label}</span>
           </div>
           
           {trend && (
             <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 ${
               trend.direction === 'up' ? 'text-accent bg-accent/10 border border-accent-100' : 
               trend.direction === 'down' ? 'text-danger-700 bg-danger-50 border border-danger-100' : 
               'text-slate-600 bg-slate-100 border border-slate-200'
             }`}>
               {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}
             </div>
           )}
        </div>
        
        <div className="flex flex-col mt-auto">
           <span className="text-3xl md:text-4xl font-black text-ink tracking-tighter leading-none mb-1">{value}</span>
           {supportingText && (
             <span className="text-xs font-medium text-slate-500">{supportingText}</span>
           )}
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-stroke/50">
            {children}
          </div>
        )}
    </div>
  );
}

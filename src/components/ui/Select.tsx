import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options?: SelectOption[];
    children?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, children, className = '', ...props }, ref) => {
        return (
            <div className="relative group">
                {label && (
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            appearance-none block w-full rounded-xl border border-slate-200 bg-white
                            px-4 py-3 pr-10 text-sm font-bold text-slate-700
                            shadow-sm transition-all duration-200
                            hover:border-slate-300 hover:shadow-md
                            focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none
                            cursor-pointer
                            ${className}
                        `}
                        {...props}
                    >
                        {options
                            ? options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))
                            : children}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </div>
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;

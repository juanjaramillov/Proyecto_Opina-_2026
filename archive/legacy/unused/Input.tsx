import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="label-sm block mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`
                            block w-full rounded-xl border border-stroke bg-white
                            px-4 py-3 text-sm font-bold text-ink
                            shadow-sm transition-all duration-200
                            hover:border-primary/50 hover:shadow-md
                            focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none
                            disabled:bg-surface2 disabled:cursor-not-allowed disabled:text-text-muted
                            ${error ? 'border-red-500 hover:border-red-600 focus:border-red-500 focus:ring-red-500/10' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

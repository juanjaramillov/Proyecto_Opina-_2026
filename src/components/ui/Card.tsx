import React, { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
    active?: boolean;
    density?: "default" | "compact";
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    hoverEffect = false,
    active = false,
    density = "default",
    ...props
}) => {
    const baseStyles = "bg-white rounded-2xl border transition-all duration-300 relative overflow-hidden";
    const defaultStyles = "border-slate-200 shadow-sm";
    const hoverStyles = hoverEffect ? "hover:shadow-xl hover:border-indigo-100 hover:-translate-y-0.5" : "";
    const activeStyles = active ? "ring-2 ring-indigo-500 border-indigo-500 shadow-md" : "";
    const densityStyles = density === "compact" ? "rounded-xl" : "rounded-2xl";

    return (
        <div className={`${baseStyles} ${defaultStyles} ${hoverStyles} ${activeStyles} ${densityStyles} ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
    <div className={`p-4 sm:p-5 border-b border-slate-100 ${className}`} {...props}>
        {children}
    </div>
);

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
    <div className={`p-3 sm:p-4 bg-slate-50 border-t border-slate-100 ${className}`} {...props}>
        {children}
    </div>
);

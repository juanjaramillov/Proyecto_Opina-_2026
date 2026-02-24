import React from "react";

type PageHeaderVariant = "card" | "simple";

type PageHeaderProps = {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    meta?: React.ReactNode;
    actions?: React.ReactNode;
    variant?: PageHeaderVariant;
    className?: string;
};

export default function PageHeader({
    eyebrow,
    title,
    subtitle,
    meta,
    actions,
    variant = "card",
    className,
}: PageHeaderProps) {
    const base =
        variant === "card"
            ? "bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            : "pb-4 border-b border-slate-200";

    return (
        <header className={[base, className].filter(Boolean).join(" ")}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="min-w-0">
                    {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
                    <div className="min-w-0">{title}</div>
                    {subtitle ? <div className="mt-1">{subtitle}</div> : null}
                    {meta ? <div className="mt-2">{meta}</div> : null}
                </div>

                {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
        </header>
    );
}

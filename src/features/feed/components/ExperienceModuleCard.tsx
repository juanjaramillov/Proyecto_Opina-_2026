import React from "react";

type Tone = "primary" | "secondary" | "emerald" | "rose" | "slate";

const toneStyles: Record<Tone, { iconWrap: string; hover: string }> = {
    primary: {
        iconWrap: "bg-primary/10 text-primary",
        hover: "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40",
    },
    secondary: {
        iconWrap: "bg-secondary/10 text-secondary",
        hover: "hover:shadow-lg hover:shadow-secondary/10 hover:border-secondary/40",
    },
    emerald: {
        iconWrap: "bg-emerald-500/10 text-emerald-600",
        hover: "hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/40",
    },
    rose: {
        iconWrap: "bg-rose-500/10 text-rose-600",
        hover: "hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-500/40",
    },
    slate: {
        iconWrap: "bg-slate-200 text-slate-500",
        hover: "hover:shadow-md hover:border-slate-300",
    },
};

type Props = {
    title: string;
    description: string;
    icon: string;
    tone?: Tone;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string; // ej: "Próximamente"
    footerLeft?: React.ReactNode;
    footerRight?: React.ReactNode;
};

export default function ExperienceModuleCard({
    title,
    description,
    icon,
    tone = "primary",
    onClick,
    disabled,
    badge,
    footerLeft,
    footerRight,
}: Props) {
    const t = toneStyles[tone];

    const base =
        "relative p-6 rounded-3xl border border-slate-100 shadow-sm transition-all text-left flex flex-col h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500";

    const enabled = `${t.hover} hover:-translate-y-1 active:scale-[0.99] bg-white`;
    const disabledCls =
        "bg-slate-50 opacity-70 cursor-default border-slate-100 shadow-none";

    const Wrapper: React.ElementType = onClick ? "button" : "div";

    return (
        <Wrapper
            type={onClick ? "button" : undefined}
            onClick={disabled ? undefined : onClick}
            className={[base, disabled ? disabledCls : enabled].join(" ")}
            disabled={!!disabled}
        >
            {badge ? (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-900 rounded-md text-[10px] font-black text-white uppercase tracking-wider">
                    {badge}
                </div>
            ) : null}

            <div
                className={[
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform",
                    disabled ? "bg-slate-200 text-slate-500" : t.iconWrap,
                    !disabled ? "group-hover:scale-110" : "",
                ].join(" ")}
            >
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>

            <h3 className="text-xl font-black text-ink tracking-tight mb-2">{title}</h3>
            <p className="text-sm text-muted mb-4">{description}</p>

            {(footerLeft || footerRight) ? (
                <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-slate-50">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {footerLeft}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {footerRight}
                    </div>
                </div>
            ) : null}
        </Wrapper>
    );
}

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
    status?: "active" | "soon";
    tags?: string[];
    variant?: "featured" | "compact" | "standard";
};

export default function ExperienceModuleCard({
    title,
    description,
    icon,
    tone = "primary",
    onClick,
    tags = [],
    variant = "standard",
}: Props) {
    const t = toneStyles[tone];

    // --- RENDER COMPACTO (Para los módulos Próximamente) ---
    if (variant === "compact") {
        return (
            <button
                type="button"
                onClick={onClick}
                className="group relative flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 overflow-hidden w-full"
            >
                {/* Ícono Izquierdo */}
                <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-200/50 text-slate-400 flex items-center justify-center mr-4 group-hover:bg-slate-100 group-hover:text-slate-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>

                <div className="flex-grow pr-16">
                    <h3 className="text-base font-black tracking-tight text-slate-600 group-hover:text-slate-900 transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">
                        {description}
                    </p>
                </div>

                {/* Tag Right */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-wider group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors flex items-center gap-1">
                        Mockup <span className="material-symbols-outlined text-[10px]">visibility</span>
                    </span>
                </div>
            </button>
        );
    }

    // --- RENDER FEATURED / STANDARD (Para módulos Activos) ---
    const isFeatured = variant === "featured";

    // Background con un gradient súper sutil dependiendo del tono, para que se vea premium
    const baseClass = `relative w-full h-full flex flex-col justify-between rounded-[2rem] p-8 text-left transition-all duration-300 group focus:outline-none overflow-hidden hover:-translate-y-1 hover:shadow-xl`;

    // Asignación de bordes e iluminación según el tono
    // Aquí hardcodeamos un par de clases basadas en el tone para evitar interpolación compleja en Tailwind
    let premiumClasses = "bg-white border hover:border-primary-200 border-slate-100";
    let glowClass = "from-primary-500/0 via-primary-500/5 to-primary-500/0";

    if (tone === "primary") {
        premiumClasses = "bg-gradient-to-b from-white to-blue-50/30 border border-blue-100 hover:border-blue-300 shadow-sm shadow-blue-900/5";
        glowClass = "from-blue-400/0 via-blue-400/20 to-blue-400/0";
    } else if (tone === "secondary") {
        premiumClasses = "bg-gradient-to-b from-white to-secondary-50/30 border border-secondary-100 hover:border-secondary-300 shadow-sm shadow-secondary-900/5";
        glowClass = "from-secondary-400/0 via-secondary-400/20 to-secondary-400/0";
    } else if (tone === "emerald") {
        premiumClasses = "bg-gradient-to-b from-white to-emerald-50/30 border border-emerald-100 hover:border-emerald-300 shadow-sm shadow-emerald-900/5";
        glowClass = "from-emerald-400/0 via-emerald-400/20 to-emerald-400/0";
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={[baseClass, premiumClasses].join(" ")}
        >
            {/* Animación de brillo superior */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${glowClass} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Ícono gigante y estilizado */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${t.iconWrap} ring-4 ring-white shadow-sm`}>
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>

            <h3 className={`font-black tracking-tight text-slate-900 mb-2 ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                {title}
            </h3>

            <p className={`text-slate-500 font-medium mb-8 leading-relaxed ${isFeatured ? 'text-base' : 'text-sm'}`}>
                {description}
            </p>

            <div className="mt-auto flex flex-col gap-5">
                {/* Tags premium */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 bg-white/50 px-3 py-1.5 rounded-xl shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Botón CTA Falso/Visual */}
                <div className={`flex items-center gap-2 font-black text-sm transition-colors ${tone === 'primary' ? 'text-blue-600 group-hover:text-blue-700' :
                    tone === 'secondary' ? 'text-secondary-600 group-hover:text-secondary-700' :
                        tone === 'emerald' ? 'text-emerald-600 group-hover:text-emerald-700' :
                            'text-slate-600'
                    }`}>
                    <span>Participar</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
            </div>
        </button>
    );
}

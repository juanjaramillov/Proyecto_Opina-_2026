import { toneClasses, TrackCard, ExperienceMode } from "./hubSecondaryData";
import { PreviewByType } from "./HubTrackPreviews";

export function CardPattern({ tone }: { tone: TrackCard["tone"] }) {
    if (tone === "indigo") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_10%_15%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_92%_10%,rgba(59,130,246,0.12),transparent_34%)]" />
                <div className="absolute inset-x-4 top-10 h-20 opacity-80">
                    <div className="absolute inset-x-0 top-2 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                    <div className="absolute inset-x-6 top-8 h-10 rounded-full border border-indigo-100/80" />
                    <div className="absolute inset-x-12 top-12 h-8 rounded-full border border-indigo-100/70" />
                </div>
            </>
        );
    }

    if (tone === "emerald") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_8%_18%,rgba(16,185,129,0.12),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(45,212,191,0.10),transparent_34%)]" />
                <div className="absolute inset-x-5 top-8 h-24 opacity-70">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(16,185,129,0.09)_22%,transparent_48%,rgba(16,185,129,0.06)_68%,transparent_100%)]" />
                    <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                </div>
            </>
        );
    }

    if (tone === "orange") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_10%_14%,rgba(249,115,22,0.14),transparent_36%),radial-gradient(circle_at_92%_12%,rgba(251,191,36,0.10),transparent_34%)]" />
                <div className="absolute right-4 top-7 h-24 w-44 opacity-70 [background-image:linear-gradient(rgba(251,146,60,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.11)_1px,transparent_1px)] [background-size:16px_16px] [transform:perspective(180px)_rotateX(68deg)] rounded-2xl" />
            </>
        );
    }

    if (tone === "sky") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.14),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(34,211,238,0.10),transparent_34%)]" />
                <div className="absolute inset-x-5 top-8 h-24 opacity-70 [background-image:linear-gradient(rgba(56,189,248,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
            </>
        );
    }

    if (tone === "violet") {
        return (
            <>
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_16%,rgba(139,92,246,0.14),transparent_36%),radial-gradient(circle_at_88%_10%,rgba(217,70,239,0.10),transparent_32%)]" />
                <div className="absolute right-5 top-6 h-24 w-24 rounded-[28px] border border-violet-100/80 opacity-80" />
                <div className="absolute right-11 top-12 h-12 w-12 rounded-2xl border border-violet-100/80 opacity-70" />
            </>
        );
    }

    return (
        <>
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_12%_16%,rgba(236,72,153,0.14),transparent_36%),radial-gradient(circle_at_88%_10%,rgba(251,113,133,0.10),transparent_32%)]" />
            <div className="absolute inset-x-5 top-10 h-20 opacity-75">
                <div className="absolute inset-x-0 top-4 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                <div className="absolute inset-x-6 top-10 h-8 rounded-full border border-pink-100/80" />
            </div>
        </>
    );
}

export function HubTrackCardView({
    card,
    setMode,
}: {
    card: TrackCard;
    setMode: (mode: ExperienceMode) => void;
}) {
    const tone = toneClasses(card.tone);

    return (
        <button
            type="button"
            onClick={card.available && card.mode ? () => setMode(card.mode as ExperienceMode) : undefined}
            aria-disabled={!card.available}
            className={[
                "group relative isolate flex w-[332px] shrink-0 snap-center flex-col overflow-hidden rounded-[34px] border bg-white text-left transition-all duration-500 ease-out md:w-[360px] md:snap-start",
                "h-auto min-h-[700px] md:min-h-[720px]",
                "border-slate-200 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.35)] hover:-translate-y-1.5",
                tone.border,
                tone.shadow,
                card.available ? "cursor-pointer" : "cursor-default",
                !card.available ? "opacity-[0.96]" : "",
            ].join(" ")}
        >
            <div className={`absolute inset-0 bg-gradient-to-b ${tone.wash}`} />
            <div className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-br ${tone.glow}`} />
            <CardPattern tone={card.tone} />

            <div className="relative z-10 flex h-full flex-col px-6 pb-6 pt-6 md:px-7 md:pb-7">
                <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border shadow-sm transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-[1.03] ${tone.iconWrap}`}>
                        <span className="material-symbols-outlined text-[28px]">{card.icon}</span>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] shrink-0 ${tone.badge}`}>
                            {card.status === "En vivo" || card.status === "Activo" ? (
                                <span className={`h-1.5 w-1.5 rounded-full ${tone.accentSoft} animate-pulse`} />
                            ) : (
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                            )}
                            {card.status}
                        </span>

                        {card.meta ? (
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] shrink-0 ${tone.meta}`}>
                                {card.meta}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-5">
                    <h3 className={`text-[34px] font-black leading-none tracking-[-0.04em] text-slate-900 transition-colors duration-300 ${tone.titleHover}`}>
                        {card.title}
                    </h3>
                    <p className="mt-3 max-w-[27ch] text-[17px] font-medium leading-[1.3] text-slate-600">
                        {card.subtitle}
                    </p>
                </div>

                <div className={`mt-5 h-px shrink-0 bg-gradient-to-r ${tone.hairline}`} />

                <div className="mt-5 space-y-4">
                    <p className="text-[14px] font-bold leading-[1.45] text-slate-800">
                        {card.statement}
                    </p>

                    <ul className="space-y-2.5">
                        {card.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2.5">
                                <span className={`material-symbols-outlined mt-0.5 text-[16px] shrink-0 ${tone.bullet}`}>check_circle</span>
                                <span className="text-[13px] font-medium leading-[1.35] text-slate-600">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto flex w-full flex-col justify-end pt-8">
                    <div className="w-full shrink-0">
                        <PreviewByType preview={card.preview} tone={tone} />
                    </div>

                    <div className="mt-5 w-full shrink-0">
                        <span
                            className={[
                                "inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-4 text-[15px] font-black tracking-[-0.02em] transition-all duration-300",
                                card.available
                                    ? `bg-gradient-to-r ${tone.cta} ${tone.ctaText} border-transparent shadow-[0_12px_24px_-16px_rgba(15,23,42,0.4)] group-hover:scale-[1.01]`
                                    : `${tone.ctaGhost} shadow-none`,
                            ].join(" ")}
                        >
                            {card.cta}
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

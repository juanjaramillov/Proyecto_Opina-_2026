import React from "react";

type Props = {
    userTier?: "guest" | "registered" | "verified" | string;
    profileCompleteness?: number; // 0..100
    className?: string;
};

function getLabel(userTier?: string, profileCompleteness?: number) {
    const tier = (userTier || "guest").toLowerCase();
    const pc = typeof profileCompleteness === "number" ? profileCompleteness : 0;

    if (tier === "verified" && pc >= 70) return { label: "Alta", dot: "bg-emerald-500" };
    if (tier === "registered" || (tier === "verified" && pc < 70)) return { label: "Media", dot: "bg-amber-500" };
    return { label: "Baja", dot: "bg-slate-300" };
}

export function QualityBadge({ userTier, profileCompleteness, className = "" }: Props) {
    const { label, dot } = getLabel(userTier, profileCompleteness);

    return (
        <span
            className={[
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
                "bg-white/60 backdrop-blur",
                className,
            ].join(" ")}
            title="Calidad de la señal (tier + completitud)"
        >
            <span className={["h-2 w-2 rounded-full", dot].join(" ")} />
            <span className="font-medium">{label}</span>
        </span>
    );
}

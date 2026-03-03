import type { LucideIcon } from "lucide-react";

export default function HubIcon({
    Icon,
    size = 44,
}: {
    Icon: LucideIcon;
    size?: number;
}) {
    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Orb */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/25 to-emerald-500/25 blur-[14px]" />

            {/* Plate */}
            <div className="relative w-full h-full rounded-2xl bg-white border border-slate-100 flex items-center justify-center
                      transition-transform duration-200 group-hover:rotate-[-3deg]">

                {/* Icon */}
                <Icon className="w-5 h-5 text-slate-900" />

                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity
                        bg-gradient-to-br from-blue-600/10 to-emerald-500/10" />
            </div>
        </div>
    );
}

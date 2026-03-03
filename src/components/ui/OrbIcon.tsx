import React from "react";

type OrbIconName = "versus" | "competition" | "depth" | "users" | "signals" | "analysis" | "battles";

export default function OrbIcon({
    name,
    size = 44,
}: {
    name: OrbIconName;
    size?: number;
}) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: "orb-icon",
    };

    const stroke = "url(#opinaGrad)";
    const stroke2 = "rgba(15,23,42,0.55)";

    const paths: Record<OrbIconName, React.ReactNode> = {
        versus: (
            <>
                <path d="M7 8h10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
                <path d="M9 6l-2 2 2 2" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 18H5" stroke={stroke2} strokeWidth="2" strokeLinecap="round" />
                <path d="M13 16l2 2-2 2" stroke={stroke2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
        ),
        competition: (
            <>
                <path d="M7 15l4-4 3 3 3-6" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 18h12" stroke={stroke2} strokeWidth="2" strokeLinecap="round" />
            </>
        ),
        depth: (
            <>
                <path d="M12 4l7 4-7 4-7-4 7-4z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
                <path d="M5 12l7 4 7-4" stroke={stroke2} strokeWidth="2" strokeLinejoin="round" />
                <path d="M5 16l7 4 7-4" stroke={stroke2} strokeWidth="2" strokeLinejoin="round" />
            </>
        ),
        users: (
            <>
                <path d="M16 11a4 4 0 10-8 0" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
                <path d="M4 20c1.5-3 4-5 8-5s6.5 2 8 5" stroke={stroke2} strokeWidth="2" strokeLinecap="round" />
            </>
        ),
        signals: (
            <>
                <path d="M12 3l-2 7h4l-2 11" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
        ),
        analysis: (
            <>
                <path d="M6 15V9" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
                <path d="M12 18V6" stroke={stroke2} strokeWidth="2" strokeLinecap="round" />
                <path d="M18 14v-4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
            </>
        ),
        battles: (
            <>
                <path d="M7 7h10v10H7z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
                <path d="M10 10h4M10 14h4" stroke={stroke2} strokeWidth="2" strokeLinecap="round" />
            </>
        ),
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600/25 to-emerald-500/25 blur-[12px]" />
            <div className="relative w-full h-full rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                <svg {...common}>
                    <defs>
                        <linearGradient id="opinaGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="rgb(37,99,235)" /> {/* #2563EB - primary-600 */}
                            <stop offset="100%" stopColor="rgb(16,185,129)" /> {/* #10b981 - emerald-500 */}
                        </linearGradient>
                    </defs>
                    {paths[name]}
                </svg>
            </div>
        </div>
    );
}

import { motion } from "framer-motion";

interface MainDistributionChartProps {
    userValue: number; // 0-100 position
    labelYou: string; // e.g., "Tú: $500k"
    labelAvg: string; // e.g., "Promedio: $420k"
    topicColor: string; // Taildwind color class for the 'You' marker
}

export default function MainDistributionChart({ userValue, labelYou, labelAvg, topicColor }: MainDistributionChartProps) {
    // Gaussian Bell Curve approximation using Cubic Bezier
    // M0,100 starts at bottom left
    // C25,100 35,15 50,15 -> Curves up to the peak at center (50,15)
    // C65,15 75,100 100,100 -> Curves down to bottom right
    const pathD = "M0,100 C25,100 35,15 50,15 C65,15 75,100 100,100 Z";

    // User position validation (keep inside visual bounds)
    const safePos = Math.max(10, Math.min(90, userValue));

    return (
        <div className="w-full h-64 md:h-80 relative flex items-end justify-center px-4 overflow-visible my-8">

            {/* 1. The "Others" Curve (Background) with Gradient */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id="bellGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path d={pathD} className="text-slate-400" fill="url(#bellGradient)" />
                    {/* Outline stroke for sharper definition */}
                    <path d={pathD} className="text-slate-300" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
            </div>

            {/* 2. Scale / Axis Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />
            <div className="absolute bottom-0 left-[10%] h-2 w-px bg-slate-300" />
            <div className="absolute bottom-0 left-[50%] h-2 w-px bg-slate-300" />
            <div className="absolute bottom-0 left-[90%] h-2 w-px bg-slate-300" />

            {/* 3. "Average" Marker (Fixed at 50% for this visual metaphor, or dynamic if we had real data mapping) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="h-24 w-px border-l-2 border-dashed border-slate-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 bg-bg px-2">
                    {labelAvg}
                </span>
            </div>

            {/* 4. "You" Marker (Animated) */}
            <motion.div
                className="absolute bottom-0 flex flex-col items-center z-10"
                initial={{ left: "50%" }}
                animate={{ left: `${safePos}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                style={{ translateX: "-50%" }}
            >
                {/* The 'You' visual line/pin */}
                <div className={`w-1 h-32 md:h-40 rounded-t-full ${topicColor.replace('text-', 'bg-')} shadow-[0_0_15px_rgba(0,0,0,0.2)]`} />

                {/* The 'You' Label */}
                <div className="mt-3 flex flex-col items-center">
                    <div className={`px-3 py-1 rounded-full text-white font-bold text-sm shadow-md ${topicColor.replace('text-', 'bg-')}`}>
                        TÚ
                    </div>
                    <span className="text-xs font-semibold text-ink mt-1 whitespace-nowrap">
                        {labelYou}
                    </span>
                </div>
            </motion.div>

        </div>
    );
}

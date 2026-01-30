import { motion } from "framer-motion";
import { useState } from "react";

export default function HowItWorksSteps() {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const steps = [
        {
            id: 1,
            label: "Opinión",
            desc: "Aquí nace el dato.",
            icon: "forum",
            color: "text-indigo-500",
            gradient: "from-indigo-500 to-blue-500",
            shadow: "shadow-indigo-500/30",
            bg: "bg-indigo-50",
            ring: "ring-indigo-100"
        },
        {
            id: 2,
            label: "Patrones",
            desc: "Miles de señales revelan la verdad.",
            icon: "blur_on",
            color: "text-emerald-500",
            gradient: "from-emerald-500 to-green-500",
            shadow: "shadow-emerald-500/30",
            bg: "bg-emerald-50",
            ring: "ring-emerald-100"
        },
        {
            id: 3,
            label: "Impacto Real",
            desc: "La información genera cambios.",
            icon: "shutter_speed",
            color: "text-purple-500",
            gradient: "from-purple-500 to-fuchsia-500",
            shadow: "shadow-purple-500/30",
            bg: "bg-purple-50",
            ring: "ring-purple-100"
        }
    ];

    return (
        <div className="w-full relative">
            <div className="max-w-6xl mx-auto px-4 relative z-10">
                {/* Connecting Line (Desktop Only) */}
                <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-1 bg-slate-200 -z-10 overflow-hidden rounded-full">
                    <motion.div
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {steps.map((step, idx) => {
                        const isHovered = hoveredStep === step.id;
                        const isDimmed = hoveredStep !== null && hoveredStep !== step.id;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                onMouseEnter={() => setHoveredStep(step.id)}
                                onMouseLeave={() => setHoveredStep(null)}
                                className={`flex flex-col items-center text-center group cursor-default transition-opacity duration-300 ${isDimmed ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}
                            >
                                {/* Circle Container */}
                                <div className="relative mb-6">
                                    {/* Pulse Effect on Hover */}
                                    {isHovered && (
                                        <motion.div
                                            layoutId="pulse"
                                            className={`absolute inset-0 rounded-full ${step.bg} opacity-50 z-0`}
                                            initial={{ scale: 1 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    )}

                                    {/* Main Circle */}
                                    <div className={`relative z-10 w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl border-4 ${step.ring} transition-all duration-300 group-hover:scale-105 group-hover:${step.shadow}`}>
                                        <div className={`w-24 h-24 rounded-full ${step.bg} flex items-center justify-center overflow-hidden`}>
                                            <span className={`material-symbols-outlined text-[48px] bg-clip-text text-transparent bg-gradient-to-br ${step.gradient}`}>
                                                {step.icon}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badge Number */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-xs font-bold flex items-center justify-center shadow-md border border-slate-100 text-text-muted z-20">
                                        {step.id}
                                    </div>
                                </div>

                                {/* Text Content */}
                                <h3 className="text-xl font-bold text-ink mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-ink group-hover:to-text-secondary transition-colors">
                                    {step.label}
                                </h3>
                                <p className="text-sm text-text-secondary font-medium max-w-[200px] leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* KPI STAT BAR (Expanded 6 Cols) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto mt-20 text-center"
            >
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Algunas referencias</h4>
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-[2rem] px-8 py-8 grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8 items-center justify-center">
                    {[
                        { val: "12,450+", label: "Usuarios", icon: "group", color: "text-indigo-500", bg: "bg-indigo-50" },
                        { val: "1.2M", label: "Señales", icon: "analytics", color: "text-emerald-500", bg: "bg-emerald-50" },
                        { val: "100%", label: "Privacidad", icon: "verified_user", color: "text-purple-500", bg: "bg-purple-50" },
                        { val: "500+", label: "Marcas", icon: "store", color: "text-orange-500", bg: "bg-orange-50" },
                        { val: "8.5K+", label: "Versus", icon: "trophy", color: "text-rose-500", bg: "bg-rose-50" },
                        { val: "$15M+", label: "Premios", icon: "paid", color: "text-amber-500", bg: "bg-amber-50" }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-4 w-40 mx-auto">
                            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <div className="leading-tight text-left">
                                <div className="font-bold text-ink text-base">{stat.val}</div>
                                <div className="text-[10px] uppercase font-bold text-text-muted">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

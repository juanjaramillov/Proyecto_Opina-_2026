import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption } from '../types';
import React from 'react';

interface OptionCardProps {
    option: BattleOption;
    onClick: (e: React.MouseEvent) => void;
    disabled: boolean;
    isSelected: boolean;
    showResult: boolean;
    showPercentage?: boolean;
    percent: number | null;
    momentum?: { percentage: number; variant_24h: number; total: number } | null;
    isLeft?: boolean;
    isChampion?: boolean;
    layout?: 'versus' | 'opinion' | 'topic';
    theme?: {
        primary: string;
        accent: string;
        bgGradient: string;
        icon: string;
    };
}

export default function OptionCard({
    option,
    onClick,
    disabled,
    isSelected,
    showResult,
    showPercentage,
    percent,
    momentum,
    isLeft = false,
    isChampion = false,
    layout = 'versus',
    theme
}: OptionCardProps) {
    const type = option.type || 'image';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                "group relative w-full text-left overflow-hidden transition-all duration-500 will-change-[transform,box-shadow]",
                layout === 'topic' ? "rounded-[1.5rem]" : "rounded-[2.5rem]",
                "bg-white border",
                disabled ? "cursor-default border-stroke opacity-90 pointer-events-none saturate-[.9]" : "cursor-pointer shadow-lg hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-3 hover:scale-[1.02] active:scale-[0.97] active:shadow-md border-transparent",
                isSelected ? "ring-[6px] ring-offset-[6px] ring-offset-bg scale-[1.03] z-10 shadow-[0_20px_50px_rgba(16,185,129,0.3)]" : "",
                isChampion ? "ring-[6px] ring-amber-400 ring-offset-[6px] ring-offset-bg shadow-[0_0_60px_rgba(251,191,36,0.6)] scale-[1.04] z-20 border-amber-400" : "",
                !disabled && !isSelected && !isChampion && layout === 'versus' ? (isLeft ? "hover:-rotate-2 hover:origin-bottom-right" : "hover:rotate-2 hover:origin-bottom-left") : ""
            ].join(" ")}
            style={{
                borderColor: isSelected ? (theme?.primary || '#10b981') : undefined,
                boxShadow: isSelected ? `0 30px 60px -15px ${(theme?.primary || '#10b981')}60, 0 0 20px ${(theme?.primary || '#10b981')}40` : undefined,
                outlineColor: isSelected ? (theme?.primary || '#10b981') : undefined
            }}
        >
            {isChampion && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-amber-400 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-slow">
                    <span className="material-symbols-outlined text-lg">emoji_events</span>
                    <span className="text-xs font-black uppercase tracking-wider">Campeón</span>
                </div>
            )}

            <div className={`relative w-full aspect-[3/4] overflow-hidden flex items-center justify-center ${type === 'text' ? (option.bgColor || 'bg-brand-gradient') : (type === 'icon' ? (option.bgColor || 'bg-white') : 'bg-white')}`}>

                {type === 'image' && (option.image_url || option.imageUrl) && (
                    <img
                        src={option.image_url || option.imageUrl || undefined}
                        alt={option.label}
                        className={[
                            "absolute inset-0 w-full h-full",
                            option.imageFit === 'contain' ? "object-contain p-12" : "object-cover",
                            "transition-transform duration-300 ease-out",
                            "group-hover:scale-110",
                            showResult ? "scale-105 blur-sm grayscale opacity-40" : "",
                        ].join(" ")}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                )}

                {type === 'brand' && (
                    <div className={`absolute inset-0 flex items-center justify-center p-8 transition-colors duration-300 ${(option.image_url || option.imageUrl) ? (option.bgColor || 'bg-white') : (option.bgColor || 'bg-white')}`}>
                        {(option.image_url || option.imageUrl) ? (
                            <div className="relative aspect-square w-full max-w-[70%] flex items-center justify-center">
                                <img
                                    src={option.image_url || option.imageUrl || undefined}
                                    alt={option.label}
                                    className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 ${showResult ? 'blur-sm opacity-50 grayscale' : ''} ${option.imageClassName || ''}`}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement?.parentElement?.classList.add('bg-fallback-pattern');
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center z-10 px-4">
                                <span className={`block text-3xl md:text-5xl font-black leading-tight drop-shadow-md transition-transform duration-500 group-hover:scale-110 ${option.bgColor ? 'text-white' : 'text-text-muted'} ${showResult ? 'blur-sm opacity-50' : ''}`}>
                                    {option.label}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                    </div>
                )}

                {type === 'text' && (
                    <div className="p-6 text-center z-10">
                        <span className={`block text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md transition-transform duration-500 group-hover:scale-110 ${showResult ? 'blur-sm opacity-50' : ''}`}>
                            {option.label}
                        </span>
                    </div>
                )}

                {type === 'icon' && (
                    <div className="p-6 text-center z-10 flex flex-col items-center">
                        <span className={`material-symbols-outlined text-6xl md:text-8xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 ${showResult ? 'opacity-30 blur-sm' : 'text-primary'}`}>
                            {option.icon || 'circle'}
                        </span>
                        <span className={`block text-xl md:text-2xl font-bold text-ink leading-tight transition-all duration-500 ${showResult ? 'opacity-30 blur-sm' : ''}`}>
                            {option.label}
                        </span>
                    </div>
                )}

                {type === 'image' && (
                    <div className={`absolute inset-0 transition-opacity duration-300 group-hover:opacity-90 ${layout === 'topic' ? 'bg-gradient-to-t from-black/60 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80'}`} />
                )}

                <AnimatePresence>
                    {showResult && (percent !== null || momentum) && (showPercentage ?? true) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-900/60 backdrop-blur-md p-4"
                        >
                            <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] tracking-tighter mix-blend-plus-lighter">
                                {momentum ? momentum.percentage : percent}%
                            </span>

                            {momentum && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`mt-2 px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-sm shadow-xl border ${momentum.variant_24h > 0
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : momentum.variant_24h < 0
                                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">
                                        {momentum.variant_24h > 0 ? 'trending_up' : momentum.variant_24h < 0 ? 'trending_down' : 'trending_flat'}
                                    </span>
                                    <span>
                                        {momentum.variant_24h > 0 ? '+' : ''}{momentum.variant_24h}% en 24h
                                    </span>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                className="absolute bottom-0 left-0 h-2 bg-white/30"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${momentum ? momentum.percentage : percent}%` }}
                                    className={`h-full shadow-[0_0_20px_rgba(255,255,255,0.5)] ${momentum ? (momentum.variant_24h > 0 ? 'bg-emerald-400' : 'bg-white') : 'bg-white'}`}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isSelected && !showResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{ backgroundColor: theme?.primary || '#10b981' }}
                    />
                )}

                {isSelected && !showResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-6 right-6 text-white rounded-full p-3 shadow-lg border-2 border-white z-30"
                        style={{ backgroundColor: theme?.primary || '#10b981' }}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </motion.div>
                )}
            </div>

            <div className={`absolute bottom-0 left-0 right-0 p-6 z-20 text-left ${layout === 'topic' ? 'text-center' : ''}`}>
                <div className={`font-black leading-tight drop-shadow-md transition-transform duration-300 group-hover:translate-x-1 ${layout === 'topic' ? 'text-2xl md:text-3xl mb-0' : 'text-xl md:text-2xl mb-1'
                    } ${option.color || (type === 'brand' ? 'text-slate-900' : 'text-white')}`}>
                    {option.label}
                </div>

                {/* LIVE STATS KPIs */}
                {option.stats && (
                    <div className={`flex items-center gap-3 mt-2 transition-all duration-300 ${!showResult ? 'opacity-80 group-hover:opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${type === 'brand' ? 'text-slate-500' : 'text-white/90'}`}>
                                {option.stats.onlineCount} en línea
                            </span>
                        </div>

                        <div className="w-[1px] h-3 bg-slate-300/30" />

                        <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${type === 'brand' ? 'text-slate-500' : 'text-white/90'}`}>
                                {option.stats.totalAnswers.toLocaleString()} señales
                            </span>
                        </div>

                        {option.stats.trend && (
                            <div className={`flex items-center ${option.stats.trend === 'up' ? 'text-emerald-500' : option.stats.trend === 'down' ? 'text-rose-500' : 'text-amber-500'}`}>
                                <span className="material-symbols-outlined text-sm font-black">
                                    {option.stats.trend === 'up' ? 'trending_up' : option.stats.trend === 'down' ? 'trending_down' : 'trending_flat'}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {!showResult && (
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 mt-2 ${type === 'brand' ? 'text-slate-500' : 'text-white/80'}`}>
                        <span>Opinar</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                )}
            </div>

            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
        </button>
    );
}

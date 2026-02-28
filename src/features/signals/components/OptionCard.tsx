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
                "bg-white border text-center flex flex-col items-center justify-between",
                disabled ? "cursor-default border-slate-100 opacity-90 pointer-events-none saturate-[.9]" : "cursor-pointer hover:-translate-y-1 focus-within:ring-2 focus-within:ring-slate-900/20 active:scale-[0.98] border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]",
                isSelected ? "ring-[4px] ring-offset-[4px] ring-offset-bg scale-[1.03] z-10 shadow-[0_25px_60px_-10px_rgba(16,185,129,0.3)]" : "",
                isChampion ? "ring-[4px] ring-amber-400 ring-offset-[4px] ring-offset-bg shadow-[0_0_60px_rgba(251,191,36,0.6)] scale-[1.04] z-20 border-amber-400" : "",
                !disabled && !isSelected && !isChampion && layout === 'versus' ? (isLeft ? "hover:-rotate-1 hover:origin-bottom-right" : "hover:rotate-1 hover:origin-bottom-left") : ""
            ].join(" ")}
            style={{
                borderColor: isSelected ? (theme?.primary || '#10b981') : undefined,
                boxShadow: isSelected ? `0 30px 70px -15px ${(theme?.primary || '#10b981')}50, 0 0 25px ${(theme?.primary || '#10b981')}30` : undefined,
                outlineColor: isSelected ? (theme?.primary || '#10b981') : undefined
            }}
        >
            {isChampion && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-slow">
                    <span className="material-symbols-outlined text-lg">emoji_events</span>
                    <span className="text-xs font-black uppercase tracking-wider">Campeón</span>
                </div>
            )}

            <div className={`relative w-full flex-grow flex items-center justify-center p-8 transition-colors duration-500 
                ${type === 'brand' ? 'min-h-[220px] md:min-h-[280px]' : 'min-h-[300px] md:min-h-[400px]'}
                ${type === 'text' ? (option.bgColor || 'bg-brand-gradient') : (type === 'icon' ? (option.bgColor || 'bg-slate-50 relative overflow-hidden') : 'bg-slate-50/50 relative overflow-hidden')}
            `}>

                {/* Subtle Background Elements for Icons and Brands */}
                {(type === 'icon' || type === 'brand') && !option.image_url && !option.imageUrl && (
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(circle at 50% 50%, ${theme?.primary || '#000'} 2px, transparent 2px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                )}

                {/* BIG LOGO or IMAGE focus */}
                {type === 'image' && (option.image_url || option.imageUrl) && (
                    <img
                        src={option.image_url || option.imageUrl || undefined}
                        alt={option.label}
                        className={[
                            "absolute inset-0 w-full h-full",
                            option.imageFit === 'contain' ? "object-contain p-8 md:p-12 scale-[0.85] group-hover:scale-95" : "object-cover group-hover:scale-105",
                            "transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                            showResult ? "scale-100 blur-md grayscale opacity-40" : "",
                        ].join(" ")}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                )}

                {/* BRAND Focus (HUGE Logos) */}
                {type === 'brand' && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 transition-colors duration-300">
                        {(option.image_url || option.imageUrl) ? (
                            <div className="w-full h-full flex items-center justify-center relative">
                                {/* Soft glow behind logo on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl scale-150"
                                    style={{ background: `radial-gradient(circle, ${theme?.primary || '#10b981'}20 0%, transparent 60%)` }}
                                />

                                <div className="flex items-center justify-center w-full max-w-[200px] md:max-w-[260px] h-[100px] md:h-[130px]">
                                    <img
                                        src={option.brand_domain ? `https://cdn.brandfetch.io/${option.brand_domain}?c=1XbJ9XN7f7y8h0B6P3t` : (option.image_url || option.imageUrl || undefined)}
                                        alt={option.label}
                                        className={`relative z-10 max-w-full max-h-full object-contain drop-shadow-xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.12] group-hover:-translate-y-1.5 group-hover:drop-shadow-2xl ${showResult ? 'blur-md opacity-30 grayscale scale-100' : ''} ${option.imageClassName || ''}`}
                                        loading="lazy"
                                        draggable={false}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement?.parentElement?.classList.add('bg-fallback-pattern');
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            // Fallback if no logo: Massive Text Avatar
                            <div className="flex flex-col items-center justify-center text-center z-10 px-4 w-full h-full relative">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl rounded-full scale-150"
                                    style={{ background: `radial-gradient(circle, ${theme?.primary || '#10b981'}15 0%, transparent 70%)` }}
                                />
                                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.15] group-hover:-translate-y-2 ${showResult ? 'blur-sm opacity-50' : 'bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white'}`}>
                                    <span className="text-5xl md:text-7xl font-black tracking-tighter text-slate-300 uppercase">
                                        {option.label.substring(0, 2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TEXT Focus */}
                {type === 'text' && (
                    <div className="p-8 md:p-12 text-center z-10 w-full h-full flex items-center justify-center">
                        <span className={`block text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08] ${showResult ? 'blur-sm opacity-50' : ''}`}>
                            {option.label}
                        </span>
                    </div>
                )}

                {/* ICON Focus */}
                {type === 'icon' && (
                    <div className="p-8 md:p-12 text-center z-10 flex flex-col items-center justify-center w-full h-full relative">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl scale-150"
                            style={{ background: `radial-gradient(circle, ${theme?.primary || '#10b981'}15 0%, transparent 70%)` }}
                        />
                        <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.15] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:-translate-y-3 ${showResult ? 'opacity-30 blur-sm bg-slate-100' : 'bg-white'}`}>
                            <span className="material-symbols-outlined text-[4rem] md:text-[5rem] transition-colors duration-500" style={{ color: showResult ? '#cbd5e1' : (theme?.primary || '#10b981') }}>
                                {option.icon || 'star'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Subtle Image Overlay */}
                {type === 'image' && (
                    <div className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-95 ${layout === 'topic' ? 'bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent' : 'bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-85'}`} />
                )}

                {/* RESULTS OVERLAY (Glassmorphism) */}
                <AnimatePresence>
                    {showResult && (percent !== null || momentum) && (showPercentage ?? true) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(12px)' }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/70 p-6"
                        >
                            <span className="text-[5rem] md:text-[7rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-tighter leading-none mb-2">
                                {momentum ? momentum.percentage : percent}%
                            </span>

                            {momentum && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`px-5 py-2 rounded-full flex items-center gap-2 font-black text-sm max-w-full shadow-2xl backdrop-blur-md border backdrop-saturate-150 ${momentum.variant_24h > 0
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
                                        : momentum.variant_24h < 0
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20'
                                            : 'bg-slate-500/30 text-slate-200 border-slate-500/40 shadow-slate-500/20'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {momentum.variant_24h > 0 ? 'trending_up' : momentum.variant_24h < 0 ? 'trending_down' : 'trending_flat'}
                                    </span>
                                    <span>
                                        {momentum.variant_24h > 0 ? '+' : ''}{momentum.variant_24h}% (24h)
                                    </span>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                className="absolute bottom-0 left-0 h-3 bg-slate-800"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${momentum ? momentum.percentage : percent}%` }}
                                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                                    className={`h-full shadow-[0_0_30px_rgba(255,255,255,0.8)] rounded-r-full ${momentum ? (momentum.variant_24h > 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-slate-200 to-white') : 'bg-gradient-to-r from-slate-200 to-white'}`}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SELECTED STATE GLOW & CHECKMARK */}
                {isSelected && !showResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.15, 0.3, 0.15] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
                        style={{ backgroundColor: theme?.primary || '#10b981' }}
                    />
                )}

                {isSelected && !showResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute top-6 right-6 text-white rounded-full p-3 shadow-2xl border-[3px] border-white z-30"
                        style={{ backgroundColor: theme?.primary || '#10b981' }}
                    >
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </motion.div>
                )}
            </div>

            {/* BOTTOM TITLE BAR */}
            <div className={`relative w-full z-20 flex flex-col justify-center px-6 md:px-10 py-6 md:py-8 bg-white border-t border-slate-100 ${layout === 'topic' ? 'text-center' : ''} ${type === 'image' || type === 'text' ? 'bg-transparent border-t-0 absolute bottom-0' : ''}`}>
                <div className={`font-black tracking-tight leading-tight origin-left transition-transform duration-500 ease-out group-hover:scale-[1.03] ${layout === 'topic' ? 'text-2xl md:text-3xl lg:text-4xl text-center origin-center' : 'text-xl md:text-3xl lg:text-4xl'} ${type === 'image' || type === 'text' ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>
                    {option.label}
                </div>

                {/* LIVE STATS KPIs */}
                {option.stats && (
                    <div className={`flex items-center justify-center gap-4 mt-4 transition-all duration-500 ${!showResult ? 'opacity-80 group-hover:opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            </span>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${type === 'image' || type === 'text' ? 'text-white/90 drop-shadow-sm' : 'text-slate-500'}`}>
                                {option.stats.onlineCount} en línea
                            </span>
                        </div>

                        <div className={`w-[2px] h-3 rounded-full ${type === 'image' || type === 'text' ? 'bg-white/30' : 'bg-slate-200'}`} />

                        <div className="flex items-center gap-1">
                            <span className={`text-[11px] font-black uppercase tracking-widest ${type === 'image' || type === 'text' ? 'text-white/90 drop-shadow-sm' : 'text-slate-500'}`}>
                                {option.stats.totalAnswers.toLocaleString()} señales
                            </span>
                        </div>
                    </div>
                )}

                {/* Visual Hint for Clickability */}
                {!showResult && (!option.stats) && (
                    <div className={`absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 ${type === 'image' || type === 'text' ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10'} group-hover:text-primary`}>
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </div>
                )}
            </div>

        </button>
    );
}

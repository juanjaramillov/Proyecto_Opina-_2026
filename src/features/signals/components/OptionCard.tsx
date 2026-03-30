import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption } from '../types';
import EntityLogo from '../../../components/entities/EntityLogo';
import { FallbackAvatar } from '../../../components/ui/FallbackAvatar';
import { resolveEntitySlug } from '../../../lib/entities/resolveEntitySlug';

interface OptionCardProps {
    option: BattleOption;
    onClick: (e: React.MouseEvent) => void;
    disabled: boolean;
    isSelected: boolean;
    showResult: boolean;
    showPercentage?: boolean;
    percent: number | null;
    momentum?: { percentage: number; variant_24h: number; total: number } | null;
    isChampion?: boolean;
    layout?: 'versus' | 'opinion' | 'topic';
    theme?: {
        primary: string;
        accent: string;
        bgGradient: string;
        icon: string;
    };
}

const OptionCard = ({
    option,
    onClick,
    disabled,
    isSelected,
    showResult,
    showPercentage,
    percent,
    momentum,
    isChampion = false,
    layout = 'versus',
    theme
}: OptionCardProps) => {
    // Fallback: Si no tiene URL ni type, asumimos 'brand' para usar los logos automáticos
    const type = option.type || ((option.image_url || option.imageUrl) ? 'image' : 'brand');

    return (
        <button
            data-testid={`versus-option-${option.id}`}
            onClick={onClick}
            disabled={disabled}
            className={`group relative w-full h-full text-center flex flex-col justify-between transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${layout === 'versus' ? 'bg-white' : 'rounded-[32px] border-[3px] shadow-xl hover:-translate-y-1 hover:shadow-2xl bg-white'} ${layout !== 'versus' && isSelected ? "border-primary-500 ring-4 ring-primary-500/20 ring-offset-2" : (layout !== 'versus' ? "border-slate-200/80 hover:border-slate-300" : "")} ${disabled && !isSelected ? "opacity-60 pointer-events-none cursor-default saturate-[.9]" : "cursor-pointer active:scale-[0.98]"} ${isChampion ? "ring-[3px] ring-primary-600 ring-offset-2 z-20 border-primary-600 shadow-[0_15px_45px_rgba(37,99,235,0.2)]" : ""}`}
        >
            {/* 2) Halo Opina+ (hover/selected) */}
            <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br from-primary-600/5 to-emerald-400/5 ${isSelected ? "opacity-100" : "group-hover:opacity-100"}`} />
            <div className={`pointer-events-none absolute -inset-[2px] opacity-0 transition-opacity duration-500 bg-gradient-to-r from-primary-600/20 to-emerald-400/20 ${isSelected ? "opacity-100" : "group-hover:opacity-40"}`} style={{ filter: "blur(20px)", zIndex: -1 }} />

            {isChampion && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-gradient-to-r from-primary-600 to-emerald-400 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-slow">
                    <span className="material-symbols-outlined text-lg">emoji_events</span>
                    <span className="text-xs font-black uppercase tracking-wider">Campeón</span>
                </div>
            )}

            {/* 3) Logo/imagen y Header wrapper */}
            {/* Usamos flex-grow para que ocupe todo el espacio en lugar de alturas fijas si es versus arena */}
            <div className={`relative flex-1 w-full flex items-center justify-center transition-colors duration-500 overflow-hidden ${type === 'text' ? (option.bgColor || 'bg-brand-gradient') : 'bg-gradient-to-b from-slate-50/80 to-slate-100/30'} ${layout !== 'versus' ? 'h-[120px] md:h-[180px]' : 'min-h-[140px] md:min-h-0'}`}>

                {/* 5) Estado seleccionado (check alineado a la esquina) */}
                <div className={`absolute top-4 right-4 md:top-6 md:right-6 z-20 transition-all duration-300 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-blue-600">done</span>
                    </div>
                </div>

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
                    <FallbackAvatar
                        src={option.image_url || option.imageUrl || undefined}
                        name={option.label}
                        className={`relative z-10 w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-lg transition-transform duration-300 ease-out group-hover:scale-[1.08] group-hover:-translate-y-1 ${isSelected ? "scale-[1.06] -translate-y-1" : ""} ${showResult ? "opacity-20 blur-sm" : ""} ${option.imageFit === 'contain' ? 'bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100' : 'absolute inset-0 w-full h-full object-cover'}`}
                        containerClassName="absolute inset-0 flex items-center justify-center p-3 md:p-4"
                        fallbackClassName="w-24 h-24 md:w-36 md:h-36 text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-100 via-indigo-50 to-cyan-50 text-blue-500 shadow-inner border-4 border-white rounded-[2rem] flex items-center justify-center"
                    />
                )}

                {/* BRAND Focus (HUGE Logos & Auto-Logos via Clearbit) */}
                {type === 'brand' && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 transition-colors duration-300">
                        <div className="w-full h-full flex items-center justify-center relative">
                            {/* Soft glow behind logo on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl scale-150"
                                style={{ background: `radial-gradient(circle, ${theme?.primary || '#3b82f6'}30 0%, transparent 60%)` }}
                            />

                            <div className="flex items-center justify-center w-full h-full relative">
                                <EntityLogo
                                    name={option.label}
                                    src={option.image_url || option.imageUrl}
                                    slug={resolveEntitySlug(option)}
                                    domain={option.brand_domain}
                                    size="lg"
                                    variant={layout === 'opinion' ? 'depth' : 'versus'}
                                    className={`relative z-10 w-full h-full object-contain transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.12] group-hover:-translate-y-2 ${isSelected ? "scale-[1.08] -translate-y-1" : ""} ${showResult ? "opacity-20 blur-sm" : ""} ${option.imageClassName || ''}`}
                                    fallbackClassName="w-24 h-24 md:w-32 md:h-32 text-4xl md:text-5xl font-black bg-gradient-to-br from-indigo-100 via-blue-50 to-emerald-50 text-indigo-500 shadow-[inset_0_2px_15px_rgba(0,0,0,0.05)] border-[3px] md:border-[4px] border-white rounded-[2rem] flex items-center justify-center"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TEXT Focus */}
                {type === 'text' && (
                    <div className="p-4 md:p-12 text-center z-10 w-full h-full flex items-center justify-center">
                        <span className={`block text-xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08] ${showResult ? 'blur-sm opacity-50' : ''}`}>
                            {option.label}
                        </span>
                    </div>
                )}

                {/* ICON Focus */}
                {type === 'icon' && (
                    <div className="p-4 md:p-12 text-center z-10 flex flex-col items-center justify-center w-full h-full relative">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl scale-150"
                            style={{ background: `radial-gradient(circle, ${theme?.primary || '#10b981'}15 0%, transparent 70%)` }}
                        />
                        <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-2 md:mb-3 shadow-2xl border-[3px] border-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.15] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:-translate-y-3 ${showResult ? 'opacity-30 blur-sm bg-slate-100' : 'bg-white'}`}>
                            <span className="material-symbols-outlined text-[3.5rem] md:text-[4.5rem] transition-colors duration-500" style={{ color: showResult ? '#cbd5e1' : (theme?.primary || '#10b981') }}>
                                {option.icon || 'star'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Subtle Image Overlay */}
                {type === 'image' && (
                    <div className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-95 ${layout === 'topic' ? 'bg-gradient-to-t from-white/90 via-white/20 to-transparent' : 'bg-gradient-to-t from-white/90 via-white/40 to-transparent opacity-90'}`} />
                )}

                {/* GIANT CENTER PERCENTAGE & BLUR GLOW */}
                <AnimatePresence>
                    {showResult && (percent !== null || momentum) && (showPercentage ?? true) && (() => {
                        const rawPercent = momentum ? momentum.percentage : (percent ?? 0);
                        const percentValue = Number.isNaN(rawPercent) ? 0 : Math.round(rawPercent);
                        const isWinner = percentValue > 50;

                        return (
                            <motion.div
                                key="result-overlay"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
                            >
                                {isWinner && (
                                    <div className="absolute inset-0 bg-emerald-500/10 mix-blend-multiply blur-xl rounded-full scale-125 transition-all duration-700" />
                                )}
                                <div className="relative drop-shadow-2xl transition-all duration-500">
                                    <span className={`text-6xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter mix-blend-overlay ${
                                        isWinner 
                                            ? 'text-emerald-900 opacity-90' 
                                            : 'text-slate-800 opacity-40'
                                    }`}>
                                        {percentValue}%
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>

            </div>

            {/* 4) Nombre (label) más premium */}
            <div className={`relative z-10 px-3 md:px-5 pb-4 md:pb-6 pt-3 md:pt-4 bg-white/95 backdrop-blur-md w-full flex flex-col justify-end items-center text-center shrink-0 border-t ${layout === 'versus' ? 'border-none bg-gradient-to-t from-white via-white to-transparent pt-8 h-[90px] md:h-[120px]' : 'border-slate-50'}`}>
                <div className={`font-black tracking-tight text-[15px] leading-tight md:text-[22px] text-center w-full transition-colors duration-300 line-clamp-2 overflow-hidden text-ellipsis flex items-center justify-center ${showResult && !isSelected ? "text-slate-400" : "text-ink"}`}>
                    {option.label}
                </div>

                {/* LIVE STATS KPIs vs DEFAULT Hint */}
                {option.stats && (
                    <div className={`flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-1.5 md:mt-2 transition-all duration-500 ${!showResult ? 'opacity-90 group-hover:opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            </span>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                                {option.stats.onlineCount} online
                            </span>
                        </div>

                        <div className="hidden sm:block w-[3px] h-3 rounded-full bg-slate-200" />

                        <div className="flex items-center gap-1">
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                                {option.stats.totalAnswers.toLocaleString()} señales
                            </span>
                        </div>
                    </div>
                )}
                
                <div className={`mt-1 text-[13px] md:text-[15px] font-bold flex items-center justify-center gap-1.5 transition-all duration-500 w-full ${showResult ? "text-slate-400 opacity-60" : "text-slate-300 group-hover:text-primary-500"}`}>
                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">touch_app</span>
                    Votar
                </div>
            </div>

            {/* RESULT PROGRESS BAR EN MODO ARENA */}
            {showResult && (percent !== null || momentum) && (() => {
                const rawPercent = momentum ? momentum.percentage : (percent ?? 0);
                const percentValue = Number.isNaN(rawPercent) ? 0 : Math.round(rawPercent);
                const isWinner = percentValue > 50;
                
                return (
                    <div className={`absolute bottom-0 left-0 w-full bg-slate-100 overflow-hidden z-20 ${layout === 'versus' ? 'h-3 md:h-4' : 'h-[6px] md:h-2 bg-slate-100/50'}`}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentValue}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className={`h-full ${isWinner ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-slate-300/80'}`}
                        />
                    </div>
                );
            })()}

        </button>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const areOptionCardPropsEqual = (prevProps: Readonly<OptionCardProps>, nextProps: Readonly<OptionCardProps>) => {
    // 1. Explicitly check 'option' visual/interactive properties
    const prevOp = prevProps.option;
    const nextOp = nextProps.option;
    const isOptionEqual = 
        prevOp.id === nextOp.id &&
        prevOp.label === nextOp.label &&
        prevOp.type === nextOp.type &&
        prevOp.image_url === nextOp.image_url &&
        prevOp.imageUrl === nextOp.imageUrl &&
        prevOp.icon === nextOp.icon &&
        prevOp.bgColor === nextOp.bgColor &&
        prevOp.imageFit === nextOp.imageFit &&
        prevOp.imageClassName === nextOp.imageClassName &&
        prevOp.brand_domain === nextOp.brand_domain &&
        prevOp.stats?.onlineCount === nextOp.stats?.onlineCount &&
        prevOp.stats?.totalAnswers === nextOp.stats?.totalAnswers;

    // 2. Explicitly check 'momentum'
    const isMomentumEqual = 
        prevProps.momentum?.percentage === nextProps.momentum?.percentage &&
        prevProps.momentum?.variant_24h === nextProps.momentum?.variant_24h &&
        prevProps.momentum?.total === nextProps.momentum?.total;

    // 3. Explicitly check 'theme'
    const isThemeEqual = 
        prevProps.theme?.primary === nextProps.theme?.primary &&
        prevProps.theme?.accent === nextProps.theme?.accent &&
        prevProps.theme?.bgGradient === nextProps.theme?.bgGradient &&
        prevProps.theme?.icon === nextProps.theme?.icon;

    // 4. Return boolean preventing re-render if ALL visual state is identical
    return (
        isOptionEqual &&
        isMomentumEqual &&
        isThemeEqual &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.showResult === nextProps.showResult &&
        prevProps.showPercentage === nextProps.showPercentage &&
        prevProps.percent === nextProps.percent &&
        prevProps.isChampion === nextProps.isChampion &&
        prevProps.layout === nextProps.layout
    );
};

export default React.memo(OptionCard, areOptionCardPropsEqual);

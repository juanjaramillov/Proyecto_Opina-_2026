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

export default function OptionCard({
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
}: OptionCardProps) {
    // Fallback: Si no tiene URL ni type, asumimos 'brand' para usar los logos automáticos
    const type = option.type || ((option.image_url || option.imageUrl) ? 'image' : 'brand');

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative w-full text-center flex flex-col justify-between rounded-[32px] border-[3px] bg-white shadow-xl transition-all duration-300 ease-out overflow-hidden hover:-translate-y-1 hover:shadow-2xl ${isSelected ? "border-primary-500 ring-4 ring-primary-500/20 ring-offset-2" : "border-slate-200/80 hover:border-slate-300"} ${disabled ? "opacity-60 pointer-events-none cursor-default saturate-[.9]" : "cursor-pointer active:scale-[0.98]"} ${isChampion ? "ring-[3px] ring-primary-600 ring-offset-2 z-20 border-primary-600 shadow-[0_15px_45px_rgba(37,99,235,0.2)]" : ""}`}
        >
            {/* 2) Halo Opina+ (hover/selected) */}
            <div className={`pointer-events-none absolute inset-0 rounded-[32px] opacity-0 transition-opacity duration-300 bg-gradient-to-br from-primary-600/14 to-emerald-400/14 ${isSelected ? "opacity-100" : "group-hover:opacity-100"}`} />
            <div className={`pointer-events-none absolute -inset-[2px] rounded-[34px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-primary-600 to-emerald-400 ${isSelected ? "opacity-100" : "group-hover:opacity-60"}`} style={{ filter: "blur(10px)", zIndex: -1 }} />

            {isChampion && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-gradient-to-r from-primary-600 to-emerald-400 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-slow">
                    <span className="material-symbols-outlined text-lg">emoji_events</span>
                    <span className="text-xs font-black uppercase tracking-wider">Campeón</span>
                </div>
            )}

            {/* 3) Logo/imagen y Header wrapper */}
            <div className={`relative h-[160px] md:h-[280px] w-full flex items-center justify-center bg-gradient-to-b from-slate-50/80 to-slate-100/50 transition-colors duration-500 overflow-hidden ${type === 'text' ? (option.bgColor || 'bg-brand-gradient') : ''}`}>

                {/* 5) Estado seleccionado (check discreto) */}
                <div className={`absolute top-4 right-4 z-20 transition-all duration-300 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    <div className="h-9 w-9 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
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
                        className={`relative z-10 w-32 h-32 md:w-52 md:h-52 object-contain drop-shadow-lg transition-transform duration-300 ease-out group-hover:scale-[1.08] group-hover:-translate-y-1 ${isSelected ? "scale-[1.06] -translate-y-1" : ""} ${showResult ? "opacity-20 blur-sm" : ""} ${option.imageFit === 'contain' ? 'bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100' : 'absolute inset-0 w-full h-full object-cover'}`}
                        containerClassName="absolute inset-0 flex items-center justify-center p-4 md:p-6"
                        fallbackClassName="w-32 h-32 md:w-52 md:h-52 text-5xl md:text-6xl font-black bg-gradient-to-br from-blue-100 via-indigo-50 to-cyan-50 text-blue-500 shadow-inner border-4 border-white rounded-[2.5rem] flex items-center justify-center"
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
                                    slug={resolveEntitySlug(option)}
                                    domain={option.brand_domain}
                                    size="lg"
                                    variant={layout === 'opinion' ? 'depth' : 'versus'}
                                    className={`relative z-10 w-full h-full object-contain transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.12] group-hover:-translate-y-2 ${isSelected ? "scale-[1.08] -translate-y-1" : ""} ${showResult ? "opacity-20 blur-sm" : ""} ${option.imageClassName || ''}`}
                                    fallbackClassName="w-32 h-32 md:w-44 md:h-44 text-5xl md:text-6xl font-black bg-gradient-to-br from-indigo-100 via-blue-50 to-emerald-50 text-indigo-500 shadow-[inset_0_2px_15px_rgba(0,0,0,0.05)] border-[4px] md:border-[6px] border-white rounded-[2rem] flex items-center justify-center"
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
                        <div className={`w-28 h-28 md:w-44 md:h-44 rounded-full flex items-center justify-center mb-2 md:mb-4 shadow-2xl border-4 border-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.15] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:-translate-y-3 ${showResult ? 'opacity-30 blur-sm bg-slate-100' : 'bg-white'}`}>
                            <span className="material-symbols-outlined text-[4rem] md:text-[6rem] transition-colors duration-500" style={{ color: showResult ? '#cbd5e1' : (theme?.primary || '#10b981') }}>
                                {option.icon || 'star'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Subtle Image Overlay */}
                {type === 'image' && (
                    <div className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-95 ${layout === 'topic' ? 'bg-gradient-to-t from-white/90 via-white/20 to-transparent' : 'bg-gradient-to-t from-white/90 via-white/40 to-transparent opacity-90'}`} />
                )}

                {/* RESULTS OVERLAY (Glassmorphism) */}
                <AnimatePresence>
                    {showResult && (percent !== null || momentum) && (showPercentage ?? true) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(8px)' }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/85 p-4 md:p-6"
                        >
                            <span className="text-[3.5rem] md:text-[7rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 drop-shadow-sm tracking-tighter leading-none mb-1 md:mb-2">
                                {momentum ? momentum.percentage : percent}%
                            </span>

                            {momentum && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={`px-5 py-2 rounded-full flex items-center gap-2 font-black text-sm max-w-full shadow-sm backdrop-blur-md border backdrop-saturate-150 ${momentum.variant_24h > 0
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : momentum.variant_24h < 0
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : 'bg-slate-50 text-slate-600 border-slate-100'
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
                                className="absolute bottom-0 left-0 h-3 bg-slate-100"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${momentum ? momentum.percentage : percent}%` }}
                                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                                    className={`h-full rounded-r-full shadow-sm ${momentum ? (momentum.variant_24h > 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-primary-500 to-primary-400') : 'bg-gradient-to-r from-primary-500 to-primary-400'}`}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* 4) Nombre (label) más premium */}
            <div className="relative z-10 px-4 md:px-6 pb-4 md:pb-6 pt-3 md:pt-5 bg-white border-t border-slate-50 w-full flex-grow flex flex-col justify-end items-center text-center">
                <div className={`font-black tracking-tight text-[1rem] leading-tight md:text-2xl text-center w-full transition-colors duration-300 line-clamp-2 overflow-hidden text-ellipsis min-h-[3rem] md:min-h-[4rem] flex items-center justify-center ${showResult ? "text-slate-300" : "text-ink"}`}>
                    {option.label}
                </div>

                {/* LIVE STATS KPIs vs DEFAULT Hint */}
                {option.stats ? (
                    <div className={`flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-2 transition-all duration-500 ${!showResult ? 'opacity-80 group-hover:opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            </span>
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                                {option.stats.onlineCount} en línea
                            </span>
                        </div>

                        <div className="hidden sm:block w-[2px] h-3 rounded-full bg-slate-200" />

                        <div className="flex items-center gap-1">
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                                {option.stats.totalAnswers.toLocaleString()} señales
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className={`mt-2 text-[13px] font-bold text-slate-400 flex items-center justify-center gap-1.5 transition-all w-full ${showResult ? "opacity-0 invisible pointer-events-none" : "opacity-100 group-hover:text-emerald-500"}`}>
                        <span className="material-symbols-outlined text-[16px]">touch_app</span>
                        Señalar
                    </div>
                )}
            </div>

        </button>
    );
}

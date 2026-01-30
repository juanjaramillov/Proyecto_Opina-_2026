import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption } from '../types';

interface OptionCardProps {
    option: BattleOption;
    onClick: () => void;
    disabled: boolean;
    isSelected: boolean;
    showResult: boolean;
    showPercentage?: boolean;
    percent: number | null;
    isLeft?: boolean;
    isChampion?: boolean;
}

export default function OptionCard({
    option,
    onClick,
    disabled,
    isSelected,
    showResult,
    showPercentage,
    percent,
    isLeft = false,
    isChampion = false,
}: OptionCardProps) {
    const type = option.type || 'image';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                "group relative w-full text-left rounded-[2rem] overflow-hidden transition-all duration-500",
                "bg-surface border-2",
                disabled ? "cursor-default border-stroke opacity-90 pointer-events-none saturate-[.9]" : "cursor-pointer shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-3 hover:scale-[1.02] border-transparent hover:border-primary/30",
                isSelected ? "ring-4 ring-primary ring-offset-4 ring-offset-bg border-primary scale-[1.02] z-10" : "",
                isChampion ? "ring-4 ring-amber-400 ring-offset-4 ring-offset-bg shadow-[0_0_40px_rgba(251,191,36,0.5)] scale-[1.03] z-20 border-amber-400" : "",
                !disabled && !isSelected && !isChampion ? (isLeft ? "hover:-rotate-1" : "hover:rotate-1") : ""
            ].join(" ")}
        >
            {isChampion && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-amber-400 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-slow">
                    <span className="material-symbols-outlined text-lg">emoji_events</span>
                    <span className="text-xs font-black uppercase tracking-wider">Campeón</span>
                </div>
            )}

            <div className={`relative w-full aspect-[3/4] overflow-hidden flex items-center justify-center ${type === 'text' ? (option.bgColor || 'bg-gradient-to-br from-indigo-500 to-purple-600') : (type === 'icon' ? (option.bgColor || 'bg-surface') : 'bg-surface2')}`}>

                {type === 'image' && option.imageUrl && (
                    <img
                        src={option.imageUrl}
                        alt={option.label}
                        className={[
                            "absolute inset-0 w-full h-full object-cover",
                            "transition-transform duration-700 ease-out",
                            "group-hover:scale-110",
                            showResult ? "scale-105 blur-sm grayscale opacity-40" : "",
                        ].join(" ")}
                    />
                )}

                {type === 'brand' && (
                    <div className={`absolute inset-0 flex items-center justify-center p-6 transition-colors duration-500 ${option.imageUrl ? (option.bgColor || 'bg-white') : (option.bgColor || 'bg-surface2')}`}>
                        {option.imageUrl ? (
                            <img
                                src={option.imageUrl}
                                alt={option.label}
                                className={`w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110 ${showResult ? 'blur-sm opacity-50 grayscale' : ''} ${option.imageClassName || ''}`}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center z-10">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                )}

                <AnimatePresence>
                    {showResult && percent !== null && (showPercentage ?? true) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-20"
                        >
                            <span className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tighter">
                                {percent}%
                            </span>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                className="absolute bottom-0 left-0 h-2 bg-white/50"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isSelected && !showResult && (
                    <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-2.5 shadow-xl border-2 border-white z-20 animate-in fade-in zoom-in duration-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            {type !== 'text' && type !== 'icon' && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-left">
                    <div className={`text-xl md:text-2xl font-black leading-none mb-1 drop-shadow-md transition-transform duration-300 group-hover:translate-x-1 ${option.color || (type === 'brand' ? 'text-slate-900' : 'text-white')}`}>
                        {option.label}
                    </div>
                    {!showResult && (
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${type === 'brand' ? 'text-slate-500' : 'text-white/80'}`}>
                            <span>Votar</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                    )}
                </div>
            )}

            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
        </button>
    );
}

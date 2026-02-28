import { motion } from 'framer-motion';
import { BattleOption } from '../../types';

interface ChallengerLaneProps {
    option: BattleOption;
    onClick: () => void;
    isVoting: boolean;
    isSelected?: boolean;
}

export default function ChallengerLane({ option, onClick, isVoting, isSelected }: ChallengerLaneProps) {
    return (
        <motion.button
            layoutId={`challenger-${option.id}`}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={onClick}
            disabled={isVoting}
            className={`
                relative w-full h-full min-h-[300px] md:min-h-[450px] rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-between
                transition-all duration-500 ease-out text-left cursor-pointer
                hover:-translate-y-1 focus:outline-none focus-within:ring-2 focus-within:ring-slate-900/20 active:scale-[0.98]
                group bg-slate-50 border-2 overflow-hidden
                ${isSelected ? 'border-primary-500 shadow-[0_20px_60px_-10px_rgba(99,102,241,0.5)] scale-[1.03] bg-white z-20' : 'border-slate-200 hover:border-primary-300 hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.3)] hover:bg-white z-10'}
                ${isVoting && !isSelected ? 'opacity-60 grayscale-[0.5] scale-[0.98]' : ''}
            `}
        >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/50 to-white pointer-events-none transition-opacity duration-500 group-hover:opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-50/50 to-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Area: Badges */}
            <div className="relative z-20 flex justify-end items-start w-full">
                <div className="px-3 py-1.5 bg-primary-500 text-white rounded-xl shadow-lg border border-primary-400/50 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">swords</span>
                    NUEVO RETADOR
                </div>
            </div>

            {/* Logo / Image Content */}
            <div className="relative z-10 flex-grow flex items-center justify-center py-8 w-full">
                {(option.brand_domain || option.image_url || option.imageUrl) ? (
                    <div className="relative w-full h-full flex items-center justify-center group-hover:scale-[1.05] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                        <div className="flex items-center justify-center w-full max-w-[240px] md:max-w-[320px] h-[140px] md:h-[180px]">
                            <img
                                src={option.brand_domain ? `https://cdn.brandfetch.io/${option.brand_domain}?c=1XbJ9XN7f7y8h0B6P3t` : (option.image_url || option.imageUrl || undefined)}
                                alt={option.label}
                                className={`max-w-full max-h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:drop-shadow-2xl ${option.imageClassName || ''}`}
                                loading="lazy"
                                draggable={false}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.1] group-hover:bg-primary-50 group-hover:shadow-primary-500/20 group-hover:border-primary-100">
                        <span className="text-5xl md:text-7xl font-black text-slate-400 group-hover:text-primary-300 uppercase tracking-tighter transition-colors duration-500">
                            {option.label.substring(0, 2)}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Content (Title) */}
            <div className="relative z-20 mt-auto w-full flex justify-between items-end gap-4">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-700 tracking-tighter group-hover:text-primary-600 transition-colors bg-clip-text">
                    {option.label}
                </h3>

                {/* Arrow hint */}
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 bg-slate-200 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-500 group-hover:translate-x-1 ${isSelected ? 'bg-primary-500 text-white' : ''}`}>
                    <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </div>
            </div>
        </motion.button>
    );
}

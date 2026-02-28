import { motion } from 'framer-motion';
import { BattleOption } from '../../types';

interface ChampionLaneProps {
    option: BattleOption;
    wins: number;
    goal: number;
    onClick: () => void;
    isVoting: boolean;
    isSelected?: boolean;
}

export default function ChampionLane({ option, wins, onClick, isVoting, isSelected }: ChampionLaneProps) {

    return (
        <button
            onClick={onClick}
            disabled={isVoting}
            className={`
                relative w-full h-full min-h-[300px] md:min-h-[450px] rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-between
                transition-all duration-500 ease-out text-left cursor-pointer
                hover:-translate-y-1 focus:outline-none focus-within:ring-2 focus-within:ring-slate-900/20 active:scale-[0.98]
                group bg-white border-2 overflow-hidden
                ${isSelected ? 'border-amber-400 shadow-[0_20px_60px_-10px_rgba(251,191,36,0.6)] scale-[1.03] z-20' : 'border-amber-100 hover:border-amber-300 hover:shadow-[0_20px_50px_-15px_rgba(251,191,36,0.4)] shadow-sm z-10'}
                ${isVoting && !isSelected ? 'opacity-60 grayscale-[0.5] scale-[0.98]' : ''}
            `}
        >
            {/* Background elements (Gradient & Glow) */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-white/50 pointer-events-none" />
            <div className={`absolute -top-32 -left-32 w-96 h-96 bg-amber-400/20 blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000 ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />

            {/* "Breathing" Champion Aura */}
            <motion.div
                className="absolute inset-0 border-4 border-amber-400/30 rounded-[2.5rem] pointer-events-none"
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.98, 1, 0.98] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Top Area: Badges */}
            <div className="relative z-20 flex justify-between items-start w-full">
                <div className="flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl shadow-lg border border-amber-300/50 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">workspace_premium</span>
                        CAMPEÓN
                    </div>

                    {wins > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-amber-700 rounded-xl shadow-sm text-[11px] font-black tracking-widest uppercase border border-amber-100/50 inline-flex items-center gap-1"
                        >
                            <span className="text-amber-500 font-bold">{wins}</span> {wins === 1 ? 'Victoria' : 'Victorias'}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-grow flex items-center justify-center py-8 w-full">
                {(option.brand_domain || option.image_url || option.imageUrl) ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="flex items-center justify-center w-full max-w-[240px] md:max-w-[320px] h-[140px] md:h-[180px]">
                            <img
                                src={option.brand_domain ? `https://cdn.brandfetch.io/${option.brand_domain}?c=1XbJ9XN7f7y8h0B6P3t` : (option.image_url || option.imageUrl || undefined)}
                                alt={option.label}
                                className={`max-w-full max-h-full object-contain drop-shadow-xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.12] group-hover:-translate-y-2 group-hover:drop-shadow-2xl ${option.imageClassName || ''}`}
                                loading="lazy"
                                draggable={false}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-white shadow-2xl flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.1]">
                        <span className="text-5xl md:text-7xl font-black text-amber-500/30 uppercase tracking-tighter">
                            {option.label.substring(0, 2)}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Content (Title) */}
            <div className="relative z-20 mt-auto w-full">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter group-hover:text-amber-600 transition-colors bg-clip-text">
                    {option.label}
                </h3>

                {/* Visual Hint */}
                <div className={`absolute right-0 bottom-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 bg-amber-100 text-amber-500`}>
                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
            </div>

        </button>
    );
}

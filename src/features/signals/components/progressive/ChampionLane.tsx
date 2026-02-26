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
                relative w-full h-full min-h-[250px] md:min-h-[400px] rounded-3xl p-6 md:p-8 flex flex-col justify-end
                transition-all duration-300 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400
                group bg-white border-2 overflow-hidden
                ${isSelected ? 'border-amber-400 shadow-[0_0_30px_-5px_rgba(251,191,36,0.5)] scale-[1.02]' : 'border-amber-100 hover:border-amber-300 hover:shadow-xl hover:-translate-y-1'}
                ${isVoting && !isSelected ? 'opacity-50 grayscale scale-[0.98]' : ''}
            `}
        >
            {/* Background image if exists */}
            {option.image_url && (
                <div className="absolute inset-x-0 top-0 h-3/5 bg-slate-50 flex items-center justify-center p-4">
                    <img src={option.image_url} alt={option.label} className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}

            {/* Top gradient for readability */}
            {option.image_url && <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />}

            {/* Champion Badge (Anchored Top Left) */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="px-3 py-1.5 bg-amber-400 text-white rounded-xl shadow-md text-xs font-black uppercase tracking-widest flex items-center gap-1 border border-amber-500/50">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    CAMPEÓN
                </div>

                {wins > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-2 py-1 bg-white/80 backdrop-blur-sm text-amber-700 rounded-lg shadow-sm text-[10px] font-bold border border-amber-100/50"
                    >
                        {wins} {wins === 1 ? 'Victoria' : 'Victorias'}
                    </motion.div>
                )}
            </div>

            {/* Bottom Content (Title) */}
            <div className="relative z-10 mt-auto">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors">
                    {option.label}
                </h3>
            </div>

            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-[100px] rounded-full pointer-events-none" />
        </button>
    );
}

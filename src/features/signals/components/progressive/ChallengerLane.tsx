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
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={onClick}
            disabled={isVoting}
            className={`
                relative w-full h-full min-h-[250px] md:min-h-[400px] rounded-3xl p-6 md:p-8 flex flex-col justify-end
                transition-all duration-300 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500
                group bg-slate-50 border-2 overflow-hidden
                ${isSelected ? 'border-indigo-500 shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)] scale-[1.02] bg-white' : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white'}
                ${isVoting && !isSelected ? 'opacity-50 grayscale scale-[0.98]' : ''}
            `}
        >
            {/* Background image if exists */}
            {option.image_url && (
                <div className="absolute inset-x-0 top-0 h-3/5 flex items-center justify-center p-4">
                    <img src={option.image_url} alt={option.label} className="w-full h-full object-contain mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}

            {/* Top gradient for readability */}
            {option.image_url && <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-white/80 to-transparent group-hover:from-white" />}

            {/* Challenger Badge (Anchored Top Right) */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                <div className="px-3 py-1.5 bg-indigo-500 text-white rounded-xl shadow-md text-xs font-black uppercase tracking-widest flex items-center gap-1 border border-indigo-600/50">
                    <span className="material-symbols-outlined text-sm">swords</span>
                    NUEVO RETADOR
                </div>
            </div>

            {/* Bottom Content (Title) */}
            <div className="relative z-10 mt-auto flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors max-w-[80%]">
                    {option.label}
                </h3>

                {/* Arrow hint */}
                <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors ${isSelected ? 'bg-indigo-500 text-white' : ''}`}>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </div>
            </div>
        </motion.button>
    );
}

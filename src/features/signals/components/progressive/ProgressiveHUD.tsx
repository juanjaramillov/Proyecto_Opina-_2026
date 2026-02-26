
interface ProgressiveHUDProps {
    round: number;
    champWins: number;
    goal: number;
    onExit: () => void;
}

export default function ProgressiveHUD({ round, champWins, goal, onExit }: ProgressiveHUDProps) {
    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white/60 backdrop-blur-md border border-slate-100/50 p-4 rounded-3xl shadow-sm">
            {/* Chips Container */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl border border-indigo-100">
                    MODO: TORNEO
                </span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-[10px] md:text-xs uppercase tracking-widest rounded-xl border border-slate-200">
                    Ronda {round}
                </span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-600 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl border border-amber-100 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    Victorias del campeón: {champWins}/{goal}
                </span>
            </div>

            {/* Exit Button */}
            <button
                onClick={onExit}
                className="flex items-center gap-1 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800 text-sm font-bold"
            >
                Salir <span className="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    );
}

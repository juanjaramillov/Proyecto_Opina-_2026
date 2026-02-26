

interface CoronationProgressProps {
    champWins: number;
    goal: number;
}

export default function CoronationProgress({ champWins, goal }: CoronationProgressProps) {
    const slots = Array.from({ length: goal }, (_, i) => i);

    return (
        <div className="flex flex-col items-center justify-center space-y-2 mt-8 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Camino a la corona
            </span>
            <div className="flex items-center gap-2">
                {slots.map((slotIndex) => {
                    const isFilled = slotIndex < champWins;
                    const isCurrent = slotIndex === champWins;

                    return (
                        <div key={slotIndex} className="relative">
                            <div
                                className={`w-8 h-3 rounded-full transition-all duration-500 border
                                    ${isFilled ? 'bg-amber-400 border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-slate-100 border-slate-200'}
                                    ${isCurrent ? 'scale-110 bg-slate-200 border-slate-300' : ''}
                                `}
                            />
                            {/* Corona icon on the last slot */}
                            {slotIndex === goal - 1 && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-slate-300">
                                    <span className={`material-symbols-outlined text-sm ${isFilled ? 'text-amber-500' : ''}`}>crown</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <span className="text-xs text-slate-500 font-medium pt-1">
                {champWins === goal ? '¡Coronado!' : `Faltan ${goal - champWins} victorias`}
            </span>
        </div>
    );
}

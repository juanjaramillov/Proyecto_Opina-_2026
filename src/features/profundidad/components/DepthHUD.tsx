import React from 'react';

interface DepthHUDProps {
    currentStep: number;
    totalSteps: number;
    onExit: () => void;
}

const DepthHUD: React.FC<DepthHUDProps> = ({ currentStep, totalSteps, onExit }) => {
    // Math to ensure smooth bar
    const progressPercent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

    return (
        <div className="flex flex-col gap-3 mb-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Progreso</span>
                    <span className="text-xl sm:text-2xl font-black text-ink leading-none">
                        {currentStep}
                        <span className="text-sm font-bold text-slate-300 mx-1">/</span>
                        <span className="text-sm font-bold text-slate-400">{totalSteps}</span>
                    </span>
                </div>

                <button
                    onClick={onExit}
                    className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors p-2 -mr-2 rounded-xl flex items-center gap-1 hover:bg-slate-50"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                    <span className="hidden sm:inline">Salir</span>
                </button>
            </div>

            <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)] relative"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
            </div>
            <div className="text-[10px] font-medium text-slate-400">
                Tus respuestas potencian el algoritmo de Opina+.
            </div>
        </div>
    );
};

export default DepthHUD;

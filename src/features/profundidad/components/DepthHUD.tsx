import React from 'react';

interface DepthHUDProps {
    currentStep: number;
    totalSteps: number;
}

const DepthHUD: React.FC<DepthHUDProps> = ({ currentStep, totalSteps }) => {
    // Math to ensure smooth bar
    const progressPercent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

    return (
        <div className="flex flex-col gap-3 mb-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end relative z-10">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Progreso</span>
                    <span className="text-xl sm:text-2xl font-black text-ink leading-none">
                        {currentStep}
                        <span className="text-sm font-bold text-slate-300 mx-1">/</span>
                        <span className="text-sm font-bold text-slate-400">{totalSteps}</span>
                    </span>
                </div>
            </div>

            <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner relative z-10">
                <div
                    className="h-full bg-gradient-brand rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)] relative"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 relative z-10 uppercase tracking-widest">
                Tus respuestas potencian el algoritmo de Opina+.
            </div>
        </div>
    );
};

export default DepthHUD;

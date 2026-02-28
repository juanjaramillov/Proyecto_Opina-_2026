import React from 'react';
import { motion } from 'framer-motion';

interface DepthHUDProps {
    currentStep: number;
    totalSteps: number;
    onExit: () => void;
}

const DepthHUD: React.FC<DepthHUDProps> = ({ currentStep, totalSteps, onExit }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-200">
                        Modo: Profundidad
                    </div>
                    <div className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                        ~60s
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso</div>
                        <div className="text-sm font-black text-slate-900">{currentStep}/{totalSteps}</div>
                    </div>
                    <button
                        onClick={onExit}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </div>
                <p className="text-xs font-bold text-slate-500 italic">
                    "5 preguntas para afinar tu señal. Sin discursos."
                </p>
            </div>
        </div>
    );
};

export default DepthHUD;

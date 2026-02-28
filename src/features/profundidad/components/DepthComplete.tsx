import React from 'react';
import { motion } from 'framer-motion';

interface DepthCompleteProps {
    onNextPack?: () => void;
    onGoToHub: () => void;
    summary?: string[];
}

const DepthComplete: React.FC<DepthCompleteProps> = ({ onNextPack, onGoToHub, summary }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8"
        >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-2">Insight registrado</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto text-sm">
                Esto refina tu radiografía y mejora la segmentación de la inteligencia colectiva.
            </p>

            {summary && summary.length > 0 && (
                <div className="w-full bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-left">Resumen del Aporte</div>
                    <ul className="space-y-3 text-left">
                        {summary.map((item, idx) => (
                            <li key={idx} className="flex gap-3 text-sm font-bold text-slate-700">
                                <span className="text-primary-500 font-black">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="w-full space-y-3">
                {onNextPack && (
                    <button
                        onClick={onNextPack}
                        className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        Siguiente pack
                    </button>
                )}
                <button
                    onClick={onGoToHub}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                >
                    Volver al hub
                </button>
            </div>
        </motion.div>
    );
};

export default DepthComplete;

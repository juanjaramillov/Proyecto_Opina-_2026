import React from 'react';
import { useAuth } from '../../auth';
import { useSignalStore } from '../../../store/signalStore';
import { NextActionRecommendation, ActionType } from '../../../components/ui/NextActionRecommendation';
import { useNavigate } from 'react-router-dom';
interface DepthCompleteProps {
    onNextPack?: () => void;
    onGoToHub: () => void;
    summary?: string[];
}

const DepthComplete: React.FC<DepthCompleteProps> = ({ onNextPack, onGoToHub, summary }) => {
    const { profile } = useAuth();
    const { signals } = useSignalStore();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center text-center py-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30">
                <span className="material-symbols-outlined text-5xl">verified</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">¡Señal Reforzada!</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto text-base">
                Has aportado valor real. Tu opinión directa alimenta las tendencias del algoritmo de Opina+.
            </p>

            {summary && summary.length > 0 && (
                <div className="w-full bg-slate-50/50 rounded-3xl p-6 md:p-8 mb-10 border-2 border-slate-100">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5 text-left flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        Resumen del Aporte
                    </div>
                    <ul className="space-y-4 text-left">
                        {summary.map((item, idx) => {
                            const [question, answer] = item.split(': ');
                            return (
                                <li key={idx} className="flex flex-col gap-1 text-sm">
                                    <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">{question}</span>
                                    <span className="text-slate-800 font-black text-base">{answer}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className="w-full space-y-4">
                {onNextPack ? (
                    <button
                        onClick={onNextPack}
                        className="w-full py-5 bg-gradient-brand text-white rounded-[1.5rem] font-black text-base uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Siguiente pack
                    </button>
                ) : null}

                <div className="mt-4">
                    <NextActionRecommendation
                        signalsEarned={summary?.length || 0}
                        totalSignals={signals}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        profileCompleteness={(profile as any)?.profileCompleteness || 0}
                        onAction={(action: ActionType) => {
                            onGoToHub();
                            if (action === 'profile') navigate('/complete-profile');
                            if (action === 'results') navigate('/results');
                            // If versus, 'onGoToHub' already resets InsightPack mode in Experience.tsx
                        }}
                        customTitle="¡Completado!"
                        showSecondaryOption={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default DepthComplete;

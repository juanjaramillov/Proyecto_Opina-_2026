import React from 'react';
import { getTierForSignals } from '../../features/profile/loyalty/loyaltyModel';
import { motion } from 'framer-motion';

export type ActionType = 'profile' | 'versus' | 'results';

interface NextActionRecommendationProps {
    signalsEarned?: number;
    totalSignals: number;
    profileCompleteness: number;
    onAction: (actionType: ActionType) => void;
    customTitle?: string;
    showSecondaryOption?: boolean;
}

export const NextActionRecommendation: React.FC<NextActionRecommendationProps> = ({
    signalsEarned,
    totalSignals,
    profileCompleteness,
    onAction,
    customTitle,
    showSecondaryOption = true
}) => {
    let recommendedAction: ActionType = 'versus';
    let actionDescription = 'Sigue aportando al sistema y sumando señales.';
    let actionIcon = 'bolt';
    let buttonLabel = 'Seguir Participando';

    const { next } = getTierForSignals(totalSignals);

    if (profileCompleteness < 100) {
        recommendedAction = 'profile';
        actionDescription = 'Asegúrate de tener un perfil completo para habilitar métricas avanzadas.';
        actionIcon = 'person_check';
        buttonLabel = 'Completar Perfil';
    } else if (totalSignals < 5) {
        recommendedAction = 'versus';
        actionDescription = 'Calienta motores y entra al juego emitiendo tus primeras señales.';
        actionIcon = 'swords';
        buttonLabel = 'Siguiente Versus';
    } else if (next) {
        const missing = Math.max(0, next.minSignals - totalSignals);
        recommendedAction = 'versus';
        actionDescription = `Te faltan ${missing} señal${missing === 1 ? '' : 'es'} para subir a nivel ${next.name}.`;
        actionIcon = 'trending_up';
        buttonLabel = 'Seguir Señalando';
    } else {
        recommendedAction = 'results';
        actionDescription = 'Revisa cómo tus opiniones pasadas impactan el ecosistema.';
        actionIcon = 'monitoring';
        buttonLabel = 'Ir a Resultados';
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center text-center w-full relative overflow-hidden">
            {/* Subtle glow effect behind */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50" />

            <div className="relative z-10 w-full flex flex-col items-center">
                {signalsEarned !== undefined && signalsEarned > 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full font-black text-sm shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Sumaste {signalsEarned} señal{signalsEarned === 1 ? '' : 'es'}
                    </motion.div>
                )}

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    {customTitle || '¿Qué sigue ahora?'}
                </h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                    {actionDescription}
                </p>

                <div className="w-full max-w-xs flex flex-col gap-3">
                    <button
                        onClick={() => onAction(recommendedAction)}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary-600 text-white rounded-2xl font-black text-[15px] shadow-lg shadow-primary-500/25 hover:bg-primary-700 active:scale-[0.98] transition-all"
                    >
                        {buttonLabel}
                        <span className="material-symbols-outlined text-[20px]">{actionIcon}</span>
                    </button>

                    {showSecondaryOption && recommendedAction !== 'results' && (
                        <button
                            onClick={() => onAction('results')}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all"
                        >
                            Ver Resultados Globales
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

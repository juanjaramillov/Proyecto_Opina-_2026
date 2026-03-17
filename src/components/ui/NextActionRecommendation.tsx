import React from 'react';
import { getTierForSignals } from '../../features/profile/loyalty/loyaltyModel';
import { motion } from 'framer-motion';

export type ActionType = 'profile' | 'versus' | 'results' | 'torneo' | 'actualidad';

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
    let actionDescription = 'Sigue aportando al sistema y sumando señales para nutrir tu identidad.';
    let actionIcon = 'bolt';
    let buttonLabel = 'Continuar Señalando';

    const { next } = getTierForSignals(totalSignals);

    if (profileCompleteness < 100) {
        recommendedAction = 'profile';
        actionDescription = 'El motor necesita que completes tu perfil sociodemográfico para desbloquear cruces de alta resolución.';
        actionIcon = 'person_check';
        buttonLabel = 'Completar Perfil';
    } else if (totalSignals < 5) {
        recommendedAction = 'versus';
        actionDescription = 'Calienta motores y entra al flujo rápido de Versus para generar tus primeras definiciones.';
        actionIcon = 'swords';
        buttonLabel = 'Entrar a Versus';
    } else if (next) {
        const missing = Math.max(0, next.minSignals - totalSignals);
        recommendedAction = 'versus';
        actionDescription = `Estás a ${missing} señal${missing === 1 ? '' : 'es'} de consolidar tu huella y subir al rango ${next.name}.`;
        actionIcon = 'trending_up';
        buttonLabel = 'Emitir Más Señales';
    } else {
        recommendedAction = 'results';
        actionDescription = 'Revisa cómo tus patrones impactan y moldean el ecosistema en tiempo real.';
        actionIcon = 'monitoring';
        buttonLabel = 'Ver Resumen Global';
    }

    return (
        <div className="bg-ink rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between text-left w-full relative overflow-hidden group shadow-xl">
            {/* Elementos Decorativos de Fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-xl mb-8 md:mb-0">
                {signalsEarned !== undefined && signalsEarned > 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-surface2/10 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
                        +{signalsEarned} Señal{signalsEarned === 1 ? '' : 'es'} Reciente{signalsEarned === 1 ? '' : 's'}
                    </motion.div>
                )}

                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                    {customTitle || 'La lectura nunca se detiene.'}
                </h3>
                <p className="text-slate-400 font-medium text-lg max-w-md leading-relaxed">
                    {actionDescription}
                </p>
            </div>

            <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0">
                <button
                    onClick={() => onAction(recommendedAction)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 py-4 px-8 bg-primary text-white rounded-2xl font-black text-[15px] hover:bg-primary-hover active:scale-[0.98] transition-all whitespace-nowrap"
                >
                    {buttonLabel}
                    <span className="material-symbols-outlined text-[20px]">{actionIcon}</span>
                </button>

                {showSecondaryOption && recommendedAction !== 'results' && (
                    <button
                        onClick={() => onAction('results')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 py-4 px-8 bg-white/5 text-white border border-white/20 rounded-2xl font-bold text-[14px] hover:bg-white/10 active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                        Volver al Hub
                    </button>
                )}
            </div>
        </div>
    );
};

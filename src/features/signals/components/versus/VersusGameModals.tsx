import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProfileRequiredModal } from '../../../../components/ProfileRequiredModal';
import { GuestConversionModal } from '../../../auth/components/GuestConversionModal';
import InsightPack from '../InsightPack';
import { Battle, BattleOption } from '../../types';

interface VersusGameModalsProps {
    showAuthModal: boolean;
    setShowAuthModal: (v: boolean) => void;
    showProfileModal: boolean;
    setShowProfileModal: (v: boolean) => void;
    showGuestConversionModal: boolean;
    setShowGuestConversionModal: (v: boolean) => void;
    showInsightPack: boolean;
    setShowInsightPack: (v: boolean) => void;
    selectedOption: BattleOption | null;
    evaluatingOption?: BattleOption | null;
    effectiveBattle: Battle;
    next: () => void;
}

export function VersusGameModals({
    showAuthModal,
    setShowAuthModal,
    showProfileModal,
    setShowProfileModal,
    showGuestConversionModal,
    setShowGuestConversionModal,
    showInsightPack,
    setShowInsightPack,
    selectedOption,
    evaluatingOption,
    effectiveBattle,
    next
}: VersusGameModalsProps) {
    const navigate = useNavigate();

    const targetOption = evaluatingOption || selectedOption;

    return (
        <>
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAuthModal(false)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-slate-100 text-center overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100/50 rounded-full blur-[40px] pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand shadow-sm">
                                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 drop-shadow-sm">Señal Protegida</h2>
                                <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                                    Para que tu señal tenga <span className="text-slate-900 font-black">impacto algorítmico</span> y se sume a la inteligencia colectiva, necesitas validar tu identidad.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-4 bg-gradient-to-br from-brand to-accent text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                                    >
                                        INICIAR SESIÓN
                                    </button>
                                    <button
                                        onClick={() => setShowAuthModal(false)}
                                        className="w-full py-3 bg-transparent text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-slate-900 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                                    >
                                        Continuar como observador
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showProfileModal && (
                    <ProfileRequiredModal
                        onClose={() => setShowProfileModal(false)}
                        onCompleteProfile={() => navigate('/complete-profile')}
                    />
                )}
                {showGuestConversionModal && (
                    <GuestConversionModal
                        isOpen={showGuestConversionModal}
                        onClose={() => setShowGuestConversionModal(false)}
                        onRegister={() => {
                            setShowGuestConversionModal(false);
                            navigate('/dashboard');
                        }}
                    />
                )}
                {showInsightPack && targetOption && (
                    <InsightPack
                        optionId={targetOption.id}
                        optionLabel={targetOption.label}
                        categorySlug={typeof effectiveBattle.category === 'object' && effectiveBattle.category !== null ? (effectiveBattle.category as { slug: string }).slug : String(effectiveBattle.category || '')}
                        onComplete={() => {
                            setShowInsightPack(false);
                            next();
                        }}
                        onCancel={() => setShowInsightPack(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

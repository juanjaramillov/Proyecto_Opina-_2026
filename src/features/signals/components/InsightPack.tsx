import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SurveyEngine from './SurveyEngine';
import RequestLoginModal from '../../auth/components/RequestLoginModal';
import { DEPTH_QUESTIONS } from '../config/depthQuestions';
import { depthService, DepthImmediateComparison } from '../services/depthService';
import { useAuth } from '../../auth';
import { useToast } from '../../../components/ui/useToast';
import { logger } from '../../../lib/logger';
import { ProfileRequiredModal } from '../../../components/ProfileRequiredModal';
import { useNavigate } from 'react-router-dom';

interface InsightPackProps {
    optionId: string;
    optionLabel: string;
    onComplete: () => void;
    onCancel: () => void;
}

const InsightPack: React.FC<InsightPackProps> = ({ optionId, optionLabel, onComplete, onCancel }) => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Segmentación y Comparativa
    const [comparisonData, setComparisonData] = useState<Record<string, DepthImmediateComparison>>({});
    const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});

    const { showToast } = useToast();

    // Mock segment filter based on profile to send to RPC
    const segmentFilter = profile?.demographics?.region || null;

    const fetchAnalytics = async (answers: Record<string, string | number>) => {
        setLoadingAnalytics(true);
        try {
            const results: Record<string, DepthImmediateComparison> = {};
            for (const key of Object.keys(answers)) {
                const data = await depthService.getDepthImmediateComparison(key, segmentFilter);
                if (data) {
                    results[key] = data;
                }
            }
            setComparisonData(results);
        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Error loading immediate analytics:', error);
            setAnalyticsError(error.message || 'Error loading analytics');
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const handleSurveyComplete = async (answers: Record<string, string | number>) => {
        // 🛡️ PROFILE WIZARD V2 CHECK: Ensure at least stage 2 for signaling
        const currentStage = profile?.demographics?.profileStage || 0;
        if (currentStage < 2) {
            logger.warn("Intento de emitir señal de profundidad sin perfil completo");
            setShowProfileModal(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const structuredAnswers = Object.entries(answers).map(([key, val]) => ({
                question_key: key,
                answer_value: String(val)
            }));

            await depthService.saveDepthStructured(optionId, structuredAnswers);
            setUserAnswers(answers);
            setShowAnalytics(true);
            await fetchAnalytics(answers);

        } catch (error) {
            logger.error('Error saving depth structured answers:', error);
            showToast('Error al guardar la señal. Reintenta.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // No longer using manual filter select
    // Automatically uses profile segment filter.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative border border-slate-100"
            >
                {showAnalytics ? (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 leading-tight">Métrica Comparativa</h2>
                            <button
                                onClick={onComplete}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">science</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Laboratorio de Inteligencia</h3>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tu señal vs El Sistema</p>
                            </div>
                        </div>

                        {loadingAnalytics && (
                            <div className="text-center py-10">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <div className="text-gray-500 font-medium animate-pulse">
                                    Segmentando señales...
                                </div>
                            </div>
                        )}

                        {analyticsError && (
                            <div className="text-red-500 text-center py-4 bg-red-50 rounded-xl border border-red-100 italic">
                                {analyticsError}
                            </div>
                        )}

                        {!loadingAnalytics && !analyticsError && Object.keys(comparisonData).length === 0 && (
                            <div className="text-center text-gray-500 py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                No hay datos cargados para este segmento.
                            </div>
                        )}

                        {!loadingAnalytics && Object.keys(comparisonData).length > 0 && (
                            <div className="relative">
                                {!profile?.canSeeInsights && (
                                    <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                                            <span className="material-symbols-outlined text-3xl">lock</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Métrica Protegida</h3>
                                        <p className="text-slate-500 text-sm mb-6 max-w-[280px]">
                                            Solo los usuarios verificados pueden ver el benchmark competitivo y la segmentación detallada.
                                        </p>
                                        <button
                                            onClick={() => setIsLoginModalOpen(true)}
                                            className="px-8 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                                        >
                                            DESBLOQUEAR AHORA
                                        </button>
                                    </div>
                                )}
                                <div className={`space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar ${!profile?.canSeeInsights ? 'pointer-events-none grayscale opacity-40' : ''}`}>
                                    {Object.entries(comparisonData).map(([questionKey, stats]) => {
                                        const myAnswer = Number(userAnswers[questionKey] || 0);

                                        return (
                                            <div
                                                key={questionKey}
                                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group"
                                            >
                                                {/* Background Accent */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />

                                                <div className="relative z-10 flex justify-between items-center mb-6">
                                                    <div className="text-[11px] font-black uppercase tracking-widest text-indigo-500">
                                                        {questionKey.replace(/_/g, ' ')}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                        {stats.total_signals.toLocaleString()} señales
                                                    </div>
                                                </div>

                                                <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
                                                    <div className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl border border-indigo-100/50">
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Tu Emisión</span>
                                                        <span className="text-3xl font-black text-indigo-600">{myAnswer.toFixed(1)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center p-3">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tu Segmento</span>
                                                        <span className="text-2xl font-black text-slate-700">{stats.segment_avg.toFixed(1)}</span>
                                                        {segmentFilter && <span className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">({segmentFilter})</span>}
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center p-3">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Global</span>
                                                        <span className="text-2xl font-black text-slate-700">{stats.global_avg.toFixed(1)}</span>
                                                    </div>
                                                </div>

                                                {/* Progress bars comparison */}
                                                <div className="relative z-10 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 text-right text-[10px] font-bold text-slate-500 uppercase">Tú</div>
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(myAnswer / 10) * 100}%` }}
                                                                className="h-full bg-indigo-500 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 text-right text-[10px] font-bold text-slate-400 uppercase">Segmento</div>
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(stats.segment_avg / 10) * 100}%` }}
                                                                className="h-full bg-slate-400 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 text-right text-[10px] font-bold text-slate-400 uppercase">Global</div>
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(stats.global_avg / 10) * 100}%` }}
                                                                className="h-full bg-slate-300 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Educational Tooltip/Message */}
                                                <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
                                                    <p className="text-[11px] font-medium text-slate-500 text-center flex items-center justify-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[14px] text-indigo-400">info</span>
                                                        Estás aportando al índice de preferencia de {optionLabel}.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {!loadingAnalytics && (
                            <button
                                onClick={onComplete}
                                className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                FINALIZAR ANÁLISIS
                            </button>
                        )}
                    </div>
                ) : (
                    <SurveyEngine
                        questions={DEPTH_QUESTIONS}
                        title={optionLabel}
                        onComplete={handleSurveyComplete}
                        onCancel={onCancel}
                        isSubmitting={isSubmitting}
                    />
                )}
            </motion.div>

            <RequestLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => {
                    setIsLoginModalOpen(false);
                    // Refresh analytics if we just logged in
                    fetchAnalytics(userAnswers);
                }}
            />

            {showProfileModal && (
                <ProfileRequiredModal
                    onClose={() => setShowProfileModal(false)}
                    onCompleteProfile={() => {
                        setShowProfileModal(false);
                        navigate('/complete-profile');
                    }}
                />
            )}
        </div>
    );
};

export default InsightPack;

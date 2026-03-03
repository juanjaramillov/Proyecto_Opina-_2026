import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DepthWizard from '../../profundidad/DepthWizard';
import RequestLoginModal from '../../auth/components/RequestLoginModal';
import { depthService, DepthImmediateComparison } from '../services/depthService';
import { useAuth } from '../../auth';
import { useToast } from '../../../components/ui/useToast';
import { logger } from '../../../lib/logger';
import { ProfileRequiredModal } from '../../../components/ProfileRequiredModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';

interface InsightPackProps {
    optionId: string;
    optionLabel: string;
    onComplete: () => void;
    onCancel: () => void;
}

const InsightPack: React.FC<InsightPackProps> = ({ optionId, optionLabel, onComplete, onCancel }) => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Segmentación y Comparativa
    const [comparisonData, setComparisonData] = useState<Record<string, DepthImmediateComparison>>({});
    const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
    const [depthQuestions, setDepthQuestions] = useState<any[]>([]);
    const [loadingDefs, setLoadingDefs] = useState(true);

    React.useEffect(() => {
        let mounted = true;

        async function loadDepthDefs() {
            setLoadingDefs(true);
            try {
                // optionId here acts as the brand_id or is used to lookup the brand_id
                // Since this component is called with optionId which is often battle_option.id, we may need true brand_id.
                // Assuming depth definitions are mapped by optionId in the context or entity_id
                // For direct optionId -> brand_id relation, let's fetch the battle_option first if needed, 
                // BUT the instructions assume optionId is what we have or we use optionId directly if it's the entity_id

                // Fetch option to get brand_id if optionId is a battle_option id
                const { data: optionData } = await supabase
                    .from('battle_options')
                    .select('brand_id')
                    .eq('id', optionId)
                    .single();

                const actualBrandId = optionData?.brand_id;
                if (!actualBrandId) {
                    if (mounted) {
                        setDepthQuestions([]);
                        setLoadingDefs(false);
                    }
                    return;
                }

                const { data, error } = await supabase
                    .from("depth_definitions")
                    .select("question_key, question_text, question_type, options, position")
                    .eq("entity_id", actualBrandId)
                    .order("position", { ascending: true });

                if (error) throw error;

                const defs = (data || []).map((d: any) => ({
                    id: d.question_key,
                    type: d.question_type || (Array.isArray(d.options) && d.options.length ? "choice" : "scale_1_5"),
                    question: d.question_text,
                    options: Array.isArray(d.options) ? d.options : [],
                }));

                if (mounted) {
                    setDepthQuestions(defs);
                    setLoadingDefs(false);
                }
            } catch (e) {
                if (mounted) {
                    setDepthQuestions([]);
                    setLoadingDefs(false);
                }
            }
        }

        loadDepthDefs();
        return () => { mounted = false; };
    }, [optionId]);

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

    const handleSurveyCompleteReturn = async (answers: Record<string, string | number>) => {
        // 🛡️ PROFILE WIZARD V2 CHECK: Ensure at least stage 1 for signaling
        const currentStage = profile?.demographics?.profileStage || 0;
        const isAdmin = profile?.role === 'admin';

        if (!isAdmin && (!profile || profile.tier === 'guest' || currentStage < 1)) {
            showToast("Completa tu perfil para emitir señales.", "error");
            setShowProfileModal(true);
            throw new Error("Profile incomplete");
        }

        try {
            const structuredAnswers = Object.entries(answers).map(([key, val]) => ({
                question_key: key,
                answer_value: String(val)
            }));

            await depthService.saveDepthStructured(optionId, structuredAnswers);
            setUserAnswers(answers);

            // Background fetch
            fetchAnalytics(answers).catch(e => logger.error('Background fetch error:', e));

        } catch (error) {
            logger.error('Error saving depth structured answers:', error);
            showToast('Error al guardar la señal. Reintenta.', 'error');
            throw error;
        }
    };

    // @ts-expect-error - feature toggle en desarrollo
    const [showAnalyticsResults, setShowAnalyticsResults] = useState(false);

    if (loadingDefs) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center max-w-sm w-full shadow-2xl relative border border-slate-100 text-center"
                >
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-bold text-slate-500">Cargando profundidad...</p>
                </motion.div>
            </div>
        );
    }

    if (!showAnalyticsResults && depthQuestions.length < 10) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-sm w-full shadow-2xl relative border border-slate-100 text-center"
                >
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Faltan preguntas</h3>
                    <p className="text-sm text-slate-500 mb-6">Esta opción aún no tiene suficientes preguntas de Profundidad (mínimo 10).</p>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                        Volver
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative border border-slate-100"
            >
                {showAnalyticsResults ? (
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
                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
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
                                <div className="text-slate-500 font-medium animate-pulse">
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
                            <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
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
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />

                                                <div className="relative z-10 flex justify-between items-center mb-6">
                                                    <div className="text-[11px] font-black uppercase tracking-widest text-primary-500">
                                                        {questionKey.replace(/_/g, ' ')}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                        {stats.total_signals.toLocaleString()} señales
                                                    </div>
                                                </div>

                                                <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
                                                    <div className="flex flex-col items-center justify-center p-3 bg-primary-50 rounded-xl border border-primary-100/50">
                                                        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1">Tu Emisión</span>
                                                        <span className="text-3xl font-black text-primary-600">{myAnswer.toFixed(1)}</span>
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

                                                <div className="relative z-10 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 text-right text-[10px] font-bold text-slate-500 uppercase">Tú</div>
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(myAnswer / 10) * 100}%` }}
                                                                className="h-full bg-primary-500 rounded-full"
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

                                                <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
                                                    <p className="text-[11px] font-medium text-slate-500 text-center flex items-center justify-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[14px] text-primary-400">info</span>
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
                    <DepthWizard
                        questions={depthQuestions}
                        packTitle={optionLabel}
                        onSave={handleSurveyCompleteReturn}
                        onCancel={onCancel}
                        onComplete={() => {
                            // After wizard complete, we could show analytics if perms allowed,
                            // but usually we just finish. For now, let's keep it simple.
                            onComplete();
                        }}
                    />
                )}
            </motion.div>

            <RequestLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => {
                    setIsLoginModalOpen(false);
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

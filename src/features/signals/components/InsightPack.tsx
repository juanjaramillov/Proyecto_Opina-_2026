import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SurveyEngine from './SurveyEngine';
import RequestLoginModal from '../../auth/components/RequestLoginModal';
import { DEPTH_QUESTIONS } from '../config/depthQuestions';
import { depthService, DepthComparisonRow } from '../services/depthService';
import { useAuth } from '../../auth';
import { useToast } from '../../../components/ui/useToast';

interface InsightPackProps {
    optionId: string;
    optionLabel: string;
    battleOptions?: Array<{ id: string, label: string }>;
    onComplete: () => void;
    onCancel: () => void;
}

const InsightPack: React.FC<InsightPackProps> = ({ optionId, optionLabel, battleOptions = [], onComplete, onCancel }) => {
    const { profile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Segmentación y Comparativa
    const [genderFilter, setGenderFilter] = useState<string | null>(null);
    const [ageFilter, setAgeFilter] = useState<string | null>(null);
    const [regionFilter, setRegionFilter] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<Record<string, DepthComparisonRow[]>>({});

    const { showToast } = useToast();

    const competitorOptionId = battleOptions.find(opt => opt.id !== optionId)?.id;

    const fetchAnalytics = async (filters: { gender?: string | null, age?: string | null, region?: string | null }) => {
        setLoadingAnalytics(true);
        try {
            const data = await depthService.getProcessedComparison({
                optionA: optionId,
                optionB: competitorOptionId || optionId,
                gender: filters.gender,
                ageBucket: filters.age,
                region: filters.region
            });

            setComparisonData(data);
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Error loading analytics:', error);
            setAnalyticsError(error.message || 'Error loading analytics');
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const handleSurveyComplete = async (answers: Record<string, string | number>) => {
        setIsSubmitting(true);
        try {
            const structuredAnswers = Object.entries(answers).map(([key, val]) => ({
                question_key: key,
                answer_value: String(val)
            }));

            await depthService.saveDepthStructured(optionId, structuredAnswers);
            setShowAnalytics(true);
            await fetchAnalytics({ gender: genderFilter, age: ageFilter, region: regionFilter });

        } catch (error) {
            console.error('Error saving depth structured answers:', error);
            showToast('Error al guardar la señal. Reintenta.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Refetch when filters change
    const handleFilterChange = async (type: 'gender' | 'age' | 'region', value: string | null) => {
        const newFilters = {
            gender: type === 'gender' ? value : genderFilter,
            age: type === 'age' ? value : ageFilter,
            region: type === 'region' ? value : regionFilter
        };

        if (type === 'gender') setGenderFilter(value);
        if (type === 'age') setAgeFilter(value);
        if (type === 'region') setRegionFilter(value);

        await fetchAnalytics(newFilters);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
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

                        {/* Segmentación UI */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                            <select
                                value={genderFilter || ''}
                                onChange={(e) => handleFilterChange('gender', e.target.value || null)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-primary/30 transition-all text-slate-500"
                            >
                                <option value="">Género</option>
                                <option value="male">Hombres</option>
                                <option value="female">Mujeres</option>
                            </select>

                            <select
                                value={ageFilter || ''}
                                onChange={(e) => handleFilterChange('age', e.target.value || null)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-primary/30 transition-all text-slate-500"
                            >
                                <option value="">Edad</option>
                                <option value="18-24">18-24</option>
                                <option value="25-34">25-34</option>
                                <option value="35-44">35-44</option>
                                <option value="45+">45+</option>
                            </select>

                            <select
                                value={regionFilter || ''}
                                onChange={(e) => handleFilterChange('region', e.target.value || null)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-primary/30 transition-all text-slate-500"
                            >
                                <option value="">Región</option>
                                <option value="metropolitana">Metropolitana</option>
                                <option value="valparaiso">Valparaíso</option>
                                <option value="biobio">Biobío</option>
                            </select>
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
                                    {Object.entries(comparisonData).map(([questionKey, rows]) => {
                                        const optionA = rows.find((r) => r.option_id === optionId);
                                        const optionB = rows.find((r) => r.option_id === competitorOptionId);

                                        const avgA = optionA?.avg_value ?? 0;
                                        const avgB = optionB?.avg_value ?? 0;
                                        const delta = Number(avgA) - Number(avgB);

                                        return (
                                            <div
                                                key={questionKey}
                                                className="bg-slate-50 rounded-2xl p-5 border border-slate-100"
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                        {questionKey}
                                                    </div>
                                                    <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${delta >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {delta >= 0 ? '+' : ''}{delta.toFixed(1)} Δ
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{optionLabel}</span>
                                                        <span className="text-2xl font-black text-slate-900">{Number(avgA).toFixed(1)}</span>
                                                    </div>
                                                    <div className="text-slate-300 font-bold px-4">vs</div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Competidor</span>
                                                        <span className="text-2xl font-black text-slate-400">{Number(avgB).toFixed(1)}</span>
                                                    </div>
                                                </div>

                                                {/* Progress bars comparison */}
                                                <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-700"
                                                        style={{ width: `${(Number(avgA) / 10) * 100}%` }}
                                                    />
                                                    <div
                                                        className="h-full bg-slate-300 transition-all duration-700 ml-auto"
                                                        style={{ width: `${(Number(avgB) / 10) * 100}%` }}
                                                    />
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
                    fetchAnalytics({ gender: genderFilter, age: ageFilter, region: regionFilter });
                }}
            />
        </div>
    );
};

export default InsightPack;

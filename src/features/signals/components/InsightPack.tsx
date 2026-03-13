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
    categorySlug?: string;
    onComplete: () => void;
    onCancel: () => void;
}

const InsightPack: React.FC<InsightPackProps> = ({ optionId, optionLabel, categorySlug, onComplete, onCancel }) => {
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

                const defs = (data || []).map((d: any) => {
                    let parsedOptions: string[] = [];
                    if (typeof d.options === 'string') {
                        try {
                            parsedOptions = JSON.parse(d.options);
                        } catch (e) {
                            parsedOptions = [];
                        }
                    } else if (Array.isArray(d.options)) {
                        parsedOptions = d.options;
                    }

                    return {
                        id: d.question_key,
                        type: d.question_type || (parsedOptions.length ? "choice" : "scale_1_5"),
                        question: d.question_text,
                        options: parsedOptions,
                    };
                });

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

    const getQuestionsForCategory = (catSlug: string | undefined, label: string) => {
        const npsQuestion = {
            id: 'recomendacion',
            type: 'nps_0_10',
            question: `Del 0 al 10… ¿qué tan probable es que recomiendes ${label} a tu mejor amigo o peor enemigo?`,
            options: []
        };

        if (catSlug === 'salud-farmacias-scl') {
            return [
                npsQuestion,
                { id: 'q_precios_farmacia', type: 'scale_1_5', question: `Del 1 al 5, ¿qué tan justos te parecen los precios en ${label}?`, options: [] },
                { id: 'q_stock', type: 'choice', question: `Cuando buscas un medicamento en ${label}...`, options: ["Siempre lo tienen", "A veces falta stock", "Casi nunca encuentro lo que busco", "Solo encuentro marcas alternativas"] },
                { id: 'q_atencion', type: 'scale_1_5', question: `Del 1 al 5, ¿cómo evalúas la atención y asesoría del farmacéutico?`, options: [] },
                { id: 'q_ubicacion', type: 'choice', question: `¿Por qué vas a ${label}?`, options: ["Me queda cerca de casa", "Me queda de camino al trabajo", "Tiene los mejores precios", "Me gusta su programa de fidelidad", "Es la única que conozco"] },
                { id: 'q_rapidez', type: 'scale_1_5', question: `Del 1 al 5, ¿son rápidos para atenderte o la fila no avanza nunca?`, options: [] },
                { id: 'q_alternativas', type: 'yes_no', question: `¿Te suelen ofrecer alternativas bioequivalentes más económicas en ${label}?`, options: [] },
                { id: 'q_programa_fidelidad', type: 'choice', question: `¿Qué te parece su programa de descuentos/fidelidad?`, options: ["Es excelente y lo uso siempre", "Es bueno pero engorroso de usar", "Ni sabía que tenían uno", "No sirve para nada"] },
                { id: 'q_compra_online', type: 'scale_1_5', question: `Si has comprado online en ${label}... del 1 al 5, ¿qué tan buena fue la experiencia?`, options: [] },
                { id: 'q_confianza', type: 'choice', question: `¿Confías plenamente en lo que te recetan/recomiendan en ${label}?`, options: ["Ciegamente", "Confío pero verifico", "Tomo lo que compro y ya", "Solo voy por recetas médicas específicas"] }
            ];
        }

        if (catSlug === 'salud-clinicas-privadas-scl') {
            return [
                npsQuestion,
                { id: 'q_reserva_hora', type: 'choice', question: `Reservar una hora en ${label} es...`, options: ["Súper fácil y rápido", "Un parto, nunca hay fechas", "Normal, lo esperable", "Depende de la especialidad"] },
                { id: 'q_tiempo_espera', type: 'scale_1_5', question: `Del 1 al 5, ¿qué tan respetuosos son con el horario de tu cita?`, options: [] },
                { id: 'q_infraestructura', type: 'scale_1_5', question: `Instalaciones y modernismo... del 1 al 5, ¿cómo evalúas a ${label}?`, options: [] },
                { id: 'q_calidad_medica', type: 'choice', question: `¿Qué opinas del cuerpo médico de ${label}?`, options: ["Cuentan con los mejores especialistas", "Son buenos en general", "Atienden muy apurados", "Dejan bastante que desear"] },
                { id: 'q_precios_clinica', type: 'scale_1_5', question: `En relación a los precios y copagos, del 1 al 5 ¿es accesible?`, options: [] },
                { id: 'q_urgencias', type: 'choice', question: `Si vas a Urgencias en ${label}...`, options: ["Te atienden rapidísimo", "Esperas lo normal", "Puedes leerte un libro entero esperando", "Solo si me estoy muriendo voy"] },
                { id: 'q_trato_personal', type: 'scale_1_5', question: `Del 1 al 5, ¿qué tan humano y empático es el trato de enfermeras y personal?`, options: [] },
                { id: 'q_tecnologia', type: 'yes_no', question: `¿Sientes que ${label} está equipada con tecnología de punta para exámenes y tratamientos?`, options: [] },
                { id: 'q_razon_principal', type: 'choice', question: `¿Cuál es tu principal razón para elegir ${label} sobre otras?`, options: ["Prestigio médico", "Convenios con mi isapre/seguro", "Cercanía a mi hogar", "Me atendí toda la vida aquí", "Me la recomendaron"] }
            ];
        }

        // Default generic
        return [
            npsQuestion,
            { id: 'q_personaje', type: 'choice', question: `Si ${label} fuera un personaje de tu serie favorita, ¿cuál sería?`, options: ["El protagonista que salva el día", "El secundario buena onda", "El villano sin corazón", "El extra que desaparece rápido", "Ese que nadie entiende qué hace ahí"] },
            { id: 'q_precio_1_5', type: 'scale_1_5', question: `Precio vs Valor del 1 al 5. ¿Te cobran lo justo o te ven la cara en ${label}?`, options: [] },
            { id: 'q_innovacion_1_5', type: 'scale_1_5', question: `Innovación del 1 al 5. ¿Qué tan al día está ${label} con el siglo XXI?`, options: [] },
            { id: 'q_soporte_1_5', type: 'scale_1_5', question: `Si tienes un problema urgente... del 1 al 5, ¿te ayudan rapidito o te mandan a un bot inútil?`, options: [] },
            { id: 'q_dolor_principal', type: 'choice', question: `¿Qué es lo que más te hace perder la santa paciencia con ${label}?`, options: ["Sus precios de joyería", "Atención estilo municipalidad", "Se caen o fallan en el peor momento", "La burocracia interminable", "Me prometen maravillas y no cumplen", "Sinceramente, los amo sin cuestionar"] },
            { id: 'q_atractivo_principal', type: 'choice', question: `Y a pesar de todo, ¿por qué vuelves a caer con ${label}?`, options: ["El precio me salva la vida", "Dentro de todo, funciona", "Me da flojera suprema cambiarme", "Me atienden como rey/reina", "Tienen el monopolio de mi vida", "Porque soy fiel por naturaleza"] },
            { id: 'q_confianza_1_5', type: 'scale_1_5', question: `¿Cuánta fe ciega le tienes a ${label} a largo plazo? (1 al 5)`, options: [] },
            { id: 'q_fidelidad', type: 'choice', question: `Si mañana desaparece ${label} de la faz de la tierra... tu reacción sería:`, options: ["Lloro lágrimas de sangre", "Me duele un rato, pero superable", "Me da exactamente lo mismo", "Descorcho y hago una fiesta", "Ya no los usaba de todas formas"] },
            { id: 'q_frecuencia_uso', type: 'choice', question: `Seamos honestos... ¿cada cuánto le rezas o acudes a ${label}?`, options: ["Prácticamente todos los días", "Una que otra vez a la semana", "Aparezco una vez al mes", "Solo para los años bisiestos", "Solo cuando no me queda de otra"] }
        ];
    };

    const questionsToUse = depthQuestions.length >= 10 ? depthQuestions : getQuestionsForCategory(categorySlug, optionLabel);

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
                            <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">psychology</span>
                                Decodificando la tendencia
                            </h4>
                            <p className="text-sm font-medium text-ink leading-relaxed">Laboratorio de Inteligencia</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tu señal vs El Sistema</p>
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
                        questions={questionsToUse}
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

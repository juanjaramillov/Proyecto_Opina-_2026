import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userStateService, UserState, UserStateBenchmarks, StateBenchmark } from '../services/userStateService';
import { useToast } from '../../../components/ui/useToast';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../lib/logger';

const METRICS = [
    { id: 'mood_score', label: 'Estado de Ánimo', emoji: '🎭', description: '¿Cómo te sientes hoy?' },
    { id: 'economic_score', label: 'Percepción Económica', emoji: '💰', description: '¿Cómo evalúas tu situación financiera?' },
    { id: 'job_score', label: 'Satisfacción Laboral', emoji: '💼', description: '¿Qué tan conforme estás con tu trabajo?' },
    { id: 'happiness_score', label: 'Nivel de Felicidad', emoji: '✨', description: 'Tu bienestar general en este momento' },
];

export default function PersonalState() {
    const [scores, setScores] = useState<UserState>({
        mood_score: 5,
        economic_score: 5,
        job_score: 5,
        happiness_score: 5,
    });
    const [benchmarks, setBenchmarks] = useState<UserStateBenchmarks | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const loadBenchmarks = async () => {
            try {
                const data = await userStateService.getBenchmarks();
                setBenchmarks(data);
            } catch (err) {
                logger.error('Error loading benchmarks:', err);
            }
        };
        loadBenchmarks();
    }, []);

    const handleScoreChange = (id: keyof UserState, value: number) => {
        setScores(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await userStateService.saveUserState(scores);
            setIsSuccess(true);
            showToast('Estado sincronizado con éxito. Tu privacidad está protegida.', 'success');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (error) {
            logger.error('Failed to save state:', error);
            showToast('Error al sincronizar. Reintenta.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMetricKey = (id: string) => id.replace('_score', '');

    return (
        <div className="container-ws section-y min-h-screen">
            <div className="max-w-2xl mx-auto">
                <header className="mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary-600"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        Motor de Estado • Fase 2: Interconexión
                    </motion.div>
                    <h1 className="text-4xl font-black text-ink tracking-tight mb-4">Tu Estado Personal</h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                        Registra tu estado actual y compáralo con el país y tu segmento demográfico (actualizado cada 3 horas).
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-6">
                        {METRICS.map((metric, idx) => {
                            const key = getMetricKey(metric.id) as keyof StateBenchmark;
                            const countryAvg = benchmarks?.country?.[key];
                            const segmentAvg = benchmarks?.segment?.[key];

                            return (
                                <motion.div
                                    key={metric.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-primary-100 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                {metric.emoji}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-ink">{metric.label}</h3>
                                                <p className="text-xs text-slate-400 font-medium">{metric.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-primary-600 block leading-none">{scores[metric.id as keyof UserState]}</span>
                                            {benchmarks && (
                                                <div className="flex gap-2 mt-1 justify-end items-center">
                                                    <div className="flex items-center gap-1" title="Promedio País">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase italic">País: {countryAvg || '-'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1" title="Promedio Segmento">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase italic">Pares: {segmentAvg || '-'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative h-12 flex items-center">
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            step="1"
                                            value={scores[metric.id as keyof UserState]}
                                            onChange={(e) => handleScoreChange(metric.id as keyof UserState, parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600 z-10"
                                        />
                                        <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-1 opacity-20">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className={`w-1 h-1 rounded-full ${scores[metric.id as keyof UserState] > i ? 'bg-primary-300' : 'bg-slate-300'}`} />
                                            ))}
                                        </div>

                                        {/* Benchmark Markers */}
                                        {benchmarks && (
                                            <div className="absolute inset-0 pointer-events-none flex items-center px-[2%]">
                                                {countryAvg && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute w-0.5 h-4 bg-slate-300/60 rounded-full"
                                                        style={{ left: `${(countryAvg / 10) * 96 + 2}%` }}
                                                    />
                                                )}
                                                {segmentAvg && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute w-0.5 h-6 bg-emerald-400/80 rounded-full"
                                                        style={{ left: `${(segmentAvg / 10) * 96 + 2}%` }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Bajo</span>
                                        <span>Alto</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100 flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary-500 text-sm mt-0.5">info</span>
                        <p className="text-[11px] text-primary-700 leading-relaxed font-medium">
                            Los marcadores de <b>País (Gris)</b> y <b>Pares (Verde)</b> te ayudan a entender tu estado en contexto.
                            Tu anonimato está garantizado ya que solo se procesan promedios agregados.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 ${isSuccess ? 'bg-emerald-500 shadow-emerald-200' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-100'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="material-symbols-outlined animate-spin font-black">refresh</span>
                        ) : isSuccess ? (
                            <>
                                <span className="material-symbols-outlined font-black">verified</span>
                                ESTADO SINCRONIZADO
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined font-black">send</span>
                                SINCRONIZAR MI ESTADO
                            </>
                        )}
                    </motion.button>
                </form>

                <footer className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">
                    <p>Fase 2 de Implementación: Motor de Estado Unificado</p>
                </footer>
            </div>
        </div>
    );
}

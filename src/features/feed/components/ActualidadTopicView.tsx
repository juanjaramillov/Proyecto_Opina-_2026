import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import { ActualidadTopic } from '../../signals/services/actualidadService';

interface ActualidadTopicViewProps {
    topic: ActualidadTopic;
    onComplete: (postura: string, impacto: string) => void;
    onCancel: () => void;
}

type Step = 'context' | 'postura' | 'impacto' | 'summary';

export function ActualidadTopicView({ topic, onComplete, onCancel }: ActualidadTopicViewProps) {
    const [step, setStep] = useState<Step>('context');
    const [postura, setPostura] = useState<string | null>(null);

    const handleSelectPostura = (opcion: string) => {
        setPostura(opcion);
        setStep('impacto');
    };

    const handleSelectImpacto = (opcion: string) => {
        // Call parent completion handler, but show local summary state for half a second if needed
        onComplete(postura!, opcion);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <header className="p-4 border-b border-gray-100 bg-white flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Volver atrás"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <span className="text-xs font-medium text-[var(--accent-primary)] uppercase tracking-wider">{topic.categoria}</span>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'context' ? 'w-4 bg-[var(--accent-primary)]' : 'w-1.5 bg-gray-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'postura' ? 'w-4 bg-[var(--accent-primary)]' : 'w-1.5 bg-gray-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'impacto' ? 'w-4 bg-[var(--accent-primary)]' : 'w-1.5 bg-gray-200'}`} />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                <AnimatePresence mode="wait">
                    {step === 'context' && (
                        <motion.div
                            key="context"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 h-full flex flex-col justify-center max-w-lg mx-auto"
                        >
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center card-shadow">
                                <div className="w-16 h-16 bg-blue-50 text-[var(--accent-primary)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{topic.titulo}</h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    {topic.contexto_corto}
                                </p>

                                <button
                                    onClick={() => setStep('postura')}
                                    className="w-full btn-primary py-4 text-lg font-medium flex items-center justify-center gap-2"
                                >
                                    Participar <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'postura' && (
                        <motion.div
                            key="postura"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 h-full flex flex-col justify-center max-w-lg mx-auto w-full"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">{topic.pregunta_postura.tipo === 'string' ? topic.pregunta_postura.tipo : '¿Cuál es tu postura sobre esto?'}</h3>

                            <div className="flex flex-col gap-4">
                                {(topic.pregunta_postura.opciones || ['A favor', 'En contra']).map((opcion: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectPostura(opcion)}
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--accent-primary)] hover:bg-emerald-50/10 transition-all text-left text-lg font-medium text-gray-800 flex items-center justify-between group"
                                    >
                                        {opcion}
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[var(--accent-primary)] flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'impacto' && (
                        <motion.div
                            key="impacto"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 h-full flex flex-col justify-center max-w-lg mx-auto w-full"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">{topic.pregunta_impacto.tipo === 'string' ? topic.pregunta_impacto.tipo : '¿Qué tanto te impacta o importa?'}</h3>

                            <div className="flex flex-col gap-4">
                                {(topic.pregunta_impacto.opciones || ['Mucho', 'Algo', 'Poco', 'Nada']).map((opcion: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectImpacto(opcion)}
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--accent-primary)] hover:bg-emerald-50/10 transition-all text-left text-lg font-medium text-gray-800 flex items-center justify-between group"
                                    >
                                        {opcion}
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[var(--accent-primary)] flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import { ActualidadTopicDetail, TopicQuestion } from '../../signals/services/actualidadService';

interface ActualidadTopicViewProps {
    topic: ActualidadTopicDetail;
    onComplete: (answers: { question_id: string, answer_value: string }[]) => void;
    onCancel: () => void;
}

export function ActualidadTopicView({ topic, onComplete, onCancel }: ActualidadTopicViewProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 is context, 0...N are questions
    const [answers, setAnswers] = useState<{ question_id: string, answer_value: string }[]>([]);

    const questions: TopicQuestion[] = useMemo(() => {
        // Fallback safety if no questions
        if (!topic.questions || topic.questions.length === 0) return [];
        return [...topic.questions].sort((a, b) => a.question_order - b.question_order);
    }, [topic.questions]);

    const handleSelectOption = (questionId: string, value: string) => {
        const newAnswers = [...answers, { question_id: questionId, answer_value: value }];
        setAnswers(newAnswers);

        if (currentStepIndex < questions.length - 1) {
            // Ir a la siguiente pregunta
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // Ir a pantalla de resumen local
            setCurrentStepIndex(questions.length);
            
            // Call onComplete after a delay, or let the user click "Finalizar"
            // For now we just call onComplete so the backend saves it, but we stay in the summary view
            // Actually, HubManager might unmount us if we call onComplete. 
            // So let's only call onComplete when the user clicks 'Finalizar' on the summary screen.
        }
    };

    const renderQuestionOptions = (question: TopicQuestion) => {
        let options: { label: string; value: string }[] = [];
        
        if (Array.isArray(question.options_json) && question.options_json.length > 0) {
            options = question.options_json.map((opt: unknown) => {
                if (typeof opt === 'string') {
                    return { label: opt, value: opt };
                }
                if (typeof opt === 'object' && opt !== null) {
                    const obj = opt as Record<string, unknown>;
                    const label = obj.label || obj.text || obj.value || JSON.stringify(opt);
                    const value = obj.value || obj.id || obj.label || obj.text || JSON.stringify(opt);
                    return { label: String(label), value: String(value) };
                }
                return { label: String(opt), value: String(opt) };
            });
        } else if (question.answer_type === 'yes_no') {
            options = [
                { label: 'Sí', value: 'Sí' },
                { label: 'No', value: 'No' },
            ];
        } else if (question.answer_type === 'scale_5') {
            options = ['1', '2', '3', '4', '5'].map(o => ({ label: o, value: o }));
        } else if (question.answer_type === 'scale_0_10') {
            options = ['0','1','2','3','4','5','6','7','8','9','10'].map(o => ({ label: o, value: o }));
        } else {
            options = [
                { label: 'A favor', value: 'A favor' },
                { label: 'Neutral', value: 'Neutral' },
                { label: 'En contra', value: 'En contra' }
            ];
        }

        const isScale = question.answer_type === 'scale_5' || question.answer_type === 'scale_0_10';

        if (isScale) {
            return (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectOption(question.id, opt.value)}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-slate-200 bg-white hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all text-xl font-black text-slate-700 flex items-center justify-center shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-3 md:gap-4 w-full">
                {options.map((opcion, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => handleSelectOption(question.id, opcion.value)}
                        className="w-full p-5 md:p-6 rounded-3xl border-2 border-transparent bg-white shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:border-[var(--accent-primary)] hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] transition-all text-left text-lg md:text-xl font-black text-ink flex items-center justify-between group transform hover:-translate-y-1"
                    >
                        {opcion.label}
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-[var(--accent-primary)] flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-blue-50 transition-colors">
                            <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden w-full">
            {/* Header Premium - Clean white solid border */}
            <header className="px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-200 bg-white/90 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-200 hover:text-blue-600 rounded-[1rem] hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all"
                        aria-label="Volver atrás"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <span className="text-[10px] sm:text-xs font-black text-[var(--accent-primary)] uppercase tracking-widest bg-[var(--accent-primary)]/10 px-3 py-1.5 rounded-lg">{topic.category}</span>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-1.5 items-center">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${currentStepIndex === -1 ? 'w-8 bg-gradient-brand shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'w-2.5 bg-slate-200'}`} />
                    {questions.map((q, i) => (
                        <div key={q.id} className={`h-2.5 rounded-full transition-all duration-500 ${currentStepIndex === i ? 'w-8 bg-gradient-brand shadow-[0_0_8px_rgba(59,130,246,0.4)]' : (currentStepIndex > i ? 'w-2.5 bg-[var(--accent-primary)]/40' : 'w-2.5 bg-slate-200')}`} />
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col justify-center max-w-4xl w-full mx-auto px-4 sm:px-6">
                <AnimatePresence mode="wait">
                    {currentStepIndex === -1 && (
                        <motion.div
                            key="context"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="py-10 flex flex-col items-center justify-center w-full"
                        >
                            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-stroke/50 text-center shadow-2xl w-full relative overflow-hidden group">
                                {/* Fondos decorativos sutiles */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-32 -mt-32 blur-[60px] opacity-40 pointer-events-none z-0"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full -ml-20 -mb-20 blur-[50px] pointer-events-none z-0"></div>

                                {topic.impact_quote ? (
                                    <div className="relative z-10 mb-8 border-l-4 border-blue-500 pl-6 text-left">
                                        <h3 className="text-2xl sm:text-3xl font-serif italic text-slate-600 leading-relaxed mb-2">
                                            "{topic.impact_quote}"
                                        </h3>
                                    </div>
                                ) : (
                                    <motion.div 
                                        animate={{ 
                                            y: [0, -4, 0],
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-blue-100 relative z-10"
                                    >
                                        <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                                    </motion.div>
                                )}
                                <h2 className="text-3xl sm:text-5xl font-black text-ink mb-6 leading-[1.1] tracking-tight relative z-10">{topic.title}</h2>
                                <p className="text-slate-500 font-medium mb-12 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto relative z-10">
                                    {topic.short_summary}
                                </p>

                                {questions.length > 0 ? (
                                    <button
                                        onClick={() => setCurrentStepIndex(0)}
                                        className="w-full sm:w-2/3 mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-5 sm:py-6 text-xl font-black flex items-center justify-center gap-3 shadow-[0_8px_30px_-8px_rgba(37,99,235,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_40px_-5px_rgba(37,99,235,0.5)] transition-all uppercase tracking-widest relative z-10 group/btn"
                                    >
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34D399]"></span>
                                        Comenzar a opinar 
                                        <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                ) : (
                                    <div className="p-4 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                        Tema sin preguntas configuradas.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {questions.map((question, index) => (
                        currentStepIndex === index && (
                            <motion.div
                                key={question.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="py-10 flex flex-col justify-center w-full max-w-lg mx-auto"
                            >
                                <div className="flex flex-col items-center mb-10 w-full text-center relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-6 border border-blue-100 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Pregunta {index + 1} de {questions.length}
                                    </span>
                                    <h3 className="text-2xl md:text-4xl font-black text-ink leading-tight tracking-tight drop-shadow-sm max-w-2xl">{question.question_text}</h3>
                                </div>

                                {renderQuestionOptions(question)}
                            </motion.div>
                        )
                    ))}

                    {currentStepIndex === questions.length && (
                         <motion.div
                            key="summary"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="py-10 flex flex-col items-center justify-center w-full h-full my-auto"
                        >
                            <div className="bg-ink rounded-[2.5rem] p-10 sm:p-14 text-center shadow-2xl w-full max-w-lg relative overflow-hidden border border-slate-800">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-500/10 pointer-events-none z-0"></div>
                                <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(37,99,235,0.4)] transform rotate-6 animate-pulse z-10 relative">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-sm relative z-10">¡Señal Enviada!</h3>
                                <p className="text-blue-100/80 mb-10 text-lg leading-relaxed font-medium relative z-10">
                                    Tu opinión fue sumada exitosamente a la inteligencia colectiva sobre este tema.
                                </p>

                                <button
                                    onClick={() => onComplete(answers)}
                                    className="w-full bg-white hover:bg-slate-50 text-blue-700 rounded-2xl py-5 text-xl font-black flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all uppercase tracking-widest relative z-10"
                                >
                                    Volver al Hub
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

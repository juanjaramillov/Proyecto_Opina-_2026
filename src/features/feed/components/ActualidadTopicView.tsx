import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ActualidadTopicDetail, TopicQuestion } from '../../signals/services/actualidadService';
import { useInteractionTimer } from '../../../hooks/useInteractionTimer';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
  'https://images.unsplash.com/photo-1614729939124-032f0b5609ce',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  'https://images.unsplash.com/photo-1531297172864-822d1fe15a2e',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  'https://images.unsplash.com/photo-1563206767-5b18f218e8de'
];

const getDeterministicImage = (topic: ActualidadTopicDetail) => {
    // 1. Try real metadata image
    const topicWithExtras = topic as ActualidadTopicDetail & { image?: unknown; cover_image?: unknown };
    const realImg = topic.image_url
        || topic.metadata?.image_url
        || topic.metadata?.image
        || (topic.metadata?.image && typeof topic.metadata.image === 'object' ? (topic.metadata.image as Record<string, unknown>).url : null)
        || topicWithExtras.image
        || topicWithExtras.cover_image;
    if (realImg && typeof realImg === 'string' && realImg.trim() !== '' && realImg !== 'null') return realImg;
    
    // 2. Deterministic Hash Fallback
    const hash = topic.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length]}?auto=format&fit=crop&w=1200&q=80`;
};

interface ActualidadTopicViewProps {
    topic: ActualidadTopicDetail;
    onComplete: (answers: { question_id: string, answer_value: string, response_time_ms?: number }[]) => void;
    onCancel: () => void;
}

export function ActualidadTopicView({ topic, onComplete, onCancel }: ActualidadTopicViewProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 is context, 0...N are questions
    const [answers, setAnswers] = useState<{ question_id: string, answer_value: string, response_time_ms?: number }[]>([]);
    const { startTimer, getElapsedMs } = useInteractionTimer();

    const questions: TopicQuestion[] = useMemo(() => {
        // Fallback safety if no questions
        if (!topic.questions || topic.questions.length === 0) return [];
        return [...topic.questions].sort((a, b) => a.question_order - b.question_order);
    }, [topic.questions]);

    useEffect(() => {
        if (currentStepIndex >= 0 && currentStepIndex < questions.length) {
            startTimer();
        }
    }, [currentStepIndex, questions.length, startTimer]);

    const handleSelectOption = (questionId: string, value: string) => {
        const ms = getElapsedMs();
        const newAnswers = [...answers, { question_id: questionId, answer_value: value, response_time_ms: ms || undefined }];
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
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-[var(--accent-primary)] flex items-center justify-center shrink-0 bg-slate-50 group-hover:bg-brand-50 transition-colors">
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
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-200 hover:text-brand-600 rounded-[1rem] hover:bg-brand-50 hover:border-brand-200 hover:shadow-sm transition-all"
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="py-6 sm:py-10 flex flex-col items-center w-full"
                        >
                            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-stroke/50 shadow-2xl w-full relative overflow-hidden group max-w-4xl mx-auto">
                                {/* Hero Image Block */}
                                <div className="relative w-full h-[250px] sm:h-[350px] rounded-2xl sm:rounded-[1.5rem] overflow-hidden mb-8 shadow-inner group-hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] transition-all duration-500">
                                    <div className="absolute inset-0 bg-slate-900/20 z-10 mix-blend-multiply" />
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center" 
                                        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')`, opacity: 0.5, zIndex: 11, mixBlendMode: 'overlay' }} 
                                    />
                                    <img 
                                        src={getDeterministicImage(topic)} 
                                        alt={topic.title} 
                                        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                                    />
                                    {/* Source Badge Inside Image */}
                                    <div className="absolute top-4 left-4 z-20 flex items-center shadow-lg bg-black/40 backdrop-blur-md rounded-xl p-0.5 border border-white/10 ring-1 ring-black/5">
                                        <div className="bg-gradient-brand text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                            Fuente
                                        </div>
                                        <div className="px-3 py-1.5 text-xs font-bold text-white/90 truncate max-w-[150px] sm:max-w-xs drop-shadow-sm">
                                            {topic.source_domain || topic.source_title || 'Medio Independiente'}
                                        </div>
                                    </div>
                                    {/* CTA Externo Floating */}
                                    {!!(topic.metadata?.url || topic.metadata?.link) && (
                                        <div className="absolute bottom-4 right-4 z-20">
                                            <a 
                                                href={(topic.metadata.url || topic.metadata.link) as string} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105"
                                            >
                                                <span>Leer Nota Original</span>
                                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Content Body */}
                                <div className="max-w-3xl mx-auto text-left relative z-10">
                                    <h2 className="text-3xl sm:text-5xl font-black text-ink mb-6 leading-[1.1] tracking-tight">{topic.title}</h2>
                                    
                                    {topic.impact_quote && (
                                        <div className="mb-8 border-l-4 border-[var(--accent-primary)] pl-6">
                                            <h3 className="text-xl sm:text-2xl font-serif italic text-slate-600 leading-relaxed">
                                                "{topic.impact_quote}"
                                            </h3>
                                        </div>
                                    )}

                                    <div className="prose prose-lg sm:prose-xl text-slate-600 mb-12">
                                        <p className="leading-relaxed font-medium">{topic.short_summary}</p>
                                    </div>

                                    {/* Action Footprint */}
                                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm inline-block">
                                            Queremos saber qué piensas
                                        </h4>
                                        {questions.length > 0 ? (
                                            <button
                                                onClick={() => setCurrentStepIndex(0)}
                                                className="w-full sm:w-2/3 mx-auto bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-5 sm:py-6 text-xl sm:text-2xl font-black flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.5)] hover:-translate-y-1 transition-all relative overflow-hidden group/btn"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                                                <span className="w-2.5 h-2.5 bg-accent-400 rounded-full animate-pulse shadow-[0_0_12px_#34D399]"></span>
                                                Comenzar a opinar 
                                                <span className="text-sm border border-slate-700 bg-slate-800 text-slate-300 px-3 py-1 rounded-full hidden sm:inline-block ml-2">{questions.length} preguntas</span>
                                                <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                            </button>
                                        ) : (
                                            <div className="p-4 bg-warning-50 text-warning-600 border border-warning-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 w-full">
                                                Tema sin preguntas configuradas.
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full mb-6 border border-brand-100 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
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
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand/10 via-transparent to-accent/10 pointer-events-none z-0"></div>
                                <div className="w-24 h-24 bg-brand-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(37,99,235,0.4)] transform rotate-6 animate-pulse z-10 relative">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-sm relative z-10">¡Señal Enviada!</h3>
                                <p className="text-brand-100/80 mb-10 text-lg leading-relaxed font-medium relative z-10">
                                    Tu opinión fue sumada exitosamente a la inteligencia colectiva sobre este tema.
                                </p>

                                <button
                                    onClick={() => onComplete(answers)}
                                    className="w-full bg-white hover:bg-slate-50 text-brand-700 rounded-2xl py-5 text-xl font-black flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all uppercase tracking-widest relative z-10"
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

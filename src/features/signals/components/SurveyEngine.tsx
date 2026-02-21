import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: string;
    type: 'choice' | 'scale' | 'text';
    question: string;
    options?: string[];
}

interface SurveyEngineProps {
    questions: Question[];
    title: string;
    onComplete: (answers: Record<string, string | number>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const SurveyEngine: React.FC<SurveyEngineProps> = ({
    questions,
    title,
    onComplete,
    onCancel,
    isSubmitting = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleAnswer = (value: string | number) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    return (
        <div className="relative">
            {/* Header / Progress */}
            <div className="px-8 pt-8 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Profundidad</span>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Pregunta {currentIndex + 1} de {questions.length}</span>
                    <span>{Math.round(progress)}% completado</span>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-10 pt-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="min-h-[220px] flex flex-col justify-center"
                    >
                        <h3 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">
                            {currentQuestion.question}
                        </h3>

                        <div className="space-y-3">
                            {currentQuestion.type === 'choice' && currentQuestion.options?.map((opt: string) => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isSubmitting}
                                    className="w-full py-4 px-6 text-left rounded-2xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 font-bold text-slate-700 transition-all flex justify-between group"
                                >
                                    {opt}
                                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                                </button>
                            ))}

                            {currentQuestion.type === 'scale' && (
                                <div className="flex justify-between gap-2 mt-4">
                                    {(currentQuestion.id === 'recomendacion'
                                        ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                                        : [1, 2, 3, 4, 5]
                                    ).map(val => (
                                        <button
                                            key={val}
                                            onClick={() => handleAnswer(val)}
                                            disabled={isSubmitting}
                                            className="flex-1 aspect-square md:aspect-auto md:py-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 font-black text-slate-800 transition-all"
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-b-3xl">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="font-bold text-slate-900">Enviando señal maestra...</span>
                </div>
            )}
        </div>
    );
};

export default SurveyEngine;

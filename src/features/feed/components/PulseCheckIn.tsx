import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type QuestionType = 'binary' | 'ternary' | 'scale';

export interface PulseQuestion {
    id: string;
    text: string;
    type: QuestionType;
    options?: { value: string, label: string, icon?: string, colorClass?: string }[];
}

interface PulseCheckInProps {
    blockTitle: string;
    questions: PulseQuestion[];
    onComplete: (answers: Record<string, string>) => void;
    onCancel: () => void;
}

export default function PulseCheckIn({ blockTitle, questions, onComplete, onCancel }: PulseCheckInProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const currentQuestion = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    const handleAnswer = (value: string) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (isLast) {
            onComplete(newAnswers);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onCancel} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-light flex items-center justify-between bg-surface">
                    <div>
                        <span className="badge badge-primary mb-1">Tu Pulso</span>
                        <h3 className="font-bold text-ink">{blockTitle}</h3>
                    </div>
                    <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-text-secondary transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Progress */}
                <div className="h-1.5 w-full bg-slate-100">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Content */}
                <div className="p-8 flex-1 min-h-[300px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full text-center"
                        >
                            <h2 className="text-xl md:text-2xl font-black text-ink mb-10 leading-tight">
                                {currentQuestion.text}
                            </h2>

                            <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
                                {currentQuestion.type === 'binary' && currentQuestion.options && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {currentQuestion.options.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleAnswer(opt.value)}
                                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${opt.colorClass || 'border-slate-200 hover:border-primary bg-white text-ink hover:bg-primary/5'}`}
                                            >
                                                {opt.icon && <span className="material-symbols-outlined text-3xl">{opt.icon}</span>}
                                                <span className="font-bold">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.type === 'ternary' && currentQuestion.options && (
                                    <div className="flex flex-col gap-3">
                                        {currentQuestion.options.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleAnswer(opt.value)}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95 text-left ${opt.colorClass || 'border-slate-200 hover:border-primary bg-white text-ink hover:bg-primary/5'}`}
                                            >
                                                {opt.icon && (
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                        <span className="material-symbols-outlined">{opt.icon}</span>
                                                    </div>
                                                )}
                                                <span className="font-bold flex-1">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.type === 'scale' && (
                                    <div className="flex items-center justify-between gap-2 px-2">
                                        {[1, 2, 3, 4, 5].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => handleAnswer(val.toString())}
                                                className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-200 bg-white shadow-sm flex items-center justify-center text-lg md:text-xl font-black text-ink hover:border-primary hover:bg-primary hover:text-white transition-all active:scale-90"
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

                {/* Footer Info */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                        Pregunta {currentIndex + 1} de {questions.length}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        Aprox. 30 segs
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

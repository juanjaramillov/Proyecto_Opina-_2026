import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type QuestionType = 'scale_1_5' | 'single_choice' | 'yes_no' | 'rank_top3' | 'short_text';

interface DepthQuestionCardProps {
    question: {
        id: string;
        type: QuestionType | string;
        question: string;
        options?: string[];
        subtext?: string;
    };
    onAnswer: (value: any) => void;
    onBack?: () => void;
    isFirst: boolean;
    isLast: boolean;
    currentValue?: string | number;
    isSubmitting?: boolean;
}

const DepthQuestionCard: React.FC<DepthQuestionCardProps> = ({
    question,
    onAnswer,
    onBack,
    isFirst,
    isLast,
    currentValue,
    isSubmitting
}) => {
    const [localValue, setLocalValue] = useState<string | number | undefined>(currentValue);
    const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

    useEffect(() => {
        setLocalValue(currentValue);
        setIsAutoAdvancing(false);
    }, [currentValue, question.id]);

    const handleSelection = (val: string | number) => {
        if (isAutoAdvancing || isSubmitting) return;
        setLocalValue(val);

        if (question.type !== 'short_text' && question.type !== 'text') {
            setIsAutoAdvancing(true);
            setTimeout(() => onAnswer(val), 350);
        }
    };

    // Handle Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitting || isAutoAdvancing) return;

            // Scale 1-5 shortcuts
            if (question.type === 'scale_1_5' || question.type === 'scale') {
                if (e.key >= '1' && e.key <= '5') {
                    handleSelection(Number(e.key));
                }
            }

            // Enter for Next (if value exists)
            if (e.key === 'Enter' && localValue !== undefined) {
                onAnswer(localValue);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [question.type, localValue, isSubmitting, isAutoAdvancing, onAnswer]);

    const renderInput = () => {
        const type = question.type;

        if (type === 'scale_1_5' || type === 'scale') {
            const max = type === 'scale' && question.id === 'recomendacion' ? 10 : 5;
            const values = Array.from({ length: max + 1 }, (_, i) => i === 0 && max === 5 ? null : i).filter(v => v !== null);

            return (
                <div className="flex flex-wrap justify-between gap-2">
                    {values.map((val: any) => (
                        <button
                            key={val}
                            onClick={() => handleSelection(val)}
                            disabled={isSubmitting}
                            className={`flex-1 min-w-[40px] aspect-square rounded-2xl border-2 font-black text-lg transition-all active:scale-95 ${localValue === val
                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                                : 'bg-white border-slate-100 text-slate-800 hover:border-primary-200 hover:bg-primary-50'
                                }`}
                        >
                            {val}
                        </button>
                    ))}
                    <div className="w-full flex justify-between px-1 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mínimo</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Máximo</span>
                    </div>
                </div>
            );
        }

        if (type === 'single_choice' || type === 'choice') {
            return (
                <div className="grid grid-cols-1 gap-3">
                    {question.options?.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection(opt)}
                            disabled={isSubmitting}
                            className={`w-full p-4 text-left rounded-2xl border-2 font-bold transition-all flex justify-between items-center group active:scale-[0.98] ${localValue === opt
                                ? 'bg-primary-50 border-primary-600 text-primary-900'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${localValue === opt ? 'border-primary-600 bg-primary-600' : 'border-slate-200'}`}>
                                {localValue === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        if (type === 'yes_no') {
            const options = ['Sí', 'No'];
            return (
                <div className="grid grid-cols-2 gap-4">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection(opt)}
                            disabled={isSubmitting}
                            className={`p-6 rounded-2xl border-2 font-black text-xl transition-all active:scale-95 ${localValue === opt
                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                                : 'bg-white border-slate-100 text-slate-800 hover:border-primary-200 hover:bg-primary-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            );
        }

        if (type === 'short_text' || type === 'text') {
            return (
                <div className="space-y-2">
                    <textarea
                        value={localValue || ''}
                        onChange={(e) => handleSelection(e.target.value.slice(0, 140))}
                        placeholder="Si quieres, una frase..."
                        disabled={isSubmitting || isAutoAdvancing}
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all text-slate-800 font-medium min-h-[120px] resize-none"
                    />
                    <div className="flex justify-end">
                        <span className={`text-[10px] font-black tracking-widest ${(String(localValue || "").length) >= 140 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {String(localValue || "").length}/140
                        </span>
                    </div>
                </div>
            );
        }

        return <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">Tipo de pregunta no soportado: {type}</div>;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col gap-6"
        >
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {question.question}
                </h2>
                {question.subtext && (
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {question.subtext}
                    </p>
                )}
            </div>

            <div className="min-h-[280px]">
                {renderInput()}
            </div>

            <div className="flex items-center justify-between pt-6 mt-2 min-h-[50px]">
                {!isFirst ? (
                    <button
                        onClick={onBack}
                        disabled={isSubmitting || isAutoAdvancing}
                        className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest disabled:opacity-50 p-2 -ml-2 rounded-lg"
                    >
                        ← Volver atrás
                    </button>
                ) : <div />}

                {(question.type === 'short_text' || question.type === 'text' || isSubmitting) && (
                    <button
                        onClick={() => onAnswer(localValue)}
                        disabled={isSubmitting || isAutoAdvancing || (localValue === undefined)}
                        className={`py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-md ${localValue !== undefined
                            ? 'bg-primary-600 text-white shadow-primary-200'
                            : 'bg-slate-100 text-slate-400 border-2 border-transparent shadow-none'
                            }`}
                    >
                        {isSubmitting ? 'Guardando...' : (isLast ? 'Finalizar' : 'Siguiente')}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default DepthQuestionCard;

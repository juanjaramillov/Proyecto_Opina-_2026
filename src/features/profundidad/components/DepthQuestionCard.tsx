import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export type QuestionType =
    | 'scale_1_5'
    | 'scale'
    | 'nps_0_10'
    | 'single_choice'
    | 'choice'
    | 'yes_no'
    | 'rank_top3'
    | 'short_text'
    | 'text';

interface DepthQuestionCardProps {
    question: {
        id: string;
        type: QuestionType | string;
        question: string;
        options?: string[];
        subtext?: string;
    };
    onAnswer: (value: string | number) => void;
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

    const handleSelection = useCallback((val: string | number) => {
        if (isAutoAdvancing || isSubmitting) return;
        setLocalValue(val);

        if (question.type !== 'short_text' && question.type !== 'text') {
            setIsAutoAdvancing(true);
            setTimeout(() => onAnswer(val), 350);
        }
    }, [isAutoAdvancing, isSubmitting, question.type, onAnswer]);

    // Handle Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitting || isAutoAdvancing) return;

            // Scale shortcuts
            if (question.type === 'scale_1_5' || question.type === 'scale') {
                if (e.key >= '1' && e.key <= '5') {
                    handleSelection(Number(e.key));
                }
                // si es scale 0..10 (caso legacy recomendacion), permite 0..9
                if (question.type === 'scale' && question.id === 'recomendacion') {
                    if (e.key >= '0' && e.key <= '9') {
                        handleSelection(Number(e.key));
                    }
                }
            }

            // NPS 0..10 (nuevo tipo): permite 0..9 por teclado (10 solo click, es ok)
            if (question.type === 'nps_0_10') {
                if (e.key >= '0' && e.key <= '9') {
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
    }, [question.type, question.id, localValue, isSubmitting, isAutoAdvancing, onAnswer, handleSelection]);

    const renderInput = () => {
        const type = question.type;

        if (type === 'scale_1_5' || type === 'scale' || type === 'nps_0_10') {
            const max =
                type === 'nps_0_10'
                    ? 10
                    : (type === 'scale' && question.id === 'recomendacion')
                        ? 10
                        : 5;

            const values = Array.from({ length: max + 1 }, (_, i) =>
                i === 0 && max === 5 ? null : i
            ).filter(v => v !== null);

            return (
                <div className="flex flex-col gap-6 w-full animate-in fade-in zoom-in duration-500">
                    <div className={`grid ${max === 10 ? 'grid-cols-11 gap-1 sm:gap-2' : 'grid-cols-5 gap-3'} w-full`}>
                        {values.map((val) => {
                            let colorClass = 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-1';
                            let activeClass = 'bg-slate-900 border-slate-900 text-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] scale-105 z-10';
                            let glowColor = '';

                            if (max === 10) {
                                if (val <= 6) {
                                    activeClass = 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200 scale-110 z-10';
                                    colorClass = 'text-rose-700 bg-white border-rose-200 hover:bg-rose-50 hover:border-rose-300 hover:shadow-md hover:-translate-y-1';
                                    glowColor = 'hover:shadow-rose-100';
                                } else if (val <= 8) {
                                    activeClass = 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200 scale-110 z-10';
                                    colorClass = 'text-amber-700 bg-white border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md hover:-translate-y-1';
                                    glowColor = 'hover:shadow-amber-100';
                                } else {
                                    activeClass = 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110 z-10';
                                    colorClass = 'text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md hover:-translate-y-1';
                                    glowColor = 'hover:shadow-emerald-100';
                                }
                            } else {
                                activeClass = 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200 scale-110 z-10';
                                colorClass = 'text-primary-700 bg-white border-primary-200 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md hover:-translate-y-1';
                            }

                            return (
                                <button
                                    key={val}
                                    onClick={() => handleSelection(val)}
                                    disabled={isSubmitting}
                                    className={`relative w-full aspect-[4/5] sm:aspect-square flex items-center justify-center rounded-2xl border-2 font-black text-sm sm:text-lg transition-all duration-300 active:scale-95 group overflow-hidden ${localValue === val ? activeClass : `${colorClass} ${glowColor}`
                                        }`}
                                >
                                    {localValue !== val && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                    <span className="relative z-10 drop-shadow-sm">{val}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full flex justify-between px-2">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-2xl sm:text-3xl opacity-90 drop-shadow-sm transition-transform hover:scale-110" role="img" aria-label="Not likely">😞</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">{max === 10 ? 'Nada probable' : 'Mínimo'}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-2xl sm:text-3xl opacity-90 drop-shadow-sm transition-transform hover:scale-110" role="img" aria-label="Very likely">🤩</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">{max === 10 ? 'Muy probable' : 'Máximo'}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'single_choice' || type === 'choice') {
            return (
                <div className="grid grid-cols-1 gap-3 w-full animate-in slide-in-from-bottom-4 duration-500">
                    {question.options?.map((opt, index) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection(opt)}
                            disabled={isSubmitting}
                            className={`relative text-left w-full p-5 rounded-2xl border-2 font-bold transition-all duration-300 flex justify-between items-center group overflow-hidden ${localValue === opt
                                ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-lg shadow-primary-500/20 scale-[1.02] z-10'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-primary-200 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {localValue !== opt && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                            )}
                            <span className="relative z-10 leading-snug">{opt}</span>
                            <div
                                className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-all flex-shrink-0 ml-4 ${localValue === opt ? 'border-primary-600 bg-primary-600 scale-110' : 'border-slate-200 group-hover:border-primary-300'
                                    }`}
                            >
                                {localValue === opt && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        if (type === 'yes_no') {
            const options = ['Sí', 'No'];
            return (
                <div className="grid grid-cols-2 gap-4 animate-in zoom-in duration-500">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection(opt)}
                            disabled={isSubmitting}
                            className={`p-8 rounded-3xl border-2 font-black text-2xl transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-2 group ${localValue === opt
                                ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-500/30 scale-105 z-10'
                                : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-4xl transition-transform duration-300 ${localValue === opt ? 'scale-110' : 'group-hover:scale-110 text-slate-400'}`}>
                                {opt === 'Sí' ? 'check_circle' : 'cancel'}
                            </span>
                            {opt}
                        </button>
                    ))}
                </div>
            );
        }

        if (type === 'short_text' || type === 'text') {
            return (
                <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="relative group">
                        <textarea
                            value={localValue || ''}
                            onChange={(e) => handleSelection(e.target.value.slice(0, 140))}
                            placeholder="Si quieres, una frase... (Opcional)"
                            disabled={isSubmitting || isAutoAdvancing}
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-primary-500 focus:bg-white focus:outline-none focus:shadow-xl focus:shadow-primary-500/10 transition-all text-slate-800 font-medium min-h-[140px] resize-none text-lg leading-relaxed z-10 relative"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-emerald-500 opacity-0 group-focus-within:opacity-10 rounded-[1.4rem] -z-0 transition-opacity duration-500 blur-lg" />
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">keyboard</span>
                            Presiona Enter para enviar
                        </span>
                        <span
                            className={`text-[11px] font-black tracking-widest px-3 py-1 rounded-full ${String(localValue || '').length >= 140 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            {String(localValue || '').length} / 140
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">error</span>
                <div>
                    <h4 className="font-bold text-sm">Tipo de pregunta no soportado</h4>
                    <p className="text-xs opacity-80 mt-1">El formato '{type}' no pudo ser renderizado.</p>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col gap-6"
        >
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {question.question}
                </h2>
                {question.subtext && (
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{question.subtext}</p>
                )}
            </div>

            <div className="min-h-[160px]">{renderInput()}</div>

            <div className="flex items-center justify-between pt-6 mt-2 min-h-[50px]">
                {!isFirst ? (
                    <button
                        onClick={onBack}
                        disabled={isSubmitting || isAutoAdvancing}
                        className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest disabled:opacity-50 p-2 -ml-2 rounded-lg"
                    >
                        ← Volver
                    </button>
                ) : (
                    <div />
                )}

                {(question.type === 'short_text' || question.type === 'text' || isSubmitting) && (
                    <button
                        onClick={() => localValue !== undefined && onAnswer(localValue)}
                        disabled={isSubmitting || isAutoAdvancing || localValue === undefined}
                        className={`py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-md ${localValue !== undefined
                            ? 'bg-primary-600 text-white shadow-primary-200'
                            : 'bg-slate-100 text-slate-400 border-2 border-transparent shadow-none'
                            }`}
                    >
                        {isSubmitting ? 'Guardando...' : isLast ? 'Enviar' : 'Continuar'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default DepthQuestionCard;

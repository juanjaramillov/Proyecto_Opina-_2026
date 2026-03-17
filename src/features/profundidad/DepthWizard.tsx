import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DepthHUD from './components/DepthHUD';
import DepthQuestionCard from './components/DepthQuestionCard';
import DepthComplete from './components/DepthComplete';
import { logger } from '../../lib/logger';

interface DepthWizardProps {
    packTitle: string;
    questions: Array<{
        id: string;
        type: string;
        question: string;
        options?: string[];
        subtext?: string;
    }>;
    onSave: (answers: Record<string, string | number>) => Promise<void>;
    onCancel: () => void;
    onComplete: () => void;
}

const DepthWizard: React.FC<DepthWizardProps> = ({
    packTitle,
    questions,
    onSave,
    onCancel,
    onComplete
}) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = async (value: string | number) => {
        const newAnswers = { ...answers, [questions[step].id]: value };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                await onSave(newAnswers);
                setIsFinished(true);
            } catch (error) {
                logger.error('[DepthWizard] Error saving answers:', error);
                // Error handling is managed by the parent via toast usually,
                // but we keep loading off
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    // Prepare summary bullets for DepthComplete
    // We pick 2-3 significant answers to show
    const summary = questions
        .slice(0, 3)
        .map(q => {
            const ans = answers[q.id];
            if (!ans) return null;
            return `${q.question.split('?')[0]}: ${ans}`;
        })
        .filter(Boolean) as string[];

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 min-h-[400px] flex flex-col relative overflow-hidden group">
            {/* Soft decorative background glows for Light Theme */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[80px] pointer-events-none transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] pointer-events-none transition-colors duration-700" />

            {/* Botón Cerrar (X) absoluto */}
            {!isFinished && (
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-50 shadow-sm border border-slate-200/60"
                    aria-label="Cerrar panel"
                >
                    <span className="material-symbols-outlined font-bold text-xl">close</span>
                </button>
            )}

            <div className="relative z-10 flex-1 flex flex-col">
                {!isFinished && (
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h1 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-gradient-brand shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                            {packTitle}
                        </h1>
                        <DepthHUD
                            currentStep={step + 1}
                            totalSteps={questions.length}
                        />
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {isFinished ? (
                            <DepthComplete
                                key="complete"
                                onGoToHub={onComplete}
                                summary={summary}
                            />
                        ) : (
                            <DepthQuestionCard
                                key={questions[step].id}
                                question={questions[step]}
                                onAnswer={handleAnswer}
                                onBack={handleBack}
                                isFirst={step === 0}
                                isLast={step === questions.length - 1}
                                currentValue={answers[questions[step].id]}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DepthWizard;

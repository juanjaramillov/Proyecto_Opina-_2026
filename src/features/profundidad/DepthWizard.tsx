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
        <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 min-h-[500px] flex flex-col">
            {!isFinished && (
                <div className="mb-6">
                    <h1 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-4">
                        {packTitle}
                    </h1>
                    <DepthHUD
                        currentStep={step + 1}
                        totalSteps={questions.length}
                        onExit={onCancel}
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
    );
};

export default DepthWizard;

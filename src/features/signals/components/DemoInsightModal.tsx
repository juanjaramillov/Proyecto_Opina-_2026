import { useState } from 'react';
import { type DemoBrand, type DemoInsightQuestion } from '../utils/demoData';

type Props = {
    brand: DemoBrand;
    questions: DemoInsightQuestion[];
    onClose: () => void;
    introMessage?: string; // NEW: Custom intro message
};

const DIMENSION_LABELS: Record<string, string> = {
    price: 'Precio / Costo',
    quality: 'Calidad Percibida',
    trust: 'Nivel de Confianza',
    experience: 'Experiencia de Uso',
    value: 'Valor / Propuesta'
};

export default function DemoInsightModal({ brand, questions, onClose, introMessage }: Props) {
    // If introMessage is present, start at step -1 (intro screen)
    const [idx, setIdx] = useState(introMessage ? -1 : 0);
    const [complete, setComplete] = useState(false);

    const currentQ = questions[idx];

    const handleStart = () => {
        setIdx(0);
    };

    const handleAnswer = () => {
        if (idx < questions.length - 1) {
            setIdx(idx + 1);
        } else {
            setComplete(true);
        }
    };

    const progress = (idx >= 0) ? ((idx) / questions.length) * 100 : 0;

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative">

                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-black tracking-widest text-gray-400 uppercase flex items-center gap-2">
                            <span>{brand.emoji}</span> Insight: {brand.name}
                        </span>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 font-bold text-xl leading-none">&times;</button>
                    </div>

                    {/* Progress Bar (hidden in intro) */}
                    {!complete && idx >= 0 && (
                        <div className="h-1 w-full bg-gray-100">
                            <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    <div className="p-8">
                        {/* STATE: INTRO */}
                        {idx === -1 && introMessage && (
                            <div className="text-center py-6 animate-fade-in">
                                <div className="text-5xl mb-6">{brand.emoji}</div>
                                <h2 className="text-2xl font-black mb-4 text-gray-900 leading-tight">{introMessage}</h2>
                                <p className="text-gray-500 mb-8 font-medium">Ayúdanos a entender por qué es tu favorito.</p>
                                <button
                                    onClick={handleStart}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Comenzar Insight →
                                </button>
                            </div>
                        )}

                        {/* STATE: QUESTIONS */}
                        {idx >= 0 && !complete && (
                            <div className="animate-fade-in">
                                <div className="mb-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                                    {DIMENSION_LABELS[currentQ.dimension]}
                                </div>
                                <h2 className="text-xl font-black text-gray-900 mb-8 leading-tight">
                                    {currentQ.text}
                                </h2>

                                <div className="space-y-3">
                                    {currentQ.options.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleAnswer()}
                                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 font-bold text-gray-700 transition-all active:scale-[0.98]"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STATE: COMPLETE */}
                        {complete && (
                            <div className="text-center py-10 animate-fade-in">
                                <div className="text-6xl mb-6">✅</div>
                                <h2 className="text-3xl font-black mb-4">¡Insight Completado!</h2>
                                <p className="text-gray-500 mb-8">Gracias por definir el perfil de {brand.name}.</p>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                                >
                                    Volver
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

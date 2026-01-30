import { useState, useEffect } from 'react';
import { type DemoDuel, demoReasons } from '../utils/demoData';

type Props = {
    duel: DemoDuel;
    onClose: () => void;
    onComplete: (duelId: string, winnerId: string, intensity: 'low' | 'high', reason: string) => void;
    progressLabel?: string;
};

type Step = 'pick' | 'intensity' | 'reason';

export default function DemoSignalModal({ duel, onClose, onComplete, progressLabel }: Props) {
    const [step, setStep] = useState<Step>('pick');
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [intensity, setIntensity] = useState<'low' | 'high' | null>(null);

    useEffect(() => {
        setStep('pick');
        setWinnerId(null);
        setIntensity(null);
    }, [duel]);

    const handlePick = (id: string) => {
        setWinnerId(id);
        setStep('intensity');
    };

    const handleIntensity = (val: 'low' | 'high') => {
        setIntensity(val);
        setStep('reason');
    };

    const handleReason = (reason: string) => {
        if (winnerId && intensity) {
            onComplete(duel.id, winnerId, intensity, reason);
        }
    };

    const winnerBrand = winnerId === duel.brandA.id ? duel.brandA : duel.brandB;

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl pointer-events-auto transform transition-all">

                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-black tracking-widest text-gray-400 uppercase">
                            {progressLabel || 'Versus'}
                        </span>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 font-bold text-xl leading-none">&times;</button>
                    </div>

                    <div className="p-8">

                        {/* STEP 1: PICK */}
                        {step === 'pick' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-black text-center mb-8">¿Con cuál te quedas?</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handlePick(duel.brandA.id)}
                                        className="aspect-square rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-4 group"
                                    >
                                        <div className="text-6xl transform group-hover:scale-110 transition-transform">{duel.brandA.emoji}</div>
                                        <span className="font-extrabold text-lg text-gray-900">{duel.brandA.name}</span>
                                    </button>

                                    <button
                                        onClick={() => handlePick(duel.brandB.id)}
                                        className="aspect-square rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-transparent hover:border-red-500 transition-all flex flex-col items-center justify-center gap-4 group"
                                    >
                                        <div className="text-6xl transform group-hover:scale-110 transition-transform">{duel.brandB.emoji}</div>
                                        <span className="font-extrabold text-lg text-gray-900">{duel.brandB.name}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: INTENSITY */}
                        {step === 'intensity' && winnerBrand && (
                            <div className="animate-fade-in text-center">
                                <div className="text-6xl mb-4">{winnerBrand.emoji}</div>
                                <h2 className="text-2xl font-black mb-2">Elegiste {winnerBrand.name}</h2>
                                <p className="text-gray-500 mb-8 font-medium">¿Qué tan seguro estás?</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleIntensity('low')}
                                        className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 font-bold text-gray-600 hover:text-gray-900 transition-all"
                                    >
                                        🤔 Apenas...
                                    </button>
                                    <button
                                        onClick={() => handleIntensity('high')}
                                        className="p-6 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold shadow-lg transform hover:scale-105 transition-all"
                                    >
                                        🔥 ¡Por lejos!
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: REASON */}
                        {step === 'reason' && winnerBrand && (
                            <div className="animate-fade-in text-center">
                                <h2 className="text-2xl font-black mb-8">¿Por qué ganaron?</h2>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {demoReasons.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => handleReason(r)}
                                            className="px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-sm font-bold text-gray-700 transition-all"
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Step Indicator */}
                    <div className="flex justify-center gap-2 pb-6">
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'pick' ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'intensity' ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 'reason' ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    </div>

                </div>
            </div>
        </div>
    );
}

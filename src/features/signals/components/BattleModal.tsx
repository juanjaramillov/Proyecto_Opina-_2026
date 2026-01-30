import { useState, useEffect } from 'react';
import { ActiveBattle } from '../../../services/signalService';
import { demoReasons } from '../utils/demoData';

type Props = {
    battle: ActiveBattle;
    onClose: () => void;
    onComplete: (battleId: string, optionId: string, intensity: 'low' | 'high', reason: string) => void;
    progressLabel?: string;
};

type Step = 'pick' | 'intensity' | 'reason';

export default function BattleModal({ battle, onClose, onComplete, progressLabel }: Props) {
    const [step, setStep] = useState<Step>('pick');
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [intensity, setIntensity] = useState<'low' | 'high' | null>(null);

    // Reset when battle changes
    useEffect(() => {
        setStep('pick');
        setSelectedOptionId(null);
        setIntensity(null);
    }, [battle]);

    const handlePick = (id: string) => {
        setSelectedOptionId(id);
        setStep('intensity');
    };

    const handleIntensity = (val: 'low' | 'high') => {
        setIntensity(val);
        setStep('reason');
    };

    const handleReason = (reason: string) => {
        if (selectedOptionId && intensity) {
            onComplete(battle.id, selectedOptionId, intensity, reason);
        }
    };

    const brandA = battle.options[0];
    const brandB = battle.options[1];

    if (!brandA || !brandB) return null;

    const selectedOption = battle.options.find(o => o.id === selectedOptionId);

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
                                        onClick={() => handlePick(brandA.id)}
                                        className="aspect-square rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-4 group"
                                    >
                                        {brandA.image_url ? (
                                            <img src={brandA.image_url} alt={brandA.label} className="w-20 h-20 object-contain mix-blend-multiply" />
                                        ) : (
                                            <div className="text-6xl transform group-hover:scale-110 transition-transform">🔸</div>
                                        )}
                                        <span className="font-extrabold text-lg text-gray-900">{brandA.label}</span>
                                    </button>

                                    <button
                                        onClick={() => handlePick(brandB.id)}
                                        className="aspect-square rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-transparent hover:border-red-500 transition-all flex flex-col items-center justify-center gap-4 group"
                                    >
                                        {brandB.image_url ? (
                                            <img src={brandB.image_url} alt={brandB.label} className="w-20 h-20 object-contain mix-blend-multiply" />
                                        ) : (
                                            <div className="text-6xl transform group-hover:scale-110 transition-transform">🔹</div>
                                        )}
                                        <span className="font-extrabold text-lg text-gray-900">{brandB.label}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: INTENSITY */}
                        {step === 'intensity' && selectedOption && (
                            <div className="animate-fade-in text-center">
                                {selectedOption.image_url ? (
                                    <img src={selectedOption.image_url} alt={selectedOption.label} className="w-24 h-24 object-contain mx-auto mb-4" />
                                ) : (
                                    <div className="text-6xl mb-4">⭐</div>
                                )}
                                <h2 className="text-2xl font-black mb-2">Elegiste {selectedOption.label}</h2>
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
                        {step === 'reason' && selectedOption && (
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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LugarSignalWizardProps {
    place: any;
    onClose: () => void;
    onComplete: (data: any) => void;
}

const VIBE_CHIPS = [
    "Relajado", "Ruidoso", "Romántico", "Familiar", "Negocios", "Fiesta", "Trendy", "Acogedor", "Rápido"
];

export default function LugarSignalWizard({ place, onClose, onComplete }: LugarSignalWizardProps) {
    const [step, setStep] = useState(1);
    const totalSteps = 6; // 5 questions + 1 success screen

    // Form State
    const [sabor, setSabor] = useState<number>(3);
    const [atencion, setAtencion] = useState<number>(3);
    const [precio, setPrecio] = useState<number>(3);
    const [vibes, setVibes] = useState<string[]>([]);
    const [notaGlobal, setNotaGlobal] = useState<number>(5);

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(prev => prev + 1);
        }
    };

    const handleComplete = () => {
        onComplete({
            sabor,
            atencion,
            precio,
            vibes,
            notaGlobal
        });
    };

    const slideVariants = {
        enter: { x: 50, opacity: 0, scale: 0.95 },
        center: { x: 0, opacity: 1, scale: 1 },
        exit: { x: -50, opacity: 0, scale: 0.95 }
    };

    const renderProgressBar = () => {
        // Ocultar barra en pantalla de éxito
        if (step === totalSteps) return null;
        
        return (
            <div className="w-full px-6 pt-6 pb-2 z-50">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <span className="text-white/60 font-bold text-sm tracking-widest uppercase">
                        {step} de {totalSteps - 1}
                    </span>
                    <div className="w-9 h-9"></div> {/* Placeholder for balance */}
                </div>
                <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex-1 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary-500"
                                initial={{ width: 0 }}
                                animate={{ width: s <= step ? '100%' : '0%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-ink text-white flex flex-col overflow-hidden"
        >
            {/* Background Blur Effect */}
            <div className="absolute inset-0 z-0">
                <img src={place.image} alt="Background" className="w-full h-full object-cover opacity-20 blur-2xl scale-110 saturate-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {renderProgressBar()}

                <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 w-full max-w-md mx-auto relative">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: SABOR */}
                        {step === 1 && (
                            <motion.div key="step-1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-slate-700/50 backdrop-blur-md">
                                    <span className="text-4xl">🍕</span>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 leading-tight">¿Qué tal <br/> el sabor?</h2>
                                <p className="text-slate-400 font-medium mb-12">Evalúa la calidad de la comida.</p>

                                <div className="flex justify-between w-full mb-8">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button 
                                            key={val}
                                            onClick={() => setSabor(val)}
                                            className={`relative w-14 h-14 flex items-center justify-center rounded-2xl text-3xl transition-all duration-300 ${sabor === val ? 'bg-primary-500 scale-110 shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-2 ring-white/20' : 'bg-slate-800/80 grayscale opacity-50 hover:opacity-100 hover:grayscale-0'}`}
                                        >
                                            {val === 1 && "🤢"}
                                            {val === 2 && "😕"}
                                            {val === 3 && "😐"}
                                            {val === 4 && "😋"}
                                            {val === 5 && "🤯"}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleNext} className="w-full py-4 bg-white text-ink rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">Siguiente</button>
                            </motion.div>
                        )}

                        {/* STEP 2: ATENCIÓN */}
                        {step === 2 && (
                            <motion.div key="step-2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-slate-700/50 backdrop-blur-md text-emerald-400">
                                    <span className="material-symbols-outlined text-[40px]">support_agent</span>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 leading-tight">La atención</h2>
                                <p className="text-slate-400 font-medium mb-12">¿Cómo te trataron el personal?</p>

                                <div className="flex justify-between w-full mb-8">
                                     {[1, 2, 3, 4, 5].map((val) => (
                                        <button 
                                            key={val}
                                            onClick={() => setAtencion(val)}
                                            className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 ${atencion === val ? 'bg-emerald-500 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white' : 'bg-slate-800/80 text-slate-500 hover:text-white'}`}
                                        >
                                            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: `'FILL' ${atencion >= val ? 1 : 0}`}}>
                                                star
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleNext} className="w-full py-4 bg-white text-ink rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">Siguiente</button>
                            </motion.div>
                        )}

                        {/* STEP 3: PRECIO */}
                        {step === 3 && (
                            <motion.div key="step-3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-slate-700/50 backdrop-blur-md text-amber-400">
                                    <span className="material-symbols-outlined text-[40px]">payments</span>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 leading-tight">Valor por Dinero</h2>
                                <p className="text-slate-400 font-medium mb-12">¿Vale la pena lo que pagas?</p>

                                <div className="flex justify-center items-center gap-3 w-full mb-12">
                                     {[1, 2, 3, 4, 5].map((val) => (
                                        <button 
                                            key={val}
                                            onClick={() => setPrecio(val)}
                                            className={`relative w-12 h-16 flex items-center justify-center rounded-xl transition-all duration-300 font-black text-2xl ${precio >= val ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 scale-110' : 'bg-slate-800 border border-slate-700 text-slate-600'}`}
                                        >
                                            $
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleNext} className="w-full py-4 bg-white text-ink rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">Siguiente</button>
                            </motion.div>
                        )}

                        {/* STEP 4: AMBIENTE (Multi-Select) */}
                        {step === 4 && (
                            <motion.div key="step-4" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-slate-700/50 backdrop-blur-md text-purple-400">
                                    <span className="material-symbols-outlined text-[40px]">celebration</span>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 leading-tight">El Vibe</h2>
                                <p className="text-slate-400 font-medium mb-8">¿Cómo se siente estar ahí? (Múltiple)</p>

                                <div className="flex flex-wrap justify-center gap-3 w-full mb-8">
                                    {VIBE_CHIPS.map((vibe) => {
                                        const isSelected = vibes.includes(vibe);
                                        return (
                                            <button 
                                                key={vibe}
                                                onClick={() => {
                                                    if (isSelected) setVibes(vibes.filter(v => v !== vibe));
                                                    else setVibes([...vibes, vibe]);
                                                }}
                                                className={`px-5 py-3 rounded-full font-bold text-sm transition-all duration-200 border ${isSelected ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                                            >
                                                {vibe}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button onClick={handleNext} className="w-full mt-auto py-4 bg-white text-ink rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">Siguiente</button>
                            </motion.div>
                        )}

                        {/* STEP 5: NOTA GLOBAL */}
                        {step === 5 && (
                            <motion.div key="step-5" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-rose-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(37,99,235,0.4)] border-4 border-white">
                                    <span className="text-5xl font-black text-white">{notaGlobal}</span>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 leading-tight">Señal Final</h2>
                                <p className="text-slate-400 font-medium mb-12">¿En resumen, qué nota le pones?</p>

                                <div className="w-full px-4 mb-4">
                                     <input 
                                        type="range" 
                                        min="1" max="10" step="1"
                                        value={notaGlobal}
                                        onChange={(e) => setNotaGlobal(parseInt(e.target.value))}
                                        className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
                                    />
                                    <div className="flex justify-between w-full mt-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                        <span>Pésimo</span>
                                        <span>Increíble</span>
                                    </div>
                                </div>

                                <button onClick={handleNext} className="w-full mt-10 py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.8)] flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[24px]">send</span>
                                    Lanzar Señal
                                </button>
                            </motion.div>
                        )}

                        {/* SUCCESS SCREEN */}
                        {step === 6 && (
                            <motion.div key="step-6" variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full flex flex-col items-center text-center">
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(16,185,129,0.5)] border-4 border-emerald-300"
                                >
                                    <span className="material-symbols-outlined text-white text-[60px]">done_all</span>
                                </motion.div>
                                <h2 className="text-4xl font-black text-white mb-4 leading-tight">¡Señal <br/> Capturada!</h2>
                                <p className="text-slate-400 font-medium mb-12 max-w-[280px]">
                                    Has aportado valiosa inteligencia colectiva a la comunidad respecto a <span className="text-white font-bold">{place.name}</span>.
                                </p>

                                <button onClick={handleComplete} className="w-full py-4 bg-white text-ink rounded-2xl font-black text-lg transition-transform active:scale-95">
                                    Volver al Lugar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

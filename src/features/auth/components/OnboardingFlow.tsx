import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';

interface OnboardingFlowProps {
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'identity' | 'demographics' | 'success';

export default function OnboardingFlow({ onClose, onSuccess }: OnboardingFlowProps) {
    const [step, setStep] = useState<Step>('identity');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Demographics State
    const [gender, setGender] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [region, setRegion] = useState('');

    const handleIdentity = async (provider: 'google' | 'apple' | 'email') => {
        setLoading(true);
        try {
            if (provider === 'email') {
                // In a real app we'd send OTP, here we emulate for the demo
                await authService.createSimpleProfile('Usuario', email);
            } else {
                await authService.createSimpleProfile('Usuario Red Social', 'social@example.com');
            }
            setStep('demographics');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDemographics = async () => {
        setLoading(true);
        try {
            await authService.updateProfileDemographics({
                gender,
                ageRange,
                region
            });
            setStep('success');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };

    return (
        <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait" custom={step === 'identity' ? -1 : 1}>
                {step === 'identity' && (
                    <motion.div
                        key="identity"
                        custom={1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="p-8 flex-1 flex flex-col"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                <span className="material-symbols-rounded text-3xl">fingerprint</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identidad</h2>
                            <p className="text-sm text-slate-500 font-medium mt-2">
                                Para una opinión transparente, necesitamos verificar que eres real.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleIdentity('google')}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                                Continuar con Google
                            </button>
                            <button
                                onClick={() => handleIdentity('apple')}
                                className="w-full flex items-center justify-center gap-3 bg-black py-3.5 rounded-2xl font-bold text-white hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.74 2.4.29 4.1.84 4.87 2.21-.19.04-2.82 1.54-2.79 5.86.06 4.38 3.86 5.84 4.07 5.92-.02.04-.6 1.99-1.39 3.03-.78 1.04-1.61 2.08-3.53 1.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.25-2.05 4.19-3.74 4.25z" /></svg>
                                Continuar con Apple
                            </button>
                        </div>

                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">O usa tu email</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                                onClick={() => handleIdentity('email')}
                                disabled={!email || loading}
                                className="w-full bg-indigo-600 py-3.5 rounded-2xl font-black text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Cargando...' : 'Verificar Email'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'demographics' && (
                    <motion.div
                        key="demographics"
                        custom={1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="p-8 flex-1 flex flex-col"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                                <span className="material-symbols-rounded text-3xl">diversity_3</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tu Perfil</h2>
                            <p className="text-sm text-slate-500 font-medium mt-2">
                                Esto nos permite ponderar tu opinión según representatividad.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Género</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Hombre', 'Mujer', 'Otro'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGender(g)}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${gender === g ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rango Etario</label>
                                <select
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="18-24">18 - 24 años</option>
                                    <option value="25-34">25 - 34 años</option>
                                    <option value="35-44">35 - 44 años</option>
                                    <option value="45-54">45 - 54 años</option>
                                    <option value="55+">55+ años</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Región</label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="rm">Región Metropolitana</option>
                                    <option value="valpo">Valparaíso</option>
                                    <option value="biobio">Biobío</option>
                                    <option value="other">Otras Regiones</option>
                                </select>
                            </div>

                            <button
                                onClick={handleDemographics}
                                disabled={!gender || !ageRange || !region || loading}
                                className="w-full bg-slate-900 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-30 mt-4"
                            >
                                {loading ? 'Guardando...' : 'Completar Verificación'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        custom={1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="p-8 flex-1 flex flex-col items-center justify-center text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 text-emerald-500">
                            <motion.span
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="material-symbols-rounded text-5xl"
                            >
                                check_circle
                            </motion.span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">¡Verificado!</h2>
                        <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                            Has desbloqueado el acceso completo a <span className="text-indigo-600 font-bold text-sm">Power Rankings</span> y
                            tu límite diario ha subido a <span className="text-indigo-600 font-bold text-sm">15 señales</span>.
                        </p>

                        <div className="grid grid-cols-2 gap-3 w-full mt-10">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-indigo-600 font-black text-xl mb-1">15</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Señales/Día</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-indigo-600 font-black text-xl mb-1">ON</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Insights</div>
                            </div>
                        </div>

                        <button
                            onClick={onSuccess}
                            className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-8"
                        >
                            Continuar Explorando
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 bg-slate-50 flex items-center justify-center">
                <button
                    onClick={onClose}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}

import { motion } from 'framer-motion';
import { SEG_AGE_BUCKETS, SEG_REGIONS } from "../../../../lib/demographicsNormalize";

interface StepDemographicsProps {
    gender: string;
    setGender: (g: string) => void;
    ageRange: string;
    setAgeRange: (a: string) => void;
    region: string;
    setRegion: (r: string) => void;
    errorMsg: string;
    loading: boolean;
    onSave: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: any;
}

export function StepDemographics({
    gender, setGender,
    ageRange, setAgeRange,
    region, setRegion,
    errorMsg, loading, onSave,
    variants
}: StepDemographicsProps) {
    return (
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
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-600">
                    <span className="material-symbols-rounded text-3xl">diversity_3</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl font-black text-slate-900 tracking-tight">Tu Perfil</h2>
                <p className="text-sm text-slate-500 font-medium mt-2">
                    Esto nos permite ponderar tu opinión según representatividad.
                </p>
            </div>

            {errorMsg && (
                <div role="alert" aria-live="polite">
                    <p className="text-xs text-danger-500 font-bold mb-4 text-center">{errorMsg}</p>
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <div id="gender-label" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Género</div>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">Requerido para el análisis colaborativo.</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: "male", label: "Hombre" },
                            { id: "female", label: "Mujer" },
                            { id: "other", label: "Otro" },
                        ].map(g => (
                            <button
                                key={g.id}
                                aria-labelledby="gender-label"
                                onClick={() => setGender(g.id)}
                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand/50 ${gender === g.id ? 'bg-brand border-brand text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-brand/30'
                                    }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="ageRange" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Edad</label>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">Para descubrir las tendencias por generación.</p>
                    <select
                        id="ageRange"
                        value={ageRange}
                        onChange={(e) => setAgeRange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand/50"
                    >
                        <option value="">Selecciona…</option>
                        {SEG_AGE_BUCKETS.filter(a => a.value !== "all").map(a => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="region" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">¿Dónde estás?</label>
                    <p className="text-[11px] text-slate-400 mb-2 font-medium">Para detectar tendencias en tu región.</p>
                    <select
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand/50"
                    >
                        <option value="">Selecciona…</option>
                        {SEG_REGIONS.filter(r => r.value !== "all").map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onSave}
                    disabled={!gender || !ageRange || !region || loading}
                    className="w-full bg-slate-900 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-30 mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand/50"
                >
                    {loading ? 'Un segundo…' : 'Listo'}
                </button>
            </div>
        </motion.div>
    );
}

export default StepDemographics;

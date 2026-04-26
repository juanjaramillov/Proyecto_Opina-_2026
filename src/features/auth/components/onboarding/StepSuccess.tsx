import { motion } from 'framer-motion';

interface StepSuccessProps {
    onSuccess: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: any;
}

export function StepSuccess({ onSuccess, variants }: StepSuccessProps) {
    return (
        <motion.div
            key="success"
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="p-8 flex-1 flex flex-col items-center justify-center text-center"
        >
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6 text-accent">
                <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="material-symbols-rounded text-5xl"
                >
                    check_circle
                </motion.span>
            </div>
            <h2 id="onboarding-title" className="text-3xl font-black text-slate-900 tracking-tighter">Listo. Ya puedes dejar tus señales.</h2>
            <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                Tu cuenta ha sido configurada y está lista para impactar las tendencias. (Desbloqueaste <span className="text-brand font-bold text-sm">15 señales</span>).
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mt-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-brand font-black text-xl mb-1">15</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Señales/Día</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-brand font-black text-xl mb-1">ON</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Insights</div>
                </div>
            </div>

            <button
                onClick={onSuccess}
                className="w-full bg-brand py-4 rounded-2xl font-black text-white shadow-lg shadow-brand-200 transition-all active:scale-[0.98] mt-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand/50"
            >
                Ir a Señales →
            </button>
        </motion.div>
    );
}

export default StepSuccess;


import { motion } from 'framer-motion';

type Props = {
    onComplete: () => void;
};

export default function OnboardingBanner({ onComplete }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/20 relative overflow-hidden"
        >
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-30 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3 border border-white/10">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Bienvenido
                </div>
                <h2 className="text-2xl font-black leading-tight mb-2">Una opinión = una señal.</h2>
                <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-sm mb-6">
                    Tu punto de vista tiene valor real. Juntas, las señales muestran qué está cambiando en Chile.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onComplete}
                        className="px-6 py-2.5 bg-white text-slate-900 text-sm font-black rounded-xl hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 active:scale-95"
                    >
                        Entendido
                    </button>
                    <button
                        onClick={() => {
                            const el = document.getElementById('home-batalla-activa');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            onComplete(); // Auto complete on interaction? Maybe optional.
                        }}
                        className="px-4 py-2.5 text-white/70 hover:text-white text-sm font-bold transition-colors"
                    >
                        Ver ejemplo
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

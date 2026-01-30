import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function RadiografiasPreview() {
    const navigate = useNavigate();

    return (
        <section className="relative w-full py-12 md:py-24 overflow-hidden">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-slate-900 z-0">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-black" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Visual Side (Dominant) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Abstract Data Visual */}
                        <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm group cursor-pointer" onClick={() => navigate('/radiografias')}>
                            <div className="absolute inset-0 flex items-end justify-center pb-8 px-8 gap-2">
                                {/* Simulated Bars */}
                                {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: "10%" }}
                                        whileInView={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.1, duration: 1, type: "spring" }}
                                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                ))}
                            </div>

                            {/* Floating Insight Card */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute top-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    </div>
                                    <p className="text-white text-sm font-medium">Eres parte del 5% que prefiere la calidad sobre el precio.</p>
                                </div>
                            </motion.div>

                            {/* Overlay Text */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <span className="px-6 py-2 bg-white text-slate-900 font-bold rounded-full transform scale-90 group-hover:scale-100 transition-transform">Ver mi Radiografía</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Side (Minimal) */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                            Premium Insight
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                            Lo que tus decisiones <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">dicen de ti.</span>
                        </h2>
                        <p className="text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed mb-8">
                            No es solo data. Es un espejo digital. Descubre tu perfil único basado en tus señales.
                        </p>

                        <button
                            onClick={() => navigate('/radiografias')}
                            className="text-white border-b border-indigo-500 pb-1 hover:text-indigo-400 transition-colors font-bold text-lg"
                        >
                            Descubrir mis patrones →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

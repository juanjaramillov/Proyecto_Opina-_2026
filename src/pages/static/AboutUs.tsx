import { motion } from "framer-motion";
import {
    TrendingUp,
    Shield,
    Zap,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================
   SISTEMA TIPOGRÁFICO
========================= */
const T = {
    eyebrow:
        "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase",
    h1: "text-5xl md:text-7xl font-black leading-[0.92] tracking-tight text-ink",
    h2: "text-3xl md:text-4xl font-bold tracking-tight text-ink",
    h3: "text-xl font-bold tracking-tight text-ink",
    pLead: "text-xl md:text-2xl text-text-secondary leading-relaxed",
    p: "text-text-secondary leading-relaxed",
    pSm: "text-sm text-text-secondary leading-relaxed",
    micro:
        "text-xs font-bold uppercase tracking-[0.2em] text-text-secondary transition-colors",
    italicNote: "opacity-50 text-sm italic text-text-secondary",
};

/* =========================
   BOTÓN ESTÁNDAR
========================= */
function AppButton({
    children,
    className = "",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
    return (
        <button
            {...props}
            className={[
                "inline-flex items-center justify-center",
                "h-12 px-8 rounded-full",
                "bg-gradient-brand text-white font-bold",
                "shadow-lg shadow-primary-500/25",
                "transition-all duration-200",
                "hover:shadow-xl hover:shadow-primary/40 hover:opacity-90 hover:scale-[1.02] hover:-translate-y-0.5",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                "disabled:opacity-60 disabled:pointer-events-none",
                className,
            ].join(" ")}
        >
            {children}
        </button>
    );
}



/* =========================
   PAGE
========================= */
export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg text-ink font-sans overflow-x-hidden selection:bg-primary selection:text-white pb-16 relative">

            {/* ATMOSPHERE: Subtle Background Blobs */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-radial-gradient from-primary/5 to-transparent opacity-20 pointer-events-none z-0 mix-blend-multiply" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-radial-gradient from-emerald-500/5 to-transparent opacity-15 pointer-events-none z-0" />

            {/* Background texture */}
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* ================= HERO ================= */}
            <section className="relative py-16 md:py-24 px-6 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-4"
                >
                    <div className={`${T.eyebrow} mb-2 shadow-sm bg-white/80 backdrop-blur-sm border border-primary/20`}>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        No venimos a “tener la razón”. Venimos a ver el patrón.
                    </div>

                    <h1 className={T.h1}>
                        Nosotros
                    </h1>

                    <p className={`${T.pLead} max-w-2xl mx-auto font-medium`}>
                        Opina+ convierte opiniones en señales: datos agregados, segmentables y vivos.
                    </p>
                </motion.div>
            </section>

            {/* ================= QUÉ ES / QUÉ NO ES / SEÑALES ================= */}
            <section className="py-12 md:py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {/* QUÉ ES */}
                    <div className="bg-white p-8 rounded-3xl border border-stroke shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp className="text-primary" size={24} />
                            </div>
                            <h3 className={`${T.h3} mb-4`}>¿Qué es Opina+?</h3>
                            <p className={T.p}>
                                Un sistema para leer tendencias reales en tiempo casi real. Tú señalas (rápido o en profundidad) y eso se transforma en inteligencia colectiva, agregada por segmentos.
                            </p>
                        </div>
                    </div>

                    {/* QUÉ NO ES */}
                    <div className="bg-white p-8 rounded-3xl border border-stroke shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                <XCircle className="text-slate-500" size={24} />
                            </div>
                            <h3 className={`${T.h3} mb-4`}>¿Qué NO es?</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className={T.pSm}>No es una encuesta eterna.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className={T.pSm}>No es una red social para pelear.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className={T.pSm}>No es “verdad”: es tendencia agregada.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* POR QUÉ SEÑALES */}
                    <div className="bg-white p-8 rounded-3xl border border-stroke shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="text-emerald-500" size={24} />
                            </div>
                            <h3 className={`${T.h3} mb-4`}>¿Por qué hablamos de “señales”?</h3>
                            <p className={T.p}>
                                Porque una señal no es solo elegir: también es contexto. Con un buen perfil (y verificación cuando aplique), la data se vuelve más útil y más justa.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= PRIVACIDAD ================= */}
            <section className="py-12 md:py-16 px-6 relative z-10">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-left border border-slate-800">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-500/20 to-transparent rounded-bl-[200px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                        <div className="w-full md:w-1/3 flex justify-center">
                            <div className="w-32 h-32 bg-slate-800/50 rounded-[2rem] border border-slate-700/50 flex items-center justify-center shadow-inner">
                                <Shield className="text-emerald-400 w-16 h-16" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h2 className={`${T.h2} text-white mb-6`}>Privacidad (en simple)</h2>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-4">
                                    <CheckCircle2 className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        Los resultados son agregados: no mostramos opiniones individuales.
                                    </p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <CheckCircle2 className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        Usamos segmentos (edad, género, comuna, etc.) para entender tendencias, no para exponerte.
                                    </p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <CheckCircle2 className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        Tu nickname es tu cara pública; tu identidad real va por otro carril.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CIERRE CTA ================= */}
            <section className="py-16 md:py-24 px-6 text-center relative z-10">
                <div className="max-w-2xl mx-auto space-y-8">
                    <h2 className={T.h2}>¿Listo para señalar?</h2>
                    <p className={T.pLead}>
                        Entra a Participa y empuja la tendencia.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <AppButton onClick={() => navigate('/experience')} className="text-lg w-full sm:w-auto h-14 px-10">
                            Ir a Participa →
                        </AppButton>
                        <button
                            onClick={() => window.location.href = "mailto:contacto@opinamas.com"}
                            className="h-14 px-8 rounded-full font-bold text-slate-600 hover:text-ink bg-slate-100 hover:bg-slate-200 transition-colors w-full sm:w-auto"
                        >
                            Hablar con nosotros
                        </button>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="py-8 px-6 text-center border-t border-stroke bg-white relative z-10">
                <p className="text-xs text-text-secondary max-w-3xl mx-auto leading-relaxed opacity-70">
                    <strong>Disclaimer:</strong> Opina+ es una plataforma independiente de opinión.
                    Las marcas, productos y servicios mencionados pertenecen a sus respectivos dueños.
                    Las comparaciones y resultados reflejan únicamente la opinión de los usuarios.
                </p>
            </section>
        </div>
    );
}

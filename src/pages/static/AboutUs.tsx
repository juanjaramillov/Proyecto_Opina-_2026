import { motion } from "framer-motion";
import {
    ShieldCheck,
    Eye,
    Scale,
    Handshake,
    TrendingUp,
    BadgeCheck,
    MessageSquare,
    Shield,
    BarChart3,
    Rocket,
    Zap,
} from "lucide-react";

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
                "shadow-lg shadow-indigo-500/25",
                "transition-transform transition-all duration-200",
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
   UI HELPERS - REFACTORED FOR WOW FACTOR
========================= */
function IconCircle({
    children,
    colorClass = "text-primary",
    isGradient = false,
    size = 72,
}: {
    children: React.ReactNode;
    colorClass?: string;
    isGradient?: boolean;
    size?: number;
}) {
    // Base classes for the container
    const baseClasses =
        "rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-[0_6px_18px_rgba(15,23,42,0.06)]";

    // Variant styles
    const styleClasses = isGradient
        ? "bg-gradient-to-br from-white to-slate-100 border-white/60" // Subtle depth
        : "bg-surface border-stroke"; // Flat clean

    return (
        <div
            className={`${baseClasses} ${styleClasses} group-hover:border-[currentColor]/20`}
            style={{ width: size, height: size, color: 'inherit' }} // inherit color for border trick if needed
        >
            {/* Icon wrapper to handle color transition on hover */}
            <div className={`text-ink transition-colors duration-300 group-hover:${colorClass}`}>
                {children}
            </div>
        </div>
    );
}

// Timeline Icon with Scroll Activation
function TimelineIcon({ children, activeColorClass = "text-ink" }: { children: React.ReactNode, activeColorClass?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0.2, scale: 0.8, filter: "grayscale(100%)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "grayscale(0%)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute left-0 md:left-1/2 -translate-x-1/2 w-[56px] h-[56px] bg-surface rounded-full flex items-center justify-center z-10 border border-stroke outline outline-4 outline-white shadow-md"
        >
            <div className={`${activeColorClass}`}>
                {children}
            </div>
        </motion.div>
    );
}

function PromiseCard({
    icon,
    title,
    body,
}: {
    icon: React.ReactNode;
    title: string;
    body: string;
}) {
    return (
        <div className="bg-bg p-7 rounded-2xl border border-stroke text-center hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg hover:border-primary/20 group">
            <div className="w-12 h-12 mx-auto bg-surface rounded-full flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/5">
                <div className="text-ink group-hover:text-primary transition-colors">
                    {icon}
                </div>
            </div>
            <h4 className="text-lg font-bold tracking-tight text-ink mb-2">
                {title}
            </h4>
            <p className={T.pSm}>{body}</p>
        </div>
    );
}

/* =========================
   PAGE
========================= */
export default function AboutUs() {
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
            <section className="relative py-8 md:py-12 px-6 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-4"
                >
                    <div className={`${T.eyebrow} mb-2 shadow-sm bg-white/80 backdrop-blur-sm border border-primary/20`}>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Manifiesto
                    </div>

                    <h1 className={T.h1}>
                        Tu opinión es <br />
                        <span className="text-gradient-brand">
                            el activo más valioso.
                        </span>
                    </h1>

                    <p className={`${T.pLead} max-w-2xl mx-auto`}>
                        Opina+ no es una red social. Es la primera plataforma donde{" "}
                        <span className="text-ink font-bold border-b-2 border-primary/30 hover:border-primary transition-colors cursor-default">
                            el valor de tus datos vuelve a ti
                        </span>
                        , no a un algoritmo publicitario.
                    </p>
                </motion.div>
            </section>

            {/* ================= SELLOS (Palanca 1 & 2) ================= */}
            <section className="py-4 md:py-6 px-4 relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-4 justify-items-center">
                    {[
                        { icon: ShieldCheck, label: "Seguridad", gradient: false },
                        { icon: Eye, label: "Transparencia", gradient: true },
                        { icon: Scale, label: "Independiente", gradient: false },
                        { icon: Handshake, label: "Confianza", gradient: true },
                        { icon: TrendingUp, label: "Impacto", gradient: false },
                        { icon: BadgeCheck, label: "Recompensa", gradient: true },
                    ].map(({ icon: Icon, label, gradient }) => (
                        <div
                            key={label}
                            className="flex flex-col items-center gap-2 text-center group cursor-default"
                        >
                            <IconCircle colorClass="text-primary" isGradient={gradient}>
                                <Icon size={28} strokeWidth={1.75} />
                            </IconCircle>
                            <span className={`${T.micro} group-hover:text-ink transition-colors duration-300`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= TIMELINE (Palanca 4: Scroll Activation) ================= */}
            <section className="py-8 md:py-12 px-6 relative z-10 overflow-hidden">
                {/* Subtle cool background for timeline */}
                <div className="absolute inset-0 bg-white/50 -skew-y-3 z-0 transform origin-top-left scale-110" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-10">
                        <h2 className={`${T.h2} mb-4`}>El Viaje de tu Señal</h2>
                        <p className="text-lg text-text-secondary max-w-lg mx-auto">
                            Cómo convertimos tu opinión individual en un cambio colectivo real.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Vertical) */}
                        <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-slate-300 to-transparent -translate-x-1/2" />

                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="relative flex flex-col md:flex-row items-center md:justify-between mb-12"
                        >
                            <div className="md:w-1/2 md:pr-16 md:text-right pl-20 md:pl-0 pt-2 md:pt-0">
                                <h3 className={T.h3}>1. Tú opinas</h3>
                                <p className={`${T.p} mt-2`}>
                                    Compartes tu experiencia honesta sobre una marca, lugar o tema.
                                </p>
                            </div>
                            <TimelineIcon activeColorClass="text-indigo-600">
                                <MessageSquare size={22} strokeWidth={1.75} />
                            </TimelineIcon>
                            <div className={`md:w-1/2 md:pl-16 hidden md:block ${T.italicNote}`}>
                                "El servicio fue excelente, pero lento."
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative flex flex-col md:flex-row items-center md:justify-between mb-12"
                        >
                            <div className={`md:w-1/2 md:pr-16 md:text-right hidden md:block ${T.italicNote}`}>
                                Tus datos personales desaparecen.
                            </div>
                            <TimelineIcon activeColorClass="text-emerald-600">
                                <Shield size={22} strokeWidth={1.75} />
                            </TimelineIcon>
                            <div className="md:w-1/2 md:pl-16 pl-20 pt-2 md:pt-0">
                                <h3 className={T.h3}>2. Blindamos tu Identidad</h3>
                                <p className={`${T.p} mt-2`}>
                                    Nuestra tecnología{" "}
                                    <span className="font-bold text-primary">Zero-Knowledge</span>{" "}
                                    separa quién eres de lo que dices. Eres libre.
                                </p>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative flex flex-col md:flex-row items-center md:justify-between mb-12"
                        >
                            <div className="md:w-1/2 md:pr-16 md:text-right pl-20 md:pl-0 pt-2 md:pt-0">
                                <h3 className={T.h3}>3. Creamos la Señal</h3>
                                <p className={`${T.p} mt-2`}>
                                    El ruido se cancela. La verdad emerge clara e innegable.
                                </p>
                            </div>
                            <TimelineIcon activeColorClass="text-primary">
                                <BarChart3 size={22} strokeWidth={1.75} />
                            </TimelineIcon>
                            <div className={`md:w-1/2 md:pl-16 hidden md:block ${T.italicNote}`}>
                                Miles de usuarios piensan lo mismo.
                            </div>
                        </motion.div>

                        {/* Step 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative flex flex-col md:flex-row items-center md:justify-between"
                        >
                            <div className={`md:w-1/2 md:pr-16 md:text-right hidden md:block ${T.italicNote}`}>
                                Las empresas se adaptan o mueren.
                            </div>
                            <TimelineIcon activeColorClass="text-primary">
                                <Rocket size={22} strokeWidth={1.75} />
                            </TimelineIcon>
                            <div className="md:w-1/2 md:pl-16 pl-20 pt-2 md:pt-0">
                                <h3 className={T.h3}>4. El Cambio Ocurre</h3>
                                <p className={`${T.p} mt-2`}>
                                    Las empresas reciben la Señal.{" "}
                                    <span className="font-bold text-primary">Tú ganas.</span>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= PROMESA ================= */}
            <section className="py-12 md:py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    <PromiseCard
                        icon={<Eye size={24} strokeWidth={1.75} />}
                        title="Transparencia Total"
                        body="Los resultados son públicos. Nadie puede esconder una mala señal."
                    />
                    <PromiseCard
                        icon={<Handshake size={24} strokeWidth={1.75} />}
                        title="Poder Colectivo"
                        body="Tu voz sola es una opinión. Junto a otras miles, es un mandato."
                    />
                    <PromiseCard
                        icon={<Zap size={24} strokeWidth={1.75} />}
                        title="Acción Rápida"
                        body="La señal llega directo a quien toma decisiones."
                    />
                </div>
            </section>

            {/* ================= CIERRE ================= */}
            <section className="py-12 md:py-20 px-6 text-center bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                    <h2 className={T.h2}>Únete a la Revolución de la Verdad</h2>
                    <p className={T.p}>
                        Deja de ser un dato para ellos. Empieza a ser una señal para el mundo.
                    </p>
                    <AppButton className="text-lg px-10 h-14">Comenzar Ahora</AppButton>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="py-8 px-6 text-center border-t border-stroke bg-white">
                <p className="text-xs text-text-secondary max-w-3xl mx-auto leading-relaxed opacity-70">
                    <strong>Disclaimer:</strong> Opina+ es una plataforma independiente de opinión.
                    Las marcas, productos y servicios mencionados pertenecen a sus respectivos dueños.
                    Las comparaciones y resultados reflejan únicamente la opinión de los usuarios.
                </p>
            </section>
        </div>
    );
}

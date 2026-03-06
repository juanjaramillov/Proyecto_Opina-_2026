import { motion } from "framer-motion";
import {
    Activity,
    ShieldCheck,
    BarChart3,
    Globe2,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================
   SISTEMA TIPOGRÁFICO y UI
========================= */
const T = {
    eyebrow:
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-500 text-[10px] font-black tracking-widest uppercase",
    h1: "text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-ink",
    h2: "text-3xl md:text-5xl font-black tracking-tight text-ink leading-tight",
    h3: "text-xl font-bold tracking-tight text-ink",
    pLead: "text-lg md:text-xl text-text-secondary font-medium leading-relaxed",
    p: "text-text-secondary leading-relaxed",
};

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg text-ink font-sans pb-24 selection:bg-primary-500 selection:text-white">

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden bg-white border-b border-stroke">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-bg rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <div className={`${T.eyebrow} mb-8`}>
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            Manifiesto Opina+
                        </div>

                        <h1 className={`${T.h1} mb-8 max-w-4xl`}>
                            La opinión en internet se convirtió en ruido. <br />
                            <span className="bg-gradient-to-r from-ink to-text-secondary bg-clip-text text-transparent">Nosotros lo convertimos en dirección.</span>
                        </h1>

                        <p className={`${T.pLead} max-w-2xl mx-auto`}>
                            Opina+ nace de una premisa simple: las personas no deberían pesar lo mismo sin contexto, y las marcas no deberían tomar decisiones basadas en intuición estática. Construimos el estándar para leer la sociedad en tiempo real.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* LA TESIS CENTRAL */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <span className="text-primary-500 font-bold uppercase tracking-widest text-xs mb-4 block">El Problema Estructural</span>
                    <h2 className={`${T.h2} mb-6`}>Ni encuestas eternas, ni likes vacíos.</h2>
                    <p className={`${T.pLead} max-w-3xl mx-auto`}>
                        Una queja anónima no vale lo mismo que la preferencia de un consumidor habitual.
                        Los likes son superficiales y las encuestas tradicionales envejecen antes de publicarse.
                        <strong>La calidad del dato depende inherentemente de la calidad y el contexto de quien lo emite.</strong>
                    </p>
                </div>

                {/* PILARES */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

                    {/* Pilar 1 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-sm hover:shadow-md relative group hover:border-primary/50 transition-colors">
                        <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 transition-transform">
                            <Activity className="text-primary-500" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className={`${T.h3} mb-4`}>Unidades de Señal, no votos planos</h3>
                        <p className={T.p}>
                            Rechazamos el “voto” plano. En Opina+, capturamos señales. Una señal encapsula intención, demografía y temporalidad simultáneamente. Esto permite construir un punto de dato vivo, contextualizado y agregable.
                        </p>
                    </div>

                    {/* Pilar 2 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-sm hover:shadow-md relative group hover:border-primary/50 transition-colors">
                        <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 transition-transform">
                            <ShieldCheck className="text-primary-500" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className={`${T.h3} mb-4`}>Progresión y Calidad del Usuario</h3>
                        <p className={T.p}>
                            La influencia en nuestro ecosistema se gana, no se regala ni se compra. El sistema pondera orgánicamente la información recompensando la consistencia, la honestidad y el historial de comportamiento de cada perfil.
                        </p>
                    </div>

                    {/* Pilar 3 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-sm hover:shadow-md relative group hover:border-primary/50 transition-colors">
                        <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 transition-transform">
                            <BarChart3 className="text-primary-500" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className={`${T.h3} mb-4`}>Mejor Dato, Mejor Lectura</h3>
                        <p className={T.p}>
                            Al estructurar el ruido digital a través de una arquitectura limpia de captura, logramos aislar el sesgo y entender con precisión meridiana qué está sucediendo en segmentos socioeconómicos y geográficos muy específicos.
                        </p>
                    </div>

                    {/* Pilar 4 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-sm hover:shadow-md relative group hover:border-primary/50 transition-colors">
                        <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 transition-transform">
                            <Globe2 className="text-primary-500" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className={`${T.h3} mb-4`}>Valor Futuro y Ecosistema</h3>
                        <p className={T.p}>
                            Hoy capturamos tendencias y devolvemos reportes. Mañana, seremos la capa de inteligencia base para la toma de decisiones estratégicas, corporativas y públicas en todo el continente.
                        </p>
                    </div>

                </div>
            </section>

            {/* CREDENTIALS / CONFIDENCE BAR */}
            <section className="py-12 bg-white border-y border-stroke mb-24">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 text-center">
                    <div>
                        <span className="block text-4xl font-black text-ink mb-2 tracking-tight">Zero</span>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Ruido Bots / Granjas</span>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-stroke"></div>
                    <div>
                        <span className="block text-4xl font-black text-ink mb-2 tracking-tight">100%</span>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Información Estructurada</span>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-stroke"></div>
                    <div>
                        <span className="block text-4xl font-black text-ink mb-2 tracking-tight">Real-Time</span>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Velocidad de Lectura</span>
                    </div>
                </div>
            </section>

            {/* DUAL CTA */}
            <section className="px-6 mb-16">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

                    {/* B2B CTA */}
                    <div className="bg-slate-900 rounded-[2rem] p-10 md:p-12 relative overflow-hidden group flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 mb-10">
                            <span className="text-primary-400 font-black uppercase tracking-widest text-[10px] mb-4 block">Para Empresas y Decisores</span>
                            <h3 className="text-3xl font-black text-white mb-4 leading-tight">Inteligencia para quienes toman decisiones.</h3>
                            <p className="text-slate-400 font-medium">Entender el mercado ya no requiere meses de investigación. Requiere conectarse al motor correcto y ver la tendencia nacer.</p>
                        </div>
                        <button
                            onClick={() => navigate('/intelligence')}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-black text-sm uppercase tracking-widest py-4 px-6 rounded-xl transition-colors inline-flex justify-between items-center w-full shadow-lg"
                        >
                            Descubrir Opina+ Intelligence
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    {/* B2C CTA */}
                    <div className="bg-white border-2 border-stroke rounded-[2rem] p-10 md:p-12 relative overflow-hidden group flex flex-col justify-between hover:border-primary/50 transition-colors">
                        <div className="relative z-10 mb-10">
                            <span className="text-text-secondary font-black uppercase tracking-widest text-[10px] mb-4 block">Para Usuarios y Ciudadanos</span>
                            <h3 className="text-3xl font-black text-ink mb-4 leading-tight">Pasa del ruido a la tendencia estructurada.</h3>
                            <p className="text-text-secondary font-medium">Tus señales construyen el ranking en tiempo real de lo que está pasando. Suma valor, elige tu nicho y avanza.</p>
                        </div>
                        <button
                            onClick={() => navigate('/experience')}
                            className="bg-bg hover:bg-stroke border border-stroke text-ink font-black text-sm uppercase tracking-widest py-4 px-6 rounded-xl transition-colors inline-flex justify-between items-center w-full"
                        >
                            Ir a Participar
                            <ArrowRight size={18} className="text-text-secondary" />
                        </button>
                    </div>

                </div>
            </section>

        </div>
    );
}

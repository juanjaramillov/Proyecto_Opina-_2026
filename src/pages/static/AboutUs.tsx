import { motion } from "framer-motion";
import {
    Activity,
    ShieldCheck,
    BarChart3,
    Globe2,
    LockKeyhole,
    UserCheck,
    Scale
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHero, GradientCTA, GlassCard, AmbientOrbs } from "../../components/ui/foundation";

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans pb-24 selection:bg-brand selection:text-white">

            {/* HERO — PageHero oficial */}
            <PageHero
                eyebrow="Manifiesto Opina+"
                eyebrowDot
                title="La opinión en internet se convirtió en ruido. Nosotros lo convertimos en dirección."
                highlightedWord="dirección."
                description="Opina+ nace de una premisa simple: las personas no deberían pesar lo mismo sin contexto, y las marcas no deberían tomar decisiones basadas en intuición estática. Construimos el estándar para leer la sociedad con monitoreo y actualización continua."
            />

            {/* TRUST & PRIVACY DYNAMIC BLOCK */}
            <section className="py-20 px-6 bg-white relative z-10 border-b border-stroke overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-accent font-bold uppercase tracking-widest text-xs mb-4 block">Contrato de Datos Opina+</span>
                        <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight">Tu identidad requiere protección. <br className="hidden md:block" />Tu opinión requiere contexto.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-[60px] left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent z-0"></div>

                        {/* Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0 }}
                        >
                            <GlassCard intensity="subtle" radius="3xl" className="p-8 relative z-10 hover:border-brand/20 transition-all group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-stroke group-hover:scale-110 transition-transform mx-auto md:mx-0">
                                    <LockKeyhole className="text-slate-700" size={24} />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight text-ink mb-3 text-center md:text-left">Privacidad vs Segmentación</h3>
                                <p className="text-slate-600 text-sm leading-relaxed text-center md:text-left">
                                    Pedimos datos como tu edad o comuna para darle valor estadístico a tu opinión en el mercado, pero <strong className="text-ink">nunca exponemos</strong> esa información anclada a tu identidad pública.
                                </p>
                            </GlassCard>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        >
                            <GlassCard intensity="subtle" radius="3xl" className="p-8 relative z-10 hover:border-accent/20 transition-all group">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-stroke group-hover:scale-110 transition-transform mx-auto md:mx-0">
                                    <UserCheck className="text-slate-700" size={24} />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight text-ink mb-3 text-center md:text-left">Verificación de Humanidad</h3>
                                <p className="text-slate-600 text-sm leading-relaxed text-center md:text-left">
                                    En los paneles interactúas usando un avatar y un alias. Validar tu teléfono o LinkedIn solo sirve para decirle a nuestro algoritmo que <strong className="text-ink">no eres un bot</strong>, garantizando cero ruido.
                                </p>
                            </GlassCard>
                        </motion.div>

                        {/* Card 3 — Destacada (ex dark, ahora light con gradient brand→accent suave) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative z-10 rounded-3xl p-8 bg-gradient-to-br from-brand-50 via-white to-accent-50 border border-brand-100 shadow-xl overflow-hidden group hover:border-brand/40 transition-all"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2"></div>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-brand-100 group-hover:scale-110 transition-transform mx-auto md:mx-0 relative z-10 shadow-sm">
                                <Scale className="text-brand" size={24} />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-ink mb-3 text-center md:text-left relative z-10">Fuerza de Señal</h3>
                            <p className="text-slate-600 text-sm leading-relaxed text-center md:text-left relative z-10">
                                Una señal no validada es casi ruido. <strong className="text-ink">Mientras más completo tu perfil</strong> y más constante tu participación sana, más impacto directo tiene tu opinión en las empresas y decisores.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LA TESIS CENTRAL */}
            <section className="py-24 px-6 relative z-10 w-full max-w-[1400px] mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <span className="text-brand font-bold uppercase tracking-widest text-xs mb-4 block">El Problema Estructural</span>
                    <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-6">Ni estudios eternos, ni likes vacíos.</h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
                        Una queja sin contexto no vale lo mismo que la preferencia de un consumidor habitual.
                        Los likes son superficiales y los estudios tradicionales envejecen antes de publicarse.
                        <strong className="text-slate-700 font-bold"> La calidad del dato depende inherentemente de la calidad y el contexto de quien lo emite.</strong>
                    </p>
                </div>

                {/* PILARES */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

                    {/* Pilar 1 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-xl shadow-slate-200/40 relative group hover:border-brand/20 transition-colors">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 group-hover:bg-brand-50/50 transition-all">
                            <Activity className="text-brand" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-ink mb-4">Unidades de Señal, no votos planos</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Rechazamos el “voto” plano. En Opina+, capturamos señales. Una señal encapsula intención, demografía y temporalidad simultáneamente. Esto permite construir un punto de dato vivo, contextualizado y agregable.
                        </p>
                    </div>

                    {/* Pilar 2 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-xl shadow-slate-200/40 relative group hover:border-accent/20 transition-colors">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 group-hover:bg-accent-50/50 transition-all">
                            <ShieldCheck className="text-accent" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-ink mb-4">Progresión y Calidad del Usuario</h3>
                        <p className="text-slate-600 leading-relaxed">
                            La influencia en nuestro ecosistema se gana, no se regala ni se compra. El sistema pondera orgánicamente la información recompensando la consistencia, la honestidad y el historial de comportamiento de cada perfil.
                        </p>
                    </div>

                    {/* Pilar 3 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-xl shadow-slate-200/40 relative group hover:border-brand/20 transition-colors">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 group-hover:bg-brand-50/50 transition-all">
                            <BarChart3 className="text-brand" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-ink mb-4">Mejor Dato, Mejor Lectura</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Al estructurar el ruido digital a través de una arquitectura limpia de captura, logramos aislar el sesgo y entender con precisión meridiana qué está sucediendo en segmentos socioeconómicos y geográficos muy específicos.
                        </p>
                    </div>

                    {/* Pilar 4 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-xl shadow-slate-200/40 relative group hover:border-accent/20 transition-colors">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-stroke group-hover:scale-110 group-hover:bg-accent-50/50 transition-all">
                            <Globe2 className="text-accent" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-ink mb-4">Valor Futuro y Ecosistema</h3>
                        <p className="text-slate-600 leading-relaxed">
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ruido Bots / Granjas</span>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-slate-200"></div>
                    <div>
                        <span className="block text-4xl font-black text-ink mb-2 tracking-tight">Estructurada</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Señal de Opinión</span>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-slate-200"></div>
                    <div>
                        <span className="block text-4xl font-black text-ink mb-2 tracking-tight">Dinámica</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Velocidad de Lectura</span>
                    </div>
                </div>
            </section>

            {/* DUAL CTA */}
            <section className="px-6 mb-16">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

                    {/* B2B CTA — ex dark, ahora light gradient con AmbientOrbs */}
                    <div className="relative rounded-[2rem] p-10 md:p-12 overflow-hidden group flex flex-col justify-between bg-gradient-to-br from-brand-50 via-white to-accent-50 border border-brand-100 shadow-xl">
                        <AmbientOrbs variant="corner" />
                        <div className="relative z-10 mb-10">
                            <span className="text-brand font-black uppercase tracking-widest text-[10px] mb-4 block">Para Empresas y Decisores</span>
                            <h3 className="text-3xl font-black text-ink mb-4 leading-tight">Inteligencia para quienes toman decisiones.</h3>
                            <p className="text-slate-600 font-medium">Entender el mercado ya no requiere meses de investigación. Requiere conectarse al motor correcto y ver la tendencia nacer.</p>
                        </div>
                        <GradientCTA
                            label="Descubrir Opina+ Intelligence"
                            icon="arrow_forward"
                            iconPosition="trailing"
                            size="md"
                            fullWidth
                            onClick={() => navigate('/intelligence')}
                            className="relative z-10"
                        />
                    </div>

                    {/* B2C CTA */}
                    <div className="bg-white border border-stroke rounded-[2rem] p-10 md:p-12 relative overflow-hidden group flex flex-col justify-between shadow-xl shadow-slate-200/40 hover:border-slate-300 transition-colors">
                        <div className="relative z-10 mb-10">
                            <span className="text-accent font-black uppercase tracking-widest text-[10px] mb-4 block">Para Usuarios y Ciudadanos</span>
                            <h3 className="text-3xl font-black text-ink mb-4 leading-tight">Pasa del ruido a la tendencia estructurada.</h3>
                            <p className="text-slate-500 font-medium">Tus señales construyen un mapa de tendencias con actualización continua. Suma valor, elige tu nicho y avanza.</p>
                        </div>
                        <GradientCTA
                            label="Ir a Participar"
                            icon="arrow_forward"
                            iconPosition="trailing"
                            size="md"
                            variant="ghost"
                            fullWidth
                            onClick={() => navigate('/signals')}
                            className="relative z-10"
                        />
                    </div>

                </div>
            </section>

        </div>
    );
}

import { motion } from "framer-motion";
import {
    ShieldAlert,
    LockKeyhole,
    UserCheck,
    Scale,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Trust() {
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-600 text-[11px] font-black tracking-widest uppercase mb-8 shadow-sm">
                            <ShieldAlert size={14} className="text-primary-500" />
                            Confianza & Reglas
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-ink mb-8 max-w-4xl">
                            La inteligencia requiere <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">contexto</span>.<br />Tu identidad requiere <span className="text-stroke-ink">protección</span>.
                        </h1>

                        <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed max-w-2xl mx-auto">
                            En Opina+ no nos interesa quién eres para exponerlo, nos interesa cómo actúas y de dónde vienes para saber cuánto pesa tu señal. Descubre cómo construimos inteligencia aislando tu privacidad.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="py-24 px-6 relative z-10 w-full max-w-[1400px] mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-6">El Contrato de Datos Opina+</h2>
                    <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-3xl mx-auto">
                        Queremos medir el mercado en tiempo real. Para lograrlo, filtramos ruido bot y ponderamos la calidad del humano detrás de la pantalla, sin transformar su nombre en un producto público.
                    </p>
                </div>

                {/* THE 4 PILLARS OF TRUST */}
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-24">

                    {/* Block 1 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-sm relative group hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center mb-6 border border-stroke">
                            <LockKeyhole className="text-primary-500" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-ink mb-3">Privacidad vs. Segmentación</h3>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            Si eres un hombre de 35 años comprando un auto en Santiago, tu opinión sobre una automotora vale oro. Pero nadie necesita saber tu nombre para que ese dato sea útil.
                        </p>
                        <p className="text-text-secondary leading-relaxed font-medium">
                            <strong>Qué hacemos:</strong> Te pedimos datos demográficos (edad, género, comuna) para agrupar tu comportamiento, pero <span className="text-ink underline decoration-primary-300 decoration-2 underline-offset-4">nunca</span> los publicamos anclados a tu identidad pública.
                        </p>
                    </div>

                    {/* Block 2 */}
                    <div className="bg-white p-10 rounded-[2rem] border border-stroke shadow-sm relative group hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-bg rounded-2xl flex items-center justify-center mb-6 border border-stroke">
                            <UserCheck className="text-secondary-500" size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-ink mb-3">Identidad Verificada ≠ Avatar Público</h3>
                        <p className="text-text-secondary leading-relaxed mb-4">
                            Saber que eres una persona real (y no una granja de bots) protege la calidad del sistema completo. Por eso recompensamos que asocies un celular, un correo o tu LinkedIn.
                        </p>
                        <p className="text-text-secondary leading-relaxed font-medium">
                            <strong>Tu Avatar:</strong> En los foros públicos interactúas con un apodo y avatar. Tu información de contacto (tu email, tu teléfono) queda resguardada y segregada de tus paneles públicos de votación.
                        </p>
                    </div>

                    {/* Block 3 */}
                    <div className="bg-slate-900 p-10 rounded-[2rem] border border-slate-800 shadow-xl shadow-primary-900/10 relative group md:col-span-2 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="shrink-0 w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                                <Scale className="text-primary-400" size={32} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-white mb-3">¿Por qué completar tu perfil fortalece tu Señal?</h3>
                                <p className="text-slate-400 leading-relaxed max-w-3xl text-lg">
                                    En encuestas tradicionales, 1 voto = 1 voto. En Opina+, un voto no validado es casi ruido.
                                    A medida que compartes tu contexto geográfico, ingresos o rubro, y participas consistentemente sin comportamiento anómalo,
                                    el sistema algorítmico confía más en ti. <strong className="text-white">Un perfil 100% completo tiene una influencia directa, ponderada y real en el mercado.</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RULES OF THE GAME */}
                <div className="max-w-4xl mx-auto bg-surface2 rounded-3xl p-8 md:p-12 border border-stroke">
                    <h3 className="text-2xl font-black text-ink mb-8 text-center tracking-tight">Reglas del Ecosistema Base</h3>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white border border-stroke flex items-center justify-center font-black text-sm text-secondary-600 shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-ink text-lg">Empiezas como Invitado (Guest)</h4>
                                <p className="text-text-secondary">Tus primeras señales sirven para calibrarte en el sistema, pero su peso es mínimo en las métricas B2B de inteligencia. Estás en periodo de prueba biológica.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white border border-stroke flex items-center justify-center font-black text-sm text-secondary-600 shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-ink text-lg">Recompensas por Consistencia</h4>
                                <p className="text-text-secondary">Mientras más días participes y menos contradicciones algorítmicas tengas, tu nivel sube, desbloqueando reportes de resultados donde antes solo veías candados.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white border border-stroke flex items-center justify-center font-black text-sm text-secondary-600 shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-ink text-lg">Tolerancia Cero a Granjas</h4>
                                <p className="text-text-secondary">Patrones repetitivos, IPs marcadas o velocidad de votación inhumana congela el peso de la señal instantáneamente. El usuario puede seguir haciendo clics en UI, pero la base de datos lo etiqueta como Nulo y no afecta Rankings globales.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA ENTRY */}
            <section className="px-6 mb-16 mt-12">
                <div className="max-w-4xl mx-auto bg-primary-50 rounded-[2rem] p-10 md:p-16 text-center border border-primary-100 flex flex-col items-center">
                    <h3 className="text-2xl md:text-3xl font-black text-primary-900 mb-4 tracking-tight">El anonimato no es opacidad.</h3>
                    <p className="text-primary-700 font-medium mb-8 max-w-xl">Entra al ecosistema de forma segura, verifica tu humanidad y comienza a direccionar las tendencias sin regalar el control de tu nombre en la red.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 inline-flex items-center gap-2"
                    >
                        Crear Cuenta y Participar
                        <ArrowRight size={18} />
                    </button>
                    <p className="mt-4 text-xs font-medium text-primary-600/70 uppercase tracking-widest">Opina+ Intelligence Protocol</p>
                </div>
            </section>

        </div>
    );
}

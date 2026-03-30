import { ArrowLeft, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-primary-500 selection:text-white pt-24">
            <div className="max-w-4xl mx-auto px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary-600 mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver
                </button>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="text-primary-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Política de Privacidad</h1>
                            <p className="text-sm text-slate-500 font-medium">Plataforma Opina+ en Fase Piloto</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-slate-600 text-[15px] leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. Identidad Protegida</h2>
                            <p className="mb-4">
                                En Opina+, tu identidad pública está separada de tus interacciones dentro de la plataforma. Para nosotros, cada persona es un agente estadístico necesario para combatir el ruido en internet. Solicitamos tu perfil demográfico (como rango de edad, educación o comuna) exclusivamente para dar <strong>contexto analítico</strong> a la lectura de mercado, nunca para exponerte. 
                            </p>
                            <p>
                                Tus opiniones sobre marcas e industrias se agregan y presentan como <strong>señales conjuntas a nivel poblacional</strong>, de forma protegida. Ningún tercero ni analista externo puede individualizar tus votos con tu nombre real de forma abierta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Autenticación y Cero Bots</h2>
                            <p>
                                La validación de cuentas (correo electrónico, invitaciones) se utiliza exclusivamente como un método necesario para <strong className="text-slate-900">verificar tu condición humana</strong>. Nuestro sistema está diseñado para erradicar bots y granjas de clics, asegurando un entorno libre de desinformación donde la opinión valga por el ser humano que está detrás, no por el volumen computacional de su cuenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Uso de la Información</h2>
                            <p className="mb-4">
                                Generamos reportes de tendencias (Dashboards de Inteligencia) integrando tus señales. Estos informes benefician a empresas y organizaciones que buscan comprender problemas reputacionales o de mercado basándose en hechos. En todos estos entregables comerciales, la unidad básica visible es el <strong>segmento</strong>, nunca el individuo.
                            </p>
                            <p>
                                Ocasionalmente usaremos los datos para mejoras de la arquitectura de puntuación interna (Elo Score algorítmico) buscando equilibrar participaciones justas.
                            </p>
                        </section>
                        
                        <div className="mt-12 bg-slate-50 border border-slate-100 p-6 rounded-2xl flex items-start gap-4">
                            <HeartHandshake className="text-slate-400 shrink-0" size={24} />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Un Compromiso de Piloto</h3>
                                <p className="text-sm text-slate-500">
                                    Esta es una declaración basal que acompaña la etapa de prueba e iteración del producto. Al estar operando como un piloto cerrado o beta, nos reservamos el derecho de robustecer o refinar esta política en la medida en que la plataforma se expanda públicamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

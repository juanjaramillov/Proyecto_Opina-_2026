import { ArrowLeft, Scale, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-brand selection:text-white pt-24">
            <div className="max-w-4xl mx-auto px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver
                </button>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center">
                            <Scale className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Condiciones de Uso</h1>
                            <p className="text-sm text-slate-500 font-medium">Plataforma Opina+ en Fase de Prueba</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-slate-600 text-[15px] leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. Naturaleza de la Plataforma Piloto</h2>
                            <p className="mb-4">
                                Opina+ se encuentra actualmente en un <strong className="text-slate-900">entorno controlado de fase piloto</strong> evaluando mecánicas de participación e inteligencia de datos. La provisión, la precisión gráfica y estadística de los datos reflejados en sus Dashboards son aproximaciones iterativas obtenidas mediante algoritmos de normalización poblacional. 
                            </p>
                            <p>
                                Declinamos cualquier responsabilidad en torno a contingencias corporativas derivadas de las señales aquí publicadas, dado que <strong className="text-slate-900">Opina+ muestra tendencias agregadas y nunca asesoramiento financiero, jurídico ni estratégico directo.</strong>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Uso Referencial de Marcas Registradas</h2>
                            <p>
                                Opina+ opera como un visualizador imparcial de percepción social y pública. Todos los nombres, logotipos corporativos y marcas catalogadas en la plataforma de encuestamiento, feed o resultados (Results) <strong>se utilizan con fines estrictamente informativos, descriptivos y de evaluación comparativa ciudadana.</strong> 
                            </p>
                            <p className="mt-4">
                                Su presencia en el sistema <strong>no implica</strong> afiliación comercial, patrocinio, asociación, ni respaldo por parte de los titulares legítimos de dichas marcas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Reglas de Accesibilidad e Integridad</h2>
                            <p className="mb-4">
                                El acceso a iteraciones Beta está sujeto a confirmación vía <strong>CÓDIGO DE INVITACIÓN ADMINISTRATIVA</strong> proporcionado individualmente. Nos reservamos el derecho de rectificar acceso ante comportamientos ilícitos como "scraping" de datos, intentos de explotación para automatizar opiniones y generación de cuentas falsas (granjas y bots).
                            </p>
                        </section>

                        <div className="mt-12 bg-warning-50 border border-warning-100 p-6 rounded-2xl flex items-start gap-4">
                            <Info className="text-warning-500 shrink-0" size={24} />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Aprobación Legal</h3>
                                <p className="text-sm text-warning-700">
                                    Al transicionar hacia las Fases Generales de Producción (GTM), este texto será sustituido por las matrices contractuales de provisión de servicios B2B (Licencia de Software) y Adhesión de Usuario B2C.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

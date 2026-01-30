import React from 'react';
import PageShell from '../../components/layout/PageShell';

const FAQ: React.FC = () => {
    // Shared styles
    const detailsApi = "group rounded-2xl border border-white/12 bg-gradient-to-b from-white/5 to-white/5 shadow-lg p-3.5 open:bg-white/10 transition-all duration-200";
    const summaryApi = "cursor-pointer font-extrabold text-sm text-ink outline-none list-none [&::-webkit-details-marker]:hidden flex items-center justify-between";
    const pApi = "mt-2.5 text-muted text-[13px] leading-relaxed";

    return (
        <PageShell>
            <div className="min-h-screen">
                <main className="py-8 pb-16">
                    <div className="max-w-ws mx-auto px-5">
                        <h1 className="m-0 text-2xl tracking-tight text-ink">Preguntas frecuentes</h1>
                        <p className="mt-2.5 text-sm leading-relaxed max-w-[90ch] text-muted">Respuestas claras, sin letra chica.</p>

                        <div className="flex flex-col gap-3 mt-6">
                            <details className={detailsApi}>
                                <summary className={summaryApi}>¿Opina+ es gratis para los usuarios?</summary>
                                <p className={pApi}>
                                    Sí. Participar es gratuito. Algunas vistas avanzadas se desbloquean al completar el perfil e identidad.
                                </p>
                            </details>

                            <details className={detailsApi}>
                                <summary className={summaryApi}>¿Venden mis datos personales?</summary>
                                <p className={pApi}>
                                    No. Nunca se venden datos personales ni respuestas individuales. El valor está en las señales agregadas.
                                </p>
                            </details>

                            <details className={detailsApi}>
                                <summary className={summaryApi}>¿Por qué piden identidad?</summary>
                                <p className={pApi}>
                                    Para evitar fraude, bots y duplicados. La identidad protege la calidad del sistema y no se expone a terceros.
                                </p>
                            </details>

                            <details className={detailsApi}>
                                <summary className={summaryApi}>¿Qué compran las empresas?</summary>
                                <p className={pApi}>
                                    Tendencias, comparaciones por segmento y series de tiempo. No acceden a personas ni respuestas individuales.
                                </p>
                            </details>

                            <details className={detailsApi}>
                                <summary className={summaryApi}>¿Cada cuánto se actualizan los datos?</summary>
                                <div className="text-slate-600 leading-relaxed text-sm">
                                    Depende de la señal y el volumen, pero el sistema está diseñado para mostrar señales frecuentes y evolución.
                                </div>
                            </details>

                            <details className={detailsApi}>
                                <summary className={summaryApi}>¿Puedo eliminar mi información?</summary>
                                <p className={pApi}>
                                    Sí. Puedes solicitar eliminación o corrección desde perfil o soporte (según políticas vigentes).
                                </p>
                            </details>
                        </div>

                        <span className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-ok/25 bg-white/5 font-extrabold text-xs text-ok/95 mt-4">
                            ● Transparencia · ● Datos agregados
                        </span>
                    </div>
                </main>
            </div>
        </PageShell>
    );
};

export default FAQ;

import React from 'react';
import PageShell from '../../components/layout/PageShell';

const Cookies: React.FC = () => {
    // Shared styles
    const cardApi = "mt-4.5 rounded-3xl border border-white/12 bg-gradient-to-b from-white/5 to-white/5 shadow-lg p-4.5";
    const h2Api = "m-0 text-base text-ink font-bold";
    const pApi = "mt-2.5 text-muted text-[13px] leading-relaxed";

    return (
        <PageShell>
            <div className="min-h-screen">
                <main className="py-8 pb-16">
                    <div className="max-w-ws mx-auto px-5">
                        <h1 className="m-0 text-2xl tracking-tight text-ink">Uso de cookies</h1>
                        <p className="mt-2.5 text-sm text-muted">
                            Usamos cookies de forma responsable para que Opina+ funcione correctamente.
                        </p>

                        <div className={cardApi}>
                            <h2 className={h2Api}>Qué son las cookies</h2>
                            <p className={pApi}>
                                Las cookies son pequeños archivos que se guardan en tu navegador para recordar información básica entre visitas.
                            </p>
                        </div>

                        <div className={cardApi}>
                            <h2 className={h2Api}>Para qué las usamos</h2>
                            <p className={pApi}>
                                - Mantener tu sesión activa
                                <br />- Recordar preferencias básicas
                                <br />- Medir uso agregado del producto (no individual)
                            </p>
                        </div>

                        <div className={cardApi}>
                            <h2 className={h2Api}>Qué NO hacemos</h2>
                            <p className={pApi}>
                                No usamos cookies para vender información, rastrear usuarios individualmente ni mostrar publicidad personalizada.
                            </p>
                        </div>

                        <div className={cardApi}>
                            <h2 className={h2Api}>Cómo gestionarlas</h2>
                            <p className={pApi}>
                                Puedes bloquear o eliminar cookies desde la configuración de tu navegador.
                                Ten en cuenta que algunas funciones pueden dejar de funcionar.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </PageShell>
    );
};

export default Cookies;

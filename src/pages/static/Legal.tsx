import React from 'react';
import PageShell from '../../components/layout/PageShell';

const Legal: React.FC = () => {
    return (
        <PageShell>
            <div className="min-h-screen container-ws section-y pb-20">
                <div className="max-w-3xl mx-auto">

                    <header className="mb-10 border-b border-stroke pb-8">
                        <h1 className="text-3xl font-black text-ink mb-2">Términos y Condiciones</h1>
                        <p className="text-sm text-text-secondary">Última actualización: Enero 2026</p>
                    </header>

                    <div className="space-y-8 text-sm text-text-secondary leading-relaxed">

                        <section>
                            <h2 className="text-lg font-bold text-ink mb-2">1. Definición del Servicio</h2>
                            <p>
                                Opina+ ("la Plataforma") es un servicio de recolección y análisis de opinión pública agregada.
                                Al utilizar nuestros servicios, aceptas compartir tus selecciones en formatos de "versus", encuestas
                                y otras interacciones ("Señales") para fines de estudio de mercado.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-ink mb-2">2. Naturaleza de la Información</h2>
                            <p className="mb-2">
                                Los resultados mostrados en Opina+ ("Insights") reflejan tendencias estadísticas basadas en la participación voluntaria.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>No garantizamos que los resultados sean representativos de toda la población nacional.</li>
                                <li>No somos una encuestadora oficial para fines electorales regulados (SERVEL).</li>
                                <li>No tenemos afiliación con las marcas mencionadas en los estudios.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-ink mb-2">3. Conducta del Usuario</h2>
                            <p>
                                Te comprometes a emitir opiniones genuinas. Opina+ se reserva el derecho de SUSPENDER cuentas que exhiban comportamiento automatizado (bots),
                                intentos de manipulación de rankings o suplantación de identidad.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-ink mb-2">4. Propiedad Intelectual</h2>
                            <p>
                                Los datos agregados y reportes generados son propiedad de Opina+. Las marcas registradas de terceros mencionadas
                                en la plataforma se utilizan únicamente con fines referenciales e informativos (fair use) para permitir la opinión pública sobre ellas.
                            </p>
                        </section>

                        <section className="bg-slate-50 p-6 rounded-2xl border border-stroke">
                            <h2 className="text-lg font-bold text-ink mb-2">5. Contacto</h2>
                            <p className="mb-3">
                                Opina+ (Nombre Legal SpA). <br />
                                Domicilio: Providencia, Santiago, Chile.
                            </p>
                            <a href="mailto:legal@opinaplus.cl" className="text-primary font-bold hover:underline">
                                legal@opinaplus.cl
                            </a>
                        </section>

                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default Legal;

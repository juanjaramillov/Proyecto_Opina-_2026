import React from 'react';
import PageShell from '../../components/layout/PageShell';

const Privacy: React.FC = () => {
    return (
        <PageShell>
            <div className="min-h-screen container-ws section-y pb-20">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-widest uppercase mb-4">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Política de Privacidad
                        </div>
                        <h1 className="text-4xl font-black text-ink tracking-tight mb-4">Tu privacidad es sagrada</h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Opina+ se construye sobre señales agregadas, no sobre la exposición de tu vida personal.
                            Aquí te explicamos qué guardamos y por qué.
                        </p>
                    </header>

                    <div className="space-y-6">
                        {/* 1. Qué recopilamos */}
                        <section className="card p-8">
                            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500">database</span>
                                1. Qué recopilamos
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-sm text-ink">Identidad (Opcional)</h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            Si verificas tu cuenta, procesamos un hash de tu RUT/ID para evitar duplicados.
                                            No guardamos el documento legible por humanos en nuestras bases de análisis.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-sm text-ink">Perfil Demográfico</h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            Edad aproximada, comuna y género. Se usan exclusivamente para segmentar tendencias ("Qué opinan en Ñuñoa", por ejemplo).
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-sm text-ink">Señales (Opiniones)</h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            Tus señales en versus y respuestas. Estas se disocian de tu identidad personal al agregarse.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        {/* 2. Para qué se usa */}
                        <section className="card p-8">
                            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">psychology</span>
                                2. Para qué usamos los datos
                            </h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                Nuestra misión es generar inteligencia colectiva. Vendemos <strong>estadísticas agregadas</strong> a empresas y organizaciones para que mejoren sus servicios.
                            </p>
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">Compromiso de Venta</p>
                                <p className="text-sm text-emerald-900 font-medium">
                                    NUNCA vendemos tu lista de contactos, tu email ni tu identidad individual a terceros.
                                    Los clientes ven "el 40% prefiere X", nunca "Juan prefiere X".
                                </p>
                            </div>
                        </section>

                        {/* 3. Control y Eliminación */}
                        <section className="card p-8">
                            <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">delete_forever</span>
                                3. Tus derechos y eliminación
                            </h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                Eres dueño de tu participación. Puedes retirar tu consentimiento en cualquier momento.
                            </p>
                            <ul className="space-y-2 text-sm text-text-secondary">
                                <li>• <strong>Acceso:</strong> Puedes ver todo tu historial en tu Perfil.</li>
                                <li>• <strong>Eliminación:</strong> En la sección "Perfil" encontrarás un botón "Eliminar mi cuenta". Esto borra tu usuario y anonimiza irreversiblemente tus señales pasadas.</li>
                            </ul>
                        </section>

                        {/* 4. Contacto */}
                        <section className="card p-8 bg-slate-900 text-white">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">mail</span>
                                4. Contacto Legal
                            </h2>
                            <p className="text-sm text-slate-300 mb-4">
                                Para dudas sobre privacidad, ejercicio de derechos ARCO o reportes de seguridad:
                            </p>
                            <a href="mailto:privacidad@opinaplus.cl" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 transition">
                                privacidad@opinaplus.cl
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default Privacy;

export default function Monetization() {
    return (
        <div className="space-y-10">
            {/* Header */}
            <section>
                <h1 className="text-2xl font-bold text-ink">
                    Monetización sin rodeos
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                    No vendemos “insights”. Vendemos decisiones mejor informadas.
                </p>
            </section>

            {/* How pricing works */}
            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-surface p-6 shadow-card">
                    <div className="text-xs text-text-muted">1. Qué compras</div>
                    <h3 className="mt-2 font-semibold text-ink">
                        Acceso a señales reales
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Opiniones sin contexto, sin relato y sin ruido.
                        Solo elección.
                    </p>
                </div>

                <div className="rounded-2xl bg-surface p-6 shadow-card">
                    <div className="text-xs text-text-muted">2. Cómo lo usas</div>
                    <h3 className="mt-2 font-semibold text-ink">
                        Testeas decisiones
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Mensajes, features, precios o percepciones.
                        Lo que quieras validar.
                    </p>
                </div>

                <div className="rounded-2xl bg-surface p-6 shadow-card">
                    <div className="text-xs text-text-muted">3. Por qué pagas</div>
                    <h3 className="mt-2 font-semibold text-ink">
                        Ahorras tiempo y error
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Una mala decisión cuesta más que cualquier plan.
                    </p>
                </div>
            </section>

            {/* Plans */}
            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-stroke bg-surface p-6 shadow-card">
                    <h3 className="font-semibold text-ink">
                        Acceso Básico
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Para explorar señales existentes y entender patrones.
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                        <li>• Visualización de resultados agregados</li>
                        <li>• Acceso limitado a filtros</li>
                        <li>• Sin creación de insights</li>
                    </ul>

                    <div className="mt-4 text-xs text-text-muted">
                        Ideal para investigación liviana
                    </div>
                </div>

                <div className="rounded-2xl bg-surface p-6 shadow-lift border border-primary/30">
                    <h3 className="font-semibold text-ink">
                        Acceso Pro
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                        Para empresas que necesitan decidir con datos propios.
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                        <li>• Creación de insights propios</li>
                        <li>• Filtros avanzados por segmento</li>
                        <li>• Históricos y comparación temporal</li>
                        <li>• Exportación de resultados</li>
                    </ul>

                    <button className="mt-5 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-lift hover:scale-[1.02] transition">
                        Hablar con ventas
                    </button>

                    <div className="mt-2 text-xs text-text-muted">
                        Precio según uso y volumen. No hay tarifa plana absurda.
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="rounded-2xl bg-surface2 p-6 text-sm text-text-secondary">
                Si tus decisiones importan, necesitas señales.
                <span className="ml-1 text-ink font-medium">
                    Las opiniones ya existen. Solo hay que leerlas bien.
                </span>
            </section>
        </div>
    );
}

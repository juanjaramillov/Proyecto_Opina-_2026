import React from 'react';

const MethodologySection: React.FC = () => {
    return (
        <section className="py-5 pb-16" id="metodo">
            <div className="max-w-ws mx-auto px-5">
                <div className="flex items-end justify-between gap-3 mb-3">
                    <h2 className="m-0 text-base tracking-wide text-muted">Metodología (resumen)</h2>
                    <div className="text-xs font-semibold text-muted2">Texto corto y claro</div>
                </div>

                <div className="rounded-2xl border border-stroke bg-white shadow-sm p-4 md:p-5 relative overflow-hidden">
                    <div className="absolute inset-[-1px] pointer-events-none z-0 opacity-40">
                        <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_20%_10%,rgba(79,70,229,0.05),transparent_60%)]"></div>
                    </div>
                    <p className="small m-0 text-xs leading-relaxed font-semibold text-muted relative z-10">
                        Opina+ captura respuestas rápidas con identidad verificada. Luego normaliza, segmenta y construye series de tiempo
                        para detectar cambios de tendencia. El usuario ve resultados de forma didáctica; las empresas acceden a señales agregadas,
                        anónimas y comparables por segmento.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default MethodologySection;

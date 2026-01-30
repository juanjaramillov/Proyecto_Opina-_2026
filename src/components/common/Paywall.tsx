// import React from 'react'; // removed unused check

export default function Paywall(props: { title: string }) {
    return (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-8 text-center max-w-md mx-auto my-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
                <span className="material-symbols-outlined">lock</span>
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">{props.title}</h2>
            <p className="text-text-secondary mb-6">
                Desbloquea acceso completo, historial ilimitado y análisis detallados con nuestro plan Pro.
            </p>
            <button className="btn-primary w-full shadow-lg shadow-indigo-200">
                Mejorar mi plan
            </button>
            <p className="mt-4 text-xs text-text-muted">
                Pago seguro vía Stripe. Cancela cuando quieras.
            </p>
        </div>
    );
}

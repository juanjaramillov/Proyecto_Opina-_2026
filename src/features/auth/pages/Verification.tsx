import React from 'react';
import { useVerificationStatus } from '../../../hooks/useVerificationStatus';

function normalizeRut(input: string) {
    const clean = input.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
    if (!clean.includes('-')) {
        const body = clean.slice(0, -1);
        const dv = clean.slice(-1);
        return `${body}-${dv}`;
    }
    return clean;
}

function computeDv(body: string) {
    let sum = 0;
    let mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += Number(body[i]) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }
    const mod = 11 - (sum % 11);
    if (mod === 11) return '0';
    if (mod === 10) return 'K';
    return String(mod);
}

function validateRut(rut: string) {
    const n = normalizeRut(rut);
    const [body, dv] = n.split('-');
    if (!body || !dv) return false;
    if (!/^\d{7,8}$/.test(body)) return false;
    if (!/^[0-9K]$/.test(dv)) return false;
    return computeDv(body) === dv;
}

const Verification: React.FC = () => {
    const { isVerified, setVerifiedStrong, reset } = useVerificationStatus();
    const [rut, setRut] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [ok, setOk] = React.useState<string | null>(null);
    const [consent, setConsent] = React.useState(false);

    const onVerify = () => {
        setError(null);
        setOk(null);

        if (!validateRut(rut)) {
            setError('RUT inválido. Revisa formato y dígito verificador.');
            return;
        }

        if (!consent) {
            setError('Debes aceptar el uso anónimo de tus opiniones.');
            return;
        }

        // MVP: marca verified_strong en localStorage.
        // Producción: Edge Function + unicidad + rate limit + hash.
        setVerifiedStrong();
        setOk(`Verificación lista (demo): ${normalizeRut(rut)}`);
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">

                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header Section */}
                    <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <span className="material-symbols-outlined text-xl">verified_user</span>
                                    </div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verificar Identidad</h1>
                                </div>
                                <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                                    Conecta tu RUT para bloquear bots y dar trazabilidad real a tus opiniones.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    {isVerified ? 'Verificado' : 'No Verificado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                        {/* Form Section */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Ingresa tu RUT
                            </label>
                            <div className="space-y-4">
                                <input
                                    className="w-full py-4 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300"
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                    placeholder="12.345.678-5"
                                />

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {error}
                                    </div>
                                )}

                                {ok && (
                                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        {ok}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 pt-2">

                                    {/* Consent Checkbox */}
                                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            checked={consent}
                                            onChange={e => setConsent(e.target.checked)}
                                        />
                                        <span className="text-xs text-slate-600 leading-snug">
                                            Acepto que mis opiniones sean utilizadas de forma anónima para análisis estadístico y generación de insights.
                                        </span>
                                    </label>

                                    <button
                                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                                        type="button"
                                        onClick={onVerify}
                                    >
                                        Verificar ahora
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>

                                    {isVerified && (
                                        <button
                                            className="w-full py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setRut('');
                                                setOk(null);
                                                setError(null);
                                            }}
                                        >
                                            Reiniciar (Modo Demo)
                                            <span className="material-symbols-outlined text-sm">refresh</span>
                                        </button>
                                    )}
                                </div>

                                <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed px-4">
                                    Esta validación es solo visual para la demo. En producción usamos Edge Functions con hashing seguro.
                                </p>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500">lock_open</span>
                                Beneficios de Identidad
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Opinar sobre productos reales (código de barras)',
                                    'Participar en rankings comunales',
                                    'Mayor peso de señal (+ puntos)',
                                    'Acceso a recompensas futuras'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
                                        <span className="text-xs font-bold text-slate-600 leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <span className="material-symbols-outlined text-lg">shield</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Privacidad Garantizada</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Verification;
